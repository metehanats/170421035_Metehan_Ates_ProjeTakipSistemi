// src/pages/ForgotPassword.jsx (Düzeltilmiş versiyon)
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Link,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send,
  Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      // Development modunda mock response
      if (process.env.NODE_ENV === 'development') {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessage('Password reset instructions have been sent to your email.');
        setEmailSent(true);
      } else {
        await authService.forgotPassword(email);
        setMessage('Password reset instructions have been sent to your email.');
        setEmailSent(true);
      }
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setMessage('');
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Card 
          elevation={24}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                textAlign: 'center',
                py: 4,
                px: 3,
              }}
            >
              <Business sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Forgot Password
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {emailSent 
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive reset instructions"
                }
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              )}

              {message && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {message}
                </Alert>
              )}

              {!emailSent ? (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      },
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    We've sent password reset instructions to <strong>{email}</strong>
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    onClick={handleResendEmail}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Didn't receive email? Try again
                  </Button>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                {/* HATA BURADA: Link component'ine startIcon prop'u geçirilmiş */}
                {/* Düzeltme: Box içinde icon ve text'i ayrı ayrı yerleştiriyoruz */}
                <Box 
                  component="button"
                  type="button"
                  onClick={handleBackToLogin}
                  sx={{
                    background: 'none',
                    border: 'none',
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: theme.typography.fontFamily,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Back to Sign In
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
            © 2024 ProjectFlow. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
