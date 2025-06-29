import React, { useState } from 'react';
import {
  Box, Button, Flex, Image, Input, Progress, 
  Stack, Text, useToast, Alert, AlertIcon
} from '@chakra-ui/react';
import { FiUpload, FiCamera } from 'react-icons/fi';
import api from '../services/api';

const ProductVerifier = ({ onVerificationComplete }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const captureImage = () => {
    toast({
      title: 'Camera capture',
      description: 'Camera feature coming soon!',
      status: 'info',
    });
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await api.post('/product-verification/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      if (onVerificationComplete) {
        onVerificationComplete(response.data);
      }
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: error.response?.data?.error || 'Server error',
        status: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConditionColor = () => {
    if (!result) return 'gray';
    return result.recommendation === 'Buy' ? 'green' : 'red';
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={6}>
      <Text fontWeight="bold" mb={2}>Verify Product Freshness</Text>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Upload an image of the actual product to analyze freshness and quality
      </Text>
      
      <Stack spacing={4}>
        {previewUrl ? (
          <Image 
            src={previewUrl} 
            alt="Product preview" 
            maxH="200px"
            objectFit="contain"
            borderRadius="md"
          />
        ) : (
          <Flex 
            borderWidth="2px" 
            borderStyle="dashed" 
            borderRadius="md" 
            p={6} 
            justify="center"
            align="center"
            direction="column"
            bg="gray.50"
          >
            <Text mb={2} color="gray.500">No image selected</Text>
          </Flex>
        )}

        <Flex gap={2}>
          <Button 
            as="label"
            leftIcon={<FiUpload />}
            variant="outline"
            cursor="pointer"
            size="sm"
          >
            Upload Image
            <Input 
              type="file" 
              accept="image/*" 
              hidden 
              onChange={handleImageChange} 
            />
          </Button>
          
          <Button 
            leftIcon={<FiCamera />}
            variant="outline"
            onClick={captureImage}
            size="sm"
          >
            Use Camera
          </Button>
        </Flex>

        {image && (
          <Button
            colorScheme="blue"
            onClick={analyzeImage}
            isLoading={isAnalyzing}
            loadingText="Analyzing..."
            size="sm"
          >
            Verify Freshness
          </Button>
        )}

        {isAnalyzing && <Progress size="xs" isIndeterminate />}

        {result && (
          <Alert 
            status={result.recommendation === 'Buy' ? 'success' : 'error'} 
            borderRadius="md"
            variant="left-accent"
          >
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                {result.produceType} - Condition: {result.condition}
              </Text>
              <Text>Quality: Grade {result.qualityGrade} | Defects: {result.defects}</Text>
              <Text mt={2} fontWeight="bold">
                Recommendation: 
                <Text as="span" color={getConditionColor()}> {result.recommendation}</Text>
                {result.confidence && ` (${result.confidence} confidence)`}
              </Text>
            </Box>
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default ProductVerifier;