import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { 
  Box, Heading, Text, Input, SimpleGrid, Card, CardHeader, CardBody, 
  CardFooter, Button, Flex, Spinner, Badge, Icon, useDisclosure, 
  InputGroup, InputLeftElement, useToast, Alert, AlertIcon, IconButton,
  Image, Skeleton, Tag, TagLabel, TagLeftIcon, Grid, GridItem, Avatar,
  useColorModeValue, Select, Wrap, WrapItem, Center, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  ModalFooter, Stack, VStack, HStack
} from '@chakra-ui/react';
import { 
  FaSearch, FaLeaf, FaMapMarkerAlt, FaRedo, FaUser, 
  FaFire, FaStar, FaClock, FaShoppingCart, FaPhone, FaVideo, FaTimes,
  FaMicrophone, FaMicrophoneSlash, FaVideoSlash
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BidModal from '../components/buyer/BidModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AgoraRTC from 'agora-rtc-sdk-ng';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

const BuyerMarketplace = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Bid modal states
  const { isOpen: isBidModalOpen, onOpen: onBidModalOpen, onClose: onBidModalClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Call modal states
  const { isOpen: isCallModalOpen, onOpen: onCallModalOpen, onClose: onCallModalClose } = useDisclosure();
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'ended'
  const [callFarmer, setCallFarmer] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  
  // Agora states
  const agoraClient = useRef(null);
  const localAudioTrack = useRef(null);
  const localVideoTrack = useRef(null);
  const remoteUsers = useRef({});
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  
  const bgGradient = useColorModeValue(
    'linear(to-r, teal.50, blue.50)',
    'linear(to-r, gray.800, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.700');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const categoryBg = useColorModeValue('teal.50', 'teal.900');
  const activeCategoryBg = useColorModeValue('teal.500', 'teal.600');

  // Get backend URL from environment variables
  const backendBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
  
  // Fixed image URL handling
  const getFullImageUrl = (url) => {
    if (!url) return '/placeholder.jpg';
    
    // If it's a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Handle Windows paths
    if (url.includes('\\')) {
      const fileName = url.split('\\').pop();
      return `${backendBaseUrl}/uploads/${fileName}`;
    }
    
    // Handle absolute paths
    if (url.startsWith('/')) {
      return `${backendBaseUrl}${url}`;
    }
    
    // Handle relative paths
    return `${backendBaseUrl}/uploads/${url}`;
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          t('fetch products error');
      
      setError(errorMessage);
      
      toast({
        title: t('error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchProducts();
    
    // Cleanup Agora on unmount
    return () => {
      leaveCall();
    };
  }, [fetchProducts, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBidClick = (product) => {
    if (!user) {
      toast({
        title: t('authentication required'),
        description: t('login to bid'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth');
      return;
    }
    
    setSelectedProduct(product);
    onBidModalOpen();
  };

  const handleBidSubmit = async (bidData) => {
    try {
      await api.post('/bids', {
        productId: selectedProduct.id,
        amount: bidData.amount,
        buyerId: user.id,
        shippingAddress: bidData.shippingAddress,
        paymentMethod: bidData.paymentMethod
      });
      
      toast({
        title: t('bid success'),
        description: t('bid placed success'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onBidModalClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          t('bid_error');
      
      toast({
        title: t('bid error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isNewProduct = (productDate) => {
    const productTime = new Date(productDate).getTime();
    const currentTime = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (currentTime - productTime) < twentyFourHours;
  };

  // Initialize Agora client
 const initAgora = useCallback(async () => {
  try {
    if (!selectedProduct || !selectedProduct.id || !user || !user.id) {
      throw new Error('Missing required product or user information');
    }

    // Get Agora token with channel and user parameters
    const response = await api.get('/agora/token', {
      params: {
        channel: `product_${selectedProduct.id}`,
        uid: user.id
      }
    });
    
    const { token, appId } = response.data;
    
    // Create client with proper codec and mode
    agoraClient.current = AgoraRTC.createClient({ 
      mode: 'rtc', 
      codec: 'h264', // Use h264 for better compatibility
    });
    
    // Set up event listeners
    agoraClient.current.on('user-published', handleUserPublished);
    agoraClient.current.on('user-unpublished', handleUserUnpublished);
    agoraClient.current.on('user-left', handleUserLeft);
    
    // Join channel with proper parameters
    await agoraClient.current.join(
      appId, 
      `product_${selectedProduct.id}`, 
      token, 
      user.id
    );
    
    setCallStatus('connecting');
    
    // Create and publish local tracks
    const tracks = [];
    
    if (callType === 'video') {
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack({
        optimizationMode: "detail",
        encoderConfig: "720p_1"
      });
      localVideoTrack.current.play('local-video');
      await agoraClient.current.publish(localVideoTrack.current);
      tracks.push(localVideoTrack.current);
      setIsVideoOn(true);
    }
    
    localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
    await agoraClient.current.publish(localAudioTrack.current);
    tracks.push(localAudioTrack.current);
    setIsAudioOn(true);
    
    setCallStatus('connected');
    
    // Handle track publication errors
    tracks.forEach(track => {
      track.on("track-ended", async () => {
        toast({
          title: t('Device disconnected'),
          description: t('Your camera/microphone was disconnected'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      });
    });
  } catch (error) {
    console.error('Agora error:', error);
    setCallStatus('error');
    
    let errorMessage = t('call connection error');
    
    if (error.message.includes('CAN_NOT_GET_GATEWAY_SERVER') || 
        error.message.includes('invalid token')) {
      errorMessage = t('Authentication failed. Please try again.');
    } else if (error.message.includes('DEVICE_NOT_FOUND')) {
      errorMessage = t('Camera or microphone not found');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = t('Permission denied for camera/microphone');
    }
    
    toast({
      title: t('call failed'),
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    
    // Clean up on error
    leaveCall();
  }
}, [selectedProduct, callType, user, t, toast]);

  const handleUserPublished = async (user, mediaType) => {
    await agoraClient.current.subscribe(user, mediaType);
    
    if (mediaType === 'video') {
      const remotePlayer = document.createElement('div');
      remotePlayer.id = `remote-${user.uid}`;
      document.getElementById('remote-container').appendChild(remotePlayer);
      user.videoTrack.play(`remote-${user.uid}`);
    }
    
    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
    
    remoteUsers.current[user.uid] = user;
  };

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      const remotePlayer = document.getElementById(`remote-${user.uid}`);
      if (remotePlayer) remotePlayer.remove();
    }
  };

  const handleUserLeft = (user) => {
    const remotePlayer = document.getElementById(`remote-${user.uid}`);
    if (remotePlayer) remotePlayer.remove();
    delete remoteUsers.current[user.uid];
  };

  const leaveCall = async () => {
    try {
      setCallStatus('ending');
      
      // Close local tracks
      if (localVideoTrack.current) {
        localVideoTrack.current.close();
        localVideoTrack.current = null;
      }
      
      if (localAudioTrack.current) {
        localAudioTrack.current.close();
        localAudioTrack.current = null;
      }
      
      // Remove all remote users
      Object.values(remoteUsers.current).forEach(user => {
        const remotePlayer = document.getElementById(`remote-${user.uid}`);
        if (remotePlayer) remotePlayer.remove();
      });
      remoteUsers.current = {};
      
      // Leave the channel
      if (agoraClient.current) {
        await agoraClient.current.leave();
        agoraClient.current = null;
      }
      
      setIsVideoOn(false);
      setIsAudioOn(false);
      setCallStatus('ended');
    } catch (error) {
      console.error('Error leaving call:', error);
      setCallStatus('error');
    }
  };

  const handleCallClick = (product, type) => {
    if (!user) {
      toast({
        title: t('authentication required'),
        description: t('login to call'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth');
      return;
    }
    
    setSelectedProduct(product);
    setCallFarmer(product.farmer || { name: t('Farmer') });
    setCallType(type);
    onCallModalOpen();
  };

  const toggleCamera = async () => {
    try {
      if (localVideoTrack.current) {
        await agoraClient.current.unpublish(localVideoTrack.current);
        localVideoTrack.current.close();
        localVideoTrack.current = null;
        setIsVideoOn(false);
      } else {
        localVideoTrack.current = await AgoraRTC.createCameraVideoTrack();
        localVideoTrack.current.play('local-video');
        await agoraClient.current.publish(localVideoTrack.current);
        setIsVideoOn(true);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast({
        title: t('Camera Error'),
        description: t('Failed to toggle camera'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleMic = async () => {
    try {
      if (localAudioTrack.current) {
        await agoraClient.current.unpublish(localAudioTrack.current);
        localAudioTrack.current.close();
        localAudioTrack.current = null;
        setIsAudioOn(false);
      } else {
        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
        await agoraClient.current.publish(localAudioTrack.current);
        setIsAudioOn(true);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast({
        title: t('Microphone Error'),
        description: t('Failed to toggle microphone'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Initialize call when modal opens and product is selected
  useEffect(() => {
    if (isCallModalOpen && selectedProduct) {
      setCallStatus('connecting');
      initAgora();
    }
  }, [isCallModalOpen, selectedProduct, initAgora]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = searchTerm 
        ? (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
        
      const matchesCategory = category 
        ? product.category === category 
        : true;
        
      const matchesLocation = location 
        ? product.location?.toLowerCase().includes(location.toLowerCase())
        : true;
        
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      switch(sortOption) {
        case 'recent':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  // Categories for horizontal navigation
  const categories = [
    { id: '', name: t('all') },
    { id: 'Vegetables', name: t('vegetables'), icon: FaLeaf },
    { id: 'Fruits', name: t('fruits') },
    { id: 'Grains', name: t('grains') },
    { id: 'Dairy & Eggs', name: t('dairy') },
    { id: 'Coffee', name: t('coffee') },
    { id: 'Tea', name: t('tea') }
  ];

  // Locations for dropdown
  const locations = ['Nairobi', 'Kiambu', 'Nakuru', 'Eldoret', 'Mombasa', 'Nyeri', 'Kisumu'];

  return (
    <Box p={{ base: 4, md: 8 }} bg={bgGradient} minH="100vh">
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="User Profile"
            icon={<FaUser />}
            colorScheme="teal"
            variant="solid"
            onClick={() => navigate('/profile')}
            size="lg"
          />
          <Heading 
            size="xl" 
            bgGradient="linear(to-r, teal.500, blue.500)"
            bgClip="text"
            fontWeight="extrabold"
          >
            MkulimaPay E-Market
          </Heading>
        </Flex>
        
        <Flex gap={3}>
          {error && (
            <Button 
              leftIcon={<FaRedo />}
              colorScheme="red"
              variant="outline"
              onClick={handleRetry}
            >
              {t('retry')}
            </Button>
          )}
        </Flex>
      </Flex>
      
      {/* Category Navigation Bar */}
      <Box 
        mb={8} 
        overflowX="auto" 
        py={3}
        css={{
          '&::-webkit-scrollbar': { height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { 
            background: useColorModeValue('teal.300', 'teal.600'),
            borderRadius: '4px'
          }
        }}
      >
        <Wrap justify="center" spacing={4}>
          {categories.map((cat) => (
            <WrapItem key={cat.id}>
              <MotionButton
                size="lg"
                px={6}
                borderRadius="full"
                variant={category === cat.id ? 'solid' : 'outline'}
                colorScheme="teal"
                onClick={() => setCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                leftIcon={cat.icon ? <Icon as={cat.icon} /> : undefined}
                bg={category === cat.id ? activeCategoryBg : categoryBg}
                color={category === cat.id ? 'white' : 'teal.600'}
                _hover={{ bg: category === cat.id ? activeCategoryBg : 'teal.100' }}
              >
                {cat.name}
              </MotionButton>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
      
      {/* Search and Filter Section */}
      <Box 
        bg={cardBg} 
        p={6} 
        borderRadius="2xl" 
        boxShadow="lg" 
        mb={8}
      >
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup flex={{ base: '1', md: '3' }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder={t('Search Placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
              borderRadius="xl"
              focusBorderColor={accentColor}
            />
          </InputGroup>
          
          <Select 
            placeholder={t('All locations')} 
            flex={{ base: '1', md: '1' }}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            size="lg"
            borderRadius="xl"
            focusBorderColor={accentColor}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>
          
          <Select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            flex={{ base: '1', md: '1' }}
            size="lg"
            borderRadius="xl"
            focusBorderColor={accentColor}
          >
            <option value="recent">{t('Most Recent')}</option>
            <option value="price-low">{t('Price Low > High')}</option>
            <option value="price-high">{t('Price High > Low')}</option>
          </Select>
        </Flex>
        
        {/* Filter tags section */}
        <Flex gap={3} flexWrap="wrap" mt={4}>
          {category && (
            <Tag size="lg" borderRadius="full" colorScheme="blue">
              <TagLabel>{t(category.toLowerCase())}</TagLabel>
              <TagLeftIcon as={FaLeaf} />
            </Tag>
          )}
          {location && (
            <Tag size="lg" borderRadius="full" colorScheme="green">
              <TagLabel>{location}</TagLabel>
              <TagLeftIcon as={FaMapMarkerAlt} />
            </Tag>
          )}
          {(category || location) && (
            <Button 
              size="sm" 
              variant="ghost" 
              colorScheme="red"
              onClick={() => {
                setCategory('');
                setLocation('');
              }}
            >
              {t('Clear all')}
            </Button>
          )}
        </Flex>
      </Box>
      
      {/* Products Count */}
      {!loading && !error && filteredProducts.length > 0 && (
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          {filteredProducts.length} {t('Products found')}
        </Text>
      )}
      
      {/* Products Grid */}
      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} borderRadius="2xl" overflow="hidden" height="400px" />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert status="error" borderRadius="xl" variant="solid">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">{t('Error loading products')}</Text>
            <Text>{error}</Text>
            <Button mt={3} colorScheme="red" onClick={handleRetry}>
              {t('Retry')}
            </Button>
          </Box>
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Box 
          textAlign="center" 
          py={20} 
          bg={cardBg} 
          borderRadius="2xl"
          boxShadow="md"
        >
          <Center>
            <Image 
              src="/empty-state.svg" 
              alt="No products found" 
              boxSize="150px"
              opacity={0.7}
              mb={6}
            />
          </Center>
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            {t('No products found')}
          </Text>
          <Text color="gray.500" mb={6}>
            {t('Try different filters')}
          </Text>
          <MotionButton 
            colorScheme="blue" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSearchTerm('');
              setCategory('');
              setLocation('');
            }}
          >
            {t('Clear filters')}
          </MotionButton>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {filteredProducts.map(product => {
            const isNew = product.updatedAt ? isNewProduct(product.updatedAt) : false;
            
            return (
              <MotionCard 
                key={product.id}
                borderRadius="2xl"
                overflow="hidden"
                bg={cardBg}
                whileHover={{ 
                  y: -10,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image Section */}
                <Box position="relative" h="250px" overflow="hidden">
                  <Image
                    src={getFullImageUrl(product.image_url || product.imageUrl)}
                    alt={product.name}
                    objectFit="cover"
                    w="full"
                    h="full"
                    fallbackSrc="/placeholder.jpg"
                  />
                  
                  {/* Badges */}
                  <Flex position="absolute" top={4} left={4} gap={2} zIndex={1}>
                    {isNew && (
                      <Badge 
                        colorScheme="purple"
                        px={3}
                        py={1}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                      >
                        <Icon as={FaClock} mr={1} /> NEW
                      </Badge>
                    )}
                    {product.organic && (
                      <Badge 
                        colorScheme="green" 
                        px={3}
                        py={1}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                      >
                        <Icon as={FaLeaf} mr={1} /> {t('organic')}
                      </Badge>
                    )}
                  </Flex>
                  
                  <Badge 
                    colorScheme="yellow" 
                    position="absolute" 
                    bottom={4} 
                    right={4}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                    zIndex={1}
                  >
                    KES {product.price}/{product.unit}
                  </Badge>
                </Box>
                
                <CardHeader pb={0}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">{product.name}</Heading>
                  {product.rating != null && !isNaN(product.rating) && (
  <Flex align="center" color="yellow.400">
    <Icon as={FaStar} />
    <Text ml={1} fontWeight="bold">
      {Number(product.rating).toFixed(1)}
    </Text>
  </Flex>
)}
                  </Flex>
                  
                  <Flex align="center" mt={2}>
                    <Avatar 
                      size="sm" 
                      name={product.farmer?.name || 'Farmer'} 
                      src={product.farmer?.avatar}
                      mr={2}
                    />
                    <Text fontSize="sm" color="gray.500">
                      {product.farmer?.name || t('Unknown farmer')}
                    </Text>
                  </Flex>
                </CardHeader>
                
                <CardBody py={3}>
                  <Flex align="center" mb={2}>
                    <Icon as={FaMapMarkerAlt} color={accentColor} mr={2} />
                    <Text fontSize="sm">{product.location}</Text>
                  </Flex>
                  <Text noOfLines={2} fontSize="sm" color="gray.600">
                    {product.description}
                  </Text>
                </CardBody>
                
                <CardFooter>
                  <MotionButton 
                    variant="outline" 
                    colorScheme="blue" 
                    flex={1}
                    mr={3}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewProduct(product.id)}
                  >
                    {t('Details')}
                  </MotionButton>
                  <MotionButton 
                    colorScheme="teal" 
                    flex={1}
                    mr={3}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBidClick(product)}
                  >
                    {t('Bid now')}
                  </MotionButton>
                  <Flex direction="column" gap={1}>
                    <IconButton
                      icon={<FaVideo />}
                      aria-label="Video call"
                      colorScheme="purple"
                      size="sm"
                      onClick={() => handleCallClick(product, 'video')}
                    />
                    <IconButton
                      icon={<FaPhone />}
                      aria-label="Voice call"
                      colorScheme="green"
                      size="sm"
                      onClick={() => handleCallClick(product, 'audio')}
                    />
                  </Flex>
                </CardFooter>
              </MotionCard>
            );
          })}
        </SimpleGrid>
      )}
      
      <BidModal 
        isOpen={isBidModalOpen} 
        onClose={onBidModalClose} 
        product={selectedProduct} 
        onSubmit={handleBidSubmit} 
      />
      
      {/* Call Modal */}
      <Modal 
        isOpen={isCallModalOpen} 
        onClose={() => {
          leaveCall();
          onCallModalClose();
        }}
        size="full"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Text>
                {callType === 'video' ? t('Video Call') : t('Voice Call')} - {callFarmer?.name || t('Farmer')}
              </Text>
              <Text fontSize="md" color={
                callStatus === 'connected' ? 'green.400' : 
                callStatus === 'connecting' ? 'yellow.400' : 
                'red.400'
              }>
                {callStatus === 'connecting' && t('Connecting...')}
                {callStatus === 'connected' && t('Connected')}
                {callStatus === 'ending' && t('Ending...')}
                {callStatus === 'ended' && t('Call Ended')}
                {callStatus === 'error' && t('Error')}
              </Text>
              <IconButton
                icon={<FaTimes />}
                aria-label="Close call"
                onClick={() => {
                  leaveCall();
                  onCallModalClose();
                }}
                variant="ghost"
              />
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex 
              h="calc(100vh - 200px)" 
              w="full" 
              position="relative"
              justify="center"
              align="center"
              bg="black"
              overflow="hidden"
            >
              {/* Remote video container */}
              <Box 
                id="remote-container" 
                w="full" 
                h="full"
                position="absolute"
                top={0}
                left={0}
              />
              
              {/* Local video */}
              {callType === 'video' && (
                <Box
                  id="local-video"
                  position="absolute"
                  bottom={4}
                  right={4}
                  w="200px"
                  h="150px"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="xl"
                  zIndex={10}
                />
              )}
              
              {/* Connection status */}
              {callStatus !== 'connected' && (
                <VStack spacing={4}>
                  <Avatar 
                    size="2xl" 
                    name={callFarmer?.name || t('Farmer')} 
                    src={callFarmer?.avatar}
                  />
                  <Text fontSize="2xl" fontWeight="bold">
                    {callStatus === 'connecting' 
                      ? t('Connecting to farmer...') 
                      : callStatus === 'ended' 
                        ? t('Call ended') 
                        : t('Call error')}
                  </Text>
                  <Spinner size="xl" />
                </VStack>
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4} w="full" justify="center">
              <IconButton
                icon={isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                aria-label={isVideoOn ? t('Turn off camera') : t('Turn on camera')}
                colorScheme={isVideoOn ? 'blue' : 'gray'}
                size="lg"
                onClick={toggleCamera}
                isRound
                disabled={callType !== 'video' || callStatus !== 'connected'}
              />
              <IconButton
                icon={isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                aria-label={isAudioOn ? t('Mute') : t('Unmute')}
                colorScheme={isAudioOn ? 'blue' : 'red'}
                size="lg"
                onClick={toggleMic}
                isRound
                disabled={callStatus !== 'connected'}
              />
              <IconButton
                icon={<FaTimes />}
                aria-label={t('End call')}
                colorScheme="red"
                size="lg"
                onClick={() => {
                  leaveCall();
                  onCallModalClose();
                }}
                isRound
              />
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BuyerMarketplace;