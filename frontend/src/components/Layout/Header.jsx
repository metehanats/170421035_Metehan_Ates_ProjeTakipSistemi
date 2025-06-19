import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        backgroundColor: 'white',
        color: '#172B4D',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        zIndex: 1300,
      }}
    >
      <Toolbar sx={{ minHeight: '48px !important', px: 2 }}>
        {/* Company Name */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '16px',
            color: '#0052CC',
            mr: 4
          }}
        >
          ProjectFlow
        </Typography>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Button
            sx={{
              color: '#172B4D',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              px: 2,
              py: 0.5,
              minHeight: '32px',
              '&:hover': {
                backgroundColor: '#F4F5F7',
              }
            }}
            endIcon={<KeyboardArrowDown sx={{ fontSize: '16px' }} />}
            onClick={() => navigate('/projects')}
          >
            Projects
          </Button>

          <Button
            sx={{
              color: '#172B4D',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              px: 2,
              py: 0.5,
              minHeight: '32px',
              '&:hover': {
                backgroundColor: '#F4F5F7',
              }
            }}
            endIcon={<KeyboardArrowDown sx={{ fontSize: '16px' }} />}
            onClick={() => navigate('/issues')}
          >
            Issues
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#0052CC',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              px: 2,
              py: 0.5,
              minHeight: '32px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#0747A6',
                boxShadow: 'none',
              }
            }}
            onClick={() => navigate('/create')}
          >
            Create
          </Button>
        </Box>

        {/* Right Side - Settings & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            sx={{
              color: '#6B778C',
              '&:hover': {
                backgroundColor: '#F4F5F7',
              }
            }}
          >
            <SettingsIcon sx={{ fontSize: '18px' }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              p: 0.5,
              '&:hover': {
                backgroundColor: '#F4F5F7',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                backgroundColor: '#0052CC',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '1px solid #DFE1E6',
                borderRadius: '4px',
                minWidth: '180px',
              }
            }}
          >
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ 
                fontSize: '13px',
                py: 1,
                '&:hover': {
                  backgroundColor: '#F4F5F7',
                }
              }}
            >
              <ListItemIcon>
                <AccountCircle sx={{ fontSize: '18px' }} />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ 
                fontSize: '13px',
                py: 1,
                '&:hover': {
                  backgroundColor: '#F4F5F7',
                }
              }}
            >
              <ListItemIcon>
                <SettingsIcon sx={{ fontSize: '18px' }} />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                fontSize: '13px',
                py: 1,
                '&:hover': {
                  backgroundColor: '#F4F5F7',
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ fontSize: '18px' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
