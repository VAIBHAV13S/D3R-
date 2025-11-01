import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { Spinner, Center, Text } from '@chakra-ui/react';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { isAuthenticated, isLoading, checkAuth } = useContext(Web3Context);
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  if (isLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // If authentication is required but user is not authenticated, redirect to home
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
}
