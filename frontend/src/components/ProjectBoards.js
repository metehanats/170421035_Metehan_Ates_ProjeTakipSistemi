// src/components/ProjectBoards.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  BugReport as BugIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import { projectService, issueTypeService } from '../services/api';

const ProjectBoards = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectResponse, issueTypesResponse] = await Promise.all([
        projectService.getById(projectId),
        issueTypeService.getAll()
      ]);

      setProject(projectResponse.data || projectResponse); // API response formatına göre düzelt
      setIssueTypes(issueTypesResponse.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load project boards');
    } finally {
      setLoading(false);
    }
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/projects"
          onClick={(e) => {
            e.preventDefault();
            navigate('/projects');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Projects
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          href={`/project/${projectId}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/project/${projectId}`);
          }}
          sx={{ cursor: 'pointer' }}
        >
          {project?.name}
        </Link>
        <Typography color="text.primary" fontWeight="500">
          Boards
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton 
          onClick={() => navigate(`/project/${projectId}`)}
          sx={{ 
            backgroundColor: '#F3F4F6',
            '&:hover': { backgroundColor: '#E5E7EB' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="700" color="#111827">
            Project Boards
          </Typography>
          <Typography variant="body1" color="#6B7280">
            {project?.name} - Select a board to manage issues
          </Typography>
        </Box>
      </Box>

      {/* Issue Type Boards */}
      <Grid container spacing={3}>
        {issueTypes.map((issueType) => (
          <Grid item xs={12} sm={6} md={4} key={issueType.typeId}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #E5E7EB',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                  borderColor: '#4F46E5',
                },
              }}
              onClick={() => navigate(`/board/${issueType.typeId}?projectId=${projectId}`)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box mb={3}>
                  {issueType.name.toLowerCase() === 'bug' && (
                    <BugIcon sx={{ fontSize: 64, color: '#EF4444' }} />
                  )}
                  {issueType.name.toLowerCase() === 'task' && (
                    <TaskIcon sx={{ fontSize: 64, color: '#3B82F6' }} />
                  )}
                  {!['bug', 'task'].includes(issueType.name.toLowerCase()) && (
                    <DashboardIcon sx={{ fontSize: 64, color: '#6B7280' }} />
                  )}
                </Box>
                
                <Typography variant="h5" fontWeight="600" color="#111827" mb={2}>
                  {issueType.name} Board
                </Typography>
                
                <Typography variant="body1" color="#6B7280" mb={3}>
                  {issueType.description || `Manage ${issueType.name.toLowerCase()} items for this project`}
                </Typography>
                
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 3,
                    py: 1,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 2,
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 20 }} />
                  Open Board
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {issueTypes.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={8}>
              <DashboardIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
              <Typography variant="h6" color="#374151" fontWeight="600" mb={1}>
                No Issue Types Available
              </Typography>
              <Typography variant="body1" color="#6B7280">
                Issue types need to be configured to access project boards.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProjectBoards;
