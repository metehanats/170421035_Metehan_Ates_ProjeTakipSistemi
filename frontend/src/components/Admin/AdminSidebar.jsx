import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Settings,
  BugReport,
  AccountTree,
  People,
  AdminPanelSettings,
  Extension,
  FolderOpen,
  ExpandLess,
  ExpandMore,
  Circle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const AdminSidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState(['configuration']);

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
            {open && (
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151'
                }}
              />
            )}
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
              {open && (
                <>
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
                </>
              )}
            </ListItemButton>
          </ListItem>
          
          {open && (
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
          )}
        </React.Fragment>
      );
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          overflow: 'hidden'
        },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: open ? 2.5 : 1.5, 
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
          {open && (
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
          )}
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
    </Drawer>
  );
};

export default AdminSidebar;
