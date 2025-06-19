// src/components/LoadingScreen.jsx
import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Business } from '@mui/icons-material';

const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
      }}
    >
      <Business sx={{ fontSize: 64, mb: 3, opacity: 0.9 }} />
      
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        ProjectFlow
      </Typography>
      
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress 
          size={40} 
          sx={{ 
            color: 'white',
            mb: 2
          }} 
        />
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Loading...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
