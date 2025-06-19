import React, { useState, useEffect } from 'react';
import { issueService, projectService, userService } from '../services/api';
import { mapIssueFromApi, mapIssueToApi } from '../utils/adapters';
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
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  Divider,
  CircularProgress,
  FormHelperText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport as BugIcon,
  Assignment as TaskIcon,
  NewReleases as StoryIcon,
  KeyboardArrowUp as HighIcon,
  KeyboardArrowDown as LowIcon,
  Remove as MediumIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProject } from '../context/ProjectContext';

const Issues = () => {
  const { projects } = useProject();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    projectId: '',
    assigneeId: '',
  });
  
  // Yeni eklenen state'ler
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [users, setUsers] = useState([]);

  // Seçenek listeleri
  const issueTypeOptions = [
    { value: 'bug', icon: <BugIcon color="error" />, label: 'Bug' },
    { value: 'task', icon: <TaskIcon color="primary" />, label: 'Task' },
    { value: 'story', icon: <StoryIcon color="success" />, label: 'Story' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: 'low', icon: <LowIcon sx={{ color: '#36B37E' }} />, label: 'Low' },
    { value: 'medium', icon: <MediumIcon sx={{ color: '#FFA500' }} />, label: 'Medium' },
    { value: 'high', icon: <HighIcon sx={{ color: '#FF5630' }} />, label: 'High' },
    { value: 'critical', icon: <HighIcon sx={{ color: '#DE350B' }} />, label: 'Critical' }
  ];

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, []);

  // Verileri API'den çekme
  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesResponse, usersResponse] = await Promise.all([
        issueService.getAll(),
        userService.getAll()
      ]);
      
      // API'den gelen verileri frontend formatına dönüştür
      const mappedIssues = issuesResponse.data.map(mapIssueFromApi);
      setIssues(mappedIssues);
      setUsers(usersResponse.data);
      
      setError(null);
    } catch (err) {
      console.error('Veri yüklenirken hata oluştu:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Form alanları değiştiğinde
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: false
      });
    }
  };

  // Dialog açma işlevi
  const handleOpenDialog = (issue = null) => {
    if (issue) {
      setEditingIssue(issue);
      setFormData({
        title: issue.title,
        description: issue.description || '',
        type: issue.type,
        status: issue.status,
        priority: issue.priority || 'medium',
        projectId: issue.projectId,
        assigneeId: issue.assigneeId || '',
      });
    } else {
      setEditingIssue(null);
      setFormData({
        title: '',
        description: '',
        type: 'task',
        status: 'todo',
        priority: 'medium',
        projectId: projects.length > 0 ? projects[0].id : '',
        assigneeId: '',
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  // Dialog kapatma işlevi
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIssue(null);
    setFormErrors({});
  };

  // Context menu açma işlevi
  const handleOpenMenu = (event, issue) => {
    setAnchorEl(event.currentTarget);
    setSelectedIssue(issue);
  };

  // Context menu kapatma işlevi
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedIssue(null);
  };

  // Issue kaydetme işlevi
  const handleSaveIssue = async () => {
    // Form doğrulama
    const errors = {};
    if (!formData.title.trim()) errors.title = "Başlık gerekli";
    if (!formData.type) errors.type = "Tür seçimi gerekli";
    if (!formData.status) errors.status = "Durum seçimi gerekli";
    if (!formData.projectId) errors.projectId = "Proje seçimi gerekli";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setFormSubmitting(true);
      
      if (editingIssue) {
        // Frontend verisini API formatına dönüştür
        const apiIssueData = mapIssueToApi({...formData, id: editingIssue.id});
        
        // API'yi çağır
        await issueService.update(editingIssue.id, apiIssueData);
        
        // UI'ı güncelle
        setIssues(issues.map(i => 
          i.id === editingIssue.id 
            ? { ...formData, id: editingIssue.id, updatedAt: new Date().toISOString() }
            : i
        ));
        
        setNotification({
          type: 'success',
          message: 'Issue başarıyla güncellendi'
        });
      } else {
        // Frontend verisini API formatına dönüştür
        const apiIssueData = mapIssueToApi(formData);
        
        // API'yi çağır
        const response = await issueService.create(apiIssueData);
        
        // API'den dönen veriyi frontend formatına dönüştür
        const newIssue = mapIssueFromApi(response.data);
        
        // UI'ı güncelle
        setIssues([...issues, newIssue]);
        
        setNotification({
          type: 'success',
          message: 'Yeni issue başarıyla oluşturuldu'
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Issue kaydedilirken hata oluştu:', err);
      setNotification({
        type: 'error',
        message: 'Issue kaydedilirken bir hata oluştu'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Issue silme işlevi
  const handleDeleteIssue = async (issueId) => {
    if (!issueId) return;
    
    if (!window.confirm('Bu issue\'yu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await issueService.delete(issueId);
      setIssues(issues.filter(i => i.id !== issueId));
      handleCloseMenu();
      setNotification({
        type: 'success',
        message: 'Issue başarıyla silindi'
      });
    } catch (err) {
      console.error('Issue silinirken hata oluştu:', err);
      setNotification({
        type: 'error',
        message: 'Issue silinirken bir hata oluştu'
      });
    }
  };

  // Bildirim kapatma
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Kanban Board bileşeni
  const KanbanBoard = () => {
    const columns = {
      todo: issues.filter(issue => issue.status === 'todo'),
      in_progress: issues.filter(issue => issue.status === 'in_progress'),
      done: issues.filter(issue => issue.status === 'done')
    };
    
    const columnTitles = {
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done'
    };
    
    return (
      <Grid container spacing={2}>
        {Object.keys(columns).map(columnKey => (
          <Grid item xs={12} md={4} key={columnKey}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#F4F5F7',
                height: '100%',
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="bold">
                  {columnTitles[columnKey]}
                </Typography>
                <Chip
                  label={columns[columnKey].length}
                  size="small"
                  sx={{ bgcolor: '#DFE1E6' }}
                />
              </Box>
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {columns[columnKey].length === 0 ? (
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      color: 'text.secondary',
                      bgcolor: '#EBECF0',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2">
                      Bu kolonda henüz issue bulunmuyor
                    </Typography>
                  </Box>
                ) : (
                  columns[columnKey].map(issue => (
                    <Card
                      key={issue.id}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {issue.type === 'bug' && <BugIcon color="error" fontSize="small" />}
                            {issue.type === 'task' && <TaskIcon color="primary" fontSize="small" />}
                            {issue.type === 'story' && <StoryIcon color="success" fontSize="small" />}
                            <Typography variant="subtitle2" noWrap>
                              {issue.title}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMenu(e, issue);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            size="small"
                            label={issue.priority}
                            sx={{
                              bgcolor: 
                                issue.priority === 'high' ? '#FFEBE6' :
                                issue.priority === 'medium' ? '#FFFAE6' :
                                issue.priority === 'critical' ? '#FF8F73' : '#E3FCEF',
                              color: 
                                issue.priority === 'high' ? '#DE350B' :
                                issue.priority === 'medium' ? '#FF8B00' :
                                issue.priority === 'critical' ? '#BF2600' : '#006644'
                            }}
                          />
                          
                          {issue.assigneeName ? (
                            <Tooltip title={issue.assigneeName || ''}>
                              <Avatar
                                sx={{ width: 24, height: 24, fontSize: 12 }}
                              >
                                {issue.assigneeName && typeof issue.assigneeName === 'string' ? issue.assigneeName.charAt(0) : '?'}
                              </Avatar>
                            </Tooltip>
                          ) : (
                            <Avatar
                              sx={{ width: 24, height: 24, fontSize: 12, bgcolor: '#DFE1E6', color: '#42526E' }}
                            >
                              ?
                            </Avatar>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Liste Görünümü bileşeni
  const ListView = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F4F5F7' }}>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id} hover>
                <TableCell>
                  {issue.type === 'bug' && <BugIcon color="error" />}
                  {issue.type === 'task' && <TaskIcon color="primary" />}
                  {issue.type === 'story' && <StoryIcon color="success" />}
                </TableCell>
                <TableCell>{issue.title}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      issue.status === 'todo' ? 'To Do' :
                      issue.status === 'in_progress' ? 'In Progress' : 'Done'
                    }
                    size="small"
                    sx={{
                      bgcolor: 
                        issue.status === 'todo' ? '#DFE1E6' :
                        issue.status === 'in_progress' ? '#DEEBFF' : '#E3FCEF',
                      color: 
                        issue.status === 'todo' ? '#42526E' :
                        issue.status === 'in_progress' ? '#0052CC' : '#006644'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={issue.priority}
                    sx={{
                      bgcolor: 
                        issue.priority === 'high' ? '#FFEBE6' :
                        issue.priority === 'medium' ? '#FFFAE6' :
                        issue.priority === 'critical' ? '#FF8F73' : '#E3FCEF',
                      color: 
                        issue.priority === 'high' ? '#DE350B' :
                        issue.priority === 'medium' ? '#FF8B00' :
                        issue.priority === 'critical' ? '#BF2600' : '#006644'
                    }}
                  />
                </TableCell>
                <TableCell>
                  {issue.assigneeName ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {issue.assigneeName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {issue.assigneeName}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => handleOpenMenu(e, issue)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="#172B4D">
          Issues
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderColor: '#DFE1E6' }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#0052CC',
              '&:hover': { backgroundColor: '#0065FF' },
            }}
            disabled={loading}
          >
            Create Issue
          </Button>
        </Box>
      </Box>

      {/* Yükleme ve Hata Durumları */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          height="50vh"
        >
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => fetchData()} 
            startIcon={<RefreshIcon />}
          >
            Yeniden Dene
          </Button>
        </Box>
      ) : (
        <>
          {/* View Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="Kanban Board" />
              <Tab label="List View" />
            </Tabs>
          </Box>

          {/* Content */}
          {issues.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="center" 
              alignItems="center" 
              height="50vh"
              sx={{ color: 'text.secondary' }}
            >
              <AssignmentIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Henüz hiç issue eklenmemiş
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleOpenDialog()}
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                İlk Issue'yu Oluştur
              </Button>
            </Box>
          ) : (
            currentTab === 0 ? <KanbanBoard /> : <ListView />
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => { handleOpenDialog(selectedIssue); handleCloseMenu(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Issue
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteIssue(selectedIssue?.id)}
          sx={{ color: '#FF5630' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Issue
        </MenuItem>
      </Menu>

      {/* Add/Edit Issue Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingIssue ? 'Edit Issue' : 'Create New Issue'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Issue Title"
                fullWidth
                value={formData.title}
                onChange={handleFormChange}
                error={Boolean(formErrors.title)}
                helperText={formErrors.title}
                disabled={formSubmitting}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(formErrors.type)} required>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  label="Issue Type"
                  disabled={formSubmitting}
                >
                  {issueTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(formErrors.status)} required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  label="Status"
                  disabled={formSubmitting}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                                  </Select>
                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(formErrors.priority)}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  label="Priority"
                  disabled={formSubmitting}
                >
                  {priorityOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.priority && <FormHelperText>{formErrors.priority}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(formErrors.projectId)} required>
                <InputLabel>Project</InputLabel>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleFormChange}
                  label="Project"
                  disabled={formSubmitting}
                >
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.projectId && <FormHelperText>{formErrors.projectId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleFormChange}
                  label="Assignee"
                  disabled={formSubmitting}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {users.map(user => {
                    // userID için güvenli bir değer oluştur
                    const userID = user.userID != null ? user.userID.toString() : '';
                    
                    return (
                      <MenuItem key={userID || `user-${Math.random()}`} value={userID}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {user.firstName?.charAt(0) || "?"}
                          </Avatar>
                          {user.firstName || ''} {user.lastName || ''}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={handleFormChange}
                disabled={formSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveIssue} 
            variant="contained" 
            color="primary"
            disabled={formSubmitting}
          >
            {formSubmitting ? 'Saving...' : (editingIssue ? 'Update Issue' : 'Create Issue')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={Boolean(notification)} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.type} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default Issues;