import React, { useState } from 'react';
import { 
  Box, Heading, FormControl, FormLabel, Input, Textarea, Select, 
  Button, useToast, VStack, Checkbox, Flex, Text
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';

const FarmerAddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category: 'Vegetables',
    location: 'Nairobi',
    organic: false,
    image: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Ensure user is authenticated
    if (!user || !user.token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    
    try {
      const formPayload = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'image' && value) {
            formPayload.append('image', value);
          } else {
            formPayload.append(key, value);
          }
        }
      });

      // Add farmer_id to the form data
      formPayload.append('farmer_id', user.id);

      const response = await api.post('/products/', formPayload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      toast({
        title: 'Product Added',
        description: 'Your product is now live in the marketplace',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/marketplace');
    } catch (error) {
      let errorMsg = 'Failed to add product';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = 'Session expired. Please log in again';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} maxW="600px" mx="auto">
      <Heading mb={6} size="xl">Add New Product</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Product Name</FormLabel>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Organic Tomatoes"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows={3}
            />
          </FormControl>

          <Flex gap={4} width="full">
            <FormControl isRequired flex={1}>
              <FormLabel>Price (KES)</FormLabel>
              <Input 
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="150"
                min="0"
                step="0.01"
              />
            </FormControl>

            <FormControl isRequired flex={1}>
              <FormLabel>Unit</FormLabel>
              <Select 
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">kg</option>
                <option value="gram">g</option>
                <option value="piece">Piece</option>
                <option value="bunch">Bunch</option>
                <option value="litre">Litre</option>
                <option value="bag">Bag</option>
              </Select>
            </FormControl>
          </Flex>

          <Flex gap={4} width="full">
            <FormControl isRequired flex={1}>
              <FormLabel>Category</FormLabel>
              <Select 
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Coffee">Coffee</option>
                <option value="Tea">Tea</option>
              </Select>
            </FormControl>

            <FormControl isRequired flex={1}>
              <FormLabel>Location</FormLabel>
              <Select 
                name="location"
                value={formData.location}
                onChange={handleChange}
              >
                <option value="Nairobi">Nairobi</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Eldoret">Eldoret</option>
                <option value="Mombasa">Mombasa</option>
              </Select>
            </FormControl>
          </Flex>

          <FormControl>
            <Checkbox 
              name="organic"
              isChecked={formData.organic}
              onChange={handleChange}
              colorScheme="green"
            >
              Organic Product
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>Product Image</FormLabel>
            <Input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              p={1}
              border="none"
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              JPG or PNG (Max 5MB)
            </Text>
          </FormControl>

          <Button 
            type="submit" 
            colorScheme="green" 
            isLoading={loading}
            loadingText="Adding Product..."
            width="full"
            size="lg"
            mt={4}
          >
            Add Product
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default FarmerAddProduct;