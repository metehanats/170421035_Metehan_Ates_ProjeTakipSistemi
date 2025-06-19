import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  ListItemIcon as MenuListItemIcon,
  Divider,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  GridView as DashboardIcon,
  Folder as ProjectsIcon,
  Dashboard as BoardsIcon, // Icon değiştirildi
  PlayCircle as SprintsIcon,
  AccountCircle,
  Logout,
  Settings as SettingsIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar'; // Sidebar bileşenini import et

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [boardsMenuAnchor, setBoardsMenuAnchor] = useState(null); // Boards dropdown için
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarBoardsOpen, setSidebarBoardsOpen] = useState(false); // Sidebar'daki boards dropdown için

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} />, path: '/' },
    { text: 'Issues', icon: <BoardsIcon sx={{ fontSize: 20 }} />, path: '/issues' },
    { text: 'Sprints', icon: <SprintsIcon sx={{ fontSize: 20 }} />, path: '/sprints' },
  ];

  // Recent Projects Data
  const recentProjects = [
    {
      name: 'TST2024000 Test',
      code: 'TST2024000',
      type: 'Software project',
      color: '#0052CC'
    },
    {
      name: 'Mobile App',
      code: 'MOB2024',
      type: 'Software project',
      color: '#36B37E'
    },
    {
      name: 'Web Platform',
      code: 'WEB2024',
      type: 'Software project',
      color: '#FF5630'
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleCloseProfileMenu();
  };

  const handleSettingsClick = () => {
    navigate('/admin');
    handleCloseProfileMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseProfileMenu();
  };

  // Boards dropdown için
  const handleBoardsMenuOpen = (event) => {
    setBoardsMenuAnchor(event.currentTarget);
    // Sidebar'daki boards dropdown'ı da aç
    setSidebarBoardsOpen(true);
  };

  const handleBoardsMenuClose = () => {
    setBoardsMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* NAVBAR */}
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
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

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
              onClick={handleBoardsMenuOpen} // Boards dropdown'ı açacak
            >
              Boards
            </Button>

            <Button
              variant="contained"
              sx={{
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'none',
                px: 2,
                py: 0.5,
                minHeight: '32px',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#c82333',
                  boxShadow: 'none',
                }
              }}
              onClick={() => navigate('/create')}
            >
              Create
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => navigate('/admin')}
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
              onClick={handleProfileMenu}
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
              onClose={handleCloseProfileMenu}
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
                onClick={handleProfileClick}
                sx={{ 
                  fontSize: '13px',
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#F4F5F7',
                  }
                }}
              >
                <MenuListItemIcon>
                  <AccountCircle sx={{ fontSize: '18px' }} />
                </MenuListItemIcon>
                Profile
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
                <MenuListItemIcon>
                  <Logout sx={{ fontSize: '18px' }} />
                </MenuListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar - boardsOpen prop'unu geçiriyoruz */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        boardsOpen={sidebarBoardsOpen}
        setBoardsOpen={setSidebarBoardsOpen}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#F4F5F7',
          minHeight: '100vh',
          ml: { sm: 0 },
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important' }} />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;