// src/components/Sprints.jsx
import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  PlayArrow as PlayArrowIcon, // Bu satırı ekleyin
  Stop as EndIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { sprintService } from '../services/sprintService';
import { projectService, issueService } from '../services/api';
import SprintDetailModal from '../components/SprintDetailModal';

const Sprints = () => {
  // State management
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
const [selectedSprintForDetail, setSelectedSprintForDetail] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    projectId: '',
    startDate: '',
    endDate: '',
    status: 'planned',
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sprint stats
  const [sprintStats, setSprintStats] = useState({});

  // Constants
  const statusColors = {
    planned: { bg: '#F4F5F7', text: '#5E6C84', main: '#5E6C84' },
    active: { bg: '#E3FCEF', text: '#006644', main: '#36B37E' },
    completed: { bg: '#DEEBFF', text: '#0052CC', main: '#0052CC' },
    cancelled: { bg: '#FFEBE6', text: '#DE350B', main: '#DE350B' },
  };

  const pieColors = ['#0052CC', '#36B37E', '#FFAB00', '#DE350B'];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load sprint stats when sprints change
  useEffect(() => {
    if (sprints.length > 0) {
      loadSprintStats();
    }
  }, [sprints]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sprintsData, projectsData, issuesData] = await Promise.all([
        sprintService.getAll(),
        projectService.getAll(),
        issueService.getAll()
      ]);

      setSprints(sprintsData || []);
      setProjects(projectsData.data || []);
      setIssues(issuesData.data || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load sprint data');
    } finally {
      setLoading(false);
    }
  };

  const loadSprintStats = async () => {
    try {
      const statsPromises = sprints.map(async (sprint) => {
        const stats = await sprintService.getSprintStats(sprint.id);
        return { [sprint.id]: stats };
      });

      const statsResults = await Promise.all(statsPromises);
      const combinedStats = statsResults.reduce((acc, stat) => ({ ...acc, ...stat }), {});
      setSprintStats(combinedStats);
    } catch (err) {
      console.error('Error loading sprint stats:', err);
    }
  };

  const handleSprintClick = (sprint) => {
    setSelectedSprintForDetail(sprint);
    setDetailModalOpen(true);
  };

  // Event handlers
  // Sprints.jsx içinde handleOpenDialog fonksiyonunu güncelleyin
  const handleOpenDialog = (sprint = null) => {
    if (sprint) {
      setEditingSprint(sprint);
      setFormData({
        name: sprint.name || '',
        description: sprint.description || '',
        goal: sprint.goal || '',
        projectId: sprint.projectId?.toString() || '',
        startDate: sprint.startDate ? sprint.startDate.split('T')[0] : '',
        endDate: sprint.endDate ? sprint.endDate.split('T')[0] : '',
        status: sprint.status || 'planned',
      });
    } else {
      setEditingSprint(null);
      
      // Default değerler
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 hafta sonra
      
      setFormData({
        name: '',
        description: '',
        goal: '',
        projectId: projects.length > 0 ? projects[0].projectId?.toString() : '0',
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        status: 'planned',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSprint(null);
    setFormData({
      name: '',
      description: '',
      goal: '',
      projectId: '',
      startDate: '',
      endDate: '',
      status: 'planned',
    });
  };

  // Sprints.jsx içinde handleSaveSprint fonksiyonunu güncelleyin
  const handleSaveSprint = async () => {
    // Form validasyonu
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Sprint name is required',
        severity: 'error'
      });
      return;
    }

    if (!formData.projectId) {
      setSnackbar({
        open: true,
        message: 'Please select a project',
        severity: 'error'
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setSnackbar({
        open: true,
        message: 'Start date and end date are required',
        severity: 'error'
      });
      return;
    }

    // Tarih validasyonu
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate >= endDate) {
      setSnackbar({
        open: true,
        message: 'End date must be after start date',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('Form data being sent:', formData);

      if (editingSprint) {
        const updatedSprint = await sprintService.update(editingSprint.id, formData);
        setSprints(sprints.map(s => s.id === editingSprint.id ? updatedSprint : s));
        setSnackbar({
          open: true,
          message: 'Sprint updated successfully',
          severity: 'success'
        });
      } else {
        const newSprint = await sprintService.create(formData);
        setSprints([...sprints, newSprint]);
        setSnackbar({
          open: true,
          message: 'Sprint created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving sprint:', err);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Failed to save sprint';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          // Model validation errors
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join(', ');
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm('Are you sure you want to delete this sprint?')) return;

    setSubmitting(true);
    try {
      await sprintService.delete(sprintId);
      setSprints(sprints.filter(s => s.id !== sprintId));
      setSnackbar({
        open: true,
        message: 'Sprint deleted successfully',
        severity: 'success'
      });
      handleCloseMenu();
    } catch (err) {
      console.error('Error deleting sprint:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete sprint',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuClick = (event, sprint) => {
    setAnchorEl(event.currentTarget);
    setSelectedSprint(sprint);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedSprint(null);
  };

  // Utility functions
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.projectId?.toString() === projectId?.toString());
    return project ? project.name : 'Unknown Project';
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Chart data preparation
  const getVelocityChartData = () => {
    return sprints
      .filter(sprint => sprint.status === 'completed')
      .slice(-6)
      .map(sprint => {
        const stats = sprintStats[sprint.id] || {};
        return {
          name: sprint.name.substring(0, 10) + '...',
          completed: stats.completedStoryPoints || 0,
          total: stats.totalStoryPoints || 0,
        };
      });
  };

  const getBurndownChartData = () => {
    const activeSprint = sprints.find(s => s.status === 'active');
    if (!activeSprint) return [];

    // Mock burndown data - gerçek uygulamada günlük progress verisi kullanılır
    const stats = sprintStats[activeSprint.id] || {};
    const totalPoints = stats.totalStoryPoints || 0;
    const completedPoints = stats.completedStoryPoints || 0;
    const remainingPoints = totalPoints - completedPoints;

    return [
      { day: 'Day 1', ideal: totalPoints, actual: totalPoints },
      { day: 'Day 5', ideal: totalPoints * 0.8, actual: totalPoints * 0.9 },
      { day: 'Day 10', ideal: totalPoints * 0.6, actual: remainingPoints },
      { day: 'Day 15', ideal: totalPoints * 0.4, actual: remainingPoints * 0.8 },
      { day: 'Day 20', ideal: totalPoints * 0.2, actual: remainingPoints * 0.6 },
      { day: 'Today', ideal: 0, actual: remainingPoints },
    ];
  };

  const getStatusDistributionData = () => {
    const statusCounts = sprints.reduce((acc, sprint) => {
      acc[sprint.status] = (acc[sprint.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: statusColors[status]?.main || '#5E6C84'
    }));
  };

  // Sprint Board Component
  const SprintBoard = () => (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: '#E3FCEF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FlagIcon sx={{ color: '#006644', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#172B4D">
                    {sprints.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sprints
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: '#E3FCEF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PlayArrowIcon sx={{ color: '#006644', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#172B4D">
                    {sprints.filter(s => s.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Sprints
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: '#DEEBFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ color: '#0052CC', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#172B4D">
                    {sprints.filter(s => s.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Sprints
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: '#F4F5F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ScheduleIcon sx={{ color: '#5E6C84', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#172B4D">
                    {Object.values(sprintStats).reduce((sum, stats) => sum + (stats.totalIssues || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Issues
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sprint Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {sprints.map((sprint) => {
          const stats = sprintStats[sprint.id] || {};
          return (
            <Card 
              key={sprint.id}
              onClick={() => handleSprintClick(sprint)}
              sx={{ 
                width: 340,
                height: 420,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                border: '1px solid #E4E6EA',
                cursor: 'pointer', // Ekleyin
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {/* Header */}
              <Box sx={{ 
                p: 2.5, 
                borderBottom: '1px solid #E4E6EA',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                minHeight: 100
              }}>
                <Box sx={{ flex: 1, mr: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600}
                    sx={{ 
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {sprint.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={sprint.status.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[sprint.status].bg,
                        color: statusColors[sprint.status].text,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {getProjectName(sprint.projectId)}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleMenuClick(e, sprint)}
                  sx={{ flexShrink: 0 }}
                >
                  <MoreVertIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Content */}
              <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                {/* Goal */}
                <Box sx={{ mb: 2, minHeight: 60 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                    SPRINT GOAL
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {sprint.goal || 'No goal set for this sprint'}
                  </Typography>
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                  </Typography>
                  {sprint.status === 'active' && (
                    <Chip
                      label={`${getDaysRemaining(sprint.endDate)}d left`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20,
                        ml: 'auto'
                      }}
                    />
                  )}
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                      {stats.progress || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.progress || 0}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#F4F5F7',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: statusColors[sprint.status]?.main || '#5E6C84',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                {/* Stats */}
                <Box sx={{ mt: 'auto' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={700} color="#172B4D">
                          {stats.completedIssues || 0}/{stats.totalIssues || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Issues
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={700} color="#172B4D">
                          {stats.completedStoryPoints || 0}/{stats.totalStoryPoints || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Story Points
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Sprint Card */}
        <Card 
          sx={{ 
            width: 340,
            height: 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            border: '2px dashed #E4E6EA',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#0052CC',
              backgroundColor: '#F4F5F7'
            }
          }}
          onClick={() => handleOpenDialog()}
        >
          <Box textAlign="center">
            <AddIcon sx={{ fontSize: 48, color: '#5E6C84', mb: 2 }} />
            <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
              Create New Sprint
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan your next iteration
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );

  // Sprint Reports Component
  const SprintReports = () => (
    <Grid container spacing={3}>
      {/* Velocity Chart */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Team Velocity
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getVelocityChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                                        axisLine={{ stroke: '#E4E6EA' }}
                    tickLine={{ stroke: '#E4E6EA' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E4E6EA' }}
                    tickLine={{ stroke: '#E4E6EA' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E4E6EA',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="completed" fill="#36B37E" name="Completed Points" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#E4E6EA" name="Total Points" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Sprint Status Distribution */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Sprint Status Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getStatusDistributionData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getStatusDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E4E6EA',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              {getStatusDistributionData().map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: entry.color, 
                      borderRadius: '50%', 
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {entry.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {entry.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Burndown Chart */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Sprint Burndown Chart
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getBurndownChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E4E6EA' }}
                    tickLine={{ stroke: '#E4E6EA' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E4E6EA' }}
                    tickLine={{ stroke: '#E4E6EA' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E4E6EA',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ideal" 
                    stroke="#E4E6EA" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Ideal Burndown"
                    dot={{ fill: '#E4E6EA', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#0052CC" 
                    strokeWidth={3}
                    name="Actual Burndown"
                    dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Sprint Performance Metrics */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Performance Metrics
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Average Sprint Velocity
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#172B4D">
                  {Math.round(
                    getVelocityChartData().reduce((sum, sprint) => sum + sprint.completed, 0) / 
                    Math.max(getVelocityChartData().length, 1)
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Story Points per Sprint
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Sprint Success Rate
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#36B37E">
                  {sprints.length > 0 ? Math.round((sprints.filter(s => s.status === 'completed').length / sprints.length) * 100) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed Sprints
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Average Sprint Duration
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#0052CC">
                  {Math.round(
                    sprints.reduce((sum, sprint) => {
                      const start = new Date(sprint.startDate);
                      const end = new Date(sprint.endDate);
                      return sum + (end - start) / (1000 * 60 * 60 * 24);
                    }, 0) / Math.max(sprints.length, 1)
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Days per Sprint
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Sprint Activity */}
      <Grid item xs={12}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Recent Sprint Activity
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Sprint Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Progress</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Issues</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Story Points</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>End Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sprints.slice(0, 10).map((sprint) => {
                    const stats = sprintStats[sprint.id] || {};
                    return (
                      <TableRow key={sprint.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {sprint.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getProjectName(sprint.projectId)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sprint.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: statusColors[sprint.status].bg,
                              color: statusColors[sprint.status].text,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={stats.progress || 0}
                              sx={{
                                width: 60,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: '#F4F5F7',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: statusColors[sprint.status]?.main || '#5E6C84',
                                  borderRadius: 2,
                                },
                              }}
                            />
                            <Typography variant="caption" fontWeight={600}>
                              {stats.progress || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {stats.completedIssues || 0}/{stats.totalIssues || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {stats.completedStoryPoints || 0}/{stats.totalStoryPoints || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(sprint.endDate)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sprints.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No sprints found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Sprint Planning Component
  const SprintPlanning = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Backlog Items
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Drag and drop issues from the backlog to plan your next sprint.
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Issue</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Story Points</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.filter(issue => !issue.sprintId).slice(0, 10).map((issue) => (
                    <TableRow key={issue.issueId} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {issue.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={issue.type || 'Task'}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={issue.priority || 'Medium'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {issue.storyPoints || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Add to Sprint
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Sprint Planning Guide
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ p: 2, backgroundColor: '#E3FCEF', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} color="#006644" mb={1}>
                  Step 1: Define Sprint Goal
                </Typography>
                <Typography variant="body2" color="#006644" fontSize="0.85rem">
                  Set a clear, achievable goal for the sprint that aligns with project objectives.
                </Typography>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#DEEBFF', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} color="#0052CC" mb={1}>
                  Step 2: Select Backlog Items
                </Typography>
                <Typography variant="body2" color="#0052CC" fontSize="0.85rem">
                  Choose user stories and tasks that fit within the team's capacity.
                </Typography>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#FFF4E6', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} color="#974F00" mb={1}>
                  Step 3: Estimate Capacity
                </Typography>
                <Typography variant="body2" color="#974F00" fontSize="0.85rem">
                  Consider team availability and historical velocity when planning.
                </Typography>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#F4F5F7', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} color="#5E6C84" mb={1}>
                  Step 4: Create Sprint
                </Typography>
                <Typography variant="body2" color="#5E6C84" fontSize="0.85rem">
                  Finalize the sprint with selected items and start the iteration.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                mt: 3,
                backgroundColor: '#0052CC',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#0065FF' }
              }}
            >
              Start Sprint Planning
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={loadData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#FAFBFC', p: 3 }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto', width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#172B4D', fontSize: '1.75rem', mb: 0.5 }}>
              Sprints
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan, track, and manage your development iterations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => handleOpenDialog()}
            disabled={submitting}
            sx={{
              backgroundColor: '#0052CC',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,82,204,0.2)',
              '&:hover': { 
                backgroundColor: '#0065FF',
                boxShadow: '0 4px 8px rgba(0,82,204,0.3)'
              },
            }}
          >
            Create Sprint
          </Button>
        </Box>

        {/* View Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                minHeight: 48,
                px: 3,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0052CC',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              icon={<TimelineIcon sx={{ fontSize: 18 }} />} 
              label="Active Sprints" 
              iconPosition="start" 
            />
            <Tab 
              icon={<CalendarIcon sx={{ fontSize: 18 }} />} 
              label="Sprint Planning" 
              iconPosition="start" 
            />
            <Tab 
              icon={<ReportIcon sx={{ fontSize: 18 }} />} 
              label="Reports & Analytics" 
              iconPosition="start" 
            />
          </Tabs>
        </Box>

        {/* Content */}
        {currentTab === 0 && <SprintBoard />}
        {currentTab === 1 && <SprintPlanning />}
        {currentTab === 2 && <SprintReports />}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: '1px solid #E4E6EA',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: 160
            }
          }}
        >
          <MenuItem 
            onClick={() => { handleOpenDialog(selectedSprint); handleCloseMenu(); }}
            sx={{ fontSize: '0.875rem', py: 1.5, px: 2 }}
          >
            <EditIcon sx={{ mr: 1.5, fontSize: 16 }} />
            Edit Sprint
          </MenuItem>
          
          {selectedSprint?.status === 'planned' && (
            <MenuItem 
              onClick={handleCloseMenu} 
              sx={{ fontSize: '0.875rem', py: 1.5, px: 2 }}
            >
              <StartIcon sx={{ mr: 1.5, fontSize: 16 }} />
              Start Sprint
            </MenuItem>
          )}
          
          {selectedSprint?.status === 'active' && (
            <MenuItem 
              onClick={handleCloseMenu} 
              sx={{ fontSize: '0.875rem', py: 1.5, px: 2 }}
            >
              <EndIcon sx={{ mr: 1.5, fontSize: 16 }} />
              Complete Sprint
            </MenuItem>
          )}
          
          <Divider />
          
          <MenuItem 
            onClick={() => handleDeleteSprint(selectedSprint?.id)}
            sx={{ 
              color: '#DE350B', 
              fontSize: '0.875rem', 
              py: 1.5, 
              px: 2,
              '&:hover': { backgroundColor: '#FFEBE6' }
            }}
          >
            <DeleteIcon sx={{ mr: 1.5, fontSize: 16 }} />
            Delete Sprint
          </MenuItem>
        </Menu>

        {/* Add/Edit Sprint Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          disableEscapeKeyDown={submitting}
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid #E4E6EA',
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            pb: 1,
            borderBottom: '1px solid #F4F5F7'
          }}>
            {editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Sprint Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                disabled={submitting}
                required
                sx={{ 
                  '& .MuiInputBase-input': { fontSize: '0.9rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.9rem' }
                }}
              />
              
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                disabled={submitting}
                sx={{ 
                  '& .MuiInputBase-input': { fontSize: '0.9rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.9rem' }
                }}
              />
              
              <TextField
                fullWidth
                label="Sprint Goal"
                multiline
                rows={2}
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                margin="normal"
                disabled={submitting}
                placeholder="What do you want to achieve in this sprint?"
                sx={{ 
                  '& .MuiInputBase-input': { fontSize: '0.9rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.9rem' }
                }}
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={submitting}>
                    <InputLabel sx={{ fontSize: '0.9rem' }}>Project</InputLabel>
                    <Select
                      value={formData.projectId}
                      label="Project"
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      sx={{ '& .MuiSelect-select': { fontSize: '0.9rem' } }}
                    >
                      {projects.map((project) => (
                        <MenuItem 
                          key={project.projectId} 
                          value={project.projectId.toString()} 
                          sx={{ fontSize: '0.9rem' }}
                        >
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={submitting}
                    sx={{ 
                      '& .MuiInputBase-input': { fontSize: '0.9rem' },
                      '& .MuiInputLabel-root': { fontSize: '0.9rem' }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={submitting}
                    sx={{ 
                      '& .MuiInputBase-input': { fontSize: '0.9rem' },
                      '& .MuiInputLabel-root': { fontSize: '0.9rem' }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #F4F5F7' }}>
            <Button 
              onClick={handleCloseDialog}
              disabled={submitting}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem',
                color: '#5E6C84',
                '&:hover': { backgroundColor: '#F4F5F7' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSprint} 
              variant="contained"
              disabled={!formData.name.trim() || submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem',
                fontWeight: 600,
                backgroundColor: '#0052CC',
                px: 3,
                '&:hover': { backgroundColor: '#0065FF' },
                '&:disabled': { backgroundColor: '#F4F5F7' }
              }}
            >
              {submitting ? 'Saving...' : (editingSprint ? 'Update Sprint' : 'Create Sprint')}
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
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '& .MuiAlert-message': {
                fontWeight: 500,
                fontSize: '0.875rem'
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      <SprintDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        sprint={selectedSprintForDetail}
        sprintStats={selectedSprintForDetail ? sprintStats[selectedSprintForDetail.id] : {}}
        issues={issues.filter(issue => 
          parseInt(issue.sprintId) === parseInt(selectedSprintForDetail?.id)
        )}
      />
    </Box>
  );
};

export default Sprints;
