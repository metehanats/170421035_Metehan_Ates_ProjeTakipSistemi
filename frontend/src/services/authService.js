// src/services/authService.js
import apiClient from '../config/axios';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/Auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { 
        success: true,
        user
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/api/Auth/forgot-password', {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  verifyResetCode: async (email, code) => {
    try {
      const response = await apiClient.post('/api/Auth/verify-reset-code', {
        email,
        code
      });
      return response.data;
    } catch (error) {
      console.error('Verify reset code error:', error);
      throw new Error(error.response?.data?.message || 'Invalid verification code');
    }
  },

  resetPassword: async (email, code, newPassword) => {
    try {
      const response = await apiClient.post('/api/Auth/reset-password', {
        email,
        code,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
  
  logout: async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
