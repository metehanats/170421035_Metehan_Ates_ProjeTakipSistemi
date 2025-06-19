// src/services/dashboardService.js
import { projectService } from './projectService';
import { issueService } from './issueService';
import { sprintService } from './sprintService';
import { userService } from './userService';
import { mapIssueFromApi, mapProjectFromApi } from '../utils/adapters';

const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message, data) => {
  if (DEBUG) {
    console.log(`[Dashboard Debug] ${message}:`, data);
  }
};

export const dashboardService = {
  // Dashboard için gerekli tüm verileri tek seferde getir
  getDashboardData: async () => {
    try {
      debugLog('Starting dashboard data fetch');
    
      const [projects, issues, sprints, users] = await Promise.allSettled([
        projectService.getAll(),
        issueService.getAll(),
        sprintService.getAll(),
        userService.getAll()
      ]);

      debugLog('Raw API responses', { projects, issues, sprints, users });

      // API'den gelen verileri normalize et
      let normalizedProjects = [];
      let normalizedIssues = [];
      let normalizedSprints = [];
      let normalizedUsers = [];

      // Projects'i normalize et
      if (projects.status === 'fulfilled' && projects.value) {
        debugLog('Processing projects', projects.value);
        normalizedProjects = Array.isArray(projects.value) 
          ? projects.value.map(project => mapProjectFromApi(project))
          : [];
        debugLog('Normalized projects', normalizedProjects);
      }

      // Issues'i normalize et
      if (issues.status === 'fulfilled' && issues.value) {
        debugLog('Processing issues', issues.value);
        const issuesData = issues.value.data || issues.value;
        normalizedIssues = Array.isArray(issuesData) 
          ? issuesData.map(issue => mapIssueFromApi(issue))
          : [];
        debugLog('Normalized issues', normalizedIssues);
      }

      // Sprints'i normalize et
      if (sprints.status === 'fulfilled' && sprints.value) {
        debugLog('Processing sprints', sprints.value);
        normalizedSprints = Array.isArray(sprints.value) 
          ? sprints.value.map(sprint => ({
              id: sprint.sprintId?.toString() || sprint.id?.toString() || '0',
              name: sprint.name || 'Unnamed Sprint',
              status: sprint.status || 'planned',
              isActive: sprint.isActive || false,
              startDate: sprint.startDate,
              endDate: sprint.endDate,
              projectId: sprint.projectId?.toString(),
              createdAt: sprint.createdAt,
            }))
          : [];
        debugLog('Normalized sprints', normalizedSprints);
      }

      // Users'i normalize et
      if (users.status === 'fulfilled' && users.value) {
        debugLog('Processing users', users.value);
        normalizedUsers = Array.isArray(users.value) 
          ? users.value.map(user => ({
              id: user.userId?.toString() || user.id?.toString() || '0',
              fullName: user.fullName || user.name || 'Unknown User',
              email: user.email || '',
              role: user.role || 'user',
            }))
          : [];
        debugLog('Normalized users', normalizedUsers);
      }

      const result = {
        projects: normalizedProjects,
        issues: normalizedIssues,
        sprints: normalizedSprints,
        users: normalizedUsers,
        errors: {
          projects: projects.status === 'rejected' ? projects.reason : null,
          issues: issues.status === 'rejected' ? issues.reason : null,
          sprints: sprints.status === 'rejected' ? sprints.reason : null,
          users: users.status === 'rejected' ? users.reason : null,
        }
      };

      debugLog('Final dashboard data', result);
      return result;

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  },

  // Diğer fonksiyonlar aynı kalacak...
  calculateStats: (projects, issues, sprints) => {
    debugLog('Calculating stats', { projects, issues, sprints });
    
    const projectStats = {
      total: projects.length,
      active: projects.filter(p => 
        p.status === 'active' || 
        p.status === 'ACTIVE' || 
        !p.status // status yoksa active kabul et
      ).length,
      completed: projects.filter(p => 
        p.status === 'completed' || 
        p.status === 'COMPLETED'
      ).length,
      inactive: projects.filter(p => 
        p.status === 'inactive' || 
        p.status === 'INACTIVE'
      ).length,
    };

    const issueStats = {
      total: issues.length,
      todo: issues.filter(i => 
        i.status === 'todo' || 
        i.status === 'Open' ||
        (i.statusId && i.statusId === 1)
      ).length,
      inProgress: issues.filter(i => 
        i.status === 'in_progress' || 
        i.status === 'In Progress' ||
        (i.statusId && [2, 3].includes(i.statusId))
      ).length,
      done: issues.filter(i => 
        i.status === 'done' || 
        i.status === 'Done' ||
        (i.statusId && i.statusId === 4)
      ).length,
      highPriority: issues.filter(i => {
        if (i.priority === 'high' || i.priority === 'critical') return true;
        if (i.priorityId && i.priorityId >= 3) return true;
        return false;
      }).length,
      byType: {
        task: issues.filter(i => 
          i.type === 'task' || 
          i.type === 'Task' ||
          (i.typeId && i.typeId === 2)
        ).length,
        bug: issues.filter(i => 
          i.type === 'bug' || 
          i.type === 'Bug' ||
          (i.typeId && i.typeId === 1)
        ).length,
        story: issues.filter(i => 
          i.type === 'story' || 
          i.type === 'Story' ||
          (i.typeId && i.typeId === 3)
        ).length,
      }
    };

    const sprintStats = {
      total: sprints.length,
      active: sprints.filter(s => 
        s.status === 'active' || 
        s.isActive === true
      ).length,
      planned: sprints.filter(s => 
        s.status === 'planned'
      ).length,
      completed: sprints.filter(s => 
        s.status === 'completed'
      ).length,
    };

    const calculatedStats = {
      projects: projectStats,
      issues: issueStats,
      sprints: sprintStats,
    };

    debugLog('Calculated stats', calculatedStats);
    return calculatedStats;
  },

  // Son aktiviteleri getir
  getRecentActivity: (issues, projects, sprints) => {
    const activities = [];

    // Son oluşturulan issue'lar
    const recentIssues = issues
      .filter(issue => issue.createdAt) // createdAt olan issue'lar
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(issue => ({
        type: 'issue_created',
        title: `Issue created: ${issue.title}`,
        timestamp: issue.createdAt,
        data: issue
      }));

    // Son oluşturulan projeler
    const recentProjects = projects
      .filter(project => project.createdAt) // createdAt olan projeler
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(project => ({
        type: 'project_created',
        title: `Project created: ${project.name}`,
        timestamp: project.createdAt,
        data: project
      }));

    // Son oluşturulan sprint'ler
    const recentSprints = sprints
      .filter(sprint => sprint.createdAt) // createdAt olan sprint'ler
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(sprint => ({
        type: 'sprint_created',
        title: `Sprint created: ${sprint.name}`,
        timestamp: sprint.createdAt,
        data: sprint
      }));

    activities.push(...recentIssues, ...recentProjects, ...recentSprints);

    // Timestamp'e göre sırala ve son 10'u al
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }
};
