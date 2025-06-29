import React from 'react';
import { ChakraProvider, Box, Heading } from '@chakra-ui/react';
import { AuthProvider } from './core/context/AuthContext';
import AppRouter from './core/routes';
import OfflineStatus from './core/components/OfflineStatus';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Box p={4}>
          <Heading as="h1" size="xl" mb={6}>MkulimaPay</Heading>
          <OfflineStatus />
          <AppRouter />
        </Box>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;