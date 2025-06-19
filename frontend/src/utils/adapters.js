// src/utils/adapters.js

// utils/adapters.js
export const mapIssueFromApi = (apiIssue) => {
  if (!apiIssue) {
    console.warn('Received undefined or null apiIssue');
    return {
      id: 0,
      title: 'Unknown Issue',
      description: '',
      type: 'task',
      status: 'todo',
      priority: 'medium',
      projectId: 0,
      assigneeId: '',
      assigneeName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // API'den gelen durum ve tip bilgilerini frontend formatına dönüştür
  const mapApiStatusToFrontend = (statusName) => {
    if (!statusName) return 'todo';
    const statusMap = {
      'Open': 'todo',
      'In Progress': 'in_progress',
      'Done': 'done'
    };
    return statusMap[statusName] || 'todo';
  };

  const mapApiTypeToFrontend = (typeName) => {
    if (!typeName) return 'task';
    const typeMap = {
      'Bug': 'bug',
      'Task': 'task',
      'Story': 'story'
    };
    return typeMap[typeName] || 'task';
  };

  // Güvenli bir şekilde assigneeId oluştur
  let assigneeId = '';
  if (apiIssue.assigneeId !== undefined && apiIssue.assigneeId !== null) {
    assigneeId = String(apiIssue.assigneeId);
  } else if (apiIssue.assignee && apiIssue.assignee.userId !== undefined) {
    assigneeId = String(apiIssue.assignee.userId);
  }

  return {
    id: apiIssue.issueId || 0,
    title: apiIssue.title || '',
    description: apiIssue.description || '',
    type: mapApiTypeToFrontend(apiIssue.type?.name),
    status: mapApiStatusToFrontend(apiIssue.status?.name),
    priority: mapIssuePriority(apiIssue.priorityId) || 'medium',
    projectId: apiIssue.projectId || 0,
    assigneeId: assigneeId,
    assigneeName: apiIssue.assignee?.fullName || '',
    reporterName: apiIssue.reporter?.fullName || '',
    createdAt: apiIssue.createdAt || new Date().toISOString(),
    updatedAt: apiIssue.updatedAt || new Date().toISOString()
  };
};

// Frontend'den API'ye gönderilecek issue verisini dönüştürme
export const mapIssueToApi = (frontendIssue) => {
  return {
    issueID: parseInt(frontendIssue.id) || 0,
    title: frontendIssue.title,
    description: frontendIssue.description,
    typeID: mapIssueTypeIdToApi(frontendIssue.type),
    statusID: mapIssueStatusToApi(frontendIssue.status),
    priorityID: mapIssuePriorityToApi(frontendIssue.priority),
    projectID: frontendIssue.projectId,
    assigneeID: frontendIssue.assigneeId || null,
    reporterID: frontendIssue.reporterId || null,
  };
};



// Frontend'den API'ye gönderilecek proje verisini dönüştürme
export const mapProjectToApi = (frontendProject) => {
  return {
    projectID: parseInt(frontendProject.id) || 0,
    name: frontendProject.name,
    key: frontendProject.key,
    description: frontendProject.description,
    leadID: frontendProject.leadId,
  };
};

// Yardımcı dönüştürme fonksiyonları
function mapIssueType(typeID) {
  const typeMap = {
    1: 'bug',
    2: 'task',
    3: 'story'
  };
  return typeMap[typeID] || 'task';
}

function mapIssueTypeIdToApi(type) {
  const typeMap = {
    'bug': 1,
    'task': 2,
    'story': 3
  };
  return typeMap[type] || 2;
}

function mapIssueStatus(statusID) {
  const statusMap = {
    1: 'todo',
    2: 'in_progress',
    3: 'done'
  };
  return statusMap[statusID] || 'todo';
}

function mapIssueStatusToApi(status) {
  const statusMap = {
    'todo': 1,
    'in_progress': 2,
    'done': 3
  };
  return statusMap[status] || 1;
}

function mapIssuePriority(priorityID) {
  const priorityMap = {
    1: 'low',
    2: 'medium',
    3: 'high',
    4: 'critical'
  };
  return priorityMap[priorityID] || 'medium';
}

function mapIssuePriorityToApi(priority) {
  const priorityMap = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };
  return priorityMap[priority] || 2;
}

// API'den gelen issue type verisini frontend formatına dönüştürme
export const mapIssueTypeFromApi = (apiIssueType) => {
  if (!apiIssueType) {
    return null;
  }
  
  return {
    id: apiIssueType.issueTypeId,
    name: apiIssueType.name || '',
    description: apiIssueType.description || '',
    icon: mapApiIconToFrontend(apiIssueType.icon) || 'Assignment',
    color: apiIssueType.color || '#4F46E5',
    customFields: apiIssueType.customFields || []
  };
};

// Frontend'den API'ye gönderilecek issue type verisini dönüştürme
export const mapIssueTypeToApi = (frontendIssueType) => {
  return {
    issueTypeId: frontendIssueType.id || 0,
    name: frontendIssueType.name,
    description: frontendIssueType.description,
    icon: mapFrontendIconToApi(frontendIssueType.icon),
    color: frontendIssueType.color
  };
};

// API'den gelen icon string'ini frontend component'ine dönüştürme
const mapApiIconToFrontend = (iconName) => {
  const iconMap = {
    'bug': 'BugReport',
    'task': 'Assignment',
    'story': 'Timeline',
    'epic': 'Flag'
  };
  return iconMap[iconName?.toLowerCase()] || 'Assignment';
};

// Frontend icon string'ini API'ye gönderilecek formata dönüştürme
const mapFrontendIconToApi = (iconName) => {
  const iconMap = {
    'BugReport': 'bug',
    'Assignment': 'task',
    'Timeline': 'story',
    'Flag': 'epic'
  };
  return iconMap[iconName] || 'task';
};

// src/utils/adapters.js dosyasının sonuna ekleyin

// API'den gelen proje verisini frontend formatına dönüştürme (güncellendi)
export const mapProjectFromApi = (apiProject) => {
  if (!apiProject) {
    console.warn('Received undefined or null apiProject');
    return {
      id: '0',
      name: 'Unknown Project',
      key: '',
      description: '',
      leadId: '',
      leadName: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issues: 0,
      completedIssues: 0,
    };
  }

  return {
    id: (apiProject.projectID || apiProject.id || 0).toString(),
    name: apiProject.name || 'Unnamed Project',
    key: apiProject.key || '',
    description: apiProject.description || '',
    leadId: (apiProject.leadID || apiProject.leadId || '').toString(),
    leadName: apiProject.leadName || apiProject.lead?.fullName || '',
    status: apiProject.status || 'active',
    createdAt: apiProject.createdAt || new Date().toISOString(),
    updatedAt: apiProject.updatedAt || new Date().toISOString(),
    // Dashboard için ek alanlar
    issues: apiProject.totalIssues || apiProject.issues || 0,
    completedIssues: apiProject.completedIssues || 0,
  };
};
