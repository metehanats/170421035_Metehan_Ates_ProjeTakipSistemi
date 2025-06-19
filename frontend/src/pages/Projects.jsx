// src/components/Projects.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Skeleton,
  InputAdornment,
  Collapse,
  CardHeader,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  BugReport as IssueIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FolderOpen as FolderIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useProject } from '../context/ProjectContext';
import { issueService, projectMemberService, issueTypeService } from '../services/api';

const Projects = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    loading, 
    error, 
    fetchProjects,
    createProject,
    updateProject,
    deleteProject 
  } = useProject();
  
  // State management
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedProject, setExpandedProject] = useState(null);
  
  // Data states
  const [projectIssues, setProjectIssues] = useState({});
  const [projectMembers, setProjectMembers] = useState({});
  const [issueTypes, setIssueTypes] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [submitting, setSubmitting] = useState(false);

  // Constants
  const statusColors = {
    planning: '#FFA500',
    active: '#36B37E',
    completed: '#0052CC',
    on_hold: '#FF5630',
  };

  const priorityColors = {
    low: '#36B37E',
    medium: '#FFA500',
    high: '#FF5630',
    critical: '#DE350B',
  };

  // Load additional data
  useEffect(() => {
    loadIssueTypes();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        loadProjectDetails(project.id);
      });
    }
  }, [projects]);

  const loadIssueTypes = async () => {
    try {
      const response = await issueTypeService.getAll();
      setIssueTypes(response.data || []);
    } catch (error) {
      console.error('Error loading issue types:', error);
    }
  };

  const loadProjectDetails = async (projectId) => {
    if (loadingDetails[projectId]) return;
    
    setLoadingDetails(prev => ({ ...prev, [projectId]: true }));
    
    try {
      // Load project issues
      const issuesResponse = await issueService.getAll();
      const projectIssuesList = issuesResponse.data.filter(issue => 
        parseInt(issue.projectId) === parseInt(projectId)
      );
      
      // Load project members
      const membersResponse = await projectMemberService.getAll();
      const projectMembersList = membersResponse.data.filter(member => 
        parseInt(member.projectId) === parseInt(projectId)
      );
      
      setProjectIssues(prev => ({ ...prev, [projectId]: projectIssuesList }));
      setProjectMembers(prev => ({ ...prev, [projectId]: projectMembersList }));
      
    } catch (error) {
      console.error(`Error loading details for project ${projectId}:`, error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [projectId]: false }));
    }
  };

  // Filter projects
  // src/components/Projects.js - Sadece değişen kısımları gösteriyorum

// Filter projects - Bu kısmı güncelleyin
  const filteredProjects = projects.filter(project => {
    // Güvenli string kontrolü
    const projectName = project.name || '';
    const projectDescription = project.description || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = projectName.toLowerCase().includes(searchTermLower) ||
                        projectDescription.toLowerCase().includes(searchTermLower);
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dialog handlers
  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
    });
  };

  const handleSaveProject = async () => {
    if (!formData.name.trim()) return;
    
    setSubmitting(true);
    try {
      if (editingProject) {
        const result = await updateProject(editingProject.id, formData);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Project updated successfully',
            severity: 'success'
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await createProject(formData);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Project created successfully',
            severity: 'success'
          });
        } else {
          throw new Error(result.error);
        }
      }
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await deleteProject(projectId);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Project deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete project',
        severity: 'error'
      });
    }
    handleCloseMenu();
  };

  // Menu handlers
  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  // Navigation handlers
  const handleViewProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleOpenBoard = (projectId, issueTypeId) => {
    navigate(`/board/${issueTypeId}?projectId=${projectId}`);
  };

  // Utility functions
  const getProgressPercentage = (project) => {
    const issues = projectIssues[project.id] || [];
    if (issues.length === 0) return 0;
    const completedIssues = issues.filter(issue => issue.statusId === 4).length;
    return Math.round((completedIssues / issues.length) * 100);
  };

  const getIssuesByType = (projectId) => {
    const issues = projectIssues[projectId] || [];
    const issuesByType = {};
    
    issueTypes.forEach(type => {
      issuesByType[type.typeId] = {
        ...type,
        count: issues.filter(issue => issue.typeId === type.typeId).length
      };
    });
    
    return issuesByType;
  };

  const handleRefresh = () => {
    fetchProjects();
    setProjectIssues({});
    setProjectMembers({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Project Card Component
// src/components/Projects.js - Ek güvenlik kontrolleri

// ProjectCard component'inde
  // src/components/Projects.js - ProjectCard component'ini tamamen güncelleyin

const ProjectCard = ({ project }) => {
  // Güvenli değer kontrolü
  if (!project) return null;
  
  const issues = projectIssues[project.id] || [];
  const members = projectMembers[project.id] || [];
  const isExpanded = expandedProject === project.id;
  const isLoadingDetails = loadingDetails[project.id];
  const issuesByType = getIssuesByType(project.id);

  // Proje kartına tıklama handler'ı
  const handleCardClick = (e) => {
    // Eğer tıklanan element button, icon button veya menu ise navigate etme
    if (e.target.closest('button') || 
        e.target.closest('.MuiIconButton-root') || 
        e.target.closest('.MuiMenuItem-root')) {
      return;
    }
    navigate(`/project/${project.id}`);
  };

  return (
    <Card
      sx={{
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        border: '1px solid #E5E7EB',
        cursor: 'pointer', // Cursor pointer ekleyin
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          borderColor: '#D1D5DB',
        },
      }}
      onClick={handleCardClick} // Click handler ekleyin
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="600" color="#111827">
              {project.name || 'Untitled Project'}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Event bubbling'i durdur
                handleMenuClick(e, project);
              }}
              sx={{ color: '#6B7280' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {/* Status and Priority */}
        <Box display="flex" gap={1} mb={2}>
          <Chip
            label={(project.status || 'inactive').replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              backgroundColor: statusColors[project.status] || '#6B7280',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.75rem',
            }}
          />
          <Chip
            label={(project.priority || 'medium').toUpperCase()}
            size="small"
            variant="outlined"
            sx={{
              borderColor: priorityColors[project.priority] || '#6B7280',
              color: priorityColors[project.priority] || '#6B7280',
              fontWeight: '500',
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="#6B7280"
          mb={2}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '40px',
            lineHeight: 1.5,
          }}
        >
          {project.description || 'No description provided'}
        </Typography>

        {/* Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="#6B7280" fontWeight="500">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="600" color="#111827">
              {getProgressPercentage(project)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage(project)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#10B981',
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Stats */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IssueIcon sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography variant="body2" color="#6B7280">
              {issues.length} issues
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <PeopleIcon sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography variant="body2" color="#6B7280">
              {members.length} members
            </Typography>
          </Box>
        </Box>

        {/* Team Members */}
        {members.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="#6B7280" fontWeight="500" mb={1} display="block">
              Team Members
            </Typography>
            <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
              {members.map((member, index) => (
                <Tooltip key={index} title={member.user?.fullName || 'Unknown User'}>
                  <Avatar
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      fontSize: '0.75rem',
                      backgroundColor: '#4F46E5',
                      color: 'white'
                    }}
                  >
                    {member.user?.firstName?.charAt(0) || '?'}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation(); // Event bubbling'i durdur
              handleViewProject(project.id);
            }}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB'
              },
              textTransform: 'none',
              fontWeight: '500',
            }}
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={(e) => {
              e.stopPropagation(); // Event bubbling'i durdur
              navigate(`/project/${project.id}/boards`);
            }}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: '500',
            }}
          >
            Open Boards
          </Button>
        </Box>

        {/* Expanded Details */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          
          {isLoadingDetails ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box>
              {/* Issue Types */}
              <Typography variant="subtitle2" fontWeight="600" color="#111827" mb={1}>
                Issue Types & Boards
              </Typography>
              <Box mb={2}>
                {Object.values(issuesByType).map((issueType) => (
                  <Box
                    key={issueType.typeId}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    py={1}
                    px={2}
                    mb={1}
                    sx={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 1,
                      border: '1px solid #F3F4F6',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Event bubbling'i durdur
                      handleOpenBoard(project.id, issueType.typeId);
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <TaskIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                      <Typography variant="body2" fontWeight="500">
                        {issueType.name}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={issueType.count}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#E5E7EB',
                          color: '#374151',
                          fontWeight: '600',
                        }
                      }}
                    >
                      <Box />
                    </Badge>
                  </Box>
                ))}
              </Box>

              {/* Recent Activity */}
              <Typography variant="subtitle2" fontWeight="600" color="#111827" mb={1}>
                Recent Issues
              </Typography>
              <Box>
                {issues.slice(0, 3).map((issue) => (
                  <Box 
                    key={issue.issueId} 
                    display="flex" 
                    alignItems="center" 
                    gap={1} 
                    py={1}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: '#F9FAFB',
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Event bubbling'i durdur
                      navigate(`/issues/${issue.issueId}`);
                    }}
                  >
                    <TaskIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {issue.title}
                    </Typography>
                    <Chip
                      label={issue.statusName || 'Unknown'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                ))}
                {issues.length === 0 && (
                  <Typography variant="caption" color="#9CA3AF" fontStyle="italic">
                    No issues found
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};


  // List View Component
  const ProjectListView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Project</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Progress</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Team</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Issues</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProjects.map((project) => {
            const issues = projectIssues[project.id] || [];
            const members = projectMembers[project.id] || [];
            
            return (
              <TableRow key={project.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" color="#111827">
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="#6B7280">
                      {project.description || 'No description'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status?.replace('_', ' ').toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[project.status] || '#6B7280',
                      color: 'white',
                      fontWeight: '600',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.priority?.toUpperCase()}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: priorityColors[project.priority] || '#6B7280',
                      color: priorityColors[project.priority] || '#6B7280',
                      fontWeight: '500',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1} minWidth="120px">
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage(project)}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#F3F4F6',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#10B981',
                        },
                      }}
                    />
                    <Typography variant="caption" fontWeight="600">
                      {getProgressPercentage(project)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3}>
                    {members.map((member, index) => (
                      <Tooltip key={index} title={member.user?.fullName || 'Unknown User'}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                          {member.user?.firstName?.charAt(0) || '?'}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {issues.length}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, project)}
                    sx={{ color: '#6B7280' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="700" color="#111827" mb={0.5}>
            Projects
          </Typography>
          <Typography variant="body1" color="#6B7280">
            Manage and track your projects efficiently
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB'
              },
              textTransform: 'none',
              fontWeight: '500',
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            New Project
          </Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          size="small"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#F9FAFB',
              '&:hover': {
                backgroundColor: '#F3F4F6',
              },
            },
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="on_hold">On Hold</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Tooltip title="Grid View">
            <IconButton
              onClick={() => setViewMode('grid')}
              sx={{
                color: viewMode === 'grid' ? '#4F46E5' : '#6B7280',
                backgroundColor: viewMode === 'grid' ? '#EEF2FF' : 'transparent',
              }}
            >
              <GridViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton
              onClick={() => setViewMode('list')}
              sx={{
                color: viewMode === 'list' ? '#4F46E5' : '#6B7280',
                backgroundColor: viewMode === 'list' ? '#EEF2FF' : 'transparent',
              }}
            >
              <ListViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card sx={{ height: 300 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Projects Display */}
          {filteredProjects.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
              sx={{
                border: '2px dashed #E5E7EB',
                borderRadius: 2,
                backgroundColor: '#FAFBFC',
              }}
            >
              <FolderIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
              <Typography variant="h6" color="#374151" fontWeight="600" mb={1}>
                {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
              </Typography>
              <Typography variant="body2" color="#6B7280" mb={3} textAlign="center" maxWidth={400}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first project to get started with issue tracking and team collaboration'
                }
              </Typography>
              {(!searchTerm && statusFilter === 'all') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    backgroundColor: '#4F46E5',
                    '&:hover': { backgroundColor: '#4338CA' },
                    textTransform: 'none',
                                        fontWeight: '600',
                  }}
                >
                  Create Your First Project
                </Button>
              )}
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <ProjectCard project={project} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <ProjectListView />
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            minWidth: 180,
          }
        }}
      >
        <MenuItem 
          onClick={() => { 
            navigate(`/project/${selectedProject?.id}/boards`); 
            handleCloseMenu(); 
          }}
          sx={{ '&:hover': { backgroundColor: '#F3F4F6' } }}
        >
          <DashboardIcon sx={{ mr: 1.5, fontSize: 18, color: '#6B7280' }} />
          Open Boards
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleViewProject(selectedProject?.id); 
            handleCloseMenu(); 
          }}
          sx={{ '&:hover': { backgroundColor: '#F3F4F6' } }}
        >
          <ViewIcon sx={{ mr: 1.5, fontSize: 18, color: '#6B7280' }} />
          View Details
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            navigate(`/project/${selectedProject?.id}/members`); 
            handleCloseMenu(); 
          }}
          sx={{ '&:hover': { backgroundColor: '#F3F4F6' } }}
        >
          <PeopleIcon sx={{ mr: 1.5, fontSize: 18, color: '#6B7280' }} />
          Manage Members
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleOpenDialog(selectedProject); 
            handleCloseMenu(); 
          }}
          sx={{ '&:hover': { backgroundColor: '#F3F4F6' } }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 18, color: '#6B7280' }} />
          Edit Project
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            navigate(`/project/${selectedProject?.id}/settings`); 
            handleCloseMenu(); 
          }}
          sx={{ '&:hover': { backgroundColor: '#F3F4F6' } }}
        >
          <SettingsIcon sx={{ mr: 1.5, fontSize: 18, color: '#6B7280' }} />
          Project Settings
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteProject(selectedProject?.id)}
          sx={{ 
            color: '#EF4444',
            '&:hover': { backgroundColor: '#FEF2F2' }
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete Project
        </MenuItem>
      </Menu>

      {/* Add/Edit Project Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={submitting}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: '700', 
          fontSize: '1.25rem', 
          color: '#111827',
          borderBottom: '1px solid #F3F4F6',
          pb: 2
        }}>
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              disabled={submitting}
              required
              sx={{
                '& .MuiInputLabel-root': {
                  fontWeight: '500',
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
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              disabled={submitting}
              placeholder="Describe your project goals, scope, and key objectives..."
              sx={{
                '& .MuiInputLabel-root': {
                  fontWeight: '500',
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
              <FormControl fullWidth margin="normal" disabled={submitting}>
                <InputLabel sx={{ fontWeight: '500' }}>Status</InputLabel>
                <Select
                  value={formData.status}
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
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: statusColors.planning,
                        }}
                      />
                      Planning
                    </Box>
                  </MenuItem>
                  <MenuItem value="active">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: statusColors.active,
                        }}
                      />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="completed">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: statusColors.completed,
                        }}
                      />
                      Completed
                    </Box>
                  </MenuItem>
                  <MenuItem value="on_hold">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: statusColors.on_hold,
                        }}
                      />
                      On Hold
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" disabled={submitting}>
                <InputLabel sx={{ fontWeight: '500' }}>Priority</InputLabel>
                <Select
                  value={formData.priority}
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
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.low,
                        }}
                      />
                      Low
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.medium,
                        }}
                      />
                      Medium
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.high,
                        }}
                      />
                      High
                    </Box>
                  </MenuItem>
                  <MenuItem value="critical">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: priorityColors.critical,
                        }}
                      />
                      Critical
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #F3F4F6' }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={submitting}
            sx={{ 
              textTransform: 'none',
              color: '#6B7280',
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
            disabled={!formData.name.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: '600',
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '&:disabled': {
                backgroundColor: '#D1D5DB'
              }
            }}
          >
            {submitting ? 'Processing...' : (editingProject ? 'Update Project' : 'Create Project')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              fontWeight: '500'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Projects;
