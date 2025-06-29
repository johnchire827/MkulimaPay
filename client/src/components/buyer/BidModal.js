import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Text, NumberInput, NumberInputField, useToast,
  Select, Textarea
} from '@chakra-ui/react';

const BidModal = ({ isOpen, onClose, product, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!bidAmount || !shippingAddress || !paymentMethod) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(bidAmount),
        shippingAddress,
        paymentMethod
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Place Bid for {product?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="lg" mb={4}>
            Current Price: KES {product?.price}/{product?.unit}
          </Text>
          
          <FormControl isRequired mb={4}>
            <FormLabel>Your Bid Amount (KES)</FormLabel>
            <NumberInput min={0} precision={2}>
              <NumberInputField
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
              />
            </NumberInput>
          </FormControl>
          
          <FormControl isRequired mb={4}>
            <FormLabel>Shipping Address</FormLabel>
            <Textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter full shipping address"
              rows={3}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Payment Method</FormLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash on Delivery</option>
              <option value="mpesa">M-Pesa</option>
            </Select>
          </FormControl>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Bid
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BidModal;