// src/services/sprintService.js
import { sprintService as apiSprintService } from './api';

// API'den gelen sprint verisini frontend formatına dönüştürme
const mapSprintFromApi = (apiSprint) => {
  return {
    id: apiSprint.sprintId?.toString() || apiSprint.id?.toString(),
    name: apiSprint.name,
    description: apiSprint.description || '',
    goal: apiSprint.goal || '',
    startDate: apiSprint.startDate,
    endDate: apiSprint.endDate,
    status: mapSprintStatus(apiSprint.status, apiSprint.isActive),
    isActive: apiSprint.isActive,
    projectId: apiSprint.projectId?.toString(),
    projectName: apiSprint.projectName || '',
    issueCount: apiSprint.issueCount || 0,
    createdAt: apiSprint.createdAt,
    updatedAt: apiSprint.updatedAt,
  };
};

// Frontend'den API'ye gönderilecek sprint verisini dönüştürme
const mapSprintToApi = (frontendSprint) => {
  // API şemasına göre format
  return {
    projectId: parseInt(frontendSprint.projectId) || 0,
    name: frontendSprint.name || "string",
    startDate: formatDateForApi(frontendSprint.startDate),
    endDate: formatDateForApi(frontendSprint.endDate),
    isActive: frontendSprint.status === 'active',
    description: frontendSprint.description || "string",
    status: frontendSprint.status || "string",
    goal: frontendSprint.goal || "string"
  };
};

// Tarih formatını API'nin beklediği ISO formatına çevir
const formatDateForApi = (dateString) => {
  if (!dateString) return new Date().toISOString();
  
  // Eğer sadece tarih varsa (YYYY-MM-DD), saat ekle
  if (dateString.length === 10) {
    return new Date(dateString + 'T00:00:00.000Z').toISOString();
  }
  
  // Zaten ISO formatında ise olduğu gibi döndür
  return new Date(dateString).toISOString();
};

// Status dönüştürme fonksiyonları
function mapSprintStatus(status, isActive) {
  if (typeof isActive === 'boolean') {
    return isActive ? 'active' : 'planned';
  }
  
  const statusMap = {
    'planning': 'planned',
    'planned': 'planned',
    'active': 'active',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  return statusMap[status?.toLowerCase()] || 'planned';
}

export const sprintService = {
  getAll: async () => {
    try {
      const response = await apiSprintService.getAll();
      return (response.data || []).map(mapSprintFromApi);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiSprintService.getById(id);
      return mapSprintFromApi(response.data);
    } catch (error) {
      console.error('Error fetching sprint:', error);
      throw error;
    }
  },
  
  create: async (sprintData) => {
    try {
      console.log('Original sprint data:', sprintData);
      
      const apiData = mapSprintToApi(sprintData);
      console.log('Mapped API data:', apiData);
      
      const response = await apiSprintService.create(apiData);
      return mapSprintFromApi(response.data);
    } catch (error) {
      console.error('Error creating sprint:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
  
  update: async (id, sprintData) => {
    try {
      const apiData = {
        ...mapSprintToApi(sprintData),
        sprintId: parseInt(id) // Update için ID gerekli olabilir
      };
      
      console.log('Updating sprint with data:', apiData);
      
      const response = await apiSprintService.update(id, apiData);
      return mapSprintFromApi(response.data);
    } catch (error) {
      console.error('Error updating sprint:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await apiSprintService.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting sprint:', error);
      throw error;
    }
  },

  // Sprint'e ait issue'ları getir
  getSprintIssues: async (sprintId) => {
    try {
      const { issueService } = await import('./api');
      const response = await issueService.getAll();
      return (response.data || []).filter(issue => 
        parseInt(issue.sprintId) === parseInt(sprintId)
      );
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
      return [];
    }
  },

  // Sprint istatistiklerini hesapla
  getSprintStats: async (sprintId) => {
    try {
      const issues = await sprintService.getSprintIssues(sprintId);
      
      const stats = {
        totalIssues: issues.length,
        completedIssues: issues.filter(issue => issue.statusId === 4).length,
        inProgressIssues: issues.filter(issue => issue.statusId === 2).length,
        todoIssues: issues.filter(issue => issue.statusId === 1).length,
        totalStoryPoints: issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0),
        completedStoryPoints: issues
          .filter(issue => issue.statusId === 4)
          .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0),
      };

      stats.progress = stats.totalIssues > 0 
        ? Math.round((stats.completedIssues / stats.totalIssues) * 100)
        : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating sprint stats:', error);
      return {
        totalIssues: 0,
        completedIssues: 0,
        inProgressIssues: 0,
        todoIssues: 0,
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        progress: 0
      };
    }
  }
};
