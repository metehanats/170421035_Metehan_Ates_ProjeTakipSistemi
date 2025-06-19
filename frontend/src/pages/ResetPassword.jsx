// src/pages/ResetPassword.jsx (Düzeltilmiş versiyon)
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Security,
  Business
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Code verification, 2: Password reset
  const navigate = useNavigate();
  const theme = useTheme();

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !code) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        // Development modunda mock verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (code === '123456') {
          setStep(2);
        } else {
          setError('Invalid verification code. Try "123456" for development.');
        }
      } else {
        await authService.verifyResetCode(email, code);
        setStep(2);
      }
    } catch (error) {
      setError(error.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        // Development modunda mock reset
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please sign in with your new password.' 
          } 
        });
      } else {
        await authService.resetPassword(email, code, newPassword);
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please sign in with your new password.' 
          } 
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
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
                Reset Password
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {step === 1 
                  ? "Enter the verification code sent to your email"
                  : "Create your new password"
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

              {step === 1 && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  Development Mode: Use code "123456" to proceed
                </Alert>
              )}

              {step === 1 ? (
                <Box component="form" onSubmit={handleVerifyCode} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="code"
                    label="Verification Code"
                    name="code"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    placeholder="Enter 6-digit code"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleResetPassword} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
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
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Box 
                  component="button"
                  type="button"
                  onClick={() => navigate('/login')}
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

export default ResetPassword;
