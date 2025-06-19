// src/config/axios.js
import axios from 'axios';

// API için temel axios instance'ı oluştur
const apiClient = axios.create({
  // baseURL belirtmiyoruz ki proxy çalışsın
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token'ı ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatası durumunda kullanıcıyı logout yap
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token geçersiz, kullanıcıyı çıkış yaptır
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
