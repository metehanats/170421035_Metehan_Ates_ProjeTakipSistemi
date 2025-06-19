import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  FormGroup,
  Checkbox,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  List as ListIcon,
  Person as PersonIcon,
  Link as UrlIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachFile as FileIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material';
import { customFieldService, projectService, issueService } from '../../services';

const CustomFieldsAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'text',
    projectId: '', // Boş string olarak başlatın, projects array'i yerine
    required: false,
    searchable: true,
    options: [],
    defaultValue: '',
    issueTypes: []
    // projects array'ini kaldırın
  });

  // API data states
  const [customFields, setCustomFields] = useState([]);
  const [projects, setProjects] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Field Types
  const fieldTypes = [
    { value: 'text', label: 'Text Field', icon: <TextIcon />, description: 'Single line text input' },
    { value: 'textarea', label: 'Text Area', icon: <TextIcon />, description: 'Multi-line text input' },
    { value: 'number', label: 'Number', icon: <NumberIcon />, description: 'Numeric input' },
    { value: 'date', label: 'Date', icon: <DateIcon />, description: 'Date picker' },
    { value: 'datetime', label: 'Date Time', icon: <DateIcon />, description: 'Date and time picker' },
    { value: 'checkbox', label: 'Checkbox', icon: <CheckboxIcon />, description: 'Single checkbox' },
    { value: 'select', label: 'Select List', icon: <ListIcon />, description: 'Dropdown selection' },
    { value: 'multiselect', label: 'Multi Select', icon: <ListIcon />, description: 'Multiple selection' },
    { value: 'radio', label: 'Radio Buttons', icon: <RadioIcon />, description: 'Single choice from options' },
    { value: 'user', label: 'User Picker', icon: <PersonIcon />, description: 'Select user from system' },
    { value: 'url', label: 'URL', icon: <UrlIcon />, description: 'Web link input' },
    { value: 'email', label: 'Email', icon: <EmailIcon />, description: 'Email address input' },
    { value: 'phone', label: 'Phone', icon: <PhoneIcon />, description: 'Phone number input' },
    { value: 'file', label: 'File Upload', icon: <FileIcon />, description: 'File attachment' },
  ];

  const getFieldTypeInfo = (type) => {
    return fieldTypes.find(ft => ft.value === type) || fieldTypes[0];
  };
  
  // Fetch all required data from API
  useEffect(() => {
  const fetchAllData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // Fetch custom fields
    await fetchCustomFields();
    
    // Fetch projects
    const projectsData = await projectService.getAll();
    console.log('Projects data:', projectsData); // Dönüştürülmüş verileri kontrol edin
    
    // projectsData zaten dönüştürülmüş olduğu için doğrudan kullanabilirsiniz
    setProjects(projectsData);
    
    // Diğer fetch işlemleri...
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load data. Please try again later.');
    showNotification('Failed to load data. Please try again later.', 'error');
  } finally {
    setLoading(false);
  }
};
  
  fetchAllData();
}, []);
  
  // Helper function to assign colors to issue types
  const getIssueTypeColor = (typeName) => {
    const colors = {
      'Bug': '#E53E3E',
      'Task': '#3182CE',
      'Story': '#38A169',
      'Epic': '#805AD5'
    };
    
    return colors[typeName] || '#718096'; // Default color
  };

  const fetchCustomFields = async () => {
  try {
    const response = await customFieldService.getAll();
    setCustomFields(response.data || []);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    showNotification('Error fetching custom fields', 'error');
  }
};

  const createCustomField = async () => {
    try {
      setLoading(true);
      
      // API'ye gönderilecek veriyi hazırlayın
      const dataToSend = {
        ...formData,
        // Eğer API projects array'i bekliyorsa:
        projects: formData.projectId ? [formData.projectId] : []
      };
      
      const result = await customFieldService.create(dataToSend);
      
      if (result.success) {
        await fetchCustomFields(); // Listeyi yenile
        handleClose();
        showNotification('Custom field created successfully', 'success');
      } else {
        showNotification(result.error || 'Error creating custom field', 'error');
      }
    } catch (error) {
      console.error('Error creating custom field:', error);
      showNotification('Error creating custom field: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomField = async () => {
  try {
    setLoading(true);
    
    const idToUse = editingField.fieldId || editingField.id;
    
    if (!idToUse) {
      console.error('Cannot update: ID is missing');
      showNotification('Cannot update field: ID is missing', 'error');
      return;
    }
    
    console.log(`Attempting to update custom field with ID: ${idToUse}`);
    
    // API'ye gönderilecek veriyi hazırlayın
    const dataToSend = {
      ...formData,
      fieldId: idToUse, // fieldId'yi açıkça belirt
      // Eğer API projects array'i bekliyorsa:
      projects: formData.projectId ? [formData.projectId] : []
    };
    
    console.log('Data being sent for update:', dataToSend);
    
    const result = await customFieldService.update(idToUse, dataToSend);
    
    if (result.success) {
      await fetchCustomFields(); // Listeyi yenile
      handleClose();
      showNotification('Custom field updated successfully', 'success');
    } else {
      showNotification(result.error || 'Error updating custom field', 'error');
    }
  } catch (error) {
    console.error('Error updating custom field:', error);
    showNotification('Error updating custom field: ' + (error.message || 'Unknown error'), 'error');
  } finally {
    setLoading(false);
  }
};

  // Alan silme
  const deleteCustomField = async (id) => {
    if (!id) {
      console.error('Cannot delete field: ID is undefined');
      showNotification('Cannot delete field: Invalid ID', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to delete custom field with ID: ${id}`);
      
      const result = await customFieldService.delete(id);
      
      if (result.success) {
        // Silinen alanı state'den kaldır
        setCustomFields(prevFields => prevFields.filter(field => field.id !== id));
        showNotification('Custom field deleted successfully', 'success');
      } else {
        showNotification(result.error || 'Error deleting custom field', 'error');
      }
    } catch (error) {
      console.error('Error deleting custom field:', error);
      showNotification('Error deleting custom field: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  // handleSave fonksiyonunu güncelle
  const handleSave = () => {
  // Form verilerini kontrol et
  if (!formData.name) {
    showNotification('Field name is required', 'error');
    return;
  }
  
  if (!formData.projectId) {
    showNotification('Project selection is required', 'error');
    return;
  }
  
  console.log('Saving field data:', formData);
  console.log('Editing field:', editingField);
  
  if (editingField) {
    // Güncelleme işlemi
    const idToUse = editingField.fieldId || editingField.id;
    console.log(`Updating field with ID: ${idToUse}`);
    
    if (!idToUse) {
      showNotification('Cannot update field: ID is missing', 'error');
      return;
    }
    
    updateCustomField(idToUse);
  } else {
    // Yeni oluşturma işlemi
    createCustomField();
  }
};

const handleDelete = (id) => {
  console.log("Deleting field with ID:", id);
  
  if (!id) {
    console.error("Cannot delete field: ID is undefined");
    showNotification('Cannot delete field: Invalid ID', 'error');
    return;
  }
  
  if (window.confirm('Are you sure you want to delete this custom field?')) {
    deleteCustomField(id);
  }
};



  const handleOpen = (field = null) => {
    if (field) {
      setEditingField(field);
      setFormData({
        ...field,
        projectId: field.projectId || (field.projects && field.projects.length > 0 ? field.projects[0] : ''),
        options: field.options || []
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        description: '',
        type: 'text',
        projectId: '',
        required: false,
        searchable: true,
        options: [],
        defaultValue: '',
        issueTypes: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingField(null);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, value: ${value}`); // Değişiklikleri izleyin
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const needsOptions = ['select', 'multiselect', 'radio'].includes(formData.type);

  const FieldPreview = ({ field }) => {
    const typeInfo = getFieldTypeInfo(field.type);
    
    return (
      <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 1, backgroundColor: '#F9F9F9' }}>
        <Typography variant="subtitle2" gutterBottom>
          Field Preview
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Box sx={{ color: 'primary.main' }}>
            {typeInfo.icon}
          </Box>
          <Typography variant="body2" fontWeight="bold">
            {field.name || 'Field Name'}
            {field.required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        </Box>
        
        {field.description && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {field.description}
          </Typography>
        )}

        {/* Preview based on field type */}
        {field.type === 'text' && (
          <TextField size="small" placeholder="Enter text..." disabled fullWidth />
        )}
        {field.type === 'textarea' && (
          <TextField size="small" multiline rows={2} placeholder="Enter text..." disabled fullWidth />
        )}
        {field.type === 'number' && (
          <TextField size="small" type="number" placeholder="0" disabled fullWidth />
        )}
        {field.type === 'select' && (
          <FormControl size="small" fullWidth>
            <Select disabled value="" displayEmpty>
              <MenuItem value="" disabled>Select an option</MenuItem>
              {field.options.map((option, index) => (
                <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {field.type === 'multiselect' && (
          <FormControl size="small" fullWidth>
            <Select disabled multiple value={[]} displayEmpty renderValue={() => 'Select options'}>
              {field.options.map((option, index) => (
                <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {field.type === 'checkbox' && (
          <FormControlLabel control={<Checkbox disabled />} label="Checkbox option" />
        )}
        {field.type === 'radio' && field.options.length > 0 && (
          <FormGroup>
            {field.options.map((option, index) => (
              <FormControlLabel key={index} control={<Checkbox disabled />} label={option} />
            ))}
          </FormGroup>
        )}
        {field.type === 'date' && (
          <TextField size="small" type="date" disabled fullWidth />
        )}
        {field.type === 'datetime' && (
          <TextField size="small" type="datetime-local" disabled fullWidth />
        )}
        {field.type === 'email' && (
          <TextField size="small" type="email" placeholder="email@example.com" disabled fullWidth />
        )}
        {field.type === 'url' && (
          <TextField size="small" type="url" placeholder="https://example.com" disabled fullWidth />
        )}
        {field.type === 'phone' && (
          <TextField size="small" placeholder="+1234567890" disabled fullWidth />
        )}
        {field.type === 'file' && (
          <Button variant="outlined" size="small" disabled fullWidth>Upload File</Button>
        )}
        {field.type === 'user' && (
          <FormControl size="small" fullWidth>
            <Select disabled value="" displayEmpty>
              <MenuItem value="" disabled>Select a user</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
    );
  };

  if (loading && customFields.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && customFields.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={fetchCustomFields}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Custom Fields
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create and manage custom fields for your issues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Custom Field
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="All Fields" />
        <Tab label="Field Types" />
        <Tab label="Usage Statistics" />
      </Tabs>

      {tabValue === 0 && (
        <Paper>
          {loading && customFields.length > 0 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {customFields.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No custom fields found. Click "Add Custom Field" to create one.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Required</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customFields.map((field) => {
                    const typeInfo = getFieldTypeInfo(field.type);
                    const projectName = projects.find(p => p.projectId === field.projects[0])?.name || 'Unknown Project';
                    
                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ color: 'primary.main' }}>
                                {typeInfo.icon}
                              </Box>
                              <Typography fontWeight="bold">{field.name}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {field.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={typeInfo.label} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {field.required ? (
                            <Chip label="Required" size="small" color="error" />
                          ) : (
                            <Chip label="Optional" size="small" color="default" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {projectName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {field.usage} issues
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              console.log("Edit button clicked for field:", field);
                              handleOpen(field);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              console.log("Delete button clicked for field:", field);
                              handleDelete(field.fieldId || field.id);  // Önce fieldId'yi kontrol et
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {fieldTypes.map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type.value}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ color: 'primary.main' }}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {type.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {type.description}
                  </Typography>
                  <Chip
                    label={`${customFields.filter(f => f.type === type.value).length} fields`}
                    size="small"
                    color="primary"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Most Used Fields
                </Typography>
                {customFields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No usage data available yet.
                  </Typography>
                ) : (
                  <List>
                    {customFields
                      .sort((a, b) => b.usage - a.usage)
                      .slice(0, 5)
                      .map((field) => (
                        <ListItem key={field.id}>
                          <ListItemText
                            primary={field.name}
                            secondary={`Used in ${field.usage} issues`}
                          />
                          <ListItemSecondaryAction>
                            <Chip label={field.usage} size="small" color="primary" />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Field Type Distribution
                </Typography>
                {customFields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No fields available yet.
                  </Typography>
                ) : (
                  fieldTypes.map((type) => {
                    const count = customFields.filter(f => f.type === type.value).length;
                    if (count === 0) return null;
                    
                    return (
                      <Box key={type.value} display="flex" alignItems="center" gap={2} mb={1}>
                        <Box sx={{ color: 'primary.main' }}>
                          {type.icon}
                        </Box>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {type.label}
                        </Typography>
                        <Chip label={count} size="small" />
                      </Box>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Field Type"
                >
                  {fieldTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        <Box>
                          <Typography>{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormGroup sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    />
                  }
                  label="Required Field"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.searchable}
                      onChange={(e) => setFormData({ ...formData, searchable: e.target.checked })}
                    />
                  }
                  label="Searchable"
                />
              </FormGroup>

              {!needsOptions && (
                <TextField
                  fullWidth
                  label="Default Value"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  margin="normal"
                />
              )}
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="project-label">Project</InputLabel>
                <Select
                  labelId="project-label"
                  id="project"
                  name="projectId" // formData'da projectId olarak saklanacak
                  value={formData.projectId || ''}
                  onChange={handleChange}
                  label="Project"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No projects available</MenuItem>
                  )}
                </Select>
              </FormControl>

            </Grid>

            <Grid item xs={12} md={6}>
              <FieldPreview field={formData} />
              
              {needsOptions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options
                  </Typography>
                  {formData.options.map((option, index) => (
                    <Box key={index} display="flex" gap={1} mb={1}>
                      <TextField
                        size="small"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeOption(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    onClick={addOption}
                    startIcon={<AddIcon />}
                  >
                    Add Option
                  </Button>
                </Box>
              )}
            </Grid>

            {issueTypes.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Apply to Issue Types
                </Typography>
                <FormGroup row>
                  {issueTypes.map((type) => (
                    <FormControlLabel
                      key={type.id}
                      control={
                        <Checkbox
                          checked={formData.issueTypes.includes(type.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                issueTypes: [...formData.issueTypes, type.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                issueTypes: formData.issueTypes.filter(id => id !== type.id)
                              });
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: type.color }} />
                          <Typography>{type.name}</Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.name || !formData.type || !formData.projectId || loading}
          >
            {loading ? <CircularProgress size={24} /> : (editingField ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomFieldsAdmin;