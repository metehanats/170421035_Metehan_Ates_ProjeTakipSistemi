import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Settings,
  People,
  AdminPanelSettings,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Circle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedItems, setExpandedItems] = useState(['configuration']);
  const navigate = useNavigate();
  const location = useLocation();

  const handleExpand = (item) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin',
      type: 'single'
    },
    {
      id: 'configuration',
      text: 'Issue Configuration',
      icon: <Settings />,
      type: 'expandable',
      children: [
        {
          text: 'Issue Types',
          path: '/admin/issue-types'
        },
        {
          text: 'Issue Status',
          path: '/admin/issue-status'
        },
        {
          text: 'Workflows',
          path: '/admin/workflows'
        },
        {
          text: 'Custom Fields',
          path: '/admin/custom-fields'
        }
      ]
    },
    {
      id: 'user-management',
      text: 'User Management',
      icon: <People />,
      type: 'expandable',
      children: [
        {
          text: 'Users',
          path: '/admin/users'
        },
        {
          text: 'Roles & Permissions',
          path: '/admin/roles'
        }
      ]
    },
    {
      id: 'system',
      text: 'System Settings',
      icon: <AdminPanelSettings />,
      type: 'expandable',
      children: [
        {
          text: 'Email Settings',
          path: '/admin/email-settings'
        },
        {
          text: 'Project Settings',
          path: '/admin/projects'
        }
      ]
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const renderMenuItem = (item) => {
    if (item.type === 'single') {
      return (
        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              borderRadius: 1.5,
              minHeight: 44,
              '&.Mui-selected': {
                backgroundColor: '#F3F4F6',
                '& .MuiListItemIcon-root': { 
                  color: '#4F46E5' 
                },
                '& .MuiListItemText-primary': { 
                  color: '#1F2937',
                  fontWeight: 600
                },
              },
              '&:hover': {
                backgroundColor: '#F9FAFB',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    }

    if (item.type === 'expandable') {
      const isExpanded = expandedItems.includes(item.id);
      
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => handleExpand(item.id)}
              sx={{
                mx: 1,
                borderRadius: 1.5,
                minHeight: 44,
                '&:hover': {
                  backgroundColor: '#F9FAFB',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151'
                }}
              />
              {isExpanded ? 
                <ExpandLess sx={{ color: '#6B7280', fontSize: 20 }} /> : 
                <ExpandMore sx={{ color: '#6B7280', fontSize: 20 }} />
              }
            </ListItemButton>
          </ListItem>
          
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ mb: 1 }}>
              {item.children.map((child) => (
                <ListItem key={child.path} disablePadding>
                  <ListItemButton
                    selected={location.pathname === child.path}
                    onClick={() => navigate(child.path)}
                    sx={{
                      mx: 1,
                      ml: 2,
                      borderRadius: 1.5,
                      minHeight: 36,
                      '&.Mui-selected': {
                        backgroundColor: '#EEF2FF',
                        '& .MuiListItemText-primary': { 
                          color: '#4F46E5',
                          fontWeight: 600
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: 16,
                          backgroundColor: '#4F46E5',
                          borderRadius: 2
                        }
                      },
                      '&:hover': {
                        backgroundColor: '#F9FAFB',
                      },
                      position: 'relative'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Circle sx={{ 
                        fontSize: 6, 
                        color: location.pathname === child.path ? '#4F46E5' : '#9CA3AF' 
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={child.text}
                      primaryTypographyProps={{
                        fontSize: '0.8125rem',
                        fontWeight: location.pathname === child.path ? 600 : 400,
                        color: location.pathname === child.path ? '#4F46E5' : '#6B7280'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid #E5E7EB',
        minHeight: 72,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
            }}
          >
            <AdminPanelSettings sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#111827',
                lineHeight: 1.2,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Admin Panel
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6B7280',
                fontSize: '0.75rem',
                fontWeight: 500,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              System Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        py: 1,
        '&::-webkit-scrollbar': {
          width: 4,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#E5E7EB',
          borderRadius: 2,
        },
      }}>
        <List sx={{ px: 0 }}>
          {menuItems.map(renderMenuItem)}
        </List>
      </Box>
    </Box>
  );

  const getCurrentPageTitle = () => {
    for (const item of menuItems) {
      if (item.type === 'single' && location.pathname === item.path) {
        return item.text;
      }
      if (item.type === 'expandable') {
        for (const child of item.children) {
          if (location.pathname === child.path) {
            return child.text;
          }
        }
      }
    }
    return 'Admin Panel';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              fontSize: '1.125rem',
              color: '#111827',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            {getCurrentPageTitle()}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: '#F3F4F6'
                }
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ color: '#6B7280' }} />
              </Badge>
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              sx={{
                '&:hover': {
                  backgroundColor: '#F3F4F6'
                }
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: '#4F46E5',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                A
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB',
                borderRadius: 2,
                minWidth: 180
              }
            }}
          >
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                fontSize: '0.875rem',
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#F9FAFB'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AccountIcon sx={{ fontSize: 20, color: '#6B7280' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Profile"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              />
            </MenuItem>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                fontSize: '0.875rem',
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#F9FAFB'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Settings sx={{ fontSize: 20, color: '#6B7280' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Settings"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                fontSize: '0.875rem',
                py: 1.5,
                color: '#DC2626',
                '&:hover': {
                  backgroundColor: '#FEF2F2'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon sx={{ fontSize: 20, color: '#DC2626' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#DC2626'
                }}
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E7EB'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E7EB'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: '#F9FAFB',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
