import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Avatar,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  GridView as DashboardIcon,
  Folder as ProjectsIcon,
  Dashboard as BoardsIcon,
  PlayCircle as SprintsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { projectService } from '../../services/projectService'; // projectService'i import ediyoruz

const drawerWidth = 240;

// boardsOpen ve setBoardsOpen prop'larını ekledik
const Sidebar = ({ mobileOpen, handleDrawerToggle, boardsOpen, setBoardsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [issueTypes, setIssueTypes] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]); // API'den gelecek
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false); // Recent projects için ayrı loading

  // Issue Type'ları çekmek için API çağrısı
  useEffect(() => {
    const fetchIssueTypes = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/IssueType');
        setIssueTypes(response.data);
      } catch (error) {
        console.error('Error fetching issue types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueTypes();
  }, []);

  // Recent Projects'i çekmek için API çağrısı
  useEffect(() => {
    const fetchRecentProjects = async () => {
      setProjectsLoading(true);
      try {
        const projects = await projectService.getAll();
        // Son 3 projeyi al ve gerekli formata dönüştür
        const formattedProjects = projects
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // En yeni önce
          .slice(0, 3) // İlk 3 projeyi al
          .map(project => ({
            name: project.name,
            code: project.key,
            type: 'Software project', // Varsayılan tip
            color: generateProjectColor(project.key), // Proje key'ine göre renk üret
            id: project.id
          }));
        
        setRecentProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        // Hata durumunda boş array set et
        setRecentProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  // Proje key'ine göre renk üretme fonksiyonu
  const generateProjectColor = (key) => {
    const colors = [
      '#0052CC', // Jira Blue
      '#36B37E', // Green
      '#FF5630', // Red
      '#6554C0', // Purple
      '#FF8B00', // Orange
      '#00B8D9', // Cyan
      '#FF5722', // Deep Orange
      '#8BC34A', // Light Green
    ];
    
    // String'i hash'e çevir ve renk seç
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Boards dropdown toggle - dışarıdan gelen state'i kullanıyoruz
  const handleBoardsToggle = () => {
    setBoardsOpen(!boardsOpen);
  };

  const drawer = (
    <div>
      {/* Empty Toolbar for spacing */}
      <Toolbar sx={{ minHeight: '48px !important' }} />
      
      {/* Main Navigation */}
      <List sx={{ px: 1 }}>
        {/* Dashboard */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 1,
              minHeight: 36,
              px: 2,
              py: 1,
              '&.Mui-selected': {
                backgroundColor: '#E3F2FD',
                '& .MuiListItemIcon-root': {
                  color: '#0052CC',
                },
                '& .MuiListItemText-primary': {
                  color: '#0052CC',
                  fontWeight: 500,
                },
              },
              '&:hover': {
                backgroundColor: '#F4F5F7',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DashboardIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Projects */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={location.pathname === '/projects'}
            onClick={() => navigate('/projects')}
            sx={{
              borderRadius: 1,
              minHeight: 36,
              px: 2,
              py: 1,
              '&.Mui-selected': {
                backgroundColor: '#E3F2FD',
                '& .MuiListItemIcon-root': {
                  color: '#0052CC',
                },
                '& .MuiListItemText-primary': {
                  color: '#0052CC',
                  fontWeight: 500,
                },
              },
              '&:hover': {
                backgroundColor: '#F4F5F7',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ProjectsIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Projects" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Boards with dropdown */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={handleBoardsToggle}
            selected={location.pathname.startsWith('/boards')}
            sx={{
              borderRadius: 1,
              minHeight: 36,
              px: 2,
              py: 1,
              '&.Mui-selected': {
                backgroundColor: '#E3F2FD',
                '& .MuiListItemIcon-root': {
                  color: '#0052CC',
                },
                '& .MuiListItemText-primary': {
                  color: '#0052CC',
                  fontWeight: 500,
                },
              },
              '&:hover': {
                backgroundColor: '#F4F5F7',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <BoardsIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Boards" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 400,
              }}
            />
            {boardsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        {/* Boards Dropdown */}
        <Collapse in={boardsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {loading ? (
              <ListItem sx={{ pl: 2, py: 1 }}>
                <CircularProgress size={20} sx={{ color: '#0052CC' }} />
                <Typography sx={{ ml: 1, fontSize: '13px', color: '#6B778C' }}>
                  Loading boards...
                </Typography>
              </ListItem>
            ) : (
              issueTypes.map((type) => (
                <ListItem key={type.typeId} disablePadding>
                  <ListItemButton
                    selected={location.pathname === `/boards/${type.typeId}`}
                    onClick={() => navigate(`/boards/${type.typeId}`)}
                    sx={{
                      pl: 2,
                      py: 0.5,
                      minHeight: 32,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: '#E3F2FD',
                        '& .MuiListItemText-primary': {
                          color: '#0052CC',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#F4F5F7',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: type.color || '#DDD',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${type.name} Board`}
                      primaryTypographyProps={{
                        fontSize: '13px',
                        fontWeight: 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Collapse>

        {/* Sprints */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={location.pathname === '/sprints'}
            onClick={() => navigate('/sprints')}
            sx={{
              borderRadius: 1,
              minHeight: 36,
              px: 2,
              py: 1,
              '&.Mui-selected': {
                backgroundColor: '#E3F2FD',
                '& .MuiListItemIcon-root': {
                  color: '#0052CC',
                },
                '& .MuiListItemText-primary': {
                  color: '#0052CC',
                  fontWeight: 500,
                },
              },
              '&:hover': {
                backgroundColor: '#F4F5F7',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SprintsIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Sprints" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Recent Projects Section */}
      <Box sx={{ px: 1 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            px: 2, 
            py: 1, 
            display: 'block',
            color: '#6B778C',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Recent Projects
        </Typography>
        
        <List sx={{ py: 0 }}>
          {projectsLoading ? (
            <ListItem sx={{ px: 2, py: 1 }}>
              <CircularProgress size={16} sx={{ color: '#0052CC', mr: 1 }} />
              <Typography sx={{ fontSize: '13px', color: '#6B778C' }}>
                Loading projects...
              </Typography>
            </ListItem>
          ) : recentProjects.length === 0 ? (
            <ListItem sx={{ px: 2, py: 1 }}>
              <Typography sx={{ fontSize: '13px', color: '#6B778C' }}>
                No recent projects
              </Typography>
            </ListItem>
          ) : (
            recentProjects.map((project, index) => (
              <ListItem key={project.id || index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(`/projects/${project.id}`)}
                  sx={{
                    borderRadius: 1,
                    minHeight: 36,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#F4F5F7',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: project.color,
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {project.code ? project.code.substring(0, 2) : project.name.substring(0, 2)}
                    </Avatar>
                  </ListItemIcon>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#172B4D',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                      }}
                    >
                      {project.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: '#6B778C',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1,
                      }}
                    >
                      {project.type}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Settings */}
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/admin'}
            onClick={() => navigate('/admin')}
            sx={{
              borderRadius: 1,
              minHeight: 36,
              px: 2,
              py: 1,
              '&.Mui-selected': {
                backgroundColor: '#E3F2FD',
                '& .MuiListItemIcon-root': {
                  color: '#0052CC',
                },
                '& .MuiListItemText-primary': {
                  color: '#0052CC',
                  fontWeight: 500,
                },
              },
              '&:hover': {
                backgroundColor: '#F4F5F7',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            mt: '48px',
            height: 'calc(100vh - 48px)',
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
            mt: '48px',
            height: 'calc(100vh - 48px)',
            borderRight: '1px solid #DFE1E6',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;