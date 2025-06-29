import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Stack, FormControl, FormLabel,
  Input, Button, useToast, RadioGroup, Radio, Grid, Alert, AlertIcon,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, IconButton, useColorModeValue, SlideFade, ScaleFade, 
  FormHelperText, Tooltip, Badge, Spinner, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { FaLock, FaPhone, FaInfoCircle, FaCreditCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const CheckoutPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { items, total, dispatch } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutId, setCheckoutId] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('green.500', 'green.300');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    county: '',
    paymentMethod: 'mpesa'
  });
  
  // Format phone number for M-Pesa
  const formatPhoneForMpesa = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If starts with '0', convert to 254 format
    if (digits.startsWith('0')) {
      return '254' + digits.substring(1);
    }
    
    // If starts with '7', add 254 prefix
    if (digits.startsWith('7')) {
      return '254' + digits;
    }
    
    // If already in 254 format, return as is
    return digits;
  };

  // Poll for payment status
  useEffect(() => {
    if (!checkoutId || paymentStatus !== 'pending') return;
    
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/transactions/status/${checkoutId}`);
        const status = response.data.status;
        
        if (status === 'completed') {
          setPaymentStatus('success');
          dispatch({ type: 'CLEAR_CART' });
          
          // Redirect to confirmation
          setTimeout(() => {
            navigate(`/order-confirmation/${checkoutId}`);
            onClose();
          }, 2000);
          
          clearInterval(interval);
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          clearInterval(interval);
        }
        
        // Stop polling after 2 minutes
        setPollingCount(prev => prev + 1);
        if (pollingCount > 24) { // 24 * 5s = 2 minutes
          clearInterval(interval);
          setPaymentStatus('failed');
          toast({
            title: 'Payment timeout',
            description: 'M-Pesa payment did not complete in time',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Payment status error:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [checkoutId, paymentStatus, pollingCount, navigate, onClose, dispatch, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Validate phone number for M-Pesa
      if (formData.paymentMethod === 'mpesa') {
        const phoneRegex = /^0[17]\d{8}$/;
        if (!phoneRegex.test(formData.phone)) {
          toast({
            title: 'Invalid Phone Number',
            description: 'Please enter a valid Kenyan phone number (e.g. 07XXXXXXXX)',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setIsProcessing(false);
          return;
        }
      }
      
      // Create transaction for M-Pesa payment
      if (formData.paymentMethod === 'mpesa') {
        setPaymentStatus('pending');
        onOpen();
        setPollingCount(0);
        
        // Initiate M-Pesa payment
        const formattedPhone = formatPhoneForMpesa(formData.phone);
        
        const transactionResponse = await api.post('/transactions', {
          userId: user.id,
          amount: total,
          type: 'deposit',
          phone: formattedPhone,
          provider: 'mpesa'
        });
        
        const transactionId = transactionResponse.data.id;
        setCheckoutId(transactionId);
        
        toast({
          title: t('payment initiated'),
          description: t('mpesa payment prompt'),
          status: 'info',
          duration: 10000,
          isClosable: true,
        });
        
        // Create order after payment initiation
        const orderResponse = await api.post('/orders', {
          userId: user.id,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            unit: item.unit,
            imageUrl: item.imageUrl,
            farmerId: item.farmerId
          })),
          total,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.county}`,
          shippingPhone: formData.phone,
          shippingName: `${formData.firstName} ${formData.lastName}`,
          paymentMethod: formData.paymentMethod,
          transactionId: transactionId
        });
        
        const orderId = orderResponse.data.order.id;
        setCheckoutId(orderId);
      } else {
        // For cash payments, just create the order
        const orderResponse = await api.post('/orders', {
          userId: user.id,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            unit: item.unit,
            imageUrl: item.imageUrl,
            farmerId: item.farmerId
          })),
          total,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.county}`,
          shippingPhone: formData.phone,
          shippingName: `${formData.firstName} ${formData.lastName}`,
          paymentMethod: formData.paymentMethod
        });
        
        const orderId = orderResponse.data.order.id;
        setCheckoutId(orderId);
        
        // Clear cart and redirect
        dispatch({ type: 'CLEAR_CART' });
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentStatus('failed');
      
      toast({
        title: t('order failed'),
        description: error.response?.data?.message || t('order_failed_message'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentStatusModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader 
          bg={paymentStatus === 'success' ? 'green.500' : paymentStatus === 'failed' ? 'red.500' : 'blue.500'}
          color="white"
          textAlign="center"
        >
          {paymentStatus === 'pending' && t('processing_payment')}
          {paymentStatus === 'success' && t('payment_success')}
          {paymentStatus === 'failed' && t('payment_failed')}
        </ModalHeader>
        <ModalBody py={8} textAlign="center">
          <ScaleFade in={true}>
            {paymentStatus === 'pending' && (
              <>
                <Box mb={6}>
                  <Box 
                    as="div" 
                    w="100px" 
                    h="100px" 
                    mx="auto"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FaPhone size="40px" color="#3182CE" />
                  </Box>
                </Box>
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  {t('check phone')}
                </Text>
                <Text color="gray.500">
                  {t('completed payment')}
                </Text>
                <Box mt={4}>
                  <Text 
                    display="inline-block" 
                    px={3} 
                    py={1} 
                    bg="blue.50" 
                    borderRadius="md"
                    color="blue.700"
                    fontWeight="medium"
                  >
                    {formData.phone}
                  </Text>
                </Box>
                <Box mt={6}>
                  <Spinner size="md" color="blue.500" />
                  <Text mt={2} color="gray.500" fontSize="sm">
                    Waiting for payment confirmation...
                  </Text>
                </Box>
              </>
            )}
            
            {paymentStatus === 'success' && (
              <>
                <Box mb={6}>
                  <Box 
                    as="div" 
                    w="100px" 
                    h="100px" 
                    mx="auto"
                    borderRadius="full"
                    bg="green.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    animation="pulse 1.5s infinite"
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="#38A169" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="green.500" mb={2}>
                  {t('payment confirmed')}
                </Text>
                <Text color="gray.500">
                  {t('redirecting order')}
                </Text>
              </>
            )}
            
            {paymentStatus === 'failed' && (
              <>
                <Box mb={6}>
                  <Box 
                    as="div" 
                    w="100px" 
                    h="100px" 
                    mx="auto"
                    borderRadius="full"
                    bg="red.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="#E53E3E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="red.500" mb={2}>
                  {t('payment failed')}
                </Text>
                <Text color="gray.500" mb={4}>
                  {t('payment failed')}
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={onClose}
                  w="full"
                >
                  {t('try again')}
                </Button>
              </>
            )}
          </ScaleFade>
        </ModalBody>
        {paymentStatus === 'pending' && (
          <ModalFooter justifyContent="center">
            <Button 
              variant="ghost" 
              colorScheme="blue"
              onClick={() => {
                onClose();
                setPaymentStatus(null);
              }}
            >
              {t('cancel payment')}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Heading size="xl" mb={8} textAlign="center" position="relative">
        {t('Checkout')}
        <Badge 
          ml={3} 
          colorScheme="green" 
          variant="subtle"
          fontSize="0.6em"
          verticalAlign="super"
        >
          <SlideFade in={true}>SECURE</SlideFade>
        </Badge>
      </Heading>
      
      {items.length === 0 ? (
        <Alert status="info" borderRadius="md" maxW="600px" mx="auto">
          <AlertIcon />
          {t('Cart empty checkout')}
        </Alert>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
          <Box 
            as="form" 
            onSubmit={handleSubmit}
            bg={bgColor}
            borderRadius="xl"
            p={6}
            boxShadow="xl"
          >
            <Heading size="md" mb={6} pb={3} borderBottom="1px solid" borderColor="gray.100">
              {t('Shipping information')}
            </Heading>
            
            <Stack spacing={5}>
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('First name')}</FormLabel>
                  <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor={accentColor}
                    borderRadius="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('Last name')}</FormLabel>
                  <Input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor={accentColor}
                    borderRadius="md"
                  />
                </FormControl>
              </Flex>
              
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('Email')}</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor={accentColor}
                    borderRadius="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" display="flex" alignItems="center">
                    {t('Phone')}
                    <Tooltip label="Format: 07XXXXXXXX" placement="top">
                      <Box ml={1} color="gray.500">
                        <FaInfoCircle size="14px" />
                      </Box>
                    </Tooltip>
                  </FormLabel>
                  <Input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    size="lg"
                    focusBorderColor={accentColor}
                    borderRadius="md"
                    pattern="[0][17][0-9]{8}"
                    title="Enter a valid Kenyan phone number starting with 07 or 01"
                  />
                  <FormHelperText>
                    We'll send an M-Pesa prompt to this number
                  </FormHelperText>
                </FormControl>
              </Flex>
              
              <FormControl isRequired>
                <FormLabel fontWeight="medium">{t('Address')}</FormLabel>
                <Input 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                  size="lg"
                  focusBorderColor={accentColor}
                  borderRadius="md"
                />
              </FormControl>
              
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('City')}</FormLabel>
                  <Input 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor={accentColor}
                    borderRadius="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('County')}</FormLabel>
                  <Input 
                    name="county" 
                    value={formData.county} 
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor={accentColor}
                    borderRadius="md"
                  />
                </FormControl>
              </Flex>
            </Stack>
            
            <Heading size="md" mt={10} mb={6} pb={3} borderBottom="1px solid" borderColor="gray.100">
              {t('Payment method')}
            </Heading>
            
            <RadioGroup 
              name="paymentMethod" 
              value={formData.paymentMethod}
              onChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              mb={6}
            >
              <Stack direction="column" spacing={4}>
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4} 
                  cursor="pointer"
                  borderColor={formData.paymentMethod === 'mpesa' ? accentColor : 'gray.200'}
                  bg={formData.paymentMethod === 'mpesa' ? `${accentColor}10` : 'transparent'}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: accentColor,
                    boxShadow: 'md'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'mpesa' }))}
                >
                  <Flex align="center">
                    <Radio value="mpesa" colorScheme="green" size="lg" />
                    <Box ml={3}>
                      <Text fontWeight="bold">M-Pesa</Text>
                      <Text color="gray.500" fontSize="sm">Pay instantly via M-Pesa</Text>
                    </Box>
                    <Box ml="auto" color="green.500">
                      <Box 
                        w="40px" 
                        h="40px" 
                        borderRadius="md" 
                        bg="green.50" 
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V13C3 14.1046 3.89543 15 5 15H7M9 19H19C20.1046 19 21 18.1046 21 17V11C21 9.89543 20.1046 9 19 9H9C7.89543 9 7 9.89543 7 11V17C7 18.1046 7.89543 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Box>
                    </Box>
                  </Flex>
                </Box>
                
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4} 
                  cursor="not-allowed"
                  opacity="0.6"
                >
                  <Flex align="center">
                    <Radio value="card" isDisabled colorScheme="blue" size="lg" />
                    <Box ml={3}>
                      <Text fontWeight="bold">{t('credit debit card')}</Text>
                      <Text color="gray.500" fontSize="sm">{t('Coming soon')}</Text>
                    </Box>
                    <Box ml="auto" color="blue.500">
                      <FaCreditCard size="24px" />
                    </Box>
                  </Flex>
                </Box>
                
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4} 
                  cursor="pointer"
                  borderColor={formData.paymentMethod === 'cash' ? accentColor : 'gray.200'}
                  bg={formData.paymentMethod === 'cash' ? `${accentColor}10` : 'transparent'}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: accentColor,
                    boxShadow: 'md'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                >
                  <Flex align="center">
                    <Radio value="cash" colorScheme="green" size="lg" />
                    <Box ml={3}>
                      <Text fontWeight="bold">{t('Cash on delivery')}</Text>
                      <Text color="gray.500" fontSize="sm">Pay when you receive your order</Text>
                    </Box>
                    <Box ml="auto" color="orange.500">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V13C3 14.1046 3.89543 15 5 15H7M12 9H19C20.1046 9 21 9.89543 21 11V17C21 18.1046 20.1046 19 19 19H9C7.89543 19 7 18.1046 7 17V11C7 9.89543 7.89543 9 9 9H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14C12.5523 14 13 13.5523 13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13C11 13.5523 11.4477 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Box>
                  </Flex>
                </Box>
              </Stack>
            </RadioGroup>
            
            {/* M-Pesa Payment Details */}
            {formData.paymentMethod === 'mpesa' && (
              <Box mb={6} p={4} bg="blue.50" borderRadius="md">
                <Heading size="md" mb={3}>M-Pesa Payment Details</Heading>
                <Text mb={4}>You will receive a payment prompt on your phone to complete the transaction</Text>
                
                <Box bg="white" p={4} borderRadius="md" mb={4}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="bold">Business Name:</Text>
                    <Text>Mkulima Pay</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Amount:</Text>
                    <Text fontWeight="bold" fontSize="lg">KES {total.toFixed(2)}</Text>
                  </Flex>
                </Box>
              </Box>
            )}
            
            <Button 
              type="submit" 
              colorScheme="green" 
              size="lg" 
              w="100%"
              isLoading={isProcessing}
              loadingText={t('processing')}
              leftIcon={<FaLock />}
              py={7}
              fontSize="lg"
              boxShadow="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
            >
              {t('Place order')}
            </Button>
            
            <Text mt={3} textAlign="center" color="gray.500" fontSize="sm">
              <FaLock style={{ display: 'inline', marginRight: '5px' }} />
              {t('Secure payment')}
            </Text>
          </Box>
          
          <Box>
            <Heading size="md" mb={4}>{t('Order summary')}</Heading>
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="xl"
              boxShadow="md"
              position="sticky"
              top="20px"
            >
              {items.map(item => (
                <Flex 
                  key={item.id} 
                  justify="space-between" 
                  mb={3} 
                  pb={3}
                  borderBottom="1px dashed"
                  borderColor="gray.200"
                >
                  <Text fontWeight="medium">
                    {item.quantity} × {item.name} 
                    <Text as="span" color="gray.500" fontSize="sm" ml={2}>
                      ({item.unit})
                    </Text>
                  </Text>
                  <Text fontWeight="bold">KES {(item.price * item.quantity).toFixed(2)}</Text>
                </Flex>
              ))}
              
              <Box mt={4}>
                <Flex justify="space-between" mb={2}>
                  <Text>{t('subtotal')}:</Text>
                  <Text>KES {total.toFixed(2)}</Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text>{t('shipping')}:</Text>
                  <Text color="green.500">{t('free')}</Text>
                </Flex>
                <Flex justify="space-between" fontWeight="bold" mt={4} pt={4} borderTopWidth="1px">
                  <Text fontSize="lg">{t('total')}:</Text>
                  <Text fontSize="lg">KES {total.toFixed(2)}</Text>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Grid>
      )}
      
      <PaymentStatusModal />
    </Box>
  );
};

export default CheckoutPage;