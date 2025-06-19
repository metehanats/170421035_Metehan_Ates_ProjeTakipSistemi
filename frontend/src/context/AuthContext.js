// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService'; // authService doğru import edilmiş

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  const initAuth = useCallback(async () => {
    try {
      console.log('🔄 Initializing authentication...');
      
      // LocalStorage'dan kullanıcı bilgilerini kontrol et
      const savedUser = authService.getStoredUser();
      const token = authService.getStoredToken();
      
      console.log('📦 Stored data:', { 
        hasUser: !!savedUser, 
        hasToken: !!token,
        user: savedUser 
      });
      
      if (savedUser && token) {
        console.log('✅ User found in localStorage:', savedUser);
        
        // API'den güncel kullanıcı bilgilerini almayı dene
        try {
          const currentUserResponse = await authService.getCurrentUser();
          if (currentUserResponse.success && currentUserResponse.user) {
            console.log('✅ Got fresh user data from API');
            setUser(currentUserResponse.user);
            setIsAuthenticated(true);
          } else {
            // API'den alamadıysak localStorage'daki kullanıcıyı kullan
            setUser(savedUser);
            setIsAuthenticated(true);
          }
        } catch (apiError) {
          console.log('⚠️ Could not fetch fresh user data, using stored data');
          setUser(savedUser);
          setIsAuthenticated(true);
        }
      } else {
        console.log('👤 No saved user found - login required');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      // Hata durumunda localStorage'ı temizle
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Component mount olduğunda auth'u initialize et
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    console.log('🔐 Login attempt:', { email });
    
    try {
      setLoading(true);
      
      // Development mode bypass
      if (process.env.NODE_ENV === 'development' && email === 'test@test.com') {
        console.log('🚀 Development mode: Login bypassed');
        const mockUser = {
          id: 1,
          email: email,
          name: 'Test User',
          role: 'admin' // Admin dashboard'a erişim için
        };
        
        // Mock token oluştur
        const mockToken = `dev-token-${Date.now()}`;
        
        // LocalStorage'a kaydet
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // State'i güncelle
        setUser(mockUser);
        setIsAuthenticated(true);
        
        console.log('✅ Development login successful:', mockUser);
        
        return { success: true, user: mockUser };
      }
      
      // Production mode - gerçek API çağrısı
      const result = await authService.login(email, password);
      
      console.log('📋 Login result:', result);
      
      if (result.success) {
        // State'i güncelle
        setUser(result.user);
        setIsAuthenticated(true);
        
        console.log('✅ Login successful:', result.user);
        
        return { success: true, user: result.user };
      } else {
        console.log('❌ Login failed:', result.error);
        setIsAuthenticated(false);
        setUser(null);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      
      // AuthService üzerinden logout
      await authService.logout();
      
      // State'i temizle
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Hata olsa bile local state'i temizle
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Storage event listener - başka sekmeden logout olunduğunda
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        console.log('🔄 Token removed in another tab, logging out...');
        setUser(null);
        setIsAuthenticated(false);
      } else if (e.key === 'user' && e.newValue) {
        try {
          const newUser = JSON.parse(e.newValue);
          console.log('🔄 User updated in another tab');
          setUser(newUser);
        } catch (error) {
          console.error('Error parsing user from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Debug için auth state değişikliklerini logla
  useEffect(() => {
    console.log('🔍 Auth state changed:', { 
      isAuthenticated, 
      user: user ? `${user.name} (${user.email})` : null,
      loading 
    });
  }, [isAuthenticated, user, loading]);

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    initAuth, // Refresh için
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
