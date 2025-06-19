// src/components/ErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh } from '@mui/icons-material'; // Sadece Refresh kullanın

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          minHeight: 'calc(100vh - 112px)', 
          backgroundColor: '#F0F4F8',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" mb={1}>
                Something went wrong
              </Typography>
              <Typography variant="body2">
                The dashboard encountered an error. Please refresh the page or try again later.
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Refresh Page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
