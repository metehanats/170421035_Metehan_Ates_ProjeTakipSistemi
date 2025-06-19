// src/services/issueService.js
import { issueService as apiIssueService } from './api';
import { mapIssueFromApi, mapIssueToApi } from '../utils/adapters';

export const issueService = {
  getAll: async () => {
    try {
      const response = await apiIssueService.getAll();
      // API yanıtı bir dizi mi kontrol edelim
      const issues = Array.isArray(response.data) ? response.data : [response.data];
      // Her bir issue'yu güvenli bir şekilde dönüştürelim
      return {
        data: issues.map(issue => {
          try {
            return mapIssueFromApi(issue);
          } catch (error) {
            console.error('Issue mapping error:', error, issue);
            // Hata durumunda güvenli bir nesne döndürelim
            return {
              id: issue.issueId || 0,
              title: issue.title || 'Untitled Issue',
              type: 'task',
              status: 'todo',
              priority: 'medium',
              assigneeName: '',
              assigneeId: '',
            };
          }
        })
      };
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiIssueService.getById(id);
      return mapIssueFromApi(response.data);
    } catch (error) {
      console.error(`Error fetching issue with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (issueData) => {
    try {
      const apiData = mapIssueToApi(issueData);
      const response = await apiIssueService.create(apiData);
      return mapIssueFromApi(response.data);
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },
  
  update: async (id, issueData) => {
    try {
      const apiData = mapIssueToApi({ ...issueData, id });
      const response = await apiIssueService.update(id, apiData);
      return mapIssueFromApi(response.data);
    } catch (error) {
      console.error(`Error updating issue with id ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await apiIssueService.delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting issue with id ${id}:`, error);
      throw error;
    }
  }
};
