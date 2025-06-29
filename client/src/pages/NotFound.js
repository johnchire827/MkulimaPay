import React from 'react';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { FaHome, FaUndo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Flex 
      minH="100vh" 
      align="center" 
      justify="center" 
      bg="green.50"
      p={4}
    >
      <Box textAlign="center" py={10} px={6}>
        <Heading
          display="inline-block"
          as="h2"
          size="2xl"
          bg="green.400"
          backgroundClip="text"
        >
          404
        </Heading>
        <Text fontSize="18px" mt={3} mb={2}>
          {t('page_not_found')}
        </Text>
        <Text color={'gray.500'} mb={6}>
          {t('page_not_exist')}
        </Text>

        <Flex justify="center" gap={4}>
          <Button
            colorScheme="green"
            leftIcon={<FaHome />}
            onClick={() => navigate('/')}
          >
            {t('home_page')}
          </Button>
          <Button
            variant="outline"
            colorScheme="green"
            leftIcon={<FaUndo />}
            onClick={() => navigate(-1)}
          >
            {t('go_back')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default NotFound;