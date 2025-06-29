import React from 'react';
import { Box, Heading, Text, Flex,SimpleGrid } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const SupplyChainMap = ({ data }) => {
  // Mock locations - in a real app these would come from the backend
  const locations = [
    { id: 1, name: 'Kamau Farm', position: [-1.2921, 36.8219], type: 'farm' },
    { id: 2, name: 'Nakuru Processing', position: [-0.3031, 36.0800], type: 'processing' },
    { id: 3, name: 'Nairobi Distribution', position: [-1.2864, 36.8172], type: 'distribution' },
    { id: 4, name: 'Mombasa Retail', position: [-4.0435, 39.6682], type: 'retail' }
  ];
  
  const position = [-1.2921, 36.8219]; // Nairobi coordinates
  const path = locations.map(loc => loc.position);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Product Journey</Heading>
        <Text color="gray.500">Real-time tracking</Text>
      </Flex>
      
      <Box h="500px" borderRadius="xl" overflow="hidden">
        <MapContainer 
          center={position} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <Polyline positions={path} color="blue" />
          
          {locations.map(location => (
            <Marker key={location.id} position={location.position}>
              <Popup>
                <Box>
                  <Text fontWeight="bold">{location.name}</Text>
                  <Text>Type: {location.type}</Text>
                  <Text>Status: Completed</Text>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: locations.length }} spacing={4} mt={6}>
        {locations.map(location => (
          <Box key={location.id} bg="blue.50" p={4} borderRadius="lg">
            <Flex align="center" mb={2}>
              <Box 
                w="10px" 
                h="10px" 
                bg="blue.500" 
                borderRadius="full" 
                mr={2}
              ></Box>
              <Text fontWeight="bold">{location.name}</Text>
            </Flex>
            <Text fontSize="sm">Type: {location.type}</Text>
            <Text fontSize="sm">Status: Completed</Text>
            <Text fontSize="sm">Date: 2025-05-15</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default SupplyChainMap;