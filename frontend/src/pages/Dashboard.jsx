// src/components/Dashboard.jsx (optimized version)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Assignment as ProjectIcon,
  BugReport as IssueIcon,
  Timeline as SprintIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  BugReport,
  Assignment,
  Star,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 8;

  // State
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    issues: [],
    sprints: [],
    users: [],
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await dashboardService.getDashboardData();
      
      // Hata kontrolü
      const hasErrors = Object.values(data.errors).some(error => error !== null);
      if (hasErrors) {
        console.warn('Some data failed to load:', data.errors);
      }

      setDashboardData(data);
      
      // İstatistikleri hesapla
      const calculatedStats = dashboardService.calculateStats(
        data.projects,
        data.issues,
        data.sprints
      );
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(dashboardData.issues.length / issuesPerPage);
  const startIndex = (currentPage - 1) * issuesPerPage;
  const currentIssues = dashboardData.issues.slice(startIndex, startIndex + issuesPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Helper functions
  const getProjectProgress = (project) => {
    if (project.issues && project.completedIssues && project.issues > 0) {
      return Math.round((project.completedIssues / project.issues) * 100);
    }
    return 0;
  };

  const getStatusColor = (status, statusId) => {
    let normalizedStatus = status;
    if (statusId) {
      const statusMap = { 1: 'todo', 2: 'in_progress', 3: 'in_progress', 4: 'done' };
      normalizedStatus = statusMap[statusId] || 'todo';
    }

    const colors = {
      todo: { bg: '#F4F5F7', color: '#42526E' },
      in_progress: { bg: '#FFF0B3', color: '#974F0C' },
      done: { bg: '#E3FCEF', color: '#006644' },
    };
    return colors[normalizedStatus] || { bg: '#F4F5F7', color: '#42526E' };
  };

  const getPriorityColor = (priority, priorityId) => {
    let normalizedPriority = priority;
    if (priorityId) {
      const priorityMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };
      normalizedPriority = priorityMap[priorityId] || 'medium';
    }

    const colors = {
      low: { bg: '#E3FCEF', color: '#006644' },
      medium: { bg: '#FFF4E6', color: '#974F0C' },
      high: { bg: '#FFEBE6', color: '#BF2600' },
      critical: { bg: '#FFEBE6', color: '#DE350B' },
    };
    return colors[normalizedPriority] || { bg: '#E3FCEF', color: '#006644' };
  };

  const getTypeIcon = (type, typeId) => {
    let normalizedType = type;
    if (typeId) {
      const typeMap = { 1: 'task', 2: 'bug', 3: 'story' };
      normalizedType = typeMap[typeId] || 'task';
    }

    const icons = {
      bug: <BugReport sx={{ color: '#FF5630', fontSize: 16 }} />,
      task: <Assignment sx={{ color: '#0052CC', fontSize: 16 }} />,
      story: <Star sx={{ color: '#36B37E', fontSize: 16 }} />,
    };
    return icons[normalizedType] || <Assignment sx={{ fontSize: 16 }} />;
  };

  const getAssigneeName = (issue) => {
    if (issue.assigneeName) return issue.assigneeName;
    if (issue.assigneeId) {
      const user = dashboardData.users.find(u => u.id === issue.assigneeId.toString());
      return user ? user.fullName : 'Unknown User';
    }
    return 'Unassigned';
  };

  const getProjectName = (issue) => {
    if (issue.projectName) return issue.projectName;
    if (issue.projectId) {
      const project = dashboardData.projects.find(p => p.id === issue.projectId.toString());
      return project ? project.name : 'Unknown Project';
    }
    return 'No Project';
  };

  const formatStatus = (status, statusId) => {
    let displayStatus = status;
    if (statusId) {
      const statusMap = { 1: 'TO DO', 2: 'IN PROGRESS', 3: 'IN PROGRESS', 4: 'DONE' };
      displayStatus = statusMap[statusId] || 'TO DO';
    }
    return displayStatus?.replace('_', ' ').toUpperCase() || 'TO DO';
  };

  const formatPriority = (priority, priorityId) => {
    let displayPriority = priority;
    if (priorityId) {
      const priorityMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };
      displayPriority = priorityMap[priorityId] || 'medium';
    }
    return displayPriority?.toUpperCase() || 'MEDIUM';
  };

  // Stats cards configuration
  const statsCards = stats ? [
    {
      title: 'Total Projects',
      value: stats.projects.total,
      subtitle: `${stats.projects.active} active • ${stats.projects.completed} completed`,
      icon: <ProjectIcon sx={{ fontSize: 28 }} />,
      color: '#0052CC',
      bgColor: '#E3F2FD',
    },
    {
      title: 'Total Issues',
      value: stats.issues.total,
      subtitle: `${stats.issues.done} completed • ${stats.issues.inProgress} in progress`,
      icon: <IssueIcon sx={{ fontSize: 28 }} />,
      color: '#FF5630',
      bgColor: '#FFEBE6',
    },
    {
      title: 'Active Sprints',
      value: stats.sprints.active,
      subtitle: `${stats.sprints.planned} planned • ${stats.sprints.completed} completed`,
      icon: <SprintIcon sx={{ fontSize: 28 }} />,
      color: '#36B37E',
      bgColor: '#E3FCEF',
    },
    {
      title: 'High Priority',
      value: stats.issues.highPriority,
      subtitle: 'Needs immediate attention',
      icon: <WarningIcon sx={{ fontSize: 28 }} />,
      color: '#FF8B00',
      bgColor: '#FFF4E6',
    },
  ] : [];

  // Loading skeleton
  const StatCardSkeleton = () => (
    <Card sx={{ height: '180px', border: '1px solid #DFE1E6', borderRadius: '12px' }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={80} height={60} />
            <Skeleton variant="text" width={120} height={24} />
          </Box>
          <Skeleton variant="circular" width={64} height={64} />
        </Box>
        <Skeleton variant="text" width="80%" height={16} />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 112px)', backgroundColor: '#F0F4F8', pb: 3 }}>
        {/* Header */}
        <Box mb={4} sx={{ backgroundColor: 'white', p: 3, borderBottom: '1px solid #DFE1E6' }}>
          <Typography variant="h4" fontWeight="600" color="#172B4D" mb={1}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="#6B778C" sx={{ fontSize: '15px' }}>
            Loading your dashboard...
          </Typography>
        </Box>

        <Box sx={{ px: 3 }}>
          {/* Loading Statistics Cards */}
          <Grid container spacing={4} mb={4}>
            {[1, 2, 3, 4].map((index) => (
              <Grid item xs={12} sm={6} md={4} lg={6} xl={3} key={index}>
                <StatCardSkeleton />
              </Grid>
            ))}
          </Grid>

          {/* Loading Project Overview */}
          <Paper sx={{ p: 3, mb: 4, backgroundColor: 'white', border: '1px solid #DFE1E6', borderRadius: '8px' }}>
            <Skeleton variant="text" width={200} height={32} mb={3} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '8px' }} />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Loading Recent Issues */}
          <Paper sx={{ p: 3, backgroundColor: 'white', border: '1px solid #DFE1E6', borderRadius: '8px' }}>
            <Skeleton variant="text" width={200} height={32} mb={3} />
            <Box>
              {[1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: '4px' }} />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 112px)', backgroundColor: '#F0F4F8', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => loadDashboardData()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 112px)', backgroundColor: '#F0F4F8', pb: 3 }}>
      {/* Header */}
      <Box mb={4} sx={{ backgroundColor: 'white', p: 3, borderBottom: '1px solid #DFE1E6' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="600" color="#172B4D" mb={1}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="#6B778C" sx={{ fontSize: '15px' }}>
              Welcome back! Here's what's happening with your projects.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ textTransform: 'none' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        {/* Statistics Cards */}
        <Grid container spacing={4} mb={4}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={6} xl={3} key={index}>
              <Card 
                sx={{ 
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  border: '1px solid #DFE1E6',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ width: '100%', p: 4 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" fontWeight="600" color="#172B4D" sx={{ fontSize: '3rem', lineHeight: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="#6B778C" sx={{ fontWeight: 500, fontSize: '16px', mt: 0.5 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        backgroundColor: card.bgColor,
                        borderRadius: '12px',
                        p: 2.5,
                        color: card.color,
                        ml: 2
                      }}
                    >
                      {React.cloneElement(card.icon, { sx: { fontSize: 32 } })}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="#6B778C" sx={{ fontSize: '13px' }}>
                    {card.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Project Overview */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4,
            backgroundColor: 'white',
            border: '1px solid #DFE1E6',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600" color="#172B4D">
              Project Overview
            </Typography>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/projects')}
              sx={{ 
                color: '#0052CC',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: '#E3F2FD' }
              }}
            >
              View All Projects
            </Button>
          </Box>
          
          {dashboardData.projects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="#6B778C" mb={2}>
                No projects found. Create your first project to get started.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/projects')}
              >
                Create Project
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {dashboardData.projects.slice(0, 4).map((project) => (
                <Grid item xs={12} sm={6} lg={3} key={project.id}>
                  <Card 
                    sx={{ 
                      height: '180px',
                      backgroundColor: 'white',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600" color="#172B4D" mb={0.5}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="#6B778C" sx={{ fontSize: '12px' }}>
                            {project.description || 'No description'}
                          </Typography>
                        </Box>
                        
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                          }}
                          sx={{ 
                            color: '#6B778C',
                            '&:hover': { color: '#0052CC', backgroundColor: '#E3F2FD' }
                          }}
                        >
                          <SettingsIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="#0052CC" sx={{ fontSize: '12px', fontWeight: 500, mb: 1 }}>
                          Quick stats
                        </Typography>
                        
                        <Box mb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body2" color="#172B4D" sx={{ fontSize: '12px' }}>
                              Total issues
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="#172B4D" sx={{ fontSize: '12px' }}>
                              {project.issues || 0}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" color="#6B778C" sx={{ fontSize: '12px' }}>
                              Completed
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="#36B37E" sx={{ fontSize: '12px' }}>
                              {project.completedIssues || 0}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" color="#6B778C" sx={{ fontSize: '12px' }}>
                              Progress
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="#172B4D" sx={{ fontSize: '12px' }}>
                              {getProjectProgress(project)}%
                            </Typography>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={getProjectProgress(project)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: '#F4F5F7',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#36B37E',
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Recent Issues */}
        <Paper 
          sx={{ 
            p: 3,
            backgroundColor: 'white',
            border: '1px solid #DFE1E6',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600" color="#172B4D">
              Recent Issues
            </Typography>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/issues')}
              sx={{ 
                color: '#0052CC',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: '#E3F2FD' }
              }}
            >
              View All Issues
            </Button>
          </Box>
          
          {dashboardData.issues.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="#6B778C" mb={2}>
                No issues found. Create your first issue to get started.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/issues')}
              >
                Create Issue
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F4F5F7' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5 }}>
                        Issue
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5 }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5 }}>
                        Priority
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5 }}>
                        Assignee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5 }}>
                        Project
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B778C', fontSize: '12px', py: 1.5, width: 40 }}>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                                    <TableBody>
                    {currentIssues.map((issue) => (
                      <TableRow 
                        key={issue.id}
                        hover
                        sx={{ 
                          '&:hover': { backgroundColor: '#F4F5F7' },
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/issues/${issue.id}`)}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="600" color="#0052CC" sx={{ fontSize: '13px' }}>
                              #{issue.id}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="#172B4D" 
                              sx={{ 
                                fontSize: '13px',
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px'
                              }}
                            >
                              {issue.title || 'Untitled Issue'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getTypeIcon(issue.type, issue.typeId)}
                            <Typography variant="body2" color="#6B778C" sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
                              {issue.type || 'Task'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={formatStatus(issue.status, issue.statusId)}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(issue.status, issue.statusId).bg,
                              color: getStatusColor(issue.status, issue.statusId).color,
                              fontWeight: 600,
                              fontSize: '10px',
                              height: '22px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={formatPriority(issue.priority, issue.priorityId)}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(issue.priority, issue.priorityId).bg,
                              color: getPriorityColor(issue.priority, issue.priorityId).color,
                              fontWeight: 600,
                              fontSize: '10px',
                              height: '22px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: '#0052CC' }}>
                              {getAssigneeName(issue)?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography 
                              variant="body2" 
                              color="#172B4D" 
                              sx={{ 
                                fontSize: '12px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '120px'
                              }}
                            >
                              {getAssigneeName(issue)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2" 
                            color="#6B778C" 
                            sx={{ 
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '150px'
                            }}
                          >
                            {getProjectName(issue)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: '#6B778C',
                              '&:hover': { color: '#0052CC' }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Context menu veya dropdown menu açılabilir
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '14px',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
