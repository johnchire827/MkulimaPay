// C:\Users\johnii\Downloads\mkulima-pay\client\src\pages\ProductDetail.js
import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, Text, Flex, Image, Button, Badge, Icon, Stack, 
  SimpleGrid, Card, CardBody, useToast, Input, FormControl, FormLabel,
  Tabs, TabList, Tab, TabPanels, TabPanel, Spinner, Alert, Textarea, AlertIcon,
  Avatar, Skeleton, SkeletonText, useColorModeValue, ScaleFade, Fade, SlideFade
} from '@chakra-ui/react';
import Rating from 'react-rating';
import { 
  FaStar, FaMapMarkerAlt, FaLeaf, FaShoppingCart, FaTruck, 
  FaBox, FaRoute, FaUser, FaClock, FaRegStar, FaRobot, FaCheck, FaSeedling
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import ProductVerifier from '../components/ProductVerifier';

// Modern color palette
const COLORS = {
  primary: "#38A169",          // Vibrant green
  primaryLight: "#48BB78",     // Lighter green
  accent: "#ED8936",           // Warm orange
  background: "#F7FAFC",       // Light background
  textPrimary: "#1A202C",      // Dark text
  textSecondary: "#718096",    // Gray text
  success: "#38A169",          // Success green
  warning: "#DD6B20",          // Warning orange
  error: "#E53E3E",            // Error red
  cardBg: "#FFFFFF",           // White cards
  highlight: "#E6FFFA"         // Teal highlight
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const { dispatch } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // Backend base URL
  const backendBaseUrl = 'http://localhost:8080';
  
  // Color mode values
  const cardBg = useColorModeValue(COLORS.cardBg, "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // Helper function to handle image URLs
  const getFullImageUrl = (url) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${backendBaseUrl}${url}`;
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productRes = await api.get(`/products/${id}`, {
          signal: abortController.signal
        });
        const productData = productRes.data;
        
        if (!isMounted) return;
        
        // Fetch reviews for this product
        let reviewsData = [];
        try {
          const reviewsRes = await api.get(`/reviews/product/${id}`, {
            signal: abortController.signal
          });
          reviewsData = reviewsRes.data || [];
        } catch (reviewsError) {
          console.error('Error fetching reviews, using fallback:', reviewsError);
        }
        
        // Update product with real reviews
        const enhancedProduct = {
          ...productData,
          variants: productData.variants || [],
          rating: productData.rating || 0,
          reviewCount: productData.reviewCount || 0
        };
        
        setProduct(enhancedProduct);
        setReviews(reviewsData);
        
        // Set initial variant and option
        if (productData.variants?.length > 0) {
          const initialVariant = productData.variants[0];
          setSelectedVariant(initialVariant);
          if (initialVariant.options?.length > 0) {
            setSelectedOption(initialVariant.options[0]);
          }
        }
        
        // Fetch related products in same category
        let relatedData = [];
        try {
          const relatedRes = await api.get('/products', {
            params: {
              category: productData.category,
              exclude: id,
              limit: 4
            },
            signal: abortController.signal
          });
          relatedData = relatedRes.data || [];
        } catch (relatedError) {
          console.error('Error fetching related products:', relatedError);
        }
        
        if (isMounted) {
          setRelatedProducts(relatedData);
        }
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request was canceled');
        } else if (isMounted) {
          setError(err.message || t('fetch_product_error'));
          console.error('Error fetching product data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchProductData();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [id, t]);

  const handleVerificationStart = () => {
    setIsVerifying(true);
  };

  const handleVerificationComplete = (result) => {
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const handleAddToCart = () => {
    if (!product) {
      toast({
        title: t('error'),
        description: t('product_not_loaded'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!user) {
      toast({
        title: t('authentication_required'),
        description: t('login_to_cart'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth');
      return;
    }
    
    if (verificationResult && verificationResult.recommendation === 'Reject') {
      toast({
        title: 'Quality Issue Detected',
        description: 'This product has quality issues. Please verify before purchasing.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Use selected option if available, otherwise fallback
    const priceOption = selectedOption || product.variants?.[0]?.options?.[0] || {};
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: priceOption.price || product.price,
        quantity: quantity,
        imageUrl: product.images?.[0] ? getFullImageUrl(product.images[0]) : '/placeholder.jpg',
        unit: product.unit,
        farmerId: product.farmer?.id || 'unknown',
        variant: selectedVariant,
        option: selectedOption
      }
    });
    
    toast({
      title: t('added_to_cart'),
      description: `${quantity} ${t('of')} ${product.name} ${t('added_to_cart')}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleBuyNow = () => {
    if (!product) {
      toast({
        title: t('error'),
        description: t('product_not_loaded'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!user) {
      toast({
        title: t('authentication_required'),
        description: t('login_to_buy'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth');
      return;
    }
    
    if (verificationResult && verificationResult.recommendation === 'Reject') {
      toast({
        title: 'Quality Issue Detected',
        description: 'This product has quality issues. Please verify before purchasing.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Use selected option if available, otherwise fallback
    const priceOption = selectedOption || product.variants?.[0]?.options?.[0] || {};
    
    // Add to cart and proceed to checkout
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: priceOption.price || product.price,
        quantity: quantity,
        imageUrl: product.images?.[0] ? getFullImageUrl(product.images[0]) : '/placeholder.jpg',
        unit: product.unit,
        farmerId: product.farmer?.id || 'unknown',
        variant: selectedVariant,
        option: selectedOption
      }
    });
    
    navigate('/checkout');
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      toast({
        title: t('authentication_required'),
        description: t('login_to_review'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (userRating === 0) {
      toast({
        title: t('rating_required'),
        description: t('please_select_rating'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Submit review to backend
      const reviewRes = await api.post('/reviews', {
        productId: product.id,
        rating: userRating,
        comment: userReview
      });
      
      const newReview = {
        ...reviewRes.data,
        user: {
          id: user.id,
          name: user.name || 'Anonymous',
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`
        }
      };
      
      // Update reviews list
      setReviews([newReview, ...reviews]);
      
      // Update product rating in UI
      setProduct(prev => ({
        ...prev,
        rating: reviewRes.data.newAverageRating,
        reviewCount: reviewRes.data.newReviewCount
      }));
      
      setUserReview('');
      setUserRating(0);
      
      toast({
        title: t('review_submitted'),
        description: t('review_thank_you'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      toast({
        title: t('review_error'),
        description: error.response?.data?.message || t('review_submission_error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={{ base: 4, md: 8 }} bg={COLORS.background} minH="100vh">
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          <Box flex={1}>
            <Skeleton height={{ base: '300px', md: '400px' }} borderRadius="xl" mb={4} />
            <SimpleGrid columns={4} spacing={2}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} height="80px" borderRadius="md" />
              ))}
            </SimpleGrid>
          </Box>
          
          <Box flex={1}>
            <Skeleton height="40px" mb={4} />
            <Skeleton height="20px" width="60%" mb={4} />
            <Flex mb={6}>
              {[1, 2, 3, 4, 5].map(i => (
                <Icon key={i} as={FaRegStar} color="gray.300" mr={1} boxSize="20px" />
              ))}
              <Skeleton ml={2} height="20px" width="100px" />
            </Flex>
            <Skeleton height="30px" width="40%" mb={6} />
            <SkeletonText noOfLines={6} spacing={3} mb={8} />
            <Skeleton height="40px" width="160px" mb={2} />
            <Skeleton height="20px" width="40%" mb={6} />
            <Flex gap={4}>
              <Skeleton height="50px" width="200px" />
              <Skeleton height="50px" width="200px" />
            </Flex>
          </Box>
        </Flex>
        
        <Tabs mt={10}>
          <TabList>
            <Tab><Skeleton height="20px" width="80px" /></Tab>
            <Tab><Skeleton height="20px" width="100px" /></Tab>
            <Tab><Skeleton height="20px" width="100px" /></Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SkeletonText noOfLines={8} spacing={3} />
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Heading size="lg" mt={16} mb={6}><Skeleton height="30px" width="200px" /></Heading>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {[1, 2, 3, 4].map(i => (
            <Card key={i} borderRadius="xl" bg={cardBg} boxShadow="sm">
              <Skeleton height="150px" borderTopRadius="xl" />
              <CardBody>
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" width="60%" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Flex justify="center" py={20} direction="column" align="center" bg={COLORS.background} minH="100vh">
        <Alert status="error" mb={4} maxW="500px" borderRadius="lg">
          <AlertIcon />
          {error || t('fetch_product_error')}
        </Alert>
        <Button 
          colorScheme="green" 
          onClick={() => navigate('/marketplace')}
          bg={COLORS.primary}
          _hover={{ bg: COLORS.primaryLight }}
        >
          {t('browse_products')}
        </Button>
      </Flex>
    );
  }

  // Create display images array
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  // Create safe reviews with fallback
  const safeReviews = reviews.map(review => ({
    ...review,
    user: {
      id: review.user?.id || 'unknown',
      name: review.user?.name || 'Anonymous',
      avatar: review.user?.avatar || `https://i.pravatar.cc/150?u=${review.user?.id || 'unknown'}`
    }
  }));

  return (
    <Box p={{ base: 4, md: 8 }} bg={COLORS.background} minH="100vh">
      <ScaleFade in={true} initialScale={0.95}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          {/* Product Images - Left Column */}
          <Box flex={1}>
            <Box 
              borderRadius="2xl" 
              overflow="hidden" 
              boxShadow="lg"
              position="relative"
              mb={4}
            >
              <Image 
                src={getFullImageUrl(displayImages[mainImageIndex])} 
                alt={product.name}
                w="100%"
                maxH="500px"
                objectFit="contain"
                fallbackSrc="/placeholder.jpg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
              {product.organic && (
                <Badge 
                  position="absolute" 
                  top={4} 
                  right={4} 
                  bg="rgba(56, 161, 105, 0.9)" 
                  color="white"
                  p={2}
                  borderRadius="full"
                  boxShadow="md"
                >
                  <Flex align="center">
                    <Icon as={FaLeaf} mr={1} /> {t('organic')}
                  </Flex>
                </Badge>
              )}
            </Box>
            
            {displayImages.length > 1 && (
              <SimpleGrid columns={Math.min(4, displayImages.length)} spacing={3}>
                {displayImages.map((img, index) => (
                  <Box 
                    key={index}
                    borderRadius="lg"
                    overflow="hidden"
                    cursor="pointer"
                    border={index === mainImageIndex ? `3px solid ${COLORS.primary}` : `1px solid ${borderColor}`}
                    transform={index === mainImageIndex ? 'scale(1.05)' : 'scale(1)'}
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: COLORS.primary,
                      transform: 'scale(1.05)'
                    }}
                    onClick={() => setMainImageIndex(index)}
                  >
                    <Image 
                      src={getFullImageUrl(img)}
                      alt={`${product.name} thumbnail ${index}`}
                      objectFit="cover"
                      height="80px"
                      fallbackSrc="/placeholder-thumb.jpg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-thumb.jpg';
                      }}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>
          
          {/* Product Info - Right Column */}
          <Box flex={1}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Heading size="xl" color={COLORS.textPrimary}>{product.name}</Heading>
              <Badge 
                bg={COLORS.primary} 
                color="white" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontSize="sm"
              >
                {product.category}
              </Badge>
            </Flex>
            
            <Flex align="center" mb={4}>
              <Icon as={FaMapMarkerAlt} color={COLORS.primary} mr={2} />
              <Text color={COLORS.textSecondary}>{product.location || t('location_not_specified')}</Text>
            </Flex>
            
            <Flex align="center" mb={6}>
              <Rating
                initialRating={product.rating || 0}
                fractions={2}
                readonly
                emptySymbol={<FaStar style={{ color: '#CBD5E0', marginRight: '2px' }} />}
                fullSymbol={<FaStar style={{ color: '#ECC94B', marginRight: '2px' }} />}
              />
              <Text ml={2} color={COLORS.textSecondary}>({product.reviewCount || 0} {t('reviews')})</Text>
            </Flex>
            
            <Text fontSize="2xl" fontWeight="bold" mb={6} color={COLORS.textPrimary}>
              KES {product.price?.toLocaleString?.() || '0.00'}/{product.unit}
            </Text>
            
            <Text mb={8} color={COLORS.textSecondary}>{product.description || t('no_description_available')}</Text>
            
            {/* Variants Selection */}
            {product.variants?.length > 0 && (
              <Box mb={6}>
                <Text fontWeight="bold" mb={2}>Select Option:</Text>
                <Stack direction="row" flexWrap="wrap" spacing={3}>
                  {product.variants.map((variant, vIndex) => (
                    <Button
                      key={vIndex}
                      size="sm"
                      variant={selectedVariant?.id === variant.id ? 'solid' : 'outline'}
                      colorScheme={selectedVariant?.id === variant.id ? 'green' : 'gray'}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setSelectedOption(variant.options?.[0] || null);
                      }}
                    >
                      {variant.name}
                    </Button>
                  ))}
                </Stack>
                
                {selectedVariant?.options?.length > 0 && (
                  <Stack direction="row" mt={3} flexWrap="wrap" spacing={3}>
                    {selectedVariant.options.map((option, oIndex) => (
                      <Button
                        key={oIndex}
                        size="sm"
                        variant={selectedOption?.id === option.id ? 'solid' : 'outline'}
                        colorScheme={selectedOption?.id === option.id ? 'green' : 'gray'}
                        onClick={() => setSelectedOption(option)}
                      >
                        {option.name} - KES {option.price?.toLocaleString?.() || '0.00'}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
            
            <FormControl mb={6}>
              <FormLabel fontWeight="bold">Quantity</FormLabel>
              <Flex align="center">
                <Button 
                  size="sm" 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  bg={COLORS.primary}
                  color="white"
                  _hover={{ bg: COLORS.primaryLight }}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') setQuantity('');
                    else {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue)) setQuantity(Math.max(1, numValue));
                    }
                  }}
                  min={1}
                  w="80px"
                  mx={2}
                  textAlign="center"
                />
                <Button 
                  size="sm" 
                  onClick={() => setQuantity(prev => prev + 1)}
                  bg={COLORS.primary}
                  color="white"
                  _hover={{ bg: COLORS.primaryLight }}
                >
                  +
                </Button>
              </Flex>
            </FormControl>
            
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={6}>
              <Button 
                bg={COLORS.primary}
                color="white"
                size="lg" 
                leftIcon={<FaShoppingCart />}
                onClick={handleAddToCart}
                _hover={{ 
                  bg: COLORS.primaryLight,
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                _active={{ transform: 'scale(0.98)' }}
                transition="all 0.2s"
                isDisabled={isVerifying || (verificationResult && verificationResult.recommendation === 'Reject')}
                boxShadow="md"
              >
                {t('Add to cart')}
              </Button>
              <Button 
                bg={COLORS.accent}
                color="white"
                size="lg"
                onClick={handleBuyNow}
                _hover={{ 
                  bg: `${COLORS.accent}CC`,
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                _active={{ transform: 'scale(0.98)' }}
                transition="all 0.2s"
                isDisabled={isVerifying || (verificationResult && verificationResult.recommendation === 'Reject')}
                boxShadow="md"
              >
                {t('Buy now')}
              </Button>
            </Stack>
            
            {/* Verification Warning */}
            {verificationResult && verificationResult.recommendation === 'Reject' && (
              <SlideFade in={true} offsetY="20px">
                <Alert status="error" mt={4} borderRadius="lg" variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Product quality issues detected!</Text>
                    <Text>We recommend against purchasing this item based on quality analysis.</Text>
                  </Box>
                </Alert>
              </SlideFade>
            )}
            
            {/* Farmer Info */}
            {product.farmer && (
              <SlideFade in={true} offsetY="20px">
                <Box mt={8} p={4} bg={COLORS.highlight} borderRadius="xl" borderLeft={`4px solid ${COLORS.primary}`}>
                  <Flex align="center">
                    <Avatar 
                      name={product.farmer.name || 'Farmer'} 
                      src={product.farmer.avatar} 
                      size="md" 
                      mr={3} 
                    />
                    <Box>
                      <Text fontWeight="bold" color={COLORS.textSecondary}>{t('Sold by:')}</Text>
                      <Text fontSize="lg" fontWeight="bold" color={COLORS.textPrimary}>
                        {product.farmer.name || 'Unknown Farmer'}
                      </Text>
                      {product.farmer.verified && (
                        <Flex align="center" mt={1}>
                          <Icon as={FaCheck} color={COLORS.primary} mr={1} />
                          <Text color={COLORS.primary} fontSize="sm">Verified Farmer</Text>
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                </Box>
              </SlideFade>
            )}
          </Box>
        </Flex>
      </ScaleFade>
      
      {/* Tabs */}
      <Tabs mt={10} variant="unstyled" colorScheme="green">
        <TabList 
          borderBottom="1px solid" 
          borderColor={borderColor}
          position="sticky"
          top="0"
          bg={COLORS.background}
          zIndex="1"
          px={1}
        >
          <Tab 
            _selected={{ 
              color: COLORS.primary, 
              borderBottom: `2px solid ${COLORS.primary}`,
              fontWeight: "bold"
            }}
            py={4}
            px={6}
          >
            {t('description')}
          </Tab>
          <Tab 
            _selected={{ 
              color: COLORS.primary, 
              borderBottom: `2px solid ${COLORS.primary}`,
              fontWeight: "bold"
            }}
            py={4}
            px={6}
          >
            <Flex align="center">
              <Icon as={FaRobot} color="blue.500" mr={2} />
              AI Quality Scan
            </Flex>
          </Tab>
          <Tab 
            _selected={{ 
              color: COLORS.primary, 
              borderBottom: `2px solid ${COLORS.primary}`,
              fontWeight: "bold"
            }}
            py={4}
            px={6}
          >
            {t('reviews')} ({safeReviews.length})
          </Tab>
        </TabList>
        
        <TabPanels mt={6}>
          <TabPanel>
            <Text whiteSpace="pre-wrap" color={COLORS.textSecondary}>
              {product.description || t('no_description_available')}
            </Text>
            
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Box mt={8}>
                <Heading size="md" mb={4} color={COLORS.textPrimary}>{t('specifications')}</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Box key={key} bg={cardBg} p={4} borderRadius="lg" boxShadow="sm">
                      <Text fontWeight="bold" color={COLORS.textPrimary}>{key}</Text>
                      <Text color={COLORS.textSecondary}>{value}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </TabPanel>
          <TabPanel>
            <Box mb={8}>
              <Heading size="md" mb={4} color={COLORS.textPrimary}>
                <Flex align="center">
                  <Icon as={FaRobot} color="blue.500" mr={2} />
                  AI-Powered Quality Scanner
                </Flex>
              </Heading>
              <Text mb={6} color={COLORS.textSecondary}>
                Upload a photo of the actual product to verify its quality using our AI system. 
                We'll analyze freshness, defects, and give you a purchase recommendation.
              </Text>
              
              <ProductVerifier 
                onVerificationComplete={handleVerificationComplete}
                onVerificationStart={handleVerificationStart}
              />
              
              {isVerifying && (
                <Flex justify="center" my={8}>
                  <Spinner size="xl" color={COLORS.primary} thickness="4px" />
                  <Text ml={4} fontSize="lg" color={COLORS.textPrimary}>Analyzing product quality...</Text>
                </Flex>
              )}
              
              {verificationResult && (
                <SlideFade in={true} offsetY="20px">
                  <Box 
                    mt={8} 
                    p={6} 
                    bg={verificationResult.recommendation === 'Buy' ? `${COLORS.success}10` : `${COLORS.error}10`} 
                    borderRadius="xl"
                    borderLeft={`4px solid ${verificationResult.recommendation === 'Buy' ? COLORS.success : COLORS.error}`}
                  >
                    <Heading size="md" mb={4} color={COLORS.textPrimary}>Quality Analysis Report</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textSecondary}>Produce Type</Text>
                        <Text color={COLORS.textPrimary}>{verificationResult.produceType}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textSecondary}>Condition</Text>
                        <Text color={COLORS.textPrimary}>{verificationResult.condition}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textSecondary}>Quality Grade</Text>
                        <Text 
                          color={
                            verificationResult.qualityGrade === 'Premium' ? COLORS.success : 
                            verificationResult.qualityGrade === 'Good' ? COLORS.primary : 
                            COLORS.error
                          }
                          fontWeight="bold"
                        >
                          {verificationResult.qualityGrade}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textSecondary}>Freshness</Text>
                        <Flex align="center">
                          <Box 
                            w="100%" 
                            bg="gray.100" 
                            h="8px" 
                            borderRadius="full" 
                            overflow="hidden"
                            mr={3}
                          >
                            <Box 
                              w={`${verificationResult.freshnessPercentage || 0}%`} 
                              h="100%" 
                              bg={COLORS.primary}
                            />
                          </Box>
                          <Text color={COLORS.textPrimary}>{verificationResult.freshnessPercentage || 'N/A'}%</Text>
                        </Flex>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textSecondary}>Defects</Text>
                        <Text color={COLORS.textPrimary}>{verificationResult.defects || 'None detected'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textSecondary}>Recommendation</Text>
                        <Text 
                          fontWeight="bold"
                          color={verificationResult.recommendation === 'Buy' ? COLORS.success : COLORS.error}
                          fontSize="lg"
                        >
                          {verificationResult.recommendation}
                        </Text>
                      </Box>
                    </SimpleGrid>
                    
                    {verificationResult.storageTips && (
                      <Box mt={6}>
                        <Heading size="sm" mb={2} color={COLORS.textPrimary}>Storage Tips</Heading>
                        <Text color={COLORS.textSecondary}>{verificationResult.storageTips}</Text>
                      </Box>
                    )}
                  </Box>
                </SlideFade>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            {/* Review Form */}
            <Box mb={8} p={6} bg={cardBg} borderRadius="2xl" boxShadow="sm">
              <Heading size="md" mb={4} color={COLORS.textPrimary}>{t('write review')}</Heading>
              <Flex mb={4}>
                <Rating
                  initialRating={userRating}
                  onChange={setUserRating}
                  emptySymbol={<FaStar style={{ color: '#CBD5E0', fontSize: '28px', marginRight: '4px' }} />}
                  fullSymbol={<FaStar style={{ color: '#ECC94B', fontSize: '28px', marginRight: '4px' }} />}
                />
              </Flex>
              <Textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder={t('review placeholder')}
                mb={4}
                minH="120px"
                focusBorderColor={COLORS.primary}
              />
              <Button 
                bg={COLORS.primary}
                color="white"
                onClick={handleReviewSubmit}
                _hover={{ bg: COLORS.primaryLight }}
                isDisabled={!user || userRating === 0}
              >
                {t('submit review')}
              </Button>
            </Box>
            
            {/* Reviews List */}
            <Heading size="md" mb={4} color={COLORS.textPrimary}>{t('customer reviews')}</Heading>
            {safeReviews.length === 0 ? (
              <Flex 
                direction="column" 
                align="center" 
                p={8} 
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="sm"
              >
                <Icon as={FaRegStar} boxSize={10} color="gray.400" mb={4} />
                <Text fontSize="lg" mb={2} color={COLORS.textPrimary}>{t('no reviews yet')}</Text>
                <Text color={COLORS.textSecondary} textAlign="center">
                  {t('be first to review')}
                </Text>
              </Flex>
            ) : (
              <Stack spacing={6}>
                {safeReviews.map(review => (
                  <Fade in={true} key={review.id}>
                    <Box 
                      p={6} 
                      bg={cardBg} 
                      borderRadius="2xl" 
                      boxShadow="sm"
                      borderLeft={`3px solid ${COLORS.primary}`}
                    >
                      <Flex align="center" mb={3}>
                        <Avatar 
                          name={review.user.name} 
                          src={review.user.avatar} 
                          size="md" 
                          mr={3} 
                        />
                        <Box>
                          <Text fontWeight="bold" color={COLORS.textPrimary}>{review.user.name}</Text>
                          <Flex align="center">
                            <Rating
                              initialRating={review.rating}
                              readonly
                              fractions={2}
                              emptySymbol={<FaStar style={{ color: '#CBD5E0', fontSize: '16px', marginRight: '1px' }} />}
                              fullSymbol={<FaStar style={{ color: '#ECC94B', fontSize: '16px', marginRight: '1px' }} />}
                            />
                            <Text ml={2} color={COLORS.textSecondary} fontSize="sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </Flex>
                        </Box>
                      </Flex>
                      <Text mt={3} color={COLORS.textSecondary}>{review.comment}</Text>
                    </Box>
                  </Fade>
                ))}
              </Stack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <SlideFade in={true} offsetY="20px">
          <Box mt={16}>
            <Flex align="center" mb={6}>
              <Icon as={FaSeedling} color={COLORS.primary} boxSize={6} mr={2} />
              <Heading size="lg" color={COLORS.textPrimary}>Related Products</Heading>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
              {relatedProducts.map(related => (
                <Card 
                  key={related.id} 
                  borderRadius="2xl"
                  cursor="pointer"
                  onClick={() => navigate(`/product/${related.id}`)}
                  _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
                  transition="all 0.3s"
                  h="100%"
                  display="flex"
                  flexDirection="column"
                  bg={cardBg}
                  overflow="hidden"
                >
                  <Image 
                    src={getFullImageUrl(related.imageUrl)}
                    alt={related.name}
                    borderTopRadius="2xl"
                    h="180px"
                    objectFit="cover"
                    fallbackSrc="/placeholder.jpg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <CardBody flex={1} display="flex" flexDirection="column">
                    <Heading size="sm" mb={2} color={COLORS.textPrimary}>{related.name}</Heading>
                    <Text fontSize="sm" color={COLORS.textSecondary} mb={3} noOfLines={2}>
                      {related.shortDescription || related.description?.substring(0, 80) + '...'}
                    </Text>
                    <Text fontWeight="bold" mt="auto" color={COLORS.textPrimary}>
                      KES {related.price?.toLocaleString?.() || '0.00'}/{related.unit}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </SlideFade>
      )}
    </Box>
  );
};

export default ProductDetail;