// src/components/ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { 
  projectService, 
  issueService, 
  projectMemberService, 
  issueTypeService,
  userService 
} from '../services/api';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Constants
  const statusColors = {
    planning: '#F59E0B',
    active: '#10B981',
    completed: '#3B82F6',
    on_hold: '#EF4444',
    inactive: '#6B7280',
  };

  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
  };

  const statusLabels = {
    1: { name: 'To Do', color: '#6B7280' },
    2: { name: 'In Progress', color: '#3B82F6' },
    3: { name: 'In Review', color: '#F59E0B' },
    4: { name: 'Done', color: '#10B981' },
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const getRoleName = (roleId) => {
    switch(roleId) {
      case 1: return 'Member';
      case 2: return 'Admin';
      case 3: return 'Viewer';
      default: return 'Member';
    }
  };

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      const [
        projectResponse,
        issuesResponse,
        membersResponse,
        issueTypesResponse,
        usersResponse
      ] = await Promise.all([
        projectService.getById(projectId),
        issueService.getAll(),
        projectMemberService.getByProject(projectId), // Güncellenmiş fonksiyon
        issueTypeService.getAll(),
        userService.getAll()
      ]);

      setProject(projectResponse.data || projectResponse);
      
      // Filter issues for this project
      const projectIssues = issuesResponse.data.filter(issue => 
        parseInt(issue.projectId) === parseInt(projectId)
      );
      setIssues(projectIssues);
      
      // Members artık filtrelenmiş olarak geliyor
      setMembers(membersResponse.data || []);
      
      setIssueTypes(issueTypesResponse.data || []);
      setUsers(usersResponse.data || []);
      
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getProgressPercentage = () => {
    if (issues.length === 0) return 0;
    const completedIssues = issues.filter(issue => issue.statusId === 4).length;
    return Math.round((completedIssues / issues.length) * 100);
  };

  const getIssuesByStatus = () => {
    const issuesByStatus = {};
    Object.keys(statusLabels).forEach(statusId => {
      issuesByStatus[statusId] = issues.filter(issue => issue.statusId === parseInt(statusId));
    });
    return issuesByStatus;
  };

  const getIssuesByType = () => {
    const issuesByType = {};
    issueTypes.forEach(type => {
      issuesByType[type.typeId] = issues.filter(issue => issue.typeId === type.typeId);
    });
    return issuesByType;
  };

  const getRecentIssues = () => {
    return issues
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  // Event handlers
  const handleEditProject = () => {
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
    });
    setEditDialogOpen(true);
  };

  const handleSaveProject = async () => {
    if (!formData.name?.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await projectService.update(projectId, formData);
      if (response.success) {
        setProject({ ...project, ...formData });
        setSnackbar({
          open: true,
          message: 'Project updated successfully',
          severity: 'success'
        });
        setEditDialogOpen(false);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update project',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      // Role string'ini roleId'ye çevir
      const getRoleId = (roleName) => {
        switch(roleName) {
          case 'admin': return 2;
          case 'viewer': return 3;
          case 'member':
          default: return 1;
        }
      };

      const memberData = {
        projectId: parseInt(projectId),
        userId: parseInt(selectedUser),
        roleId: getRoleId(selectedRole)
      };
      
      const response = await projectMemberService.create(memberData);
      
      // API response'unu kontrol et
      if (response.data || response.status === 200) {
        await loadProjectData(); // Reload to get updated members
        setSnackbar({
          open: true,
          message: 'Member added successfully',
          severity: 'success'
        });
        setAddMemberDialogOpen(false);
        setSelectedUser('');
        setSelectedRole('member');
      } else {
        throw new Error('Failed to add member');
      }
    } catch (err) {
      console.error('Add member error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to add member',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    setSubmitting(true);
    try {
      const response = await projectMemberService.delete(memberId);
      
      // API response'unu kontrol et
      if (response.status === 200 || response.data) {
        // Üyeyi local state'den kaldır
        setMembers(members.filter(member => member.id !== memberId));
        setSnackbar({
          open: true,
          message: 'Member removed successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (err) {
      console.error('Remove member error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to remove member',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={3}>
        <Alert severity="warning">Project not found</Alert>
      </Box>
    );
  }

  const issuesByStatus = getIssuesByStatus();
  const issuesByType = getIssuesByType();
  const recentIssues = getRecentIssues();

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/projects"
          onClick={(e) => {
            e.preventDefault();
            navigate('/projects');
          }}
          sx={{ cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Projects
        </Link>
        <Typography color="text.primary" fontWeight="500" fontSize="0.875rem">
          {project.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => navigate('/projects')}
            size="small"
            sx={{ 
              backgroundColor: '#F3F4F6',
              '&:hover': { backgroundColor: '#E5E7EB' }
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Typography variant="h5" fontWeight="700" color="#111827">
                {project.name}
              </Typography>
              <Chip
                label={project.status?.replace('_', ' ').toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: statusColors[project.status] || '#6B7280',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
              <Chip
                label={project.priority?.toUpperCase()}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: priorityColors[project.priority] || '#6B7280',
                  color: priorityColors[project.priority] || '#6B7280',
                  fontWeight: '500',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>
            <Typography variant="body2" color="#6B7280" sx={{ maxWidth: 600 }}>
              {project.description || 'No description provided'}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon fontSize="small" />}
            onClick={handleEditProject}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB'
              },
              textTransform: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<DashboardIcon fontSize="small" />}
            onClick={() => navigate(`/project/${projectId}/boards`)}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            Open Boards
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E5E7EB', height: 100 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
                <Box>
                  <Typography variant="h5" fontWeight="700" color="#111827">
                    {issues.length}
                  </Typography>
                  <Typography variant="caption" color="#6B7280" fontWeight="500">
                    Total Issues
                  </Typography>
                </Box>
                <TaskIcon sx={{ fontSize: 32, color: '#3B82F6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E5E7EB', height: 100 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
                <Box>
                  <Typography variant="h5" fontWeight="700" color="#111827">
                    {issues.filter(issue => issue.statusId === 4).length}
                  </Typography>
                  <Typography variant="caption" color="#6B7280" fontWeight="500">
                    Completed
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 32, color: '#10B981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E5E7EB', height: 100 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
                <Box>
                  <Typography variant="h5" fontWeight="700" color="#111827">
                    {members.length}
                  </Typography>
                  <Typography variant="caption" color="#6B7280" fontWeight="500">
                    Team Members
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E5E7EB', height: 100 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
                <Box>
                  <Typography variant="h5" fontWeight="700" color="#111827">
                    {getProgressPercentage()}%
                  </Typography>
                  <Typography variant="caption" color="#6B7280" fontWeight="500">
                    Progress
                  </Typography>
                </Box>
                <Box sx={{ width: 32, height: 32, position: 'relative' }}>
                  <CircularProgress
                    variant="determinate"
                    value={getProgressPercentage()}
                    size={32}
                    sx={{
                      color: '#10B981',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      <Card sx={{ mb: 3, border: '1px solid #E5E7EB' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight="600" color="#111827">
              Project Progress
            </Typography>
            <Typography variant="body2" fontWeight="600" color="#111827">
              {getProgressPercentage()}% Complete
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#10B981',
                borderRadius: 4,
              },
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            {Object.entries(statusLabels).map(([statusId, status]) => {
              const count = issuesByStatus[statusId]?.length || 0;
              return (
                <Box key={statusId} textAlign="center">
                  <Typography variant="subtitle2" fontWeight="600" color={status.color}>
                    {count}
                  </Typography>
                  <Typography variant="caption" color="#6B7280">
                    {status.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
              minHeight: 40,
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Issues" />
          <Tab label="Team Members" />
          <Tab label="Issue Types" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Recent Issues */}
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid #E5E7EB', height: 'fit-content' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="600" color="#111827">
                    Recent Issues
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setActiveTab(1)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    View All
                  </Button>
                </Box>
                
                <Stack spacing={1.5}>
                  {recentIssues.map((issue) => (
                    <Box
                      key={issue.issueId}
                      sx={{
                        p: 1.5,
                        border: '1px solid #F3F4F6',
                        borderRadius: 1,
                        backgroundColor: '#FAFBFC',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => navigate(`/issues/${issue.issueId}`)}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 24, height: 24, backgroundColor: '#F3F4F6', color: '#374151' }}>
                          <TaskIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="500" color="#111827" noWrap>
                            {issue.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <TimeIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                            <Typography variant="caption" color="#6B7280">
                              {formatDate(issue.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={statusLabels[issue.statusId]?.name || 'Unknown'}
                          size="small"
                          sx={{
                            backgroundColor: statusLabels[issue.statusId]?.color || '#6B7280',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                  {recentIssues.length === 0 && (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="#6B7280">
                        No issues found
                      </Typography>
                      <Typography variant="caption" color="#9CA3AF">
                        Create your first issue to get started
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Members Preview */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #E5E7EB', height: 'fit-content' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="600" color="#111827">
                    Team Members
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setActiveTab(2)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    View All
                  </Button>
                </Box>
                
                <Stack spacing={1.5}>
                  {members.slice(0, 4).map((member) => (
                    <Box key={member.id} display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {member.user?.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" color="#111827">
                          {member.user?.fullName || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="#6B7280">
                          {getRoleName(member.roleId)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {members.length === 0 && (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="#6B7280">
                        No team members
                      </Typography>
                      <Typography variant="caption" color="#9CA3AF">
                        Add members to collaborate
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card sx={{ border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="600" color="#111827">
                All Issues ({issues.length})
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => navigate(`/issues/new?projectId=${projectId}`)}
                sx={{
                  backgroundColor: '#4F46E5',
                  '&:hover': { backgroundColor: '#4338CA' },
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                Create Issue
              </Button>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '600', fontSize: '0.875rem' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: '600', fontSize: '0.875rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: '600', fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: '600', fontSize: '0.875rem' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: '600', fontSize: '0.875rem' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: '600', fontSize: '0.875rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.issueId} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {issue.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.875rem">
                          {issueTypes.find(type => type.typeId === issue.typeId)?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[issue.statusId]?.name || 'Unknown'}
                          size="small"
                          sx={{
                            backgroundColor: statusLabels[issue.statusId]?.color || '#6B7280',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={issue.priority?.toUpperCase() || 'MEDIUM'}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: priorityColors[issue.priority] || '#6B7280',
                            color: priorityColors[issue.priority] || '#6B7280',
                            fontWeight: '500',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="#6B7280">
                          {formatDate(issue.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/issues/${issue.issueId}`)}
                          sx={{ color: '#6B7280' }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {issues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="#6B7280">
                          No issues found for this project
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="600" color="#111827">
                Team Members ({members.length})
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon fontSize="small" />}
                onClick={() => setAddMemberDialogOpen(true)}
                sx={{
                  backgroundColor: '#4F46E5',
                  '&:hover': { backgroundColor: '#4338CA' },
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                Add Member
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {members.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                                    <Card variant="outlined" sx={{ p: 2, height: 120 }}>
                    <Box display="flex" alignItems="center" gap={2} height="100%">
                      <Avatar sx={{ width: 40, height: 40, fontSize: '1rem' }}>
                        {member.user?.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight="600" noWrap>
                          {member.user?.fullName || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="#6B7280" display="block">
                          {member.user?.email || 'No email'}
                        </Typography>
                        <Chip
                          label={member.role?.name || member.role || 'Member'}
                          size="small"
                          sx={{ 
                            mt: 0.5, 
                            fontSize: '0.7rem',
                            height: 18,
                            backgroundColor: '#F3F4F6',
                            color: '#374151'
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMember(member.id)}
                        sx={{ color: '#EF4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {members.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={6}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                    <Typography variant="subtitle1" color="#374151" fontWeight="600" mb={1}>
                      No team members yet
                    </Typography>
                    <Typography variant="body2" color="#6B7280" mb={3}>
                      Add team members to collaborate on this project
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddIcon fontSize="small" />}
                      onClick={() => setAddMemberDialogOpen(true)}
                      sx={{
                        backgroundColor: '#4F46E5',
                        '&:hover': { backgroundColor: '#4338CA' },
                        textTransform: 'none',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                      }}
                    >
                      Add First Member
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card sx={{ border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight="600" color="#111827" mb={2}>
              Issue Types & Boards
            </Typography>
            
            <Grid container spacing={2}>
              {issueTypes.map((issueType) => {
                const typeIssues = issuesByType[issueType.typeId] || [];
                return (
                  <Grid item xs={12} sm={6} md={4} key={issueType.typeId}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        height: 160,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                          borderColor: '#4F46E5',
                        },
                      }}
                      onClick={() => navigate(`/board/${issueType.typeId}?projectId=${projectId}`)}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: 2.5, 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Box mb={1.5}>
                          {issueType.name.toLowerCase() === 'bug' && (
                            <BugIcon sx={{ fontSize: 36, color: '#EF4444' }} />
                          )}
                          {issueType.name.toLowerCase() === 'task' && (
                            <TaskIcon sx={{ fontSize: 36, color: '#3B82F6' }} />
                          )}
                          {!['bug', 'task'].includes(issueType.name.toLowerCase()) && (
                            <TaskIcon sx={{ fontSize: 36, color: '#6B7280' }} />
                          )}
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight="600" color="#111827" mb={1}>
                          {issueType.name}
                        </Typography>
                        
                        <Typography variant="caption" color="#6B7280" mb={1.5} sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {issueType.description || `Manage ${issueType.name.toLowerCase()} items`}
                        </Typography>
                        
                        <Chip
                          label={`${typeIssues.length} issues`}
                          size="small"
                          sx={{
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                            fontWeight: '600',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
              {issueTypes.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={6}>
                    <DashboardIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                    <Typography variant="subtitle1" color="#374151" fontWeight="600" mb={1}>
                      No Issue Types Available
                    </Typography>
                    <Typography variant="body2" color="#6B7280">
                      Issue types need to be configured to access project boards.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Edit Project Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={submitting}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #E5E7EB',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: '700', 
          fontSize: '1.125rem', 
          color: '#111827',
          borderBottom: '1px solid #F3F4F6',
          pb: 2
        }}>
          Edit Project
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Project Name"
              size="small"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              disabled={submitting}
              required
              sx={{
                '& .MuiInputLabel-root': {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#D1D5DB',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4F46E5',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Description"
              size="small"
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              disabled={submitting}
              placeholder="Describe your project goals, scope, and key objectives..."
              sx={{
                '& .MuiInputLabel-root': {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#D1D5DB',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4F46E5',
                  },
                },
              }}
            />
            
            <Box display="flex" gap={2}>
              <FormControl fullWidth margin="normal" disabled={submitting} size="small">
                <InputLabel sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Status</InputLabel>
                <Select
                  value={formData.status || ''}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4F46E5',
                    },
                  }}
                >
                  <MenuItem value="planning">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: statusColors.planning,
                        }}
                      />
                      <Typography fontSize="0.875rem">Planning</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="active">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: statusColors.active,
                        }}
                      />
                      <Typography fontSize="0.875rem">Active</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="completed">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: statusColors.completed,
                        }}
                      />
                      <Typography fontSize="0.875rem">Completed</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="on_hold">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: statusColors.on_hold,
                        }}
                      />
                      <Typography fontSize="0.875rem">On Hold</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" disabled={submitting} size="small">
                <InputLabel sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Priority</InputLabel>
                <Select
                  value={formData.priority || ''}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4F46E5',
                    },
                  }}
                >
                  <MenuItem value="low">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.low,
                        }}
                      />
                      <Typography fontSize="0.875rem">Low</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.medium,
                        }}
                      />
                      <Typography fontSize="0.875rem">Medium</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.high,
                        }}
                      />
                      <Typography fontSize="0.875rem">High</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="critical">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.critical,
                        }}
                      />
                      <Typography fontSize="0.875rem">Critical</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F3F4F6' }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={submitting}
            size="small"
            sx={{ 
              textTransform: 'none',
              color: '#6B7280',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#F9FAFB'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProject} 
            variant="contained"
            size="small"
            disabled={!formData.name?.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '&:disabled': {
                backgroundColor: '#D1D5DB'
              }
            }}
          >
            {submitting ? 'Updating...' : 'Update Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog 
        open={addMemberDialogOpen} 
        onClose={() => setAddMemberDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={submitting}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #E5E7EB',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: '700', 
          fontSize: '1.125rem', 
          color: '#111827',
          borderBottom: '1px solid #F3F4F6',
          pb: 2
        }}>
          Add Team Member
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal" disabled={submitting} size="small">
              <InputLabel sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Select User</InputLabel>
              <Select
                value={selectedUser}
                label="Select User"
                onChange={(e) => setSelectedUser(e.target.value)}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4F46E5',
                  },
                }}
              >
                {users
                  .filter(user => !members.some(member => member.userId === user.userId))
                  .map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                          {user.firstName?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {user.fullName || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="#6B7280">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" disabled={submitting} size="small">
              <InputLabel sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => setSelectedRole(e.target.value)}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4F46E5',
                  },
                }}
              >
                <MenuItem value="member">
                  <Typography fontSize="0.875rem">Member</Typography>
                </MenuItem>
                <MenuItem value="admin">
                  <Typography fontSize="0.875rem">Admin</Typography>
                </MenuItem>
                <MenuItem value="viewer">
                  <Typography fontSize="0.875rem">Viewer</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F3F4F6' }}>
          <Button 
            onClick={() => {
              setAddMemberDialogOpen(false);
              setSelectedUser('');
              setSelectedRole('member');
            }} 
            disabled={submitting}
            size="small"
            sx={{ 
              textTransform: 'none',
              color: '#6B7280',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#F9FAFB'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained"
            size="small"
            disabled={!selectedUser || submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '&:disabled': {
                backgroundColor: '#D1D5DB'
              }
            }}
          >
            {submitting ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{
            borderRadius: 1.5,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              fontWeight: '500',
              fontSize: '0.875rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail;
