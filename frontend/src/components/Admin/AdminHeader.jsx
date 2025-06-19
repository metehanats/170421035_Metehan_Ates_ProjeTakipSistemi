import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as BackIcon,
  ExitToApp as ExitIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToApp = () => {
    navigate('/');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#FFFFFF',
        color: '#172B4D',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle menu"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Jira Administration
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label="Admin Mode"
            size="small"
            sx={{
              backgroundColor: '#FFF3CD',
              color: '#856404',
              fontWeight: 'bold',
            }}
          />

          <Button
            startIcon={<BackIcon />}
            onClick={handleBackToApp}
            variant="outlined"
            size="small"
          >
            Back to App
          </Button>

          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1976D2' }}>
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
