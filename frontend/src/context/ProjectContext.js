// src/context/ProjectContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tüm projeleri yükle
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again later.');
      // Hata durumunda örnek veriler kullan
      setProjects([
        {
          id: 1,
          name: 'E-Commerce Platform',
          description: 'Building a modern e-commerce platform with React and Node.js',
          status: 'active',
          priority: 'high',
          createdAt: '2024-01-15',
          issues: 24,
          completedIssues: 18,
          teamMembers: 6,
        },
        {
          id: 2,
          name: 'Mobile App Development',
          description: 'Cross-platform mobile application using React Native',
          status: 'planning',
          priority: 'medium',
          createdAt: '2024-02-01',
          issues: 12,
          completedIssues: 3,
          teamMembers: 4,
        },
        {
          id: 3,
          name: 'Data Analytics Dashboard',
          description: 'Real-time analytics dashboard for business intelligence',
          status: 'completed',
          priority: 'low',
          createdAt: '2023-12-10',
          issues: 15,
          completedIssues: 15,
          teamMembers: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde projeleri getir
  useEffect(() => {
    fetchProjects();
  }, []);

  // Proje oluştur
  const createProject = async (projectData) => {
    try {
      const newProject = await projectService.create(projectData);
      setProjects([...projects, newProject]);
      return { success: true, data: newProject };
    } catch (err) {
      console.error('Failed to create project:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to create project' 
      };
    }
  };

  // Proje güncelle
  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await projectService.update(id, projectData);
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
      return { success: true, data: updatedProject };
    } catch (err) {
      console.error(`Failed to update project ${id}:`, err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to update project' 
      };
    }
  };

  // Proje sil
  const deleteProject = async (id) => {
    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete project ${id}:`, err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to delete project' 
      };
    }
  };

  const value = {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
