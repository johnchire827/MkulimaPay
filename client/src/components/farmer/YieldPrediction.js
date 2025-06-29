import React from 'react';
import { Box, Heading, Text, Flex, Progress, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { FaSeedling, FaCloudRain, FaThermometerHalf } from 'react-icons/fa';

const YieldPrediction = () => {
  // Mock data - in a real app this would come from an AI service
  const predictions = {
    maize: { predicted: 1200, historical: 900, unit: 'kg/ha' },
    beans: { predicted: 800, historical: 650, unit: 'kg/ha' },
    coffee: { predicted: 450, historical: 380, unit: 'kg/ha' }
  };
  
  const factors = [
    { name: 'Rainfall', value: 75, optimal: '70-80%', icon: FaCloudRain },
    { name: 'Temperature', value: 68, optimal: '65-75°F', icon: FaThermometerHalf },
    { name: 'Soil Quality', value: 82, optimal: '80-90%', icon: FaSeedling }
  ];

  return (
    <Box bg="blue.50" p={6} borderRadius="xl" mb={8}>
      <Heading size="md" mb={4}>AI-Powered Yield Prediction</Heading>
      
      <Text mb={6}>
        Based on current conditions and historical data, here are your predicted yields for this season:
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {Object.entries(predictions).map(([crop, data]) => (
          <Box key={crop} bg="white" p={4} borderRadius="lg">
            <Text fontWeight="bold" textTransform="capitalize" mb={2}>{crop}</Text>
            <Flex align="baseline">
              <Text fontSize="2xl" fontWeight="bold" mr={2}>{data.predicted}</Text>
              <Text>{data.unit}</Text>
            </Flex>
            <Text color="green.600" fontSize="sm">
              +{Math.round((data.predicted - data.historical) / data.historical * 100)}% vs historical
            </Text>
          </Box>
        ))}
      </SimpleGrid>
      
      <Heading size="sm" mb={4}>Key Growth Factors</Heading>
      
      {factors.map((factor, index) => (
        <Box key={index} mb={4}>
          <Flex justify="space-between" mb={1}>
            <Flex align="center">
              <Box as={factor.icon} mr={2} color="blue.500" />
              <Text>{factor.name}</Text>
            </Flex>
            <Text>{factor.value} (Optimal: {factor.optimal})</Text>
          </Flex>
          <Progress 
            value={factor.value} 
            colorScheme={factor.value > 70 ? 'green' : factor.value > 50 ? 'yellow' : 'red'} 
            size="sm" 
            borderRadius="full"
          />
        </Box>
      ))}
      
      <Box mt={6} bg="green.50" p={4} borderRadius="lg">
        <Text fontWeight="bold" mb={2}>Recommendations</Text>
        <Text>Based on predictions, we recommend increasing irrigation by 15% during the flowering stage for optimal maize yield.</Text>
      </Box>
    </Box>
  );
};

export default YieldPrediction;