// src/components/SprintDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  BugReport as BugIcon,
  Assignment as TaskIcon,
  NewReleases as StoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  PlayArrow as PlayArrowIcon, // Bu import eksikti
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Geri kalan kod aynı kalacak...
const SprintDetailModal = ({ open, onClose, sprint, sprintStats, issues = [] }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const issueTypes = {
    bug: { icon: <BugIcon sx={{ fontSize: 16 }} />, color: '#DE350B' },
    task: { icon: <TaskIcon sx={{ fontSize: 16 }} />, color: '#0052CC' },
    story: { icon: <StoryIcon sx={{ fontSize: 16 }} />, color: '#36B37E' },
  };

  const statusColors = {
    todo: { bg: '#F4F5F7', text: '#5E6C84' },
    in_progress: { bg: '#FFF4E6', text: '#974F00' },
    done: { bg: '#E3FCEF', text: '#006644' },
  };

  // Mock burndown data - gerçek uygulamada API'den gelir
  const burndownData = [
    { day: 'Day 1', remaining: sprintStats?.totalStoryPoints || 0, ideal: sprintStats?.totalStoryPoints || 0 },
    { day: 'Day 3', remaining: (sprintStats?.totalStoryPoints || 0) * 0.9, ideal: (sprintStats?.totalStoryPoints || 0) * 0.85 },
    { day: 'Day 5', remaining: (sprintStats?.totalStoryPoints || 0) * 0.8, ideal: (sprintStats?.totalStoryPoints || 0) * 0.7 },
    { day: 'Day 7', remaining: (sprintStats?.totalStoryPoints || 0) * 0.6, ideal: (sprintStats?.totalStoryPoints || 0) * 0.55 },
    { day: 'Day 9', remaining: (sprintStats?.totalStoryPoints || 0) * 0.4, ideal: (sprintStats?.totalStoryPoints || 0) * 0.4 },
    { day: 'Day 11', remaining: (sprintStats?.totalStoryPoints || 0) * 0.3, ideal: (sprintStats?.totalStoryPoints || 0) * 0.25 },
    { day: 'Today', remaining: (sprintStats?.totalStoryPoints || 0) - (sprintStats?.completedStoryPoints || 0), ideal: (sprintStats?.totalStoryPoints || 0) * 0.1 },
  ];

  const dailyProgressData = [
    { day: 'Mon', completed: 5, added: 2 },
    { day: 'Tue', completed: 8, added: 1 },
    { day: 'Wed', completed: 3, added: 4 },
    { day: 'Thu', completed: 12, added: 0 },
    { day: 'Fri', completed: 7, added: 2 },
    { day: 'Sat', completed: 4, added: 1 },
    { day: 'Sun', completed: 2, added: 0 },
  ];

  if (!sprint) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Overview Tab
  const OverviewTab = () => (
    <Grid container spacing={3}>
      {/* Sprint Info */}
      <Grid item xs={12} md={8}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Sprint Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                    SPRINT GOAL
                  </Typography>
                  <Typography variant="body2">
                    {sprint.goal || 'No goal set for this sprint'}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                    DURATION
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                    STATUS
                  </Typography>
                  <Chip
                    label={sprint.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: sprint.status === 'active' ? '#E3FCEF' : sprint.status === 'completed' ? '#DEEBFF' : '#F4F5F7',
                      color: sprint.status === 'active' ? '#006644' : sprint.status === 'completed' ? '#0052CC' : '#5E6C84',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                {sprint.status === 'active' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                      TIME REMAINING
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {getDaysRemaining(sprint.endDate)} days left
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Sprint Burndown
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
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
                  <Tooltip 
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
                    dataKey="remaining" 
                    stroke="#0052CC" 
                    strokeWidth={3}
                    name="Actual Remaining"
                    dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Sidebar */}
      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          {/* Progress Card */}
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Sprint Progress
              </Typography>
              
              <Box textAlign="center" mb={3}>
                <Typography variant="h2" fontWeight={700} color="#172B4D">
                  {sprintStats?.progress || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={sprintStats?.progress || 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#F4F5F7',
                  mb: 3,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#36B37E',
                    borderRadius: 4,
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={700} color="#36B37E">
                      {sprintStats?.completedIssues || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={700} color="#5E6C84">
                      {sprintStats?.totalIssues || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Issues
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Story Points Card */}
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Story Points
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#36B37E">
                  {sprintStats?.completedStoryPoints || 0}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#FFAB00">
                  {(sprintStats?.totalStoryPoints || 0) - (sprintStats?.completedStoryPoints || 0)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#172B4D">
                  {sprintStats?.totalStoryPoints || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Issue Breakdown */}
          <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Issue Breakdown
              </Typography>
              
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#36B37E' }} />
                    <Typography variant="body2">Done</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {sprintStats?.completedIssues || 0}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#FFAB00' }} />
                    <Typography variant="body2">In Progress</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {sprintStats?.inProgressIssues || 0}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon sx={{ fontSize: 16, color: '#5E6C84' }} />
                    <Typography variant="body2">To Do</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {sprintStats?.todoIssues || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );

  // Issues Tab
  const IssuesTab = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Issue</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Story Points</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {issueTypes[issue.type]?.icon || <TaskIcon sx={{ fontSize: 16 }} />}
                  <Typography variant="body2" fontWeight={500}>
                    {issue.title}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={issue.type || 'Task'}
                  sx={{ 
                    fontSize: '0.7rem', 
                    height: 20,
                    backgroundColor: issueTypes[issue.type]?.color || '#5E6C84',
                    color: 'white'
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={issue.status || 'To Do'}
                  sx={{
                    fontSize: '0.7rem',
                    height: 20,
                    backgroundColor: statusColors[issue.status]?.bg || '#F4F5F7',
                    color: statusColors[issue.status]?.text || '#5E6C84',
                  }}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {issue.assignee?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    {issue.assignee || 'Unassigned'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {issue.storyPoints || 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={issue.priority || 'Medium'}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </TableCell>
            </TableRow>
          ))}
          {issues.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No issues in this sprint
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Daily Progress
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProgressData}>
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E4E6EA',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="completed" fill="#36B37E" name="Completed" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="added" fill="#FFAB00" name="Added" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ border: '1px solid #E4E6EA', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Sprint Metrics
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Velocity
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#0052CC">
                  {sprintStats?.completedStoryPoints || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Story Points Completed
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Completion Rate
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#36B37E">
                  {sprintStats?.totalIssues > 0 ? Math.round((sprintStats.completedIssues / sprintStats.totalIssues) * 100) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Issues Completed
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Average Issue Size
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#FFAB00">
                  {sprintStats?.totalIssues > 0 ? Math.round((sprintStats.totalStoryPoints / sprintStats.totalIssues) * 10) / 10 : 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Story Points per Issue
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid #E4E6EA',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #F4F5F7',
        pb: 2
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            {sprint.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sprint.description}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#5E6C84' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label={`Issues (${issues.length})`} />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, minHeight: 500 }}>
        {currentTab === 0 && <OverviewTab />}
        {currentTab === 1 && <IssuesTab />}
        {currentTab === 2 && <AnalyticsTab />}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #F4F5F7' }}>
        <Button 
          onClick={onClose}
          sx={{ 
            textTransform: 'none',
            color: '#5E6C84',
            '&:hover': { backgroundColor: '#F4F5F7' }
          }}
        >
          Close
        </Button>
        {sprint.status === 'planned' && (
          <Button 
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{ 
              textTransform: 'none',
              backgroundColor: '#36B37E',
              '&:hover': { backgroundColor: '#2A9D8F' }
            }}
          >
            Start Sprint
          </Button>
        )}
        {sprint.status === 'active' && (
          <Button 
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              textTransform: 'none',
              backgroundColor: '#0052CC',
              '&:hover': { backgroundColor: '#0065FF' }
            }}
          >
            Complete Sprint
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SprintDetailModal;
