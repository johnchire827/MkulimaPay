import React, { useEffect, useState } from 'react';
import { 
  Box, Heading, Text, Flex, Icon, Button, 
  SimpleGrid, Card, CardBody, useToast, Spinner,
  Badge, Progress, useColorModeValue, Image,
  ScaleFade, Avatar, SlideFade, Fade, useDisclosure
} from '@chakra-ui/react';
import { 
  FaCheckCircle, FaBox, FaMapMarkerAlt, FaClock, 
  FaReceipt, FaTruck, FaShoppingBag, FaMoneyBillWave
} from 'react-icons/fa';
import { MdPayment, MdLocalShipping } from 'react-icons/md';
import { GiFarmer } from 'react-icons/gi';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import Confetti from 'react-confetti';

// Modern color palette
const COLORS = {
  primary: "#38A169",
  primaryLight: "#48BB78",
  accent: "#ED8936",
  background: "#F7FAFC",
  textPrimary: "#1A202C",
  textSecondary: "#718096",
  success: "#38A169",
  warning: "#DD6B20",
  error: "#E53E3E",
  cardBg: "#FFFFFF",
  highlight: "#E6FFFA"
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const { isOpen, onOpen } = useDisclosure();
  
  // Color mode values
  const cardBg = useColorModeValue(COLORS.cardBg, "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // Track window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
        onOpen(); // Trigger animations
      } catch (error) {
        toast({
          title: t('order_fetch_error'),
          description: t('order_fetch_error_desc'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrder();
    }
  }, [orderId, user, t, toast, navigate, onOpen]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={COLORS.background}>
        <Spinner size="xl" color={COLORS.primary} thickness="4px" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={COLORS.background} direction="column" p={4}>
        <Heading size="lg" mb={4} color={COLORS.textPrimary}>{t('order_not_found')}</Heading>
        <Button 
          bg={COLORS.primary}
          color="white"
          _hover={{ bg: COLORS.primaryLight }}
          onClick={() => navigate('/marketplace')}
        >
          {t('browse_products')}
        </Button>
      </Flex>
    );
  }

  // Calculate progress based on order status
  const getOrderProgress = () => {
    const statusMap = {
      'pending': 33,
      'processing': 66,
      'completed': 100
    };
    return statusMap[order.status] || 0;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate estimated delivery date (order date + 3 days)
  const getEstimatedDelivery = () => {
    if (!order.createdAt) return 'N/A';
    const deliveryDate = new Date(order.createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return formatDate(deliveryDate);
  };

  // Calculate total for order items
  const calculateOrderTotal = () => {
    if (!order.products || !order.products.length) return 0;
    return order.products.reduce(
      (sum, product) => sum + (product.price * product.quantity), 
      0
    );
  };

  // Get full image URL - FIXED LOGIC
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Use the same logic as in ProductDetail.js
    const backendBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    return `${backendBaseUrl}${imagePath}`;
  };

  // Map payment method to display name
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'mpesa': return 'M-Pesa';
      case 'cash': return 'Cash on Delivery';
      case 'card': return 'Credit Card';
      default: return method;
    }
  };

  return (
    <Box minH="100vh" bg={COLORS.background} p={{ base: 4, md: 8 }}>
      {/* Confetti celebration */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={isOpen ? 500 : 0}
      />
      
      <ScaleFade in={isOpen} initialScale={0.9}>
        <Box maxW="1200px" mx="auto">
          {/* Header Section */}
          <Flex direction="column" align="center" textAlign="center" mb={10}>
            <Box position="relative">
              <Icon 
                as={FaCheckCircle} 
                boxSize={{ base: 20, md: 28 }} 
                color={COLORS.success} 
                zIndex="2"
                position="relative"
              />
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg={COLORS.success}
                opacity="0.2"
                borderRadius="full"
                transform="scale(1.5)"
              />
            </Box>
            
            <Heading size="2xl" mt={6} mb={4} color={COLORS.textPrimary}>
              {t('Order Confirmed!')}
            </Heading>
            
            <Text fontSize="xl" maxW="600px" color={COLORS.textSecondary} mb={6}>
              {t('Thank you for your order! Your order has been successfully placed and is being processed.')}
            </Text>
            
            <Flex 
              bg={`${COLORS.success}10`} 
              p={4} 
              borderRadius="xl" 
              borderLeft={`4px solid ${COLORS.success}`}
              mb={6}
            >
              <Text fontWeight="bold" color={COLORS.textPrimary}>
                {t('Order ID:')} <Badge colorScheme="green" fontSize="md">{orderId}</Badge>
              </Text>
            </Flex>
          </Flex>
          
          {/* Order Progress */}
          <SlideFade in={isOpen} offsetY="20px">
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="2xl" 
              boxShadow="md" 
              mb={10}
              border="1px solid"
              borderColor={borderColor}
            >
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold" color={COLORS.textPrimary}>
                  {t('Order Status:')} 
                  <Badge 
                    ml={2} 
                    colorScheme={
                      order.status === 'completed' ? 'green' : 
                      order.status === 'processing' ? 'blue' : 
                      order.status === 'pending' ? 'orange' : 'gray'
                    }
                  >
                    {order.status}
                  </Badge>
                </Text>
                <Text color={COLORS.textSecondary}>
                  {t('Estimated Delivery:')} {getEstimatedDelivery()}
                </Text>
              </Flex>
              
              <Progress 
                value={getOrderProgress()} 
                colorScheme={
                  order.status === 'completed' ? 'green' : 
                  order.status === 'processing' ? 'blue' : 
                  order.status === 'pending' ? 'orange' : 'gray'
                }
                height="24px"
                borderRadius="full"
                mt={3}
                hasStripe
                isAnimated
              />
              
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={6}>
                {['Ordered', 'Pending', 'Processing', 'Completed'].map((step, index) => (
                  <Flex 
                    key={step}
                    direction="column" 
                    align="center"
                    position="relative"
                  >
                    {index < 3 && (
                      <Box 
                        position="absolute" 
                        top="16px" 
                        right="-40%"
                        width="80%" 
                        height="4px" 
                        bg={getOrderProgress() >= (index + 1) * 25 ? COLORS.primary : "gray.200"}
                      />
                    )}
                    <Flex
                      align="center"
                      justify="center"
                      w="32px"
                      h="32px"
                      borderRadius="full"
                      bg={getOrderProgress() >= (index + 1) * 25 ? COLORS.primary : "gray.200"}
                      color="white"
                      mb={2}
                      zIndex="1"
                    >
                      {index + 1}
                    </Flex>
                    <Text 
                      fontSize="sm" 
                      fontWeight={getOrderProgress() >= (index + 1) * 25 ? "bold" : "normal"}
                      color={COLORS.textPrimary}
                    >
                      {step}
                    </Text>
                  </Flex>
                ))}
              </SimpleGrid>
            </Box>
          </SlideFade>
          
          {/* Order Details */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
            {/* Order Items */}
            <SlideFade in={isOpen} offsetY="30px" delay={0.1}>
              <Card 
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <Flex align="center" mb={4}>
                    <Icon as={FaShoppingBag} boxSize={6} color={COLORS.primary} mr={2} />
                    <Heading size="md" color={COLORS.textPrimary}>{t('Order Items')}</Heading>
                  </Flex>
                  
                  {order.products && order.products.length > 0 ? (
                    order.products.map((product, index) => (
                      <Fade in={isOpen} key={product.id} delay={0.1 + (index * 0.1)}>
                        <Flex 
                          align="center" 
                          mb={4}
                          pb={4}
                          borderBottom={index < order.products.length - 1 ? "1px solid" : "none"}
                          borderColor={borderColor}
                        >
                          <Image 
                            src={getImageUrl(product.imageUrl)} 
                            alt={product.name}
                            boxSize="60px"
                            objectFit="cover"
                            borderRadius="md"
                            mr={4}
                            fallbackSrc="/placeholder.jpg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                          <Box flex="1">
                            <Text fontWeight="bold" color={COLORS.textPrimary}>{product.name}</Text>
                            <Flex justify="space-between">
                              <Text color={COLORS.textSecondary}>
                                {product.quantity} x KES {product.price?.toLocaleString?.() || '0.00'}
                              </Text>
                              <Text fontWeight="bold" color={COLORS.textPrimary}>
                                KES {(product.quantity * product.price).toLocaleString()}
                              </Text>
                            </Flex>
                            <Text fontSize="sm" color={COLORS.textSecondary}>
                              {t('Sold by:')} {product.farmerName || 'Mkulima Pay'}
                            </Text>
                          </Box>
                        </Flex>
                      </Fade>
                    ))
                  ) : (
                    <Text>{t('No Items Found')}</Text>
                  )}
                  
                  <Flex justify="space-between" mt={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
                    <Text fontWeight="bold" color={COLORS.textPrimary}>{t('Total:')}</Text>
                    <Text fontSize="xl" fontWeight="bold" color={COLORS.primary}>
                      KES {calculateOrderTotal().toLocaleString()}
                    </Text>
                  </Flex>
                </CardBody>
              </Card>
            </SlideFade>
            
            {/* Shipping Information */}
            <SlideFade in={isOpen} offsetY="30px" delay={0.2}>
              <Card 
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <Flex align="center" mb={4}>
                    <Icon as={FaMapMarkerAlt} boxSize={6} color={COLORS.primary} mr={2} />
                    <Heading size="md" color={COLORS.textPrimary}>{t('Shipping Details')}</Heading>
                  </Flex>
                  
                  <Box mb={4}>
                    <Text fontWeight="bold" color={COLORS.textSecondary}>{t('Delivery Address:')}</Text>
                    <Text color={COLORS.textPrimary}>{order.shippingAddress}</Text>
                  </Box>
                  
                  <Box mb={4}>
                    <Text fontWeight="bold" color={COLORS.textSecondary}>{t('Recipient:')}</Text>
                    <Text color={COLORS.textPrimary}>{order.shippingName || user?.name || 'Customer'}</Text>
                  </Box>
                  
                  <Box mb={4}>
                    <Text fontWeight="bold" color={COLORS.textSecondary}>{t('MkulimaPay Contact:')}</Text>
                    <Text color={COLORS.textPrimary}>{order.shippingPhone || user?.phone || '+254768161533'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" color={COLORS.textSecondary}>{t('Delivery Method:')}</Text>
                    <Text color={COLORS.textPrimary}>
                      {order.shippingMethod === 'express' ? 'Express Delivery (1-2 days)' : 'Standard Delivery (3-5 days)'}
                    </Text>
                  </Box>
                </CardBody>
              </Card>
            </SlideFade>
            
            {/* Payment & Farmer Info */}
            <SlideFade in={isOpen} offsetY="30px" delay={0.3}>
              <Card 
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <Flex align="center" mb={4}>
                    <Icon as={MdPayment} boxSize={6} color={COLORS.primary} mr={2} />
                    <Heading size="md" color={COLORS.textPrimary}>{t('Payment Information')}</Heading>
                  </Flex>
                  
                  <Box mb={6}>
                    <Flex justify="space-between" mb={2}>
                      <Text color={COLORS.textSecondary}>{t('Payment Method:')}</Text>
                      <Text fontWeight="bold" color={COLORS.textPrimary}>
                        {getPaymentMethodName(order.paymentMethod)}
                      </Text>
                    </Flex>
                    
                    <Flex justify="space-between" mb={2}>
                      <Text color={COLORS.textSecondary}>{t('Payment Status:')}</Text>
                      <Badge 
                        colorScheme={order.paymentStatus === 'paid' ? 'green' : 'orange'} 
                        fontSize="sm"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </Flex>
                    
                    <Flex justify="space-between">
                      <Text color={COLORS.textSecondary}>{t('Order Date:')}</Text>
                      <Text color={COLORS.textPrimary}>{formatDate(order.createdAt)}</Text>
                    </Flex>
                  </Box>
                  
                  <Flex align="center" mb={4}>
                    <Icon as={GiFarmer} boxSize={6} color={COLORS.primary} mr={2} />
                    <Heading size="md" color={COLORS.textPrimary}>{t('Farmer Information')}</Heading>
                  </Flex>
                  
                  {order.products && order.products.length > 0 && order.products[0].farmerId && (
                    <Flex align="center">
                      <Avatar 
                        name={order.products[0].farmerName} 
                        src={order.products[0].farmerAvatar} 
                        size="md" 
                        mr={3} 
                      />
                      <Box>
                        <Text fontWeight="bold" color={COLORS.textPrimary}>
                          {order.products[0].farmerName || 'Local Farmer'}
                        </Text>
                        <Text color={COLORS.textSecondary}>
                          {order.products[0].farmerLocation || 'Kenya'}
                        </Text>
                      </Box>
                    </Flex>
                  )}
                </CardBody>
              </Card>
            </SlideFade>
          </SimpleGrid>
          
          {/* Action Buttons */}
          <Flex 
            justify="center" 
            gap={4} 
            flexWrap="wrap"
            mt={10}
          >
            {order.products && order.products.length > 0 && (
              <Button 
                bg={COLORS.primary}
                color="white"
                _hover={{ bg: COLORS.primaryLight }}
                leftIcon={<FaTruck />}
                onClick={() => navigate(`/supply-chain/${order.products[0].id}`)}
                size="lg"
                px={8}
                py={6}
              >
                {t('Track Shipment')}
              </Button>
            )}
            
            <Button 
              variant="outline"
              borderColor={COLORS.primary}
              color={COLORS.primary}
              _hover={{ bg: `${COLORS.primary}10` }}
              leftIcon={<FaReceipt />}
              onClick={() => navigate(`/orders/${orderId}`)}
              size="lg"
              px={8}
              py={6}
            >
              {t('View Order Details')}
            </Button>
            
            <Button 
              bg={COLORS.accent}
              color="white"
              _hover={{ bg: `${COLORS.accent}CC` }}
              leftIcon={<FaBox />}
              onClick={() => navigate('/marketplace')}
              size="lg"
              px={8}
              py={6}
            >
              {t('Continue Shopping')}
            </Button>
          </Flex>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default OrderConfirmation;