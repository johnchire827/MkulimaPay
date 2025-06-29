import React, { useState } from 'react';
import {
  Box, Heading, Text, Flex, Stack, FormControl, FormLabel,
  Input, Button, useToast, RadioGroup, Radio, Grid, Alert, AlertIcon
} from '@chakra-ui/react';
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Create order
      const orderResponse = await api.post('/orders', {
        userId: user.id,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.county}`,
        paymentMethod: formData.paymentMethod
      });
      
      // FIXED: Get order ID from the correct location in the response
      const orderId = orderResponse.data.order.id;
      
      // Process payment
      if (formData.paymentMethod === 'mpesa') {
        // Initiate M-Pesa payment
        await api.post('/payments/mpesa', {
          orderId: orderId, // Use the correct order ID
          phone: formData.phone,
          amount: total
        });
        
        toast({
          title: t('payment_initiated'),
          description: t('mpesa_payment_prompt'),
          status: 'info',
          duration: 10000,
          isClosable: true,
        });
      }
      
      // Clear cart after successful order creation
      dispatch({ type: 'CLEAR_CART' });
      
      // Redirect to order confirmation WITH ORDER DATA
      navigate(`/order-confirmation/${orderId}`, {
        state: { order: orderResponse.data.order } // Pass order data in state
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: t('order_failed'),
        description: error.response?.data?.message || t('order_failed_message'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="xl" mb={8}>{t('checkout')}</Heading>
      
      {items.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          {t('cart_empty_checkout')}
        </Alert>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
          <Box as="form" onSubmit={handleSubmit}>
            <Heading size="md" mb={4}>{t('shipping_information')}</Heading>
            
            <Stack spacing={4}>
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired>
                  <FormLabel>{t('first_name')}</FormLabel>
                  <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>{t('last_name')}</FormLabel>
                  <Input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                  />
                </FormControl>
              </Flex>
              
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired>
                  <FormLabel>{t('email')}</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>{t('phone')}</FormLabel>
                  <Input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="07XXXXXXXX"
                  />
                </FormControl>
              </Flex>
              
              <FormControl isRequired>
                <FormLabel>{t('address')}</FormLabel>
                <Input 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                />
              </FormControl>
              
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isRequired>
                  <FormLabel>{t('city')}</FormLabel>
                  <Input 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>{t('county')}</FormLabel>
                  <Input 
                    name="county" 
                    value={formData.county} 
                    onChange={handleChange} 
                  />
                </FormControl>
              </Flex>
            </Stack>
            
            <Heading size="md" mt={8} mb={4}>{t('payment_method')}</Heading>
            
            <RadioGroup 
              name="paymentMethod" 
              value={formData.paymentMethod}
              onChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              mb={6}
            >
              <Stack direction="column">
                <Radio value="mpesa">M-Pesa</Radio>
                <Radio value="card" isDisabled>{t('credit_debit_card')} ({t('coming_soon')})</Radio>
                <Radio value="cash">{t('cash_on_delivery')}</Radio>
              </Stack>
            </RadioGroup>
            
            <Button 
              type="submit" 
              colorScheme="green" 
              size="lg" 
              w="100%"
              isLoading={isProcessing}
              loadingText={t('processing')}
            >
              {t('place_order')}
            </Button>
          </Box>
          
          <Box>
            <Heading size="md" mb={4}>{t('order_summary')}</Heading>
            <Box bg="gray.50" p={4} borderRadius="md">
              {items.map(item => (
                <Flex key={item.id} justify="space-between" mb={2}>
                  <Text>
                    {item.quantity} x {item.name}
                  </Text>
                  <Text>KES {(item.price * item.quantity).toFixed(2)}</Text>
                </Flex>
              ))}
              
              <Flex justify="space-between" fontWeight="bold" mt={4} pt={4} borderTopWidth="1px">
                <Text>{t('total')}:</Text>
                <Text>KES {total.toFixed(2)}</Text>
              </Flex>
            </Box>
          </Box>
        </Grid>
      )}
    </Box>
  );
};

export default CheckoutPage;