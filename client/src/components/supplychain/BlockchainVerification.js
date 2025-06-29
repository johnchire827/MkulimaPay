import React from 'react';
import { 
  Box, Heading, Text, Flex, Badge, Icon, SimpleGrid, Card, CardBody, 
  Button, Link
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const BlockchainVerification = ({ data }) => {
  const { t } = useLanguage();

  // Mock blockchain data
  const blockchainData = {
    txHash: '0x4a7b8c9d2e6f3a1b5c8d9e0f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    blockNumber: 12345678,
    timestamp: '2025-05-15 14:30:22',
    verified: true,
    steps: [
      { step: t('harvest_recorded'), verified: true, timestamp: '2025-05-01 09:15:00' },
      { step: t('quality_check'), verified: true, timestamp: '2025-05-05 11:20:00' },
      { step: t('processing_recorded'), verified: true, timestamp: '2025-05-10 13:45:00' },
      { step: t('shipment_initiated'), verified: true, timestamp: '2025-05-12 15:30:00' },
      { step: t('retail_received'), verified: false, timestamp: '' },
    ]
  };

  return (
    <Box>
      <Heading size="md" mb={6}>{t('blockchain_verification')}</Heading>
      
      <Card mb={6} bg={blockchainData.verified ? "green.50" : "red.50"}>
        <CardBody>
          <Flex align="center" mb={4}>
            {blockchainData.verified ? (
              <Icon as={FaCheckCircle} color="green.500" boxSize={6} mr={3} />
            ) : (
              <Icon as={FaTimesCircle} color="red.500" boxSize={6} mr={3} />
            )}
            <Text fontWeight="bold">
              {blockchainData.verified ? t('product_verified') : t('verification_pending')}
            </Text>
          </Flex>
          
          <Text mb={2}>{t('transaction_hash')}:</Text>
          <Flex align="center" mb={4}>
            <Text fontFamily="monospace" fontSize="sm" noOfLines={1} flex={1}>
              {blockchainData.txHash}
            </Text>
            <Link ml={2} href={`https://explorer.example.com/tx/${blockchainData.txHash}`} isExternal>
              <Icon as={FaExternalLinkAlt} />
            </Link>
          </Flex>
          
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text>{t('block_number')}:</Text>
              <Text fontWeight="bold">{blockchainData.blockNumber}</Text>
            </Box>
            <Box>
              <Text>{t('timestamp')}:</Text>
              <Text fontWeight="bold">{blockchainData.timestamp}</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
      
      <Heading size="sm" mb={4}>{t('verification_steps')}</Heading>
      
      {blockchainData.steps.map((step, index) => (
        <Card key={index} mb={4}>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium">{step.step}</Text>
              {step.verified ? (
                <Badge colorScheme="green">
                  <Flex align="center">
                    <Icon as={FaCheckCircle} mr={1} /> {t('verified')}
                  </Flex>
                </Badge>
              ) : (
                <Badge colorScheme="yellow">
                  {t('pending')}
                </Badge>
              )}
            </Flex>
            {step.timestamp && (
              <Text color="gray.500" fontSize="sm" mt={2}>
                {step.timestamp}
              </Text>
            )}
          </CardBody>
        </Card>
      ))}
      
      <Button 
        colorScheme="green" 
        mt={6}
        leftIcon={<FaExternalLinkAlt />}
        as="a"
        href={`https://explorer.example.com/tx/${blockchainData.txHash}`}
        target="_blank"
      >
        {t('view_on_block_explorer')}
      </Button>
    </Box>
  );
};

export default BlockchainVerification;