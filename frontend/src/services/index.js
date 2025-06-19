// src/services/index.js

// Önce importları yapın
import { 
  issueStatusService,
  commentService,
  attachmentService,
  projectMemberService 
} from './api';

// Sonra exportları yapın
export * from './authService';
export * from './issueService';
export * from './projectService';
export * from './userService';
export * from './sprintService';
export * from './customFieldService';
export { dashboardService } from './dashboardService';

export {
  issueStatusService,
  commentService,
  attachmentService,
  projectMemberService
};
