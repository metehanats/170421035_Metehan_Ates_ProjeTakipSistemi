// src/services/api.js
import apiClient from '../config/axios';

// Workflow servisi
export const workflowService = {
  getAll: () => apiClient.get('/api/Workflow'),
  getById: (id) => apiClient.get(`/api/Workflow/${id}`),
  create: (data) => apiClient.post('/api/Workflow', data),
  update: (id, data) => apiClient.put(`/api/Workflow/${id}`, data),
  delete: (id) => apiClient.delete(`/api/Workflow/${id}`),
  getStatuses: (id) => apiClient.get(`/api/Workflow/${id}/statuses`),
  updateStatusOrder: (id, data) => apiClient.put(`/api/Workflow/${id}/statuses/order`, data),
  getByIssueType: (issueTypeId) => apiClient.get(`/api/Workflow/ByIssueType/${issueTypeId}`),
  
  deleteTransition: (workflowId, fromStatusId, toStatusId) => {
    return apiClient.get(`/api/Workflow/${workflowId}/statuses`)
      .then(response => {
        const currentStatuses = response.data;
        const orderedStatuses = [...currentStatuses].sort((a, b) => a.order - b.order);
        
        let transitionIndex = -1;
        for (let i = 0; i < orderedStatuses.length - 1; i++) {
          if (orderedStatuses[i].statusId === fromStatusId && 
              orderedStatuses[i + 1].statusId === toStatusId) {
            transitionIndex = i;
            break;
          }
        }
        
        if (transitionIndex !== -1) {
          const toStatus = orderedStatuses.splice(transitionIndex + 1, 1)[0];
          orderedStatuses.push(toStatus);
        }
        
        const updatedStatuses = orderedStatuses.map((status, index) => ({
          statusId: status.statusId,
          order: index + 1
        }));
        
        return apiClient.put(`/api/Workflow/${workflowId}/statuses/order`, {
          workflowId: workflowId,
          statuses: updatedStatuses
        });
      });
  }
};

// Issue servisi
export const issueService = {
  getAll: () => apiClient.get('/api/Issue'),
  getAllIssues: () => apiClient.get('/api/Issue'),
  getById: (id) => apiClient.get(`/api/Issue/${id}`),
  create: (data) => apiClient.post('/api/Issue', data),
  update: (id, data) => apiClient.put(`/api/Issue/${id}`, data),
  delete: (id) => apiClient.delete(`/api/Issue/${id}`),
};

// Project servisi
export const projectService = {
  getAll: () => apiClient.get('/api/Project'),
  getAllProjects: () => apiClient.get('/api/Project'),
  getById: (id) => apiClient.get(`/api/Project/${id}`),
  create: (data) => apiClient.post('/api/Project', data),
  update: (id, data) => apiClient.put(`/api/Project/${id}`, data),
  delete: (id) => apiClient.delete(`/api/Project/${id}`),
};

// User servisi
export const userService = {
  getAll: () => apiClient.get('/api/User'),
  getAllUsers: () => apiClient.get('/api/User'),
  getById: (id) => apiClient.get(`/api/User/${id}`),
  create: (data) => apiClient.post('/api/User', data),
  update: (id, data) => apiClient.put(`/api/User/${id}`, data),
  delete: (id) => apiClient.delete(`/api/User/${id}`),
};

// Sprint servisi
export const sprintService = {
  getAll: () => apiClient.get('/api/Sprint'),
  getById: (id) => apiClient.get(`/api/Sprint/${id}`),
  create: (data) => apiClient.post('/api/Sprint', data),
  update: (id, data) => apiClient.put(`/api/Sprint/${id}`, data),
  delete: (id) => apiClient.delete(`/api/Sprint/${id}`),
};

// Issue Type servisi
export const issueTypeService = {
  getAll: () => apiClient.get('/api/IssueType'),
  getById: (id) => apiClient.get(`/api/IssueType/${id}`),
  getIssueTypeById: (id) => apiClient.get(`/api/IssueType/${id}`),
  create: (data) => apiClient.post('/api/IssueType', data),
  update: (id, data) => apiClient.put(`/api/IssueType/${id}`, data),
  delete: (id) => apiClient.delete(`/api/IssueType/${id}`),
  getCustomFields: (id) => apiClient.get(`/api/IssueType/${id}/custom-fields`),
  getIssueTypeCustomFields: (id) => apiClient.get(`/api/IssueType/${id}/custom-fields`),
  updateCustomFields: (id, data) => apiClient.post(`/api/IssueType/${id}/custom-fields`, data)
};

// Issue Status servisi
export const issueStatusService = {
  getAll: () => apiClient.get('/api/IssueStatus'),
  getById: (id) => apiClient.get(`/api/IssueStatus/${id}`),
  create: (data) => apiClient.post('/api/IssueStatus', data),
  update: (id, data) => apiClient.put(`/api/IssueStatus/${id}`, data),
  delete: (id) => apiClient.delete(`/api/IssueStatus/${id}`)
};

// Status Service - Board.jsx için alias
export const statusService = {
  getAllStatuses: () => apiClient.get('/api/IssueStatus'),
  getById: (id) => apiClient.get(`/api/IssueStatus/${id}`),
  create: (data) => apiClient.post('/api/IssueStatus', data),
  update: (id, data) => apiClient.put(`/api/IssueStatus/${id}`, data),
  delete: (id) => apiClient.delete(`/api/IssueStatus/${id}`)
};

// Comment servisi
export const commentService = {
  getAll: () => apiClient.get('/api/Comment'),
  getById: (id) => apiClient.get(`/api/Comment/${id}`),
  create: (data) => apiClient.post('/api/Comment', data),
  update: (id, data) => apiClient.put(`/api/Comment/${id}`, data),
  delete: (id) => apiClient.delete(`/api/Comment/${id}`),
};

// Attachment servisi
export const attachmentService = {
  getAll: () => apiClient.get('/api/Attachment'),
  getById: (id) => apiClient.get(`/api/Attachment/${id}`),
  create: (data) => apiClient.post('/api/Attachment', data),
  update: (id, data) => apiClient.put(`/api/Attachment/${id}`, data),
  delete: (id) => apiClient.delete(`/api/Attachment/${id}`),
};

// ProjectMember servisi - API dokümantasyonuna göre güncellenmiş
export const projectMemberService = {
  getAll: () => apiClient.get('/api/ProjectMember'),
  getById: (id) => apiClient.get(`/api/ProjectMember/${id}`),
  create: (data) => {
    // API'nin beklediği format: { projectId, userId, roleId }
    const payload = {
      projectId: parseInt(data.projectId),
      userId: parseInt(data.userId),
      roleId: data.roleId || 1 // Default role ID (member)
    };
    return apiClient.post('/api/ProjectMember', payload);
  },
  update: (id, data) => {
    const payload = {
      projectId: parseInt(data.projectId),
      userId: parseInt(data.userId),
      roleId: data.roleId || 1
    };
    return apiClient.put(`/api/ProjectMember/${id}`, payload);
  },
  delete: (id) => apiClient.delete(`/api/ProjectMember/${id}`),
  
  // Proje bazında üyeleri getir
  getByProject: (projectId) => {
    return apiClient.get('/api/ProjectMember')
      .then(response => ({
        ...response,
        data: response.data.filter(member => 
          parseInt(member.projectId) === parseInt(projectId)
        )
      }));
  },
  
  // Kullanıcı bazında projeleri getir
  getByUser: (userId) => {
    return apiClient.get('/api/ProjectMember')
      .then(response => ({
        ...response,
        data: response.data.filter(member => 
          parseInt(member.userId) === parseInt(userId)
        )
      }));
  }
};

// Role servisi - ProjectMember için gerekli
export const roleService = {
  getAll: () => {
    // Mock data - API'nizde Role endpoint'i yoksa bu şekilde kullanabilirsiniz
    return Promise.resolve({
      data: [
        { roleId: 1, name: 'Member' },
        { roleId: 2, name: 'Admin' },
        { roleId: 3, name: 'Viewer' }
      ]
    });
  },
  getById: (id) => {
    const roles = [
      { roleId: 1, name: 'Member' },
      { roleId: 2, name: 'Admin' },
      { roleId: 3, name: 'Viewer' }
    ];
    const role = roles.find(r => r.roleId === parseInt(id));
    return Promise.resolve({ data: role });
  }
};

// Custom Field servisi
export const customFieldService = {
  getAll: () => apiClient.get('/api/CustomField'),
  getAllCustomFields: () => apiClient.get('/api/CustomField'),
  getById: (id) => apiClient.get(`/api/CustomField/${id}`),
  create: (data) => apiClient.post('/api/CustomField', data),
  update: (id, data) => apiClient.put(`/api/CustomField/${id}`, data),
  delete: (id) => apiClient.delete(`/api/CustomField/${id}`),
};

// Priority Service - Mock data
export const priorityService = {
  getAllPriorities: () => {
    return Promise.resolve({
      data: [
        { id: 1, name: 'Low', color: '#36B37E' },
        { id: 2, name: 'Medium', color: '#FFA500' },
        { id: 3, name: 'High', color: '#FF5630' },
        { id: 4, name: 'Critical', color: '#DE350B' }
      ]
    });
  },
  getById: (id) => {
    const priorities = [
      { id: 1, name: 'Low', color: '#36B37E' },
      { id: 2, name: 'Medium', color: '#FFA500' },
      { id: 3, name: 'High', color: '#FF5630' },
      { id: 4, name: 'Critical', color: '#DE350B' }
    ];
    const priority = priorities.find(p => p.id === parseInt(id));
    return Promise.resolve({ data: priority });
  }
};
