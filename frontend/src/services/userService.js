// src/services/userService.js
import { userService as apiUserService } from './api';

// API'den gelen kullanıcı verisini frontend formatına dönüştürme
const mapUserFromApi = (apiUser) => {
  return {
    id: apiUser.userID.toString(),
    firstName: apiUser.firstName || '',
    lastName: apiUser.lastName || '',
    email: apiUser.email || '',
    username: apiUser.username || '',
    fullName: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    avatarUrl: apiUser.avatarUrl || '',
    role: apiUser.roleID?.toString() || '',
    roleName: apiUser.roleName || '',
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
};

// Frontend'den API'ye gönderilecek kullanıcı verisini dönüştürme
const mapUserToApi = (frontendUser) => {
  return {
    userID: parseInt(frontendUser.id) || 0,
    firstName: frontendUser.firstName,
    lastName: frontendUser.lastName,
    email: frontendUser.email,
    username: frontendUser.username,
    password: frontendUser.password, // Sadece create ve update işlemlerinde
    roleID: frontendUser.role ? parseInt(frontendUser.role) : null,
  };
};

export const userService = {
  getAll: async () => {
    const response = await apiUserService.getAll();
    return response.data.map(mapUserFromApi);
  },
  
  getById: async (id) => {
    const response = await apiUserService.getById(id);
    return mapUserFromApi(response.data);
  },
  
  create: async (userData) => {
    const apiData = mapUserToApi(userData);
    const response = await apiUserService.create(apiData);
    return mapUserFromApi(response.data);
  },
  
  update: async (id, userData) => {
    const apiData = mapUserToApi({ ...userData, id });
    const response = await apiUserService.update(id, apiData);
    return mapUserFromApi(response.data);
  },
  
  delete: async (id) => {
    await apiUserService.delete(id);
    return true;
  }
};
