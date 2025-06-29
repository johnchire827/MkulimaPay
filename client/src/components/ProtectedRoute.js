import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    
    if (user?.role === 'both') return true;
    if (user?.role === requiredRole) return true;
    
    return false;
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasRequiredRole()) {
    return (
      <Center h="100vh" textAlign="center" p={4}>
        <Text fontSize="xl" fontWeight="bold">
          Access Denied
        </Text>
        <Text mt={4}>
          You don't have permission to access this page.
        </Text>
      </Center>
    );
  }

  return children;
};

export default ProtectedRoute;