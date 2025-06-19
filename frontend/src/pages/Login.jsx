// src/pages/Login.jsx (Navigation sorunu düzeltildi)
import React, { useState, useEffect } from 'react';
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
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Success message from reset password
  const successMessage = location.state?.message;

  // Authentication check effect - daha güvenilir
  useEffect(() => {
    console.log('🔍 Login useEffect - Auth state changed:', { isAuthenticated, loading });
    if (isAuthenticated && !loading) {
      const from = location.state?.from?.pathname || '/';
      console.log('🔄 Redirecting authenticated user to:', from);
      // State update'in tamamlanması için küçük delay
      const timeoutId = setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
      
      // Cleanup timeout
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, loading, navigate, location.state?.from?.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Form submitted');
    
    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Calling login function...');
      const result = await login(email, password);
      
      console.log('📋 Login result:', result);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      } else {
        console.log('✅ Login successful');
        // Login başarılı olduğunda manuel olarak da yönlendirme yapabiliriz
        const redirectTo = location.state?.from?.pathname || '/';
        console.log('🎯 Manual redirect to:', redirectTo);
        
        // useEffect'in çalışması için kısa bir bekleme
        // Normalde useEffect otomatik olarak çalışmalı
      }
    } catch (error) {
      console.error('❌ Login error in component:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Eğer zaten authenticate edilmişse ve loading bittiyse login sayfasını gösterme
  if (isAuthenticated && !loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Redirecting...
        </Typography>
      </Box>
    );
  }

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
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                ProjectFlow
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back! Please sign in to your account
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4 }}>
              {successMessage && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {successMessage}
                </Alert>
              )}

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
                  placeholder="Enter your email address"
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
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                  disabled={loading || !email || !password}
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
                    '&:disabled': {
                      background: theme.palette.grey[300],
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => navigate('/forgot-password')}
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot your password?
                  </Link>
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

export default Login;