// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Auth yüklenirken spinner göster
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Authenticated değilse login'e yönlendir
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role kontrolü
  if (requiredRole && user?.role !== requiredRole) {
    console.log('🚫 Insufficient permissions, redirecting to home...');
    return <Navigate to="/" replace />;
  }

  // Her şey OK ise children'ı render et
  return children;
};

export default PrivateRoute;
