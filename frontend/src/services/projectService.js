// src/services/projectService.js
import { projectService as apiProjectService } from './api';

const mapProjectFromApi = (apiProject) => {
  return {
    id: apiProject.projectId?.toString() || '0',
    name: apiProject.name || '',
    description: apiProject.description || '',
    key: apiProject.key || '',
    status: apiProject.isActive ? 'active' : 'inactive',
    priority: apiProject.priority || 'medium', // API'den gelen priority değerini kullan
    createdAt: apiProject.createdAt || new Date().toISOString(),
    issues: apiProject.issues?.length || 0,
    completedIssues: apiProject.issues?.filter(issue => issue.statusId === 4)?.length || 0,
    teamMembers: apiProject.projectMembers?.length || 0,
    ownerId: apiProject.ownerId || 0
  };
};

export const projectService = {
  getAll: async () => {
    try {
      const response = await apiProjectService.getAll();
      
      if (!response || !response.data) {
        console.error('Invalid API response:', response);
        return [];
      }
      
      // API yanıtının array olup olmadığını kontrol et
      const projectsData = Array.isArray(response.data) ? response.data : [response.data];
      
      // Her projeyi güvenli bir şekilde dönüştür
      return projectsData.map(project => {
        try {
          return mapProjectFromApi(project);
        } catch (error) {
          console.error('Error mapping project:', error, project);
          // Hata durumunda güvenli bir proje objesi döndür
          return {
            id: project.projectId?.toString() || '0',
            name: project.name || 'Untitled Project',
            description: project.description || '',
            key: project.key || '',
            status: 'inactive',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            issues: 0,
            completedIssues: 0,
            teamMembers: 0,
            ownerId: project.ownerId || 0
          };
        }
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiProjectService.getById(id);
      if (!response || !response.data) {
        return null;
      }
      return mapProjectFromApi(response.data);
    } catch (error) {
      console.error(`Error fetching project with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (projectData) => {
    try {
      // API'nin beklediği format
      const apiData = {
        name: projectData.name,
        key: projectData.name.toUpperCase().replace(/\s+/g, ''), // Basit key oluşturma
        description: projectData.description || '',
        ownerId: 1, // Şu an için sabit, daha sonra auth'dan alınacak
        isActive: projectData.status === 'active',
        status: projectData.status,
        priority: projectData.priority
      };
      
      const response = await apiProjectService.create(apiData);
      if (!response || !response.data) {
        throw new Error('Failed to create project');
      }
      return { success: true, data: mapProjectFromApi(response.data) };
    } catch (error) {
      console.error('Error creating project:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to create project' 
      };
    }
  },
  
  update: async (id, projectData) => {
    try {
      // API'nin beklediği format
      const apiData = {
        name: projectData.name,
        key: projectData.key || projectData.name.toUpperCase().replace(/\s+/g, ''),
        description: projectData.description || '',
        isActive: projectData.status === 'active',
        status: projectData.status,
        priority: projectData.priority
      };
      
      const response = await apiProjectService.update(id, apiData);
      if (!response || !response.data) {
        throw new Error('Failed to update project');
      }
      return { success: true, data: mapProjectFromApi(response.data) };
    } catch (error) {
      console.error(`Error updating project with id ${id}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update project' 
      };
    }
  },
  
  delete: async (id) => {
    try {
      await apiProjectService.delete(id);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting project with id ${id}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to delete project' 
      };
    }
  }
};
