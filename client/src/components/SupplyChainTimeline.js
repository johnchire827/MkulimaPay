import React from 'react';
import { 
  Box, Flex, Text, Icon, Badge, Progress, Heading 
} from '@chakra-ui/react';
import { 
  FaSeedling, FaTruck, FaWarehouse, FaStore, FaBox, FaHome 
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const STAGE_ICONS = {
  planting: FaSeedling,
  harvesting: FaSeedling,
  transport: FaTruck,
  processing: FaWarehouse,
  packaging: FaBox,
  distribution: FaStore,
  shipped: FaTruck,
  delivered: FaHome
};

const SupplyChainTimeline = ({ chainId }) => {
  const { t } = useLanguage();
  
  // In a real app, this would come from an API
  const stages = [
    { key: 'planting', name: t('Planting'), status: 'completed', date: '2023-06-01' },
    { key: 'harvesting', name: t('Harvesting'), status: 'completed', date: '2023-08-15' },
    { key: 'transport', name: t('Transport'), status: 'completed', date: '2023-08-20' },
    { key: 'processing', name: t('Processing'), status: 'completed', date: '2023-08-22' },
    { key: 'packaging', name: t('Packaging'), status: 'active', date: '2023-08-25' },
    { key: 'distribution', name: t('Distribution'), status: 'pending' },
    { key: 'shipped', name: t('Shipped'), status: 'pending' },
    { key: 'delivered', name: t('Delivered'), status: 'pending' }
  ];

  return (
    <Box>
      <Heading size="md" mb={6}>{t('supply_chain_progress')}</Heading>
      
      <Box position="relative">
        <Flex justify="space-between" mb={2} position="relative" zIndex={1}>
          {stages.map((stage) => {
            const IconComponent = STAGE_ICONS[stage.key];
            const isActive = stage.status === 'active';
            const isCompleted = stage.status === 'completed';
            
            return (
              <Box key={stage.key} textAlign="center" position="relative" zIndex={1}>
                <Flex
                  justify="center"
                  align="center"
                  w="50px"
                  h="50px"
                  borderRadius="full"
                  bg={isCompleted ? 'green.500' : isActive ? 'blue.500' : 'gray.200'}
                  color="white"
                  mx="auto"
                  mb={2}
                  border="2px solid white"
                  boxShadow="md"
                >
                  <Icon as={IconComponent} boxSize={5} />
                </Flex>
                <Text fontSize="sm" fontWeight="medium">{stage.name}</Text>
                {stage.date && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {new Date(stage.date).toLocaleDateString()}
                  </Text>
                )}
                {isActive && (
                  <Badge colorScheme="blue" mt={1} fontSize="xs">
                    {t('current')}
                  </Badge>
                )}
              </Box>
            );
          })}
        </Flex>
        
        <Progress 
          value={75} 
          size="sm" 
          colorScheme="gray" 
          position="absolute" 
          top="25px" 
          left="0" 
          right="0"
          zIndex={0}
          borderRadius="full"
        />
      </Box>
    </Box>
  );
};

export default SupplyChainTimeline;