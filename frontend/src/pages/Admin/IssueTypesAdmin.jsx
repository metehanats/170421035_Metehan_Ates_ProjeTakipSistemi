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
  Divider,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport,
  Assignment,
  Timeline,
  Flag,
  Settings as SettingsIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  List as ListIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { issueTypeService, customFieldService } from '../../services/api';

const IssueTypesAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [fieldsDialogOpen, setFieldsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [selectedTypeForFields, setSelectedTypeForFields] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Assignment',
    color: '#4F46E5'
  });

  // API'den gelen issue type'ları saklamak için state
  const [issueTypes, setIssueTypes] = useState([]);
  
  // Custom fields için state
  const [customFields, setCustomFields] = useState([]);

  const iconOptions = [
    { value: 'BugReport', label: 'Bug Report', component: <BugReport />, apiValue: 'bug' },
    { value: 'Assignment', label: 'Task', component: <Assignment />, apiValue: 'task' },
    { value: 'Timeline', label: 'Story', component: <Timeline />, apiValue: 'story' },
    { value: 'Flag', label: 'Epic', component: <Flag />, apiValue: 'epic' }
  ];

  const colorOptions = [
    '#DC2626', '#4F46E5', '#059669', '#7C3AED',
    '#EA580C', '#0891B2', '#C2410C', '#BE185D'
  ];

  // API'den issue type'ları çekme
  useEffect(() => {
    fetchIssueTypes();
    fetchCustomFields();
  }, []);

  const fetchIssueTypes = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await issueTypeService.getAll();
    
    if (!response || !response.data) {
      throw new Error('Invalid API response');
    }
    
    console.log('API response for issue types:', response.data);
    
    // API'den gelen verileri frontend formatına dönüştür
    const formattedTypes = response.data.map(type => ({
      id: type.typeId,
      name: type.name || '',
      description: type.description || '',
      icon: mapApiIconToFrontend(type.icon) || 'Assignment',
      color: type.color || '#4F46E5',
      customFields: [] // Başlangıçta boş, sonra doldurulacak
    }));
    
    setIssueTypes(formattedTypes);
    
    // Her issue type için custom field'ları yükle
    await Promise.all(formattedTypes.map(async (type) => {
      await loadCustomFieldsForType(type.id);
    }));
    
  } catch (err) {
    console.error('Failed to fetch issue types:', err);
    setError('Failed to load issue types. Please try again later.');
  } finally {
    setLoading(false);
  }
};

const loadCustomFieldsForType = async (typeId) => {
  try {
    const customFieldIds = await fetchTypeCustomFields(typeId);
    
    // State'i güncelle
    setIssueTypes(prev => prev.map(type => 
      type.id === typeId
        ? { ...type, customFields: customFieldIds }
        : type
    ));
    
    return customFieldIds;
  } catch (error) {
    console.error(`Error loading custom fields for type ${typeId}:`, error);
    return [];
  }
};

  const fetchCustomFields = async () => {
    try {
      const response = await customFieldService.getAll();
      
      if (!response || !response.data) {
        console.warn('No custom fields found or invalid response');
        return;
      }
      
      console.log('API response for custom fields:', response.data);
      
      // API'den gelen custom field'ları frontend formatına dönüştür
      const formattedFields = response.data.map(field => ({
        id: field.fieldId,
        name: field.fieldName || '',
        description: field.description || '',
        type: field.fieldType || 'text',
        required: field.required || false,
        options: field.options ? field.options.split(',').map(opt => opt.trim()) : [],
        icon: getFieldIcon(field.fieldType)
      }));
      
      setCustomFields(formattedFields);
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
    }
  };

  // Field type'a göre icon döndür
  const getFieldIcon = (fieldType) => {
    const iconMap = {
      'text': <ListIcon />,
      'number': <NumberIcon />,
      'date': <DateIcon />,
      'select': <ListIcon />,
      'multiselect': <ListIcon />,
      'email': <EmailIcon />,
      'user': <PersonIcon />
    };
    return iconMap[fieldType] || <ListIcon />;
  };

  // API'den gelen icon string'ini frontend component'ine dönüştür
  const mapApiIconToFrontend = (iconName) => {
    if (!iconName) return 'Assignment';
    
    const iconMap = {
      'bug': 'BugReport',
      'task': 'Assignment',
      'story': 'Timeline',
      'epic': 'Flag'
    };
    return iconMap[iconName.toLowerCase()] || 'Assignment';
  };

  // Frontend icon string'ini API'ye gönderilecek formata dönüştür
  const mapFrontendIconToApi = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.apiValue : 'task';
  };

  const getIcon = (iconName) => {
    const iconMap = {
      BugReport: <BugReport />,
      Assignment: <Assignment />,
      Timeline: <Timeline />,
      Flag: <Flag />
    };
    return iconMap[iconName] || <Assignment />;
  };

  const handleOpen = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || '',
        icon: type.icon,
        color: type.color
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        icon: 'Assignment',
        color: '#4F46E5'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingType(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Form validation
      if (!formData.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Issue type name is required',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // API'ye gönderilecek veriyi hazırla
      const issueTypeData = {
        name: formData.name,
        description: formData.description || null,
        icon: mapFrontendIconToApi(formData.icon),
        color: formData.color
      };

      console.log('Sending data to API:', issueTypeData);
      
      let result;
      
      if (editingType) {
        // Güncelleme işlemi
        result = await issueTypeService.update(editingType.id, issueTypeData);
        
        if (result && result.data) {
          console.log('Update response:', result.data);
          
          // UI'daki veriyi güncelle
          setIssueTypes(prev => prev.map(type => 
            type.id === editingType.id 
              ? { 
                  ...type, 
                  name: formData.name,
                  description: formData.description,
                  icon: formData.icon,
                  color: formData.color
                }
              : type
          ));
          
          setSnackbar({
            open: true,
            message: 'Issue type updated successfully',
            severity: 'success'
          });
        }
      } else {
        // Yeni oluşturma işlemi
        result = await issueTypeService.create(issueTypeData);
        
        if (result && result.data) {
          console.log('Create response:', result.data);
          
          // Yeni oluşturulan veriyi API'den alınan ID ile ekle
          const newType = {
            id: result.data.typeId,
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
            customFields: []
          };
          
          setIssueTypes(prev => [...prev, newType]);
          
          setSnackbar({
            open: true,
            message: 'Issue type created successfully',
            severity: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error saving issue type:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to save issue type'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue type?')) {
      return;
    }
    
    try {
      setLoading(true);
      await issueTypeService.delete(id);
      setIssueTypes(prev => prev.filter(type => type.id !== id));
      setSnackbar({
        open: true,
        message: 'Issue type deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting issue type:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to delete issue type'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  

  const closeFieldsDialog = () => {
    setFieldsDialogOpen(false);
    setSelectedTypeForFields(null);
  };

  const toggleCustomField = (fieldId) => {
    if (!selectedTypeForFields) return;

    setSelectedTypeForFields(prev => {
      const currentFields = prev.customFields || [];
      const hasField = currentFields.includes(fieldId);
      
      return {
        ...prev,
        customFields: hasField 
          ? currentFields.filter(id => id !== fieldId)
          : [...currentFields, fieldId]
      };
    });
  };

  const fetchTypeCustomFields = async (typeId) => {
  try {
    const response = await issueTypeService.getCustomFields(typeId);
    
    if (!response || !response.data) {
      console.warn(`No custom fields found for issue type ${typeId}`);
      return [];
    }
    
    console.log(`Custom fields for issue type ${typeId}:`, response.data);
    
    // API'den gelen custom field'ları ID listesine dönüştür
    const customFieldIds = response.data.map(cf => cf.customFieldId);
    return customFieldIds;
  } catch (err) {
    console.error(`Failed to fetch custom fields for issue type ${typeId}:`, err);
    return [];
  }
};

  const saveCustomFields = async () => {
  try {
    if (!selectedTypeForFields) return;
    
    setLoading(true);
    
    // API'ye gönderilecek veriyi hazırla
    const customFieldsData = {
      issueTypeId: selectedTypeForFields.id,
      customFields: (selectedTypeForFields.customFields || []).map((fieldId, index) => ({
        customFieldId: fieldId,
        isRequired: getCustomFieldById(fieldId)?.required || false,
        displayOrder: index
      }))
    };
    
    console.log('Sending custom fields data to API:', customFieldsData);
    
    // API çağrısı
    await issueTypeService.updateCustomFields(selectedTypeForFields.id, customFieldsData);
    
    // UI'daki veriyi güncelle
    setIssueTypes(prev => prev.map(type => 
      type.id === selectedTypeForFields.id
        ? { ...type, customFields: selectedTypeForFields.customFields }
        : type
    ));
    
    setSnackbar({
      open: true,
      message: 'Custom fields updated successfully',
      severity: 'success'
    });
    
    closeFieldsDialog();
  } catch (error) {
    console.error('Error saving custom fields:', error);
    setSnackbar({
      open: true,
      message: `Error: ${error.message || 'Failed to save custom fields'}`,
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};

const openFieldsDialog = async (type) => {
  setLoading(true);
  try {
    // API'den bu issue type için custom field'ları çek
    const customFieldIds = await fetchTypeCustomFields(type.id);
    
    // State'i güncelle
    setSelectedTypeForFields({
      ...type,
      customFields: customFieldIds
    });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    setSnackbar({
      open: true,
      message: `Error: ${error.message || 'Failed to fetch custom fields'}`,
      severity: 'error'
    });
    setSelectedTypeForFields(type);
  } finally {
    setLoading(false);
    setFieldsDialogOpen(true);
  }
};

  const getCustomFieldById = (id) => {
    return customFields.find(field => field.id === id);
  };

  const getFieldTypeColor = (type) => {
    const colors = {
      text: '#4F46E5',
      number: '#059669',
      date: '#7C3AED',
      select: '#EA580C',
      multiselect: '#DC2626',
      email: '#0891B2',
      user: '#BE185D'
    };
    return colors[type] || '#4F46E5';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  if (loading && issueTypes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.875rem',
              color: '#111827',
              mb: 0.5,
              fontFamily: 'inherit'
            }}
          >
            Issue Types
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6B7280',
              fontSize: '1rem',
              fontWeight: 400,
              fontFamily: 'inherit'
            }}
          >
            Configure issue types and their custom fields
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={() => handleOpen()}
          sx={{
            backgroundColor: '#4F46E5',
            '&:hover': { backgroundColor: '#4338CA' },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            fontFamily: 'inherit'
          }}
        >
          Add Issue Type
        </Button>
      </Box>

      {/* Error message if API fetch failed */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={(e, v) => setTabValue(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            fontFamily: 'inherit'
          }
        }}
      >
        <Tab label="Issue Types" />
        <Tab label="Field Configuration" />
      </Tabs>

      {/* Issue Types Grid */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {issueTypes.length === 0 ? (
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  border: '1px dashed #D1D5DB',
                  borderRadius: 3
                }}
              >
                <Typography color="text.secondary">
                  No issue types found. Click "Add Issue Type" to create one.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            issueTypes.map((type) => (
              <Grid item xs={12} sm={6} lg={4} key={type.id}>
                <Card 
                  sx={{ 
                    height: 280,
                    width: '100%',
                    maxWidth: 360,
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box 
                        sx={{ 
                          color: type.color, 
                          fontSize: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: `${type.color}15`
                        }}
                      >
                        {getIcon(type.icon)}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            color: '#111827',
                            mb: 0.5,
                            fontFamily: 'inherit'
                          }}
                        >
                          {type.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#6B7280',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            fontFamily: 'inherit',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {type.description || 'No description'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Custom Fields */}
                    <Box mb={2} sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#374151',
                          mb: 1.5,
                          fontFamily: 'inherit'
                        }}
                      >
                        Custom Fields ({(type.customFields || []).length})
                      </Typography>
                      <Box display="flex" gap={0.75} flexWrap="wrap">
                        {(type.customFields || []).slice(0, 3).map(fieldId => {
                          const field = getCustomFieldById(fieldId);
                          return field ? (
                            <Chip
                              key={fieldId}
                              label={field.name}
                              size="small"
                              sx={{
                                backgroundColor: `${getFieldTypeColor(field.type)}15`,
                                color: getFieldTypeColor(field.type),
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                height: 24,
                                fontFamily: 'inherit',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          ) : null;
                        })}
                        {(type.customFields || []).length > 3 && (
                          <Chip
                            label={`+${(type.customFields || []).length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              height: 24,
                              fontFamily: 'inherit',
                              borderColor: '#D1D5DB',
                              color: '#6B7280'
                            }}
                          />
                        )}
                        {(type.customFields || []).length === 0 && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#9CA3AF',
                              fontSize: '0.75rem',
                              fontStyle: 'italic'
                            }}
                          >
                            No custom fields configured
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box display="flex" gap={1} mt="auto">
                      <Button
                        size="small"
                        startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
                        onClick={() => openFieldsDialog(type)}
                        variant="outlined"
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.8125rem',
                          py: 1,
                          borderColor: '#D1D5DB',
                          color: '#374151',
                          '&:hover': {
                            borderColor: '#9CA3AF',
                            backgroundColor: '#F9FAFB'
                          },
                          fontFamily: 'inherit'
                        }}
                      >
                        Configure
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(type)}
                        sx={{
                          color: '#6B7280',
                          '&:hover': {
                            backgroundColor: '#F3F4F6',
                            color: '#374151'
                          }
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(type.id)}
                        sx={{
                          color: '#6B7280',
                          '&:hover': {
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626'
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Field Configuration Table */}
      {tabValue === 1 && (
        <Paper 
          sx={{ 
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', fontFamily: 'inherit' }}>
                    Issue Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', fontFamily: 'inherit' }}>
                    Custom Fields
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', fontFamily: 'inherit' }}>
                    Required Fields
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', fontFamily: 'inherit' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issueTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No issue types found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  issueTypes.map((type) => {
                    const typeFields = (type.customFields || [])
                      .map(id => getCustomFieldById(id))
                      .filter(Boolean);
                    const requiredFields = typeFields.filter(field => field.required);
                    
                    return (
                      <TableRow key={type.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box 
                              sx={{ 
                                color: type.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                backgroundColor: `${type.color}15`
                              }}
                            >
                              {getIcon(type.icon)}
                            </Box>
                            <Box>
                              <Typography 
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {type.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#6B7280',
                                  fontSize: '0.75rem',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {type.description || 'No description'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {typeFields.length > 0 ? (
                              typeFields.map(field => (
                                <Chip
                                  key={field.id}
                                  label={field.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${getFieldTypeColor(field.type)}15`,
                                    color: getFieldTypeColor(field.type),
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    height: 24,
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No custom fields
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontSize: '0.875rem',
                              color: '#374151',
                              fontFamily: 'inherit'
                            }}
                          >
                            {requiredFields.length} of {typeFields.length} required
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
                            onClick={() => openFieldsDialog(type)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 500,
                              fontSize: '0.8125rem',
                              color: '#4F46E5',
                              '&:hover': {
                                backgroundColor: '#EEF2FF'
                              },
                              fontFamily: 'inherit'
                            }}
                          >
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add/Edit Issue Type Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#111827',
          fontFamily: 'inherit'
        }}>
          {editingType ? 'Edit Issue Type' : 'Add Issue Type'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Type Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
                            sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }
              }}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '0.875rem', fontFamily: 'inherit' }}>
                Icon
              </InputLabel>
              <Select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                label="Icon"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '0.875rem',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {iconOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      {option.component}
                      <Typography sx={{ fontSize: '0.875rem', fontFamily: 'inherit' }}>
                        {option.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  fontFamily: 'inherit'
                }}
              >
                Color
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                {colorOptions.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: color,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: formData.color === color ? `3px solid ${color}` : '2px solid #E5E7EB',
                      boxShadow: formData.color === color ? '0 0 0 2px #fff, 0 0 0 4px #E5E7EB' : 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 3, backgroundColor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  fontFamily: 'inherit'
                }}
              >
                Preview
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box 
                  sx={{ 
                    color: formData.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: `${formData.color}15`
                  }}
                >
                  {getIcon(formData.icon)}
                </Box>
                <Typography 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#111827',
                    fontFamily: 'inherit'
                  }}
                >
                  {formData.name || 'Issue Type Name'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#6B7280',
              fontFamily: 'inherit'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 3,
              fontFamily: 'inherit'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              editingType ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Fields Configuration Dialog */}
      <Dialog 
        open={fieldsDialogOpen} 
        onClose={closeFieldsDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#111827',
          fontFamily: 'inherit'
        }}>
          Configure Custom Fields - {selectedTypeForFields?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#111827',
                  fontFamily: 'inherit'
                }}
              >
                Available Custom Fields
              </Typography>
              {customFields.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No custom fields available. Please create custom fields first.
                </Alert>
              ) : (
                <FormGroup>
                  {customFields.map((field) => (
                    <FormControlLabel
                      key={field.id}
                      control={
                        <Checkbox
                          checked={(selectedTypeForFields?.customFields || []).includes(field.id)}
                          onChange={() => toggleCustomField(field.id)}
                          sx={{ color: '#4F46E5' }}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                            <Box sx={{ color: getFieldTypeColor(field.type), fontSize: 20 }}>
                              {field.icon}
                            </Box>
                            <Typography 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: '#111827',
                                fontFamily: 'inherit'
                              }}
                            >
                              {field.name}
                            </Typography>
                            {field.required && (
                              <Chip 
                                label="Required" 
                                size="small" 
                                sx={{
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  height: 20,
                                  fontFamily: 'inherit'
                                }}
                              />
                            )}
                          </Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6B7280',
                              fontSize: '0.75rem',
                              fontFamily: 'inherit'
                            }}
                          >
                            {field.description} • Type: {field.type}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        mb: 2,
                        alignItems: 'flex-start',
                        '& .MuiFormControlLabel-label': {
                          width: '100%'
                        }
                      }}
                    />
                  ))}
                </FormGroup>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#111827',
                  fontFamily: 'inherit'
                }}
              >
                Selected Fields Preview
              </Typography>
              <Box 
                sx={{ 
                  p: 3, 
                  border: '1px solid #E5E7EB', 
                  borderRadius: 2, 
                  backgroundColor: '#F9FAFB',
                  minHeight: 200
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#374151',
                    fontFamily: 'inherit'
                  }}
                >
                  Fields for {selectedTypeForFields?.name}
                </Typography>
                {!selectedTypeForFields || (selectedTypeForFields?.customFields || []).length === 0 ? (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#9CA3AF',
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      mt: 4,
                      fontFamily: 'inherit'
                    }}
                  >
                    No custom fields selected
                  </Typography>
                ) : (
                  <List dense sx={{ p: 0 }}>
                    {(selectedTypeForFields?.customFields || []).map(fieldId => {
                      const field = getCustomFieldById(fieldId);
                      return field ? (
                        <ListItem 
                          key={fieldId}
                          sx={{ 
                            px: 0,
                            py: 1,
                            borderBottom: '1px solid #E5E7EB',
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <Box sx={{ color: getFieldTypeColor(field.type), mr: 2, fontSize: 20 }}>
                            {field.icon}
                          </Box>
                          <ListItemText
                            primary={
                              <Typography 
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {field.name}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  color: '#6B7280',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {field.type}
                              </Typography>
                            }
                          />
                          {field.required && (
                            <Chip 
                              label="Required" 
                              size="small" 
                              sx={{
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                height: 20,
                                fontFamily: 'inherit'
                              }}
                            />
                          )}
                        </ListItem>
                      ) : null;
                    })}
                  </List>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={closeFieldsDialog}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#6B7280',
              fontFamily: 'inherit'
            }}
          >
            Close
          </Button>
          <Button 
            onClick={saveCustomFields} 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 3,
              fontFamily: 'inherit'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Save Configuration'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueTypesAdmin;