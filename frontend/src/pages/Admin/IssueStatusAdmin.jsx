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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { issueStatusService } from '../../services/api';

const IssueStatusAdmin = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    order: 1,
    description: '',
    color: '#3B82F6'
  });

  const colorOptions = [
    '#6B7280', '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
  ];

  // API'den statüleri çekme
  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await issueStatusService.getAll();
      
      if (!response || !response.data) {
        throw new Error('Invalid API response');
      }
      
      console.log('API response for issue statuses:', response.data);
      
      // API'den gelen verileri frontend formatına dönüştür
      const formattedStatuses = response.data.map(status => ({
        id: status.statusId,
        name: status.name || '',
        order: status.order || 1,
        description: status.description || '',
        color: status.color || '#3B82F6',
        category: status.category || null
      }));
      
      setStatuses(formattedStatuses);
    } catch (err) {
      console.error('Failed to fetch issue statuses:', err);
      setError('Failed to load issue statuses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatus = (status = null) => {
    if (status) {
      setEditingStatus(status);
      setFormData({
        name: status.name,
        order: status.order,
        description: status.description || '',
        color: status.color || '#3B82F6'
      });
    } else {
      setEditingStatus(null);
      // Yeni statü için sıra numarasını mevcut en yüksek sıra + 1 olarak ayarla
      const maxOrder = statuses.length > 0 
        ? Math.max(...statuses.map(s => s.order)) 
        : 0;
      
      setFormData({
        name: '',
        order: maxOrder + 1,
        description: '',
        color: '#3B82F6'
      });
    }
    setOpen(true);
  };

  const handleCloseStatus = () => {
    setOpen(false);
    setEditingStatus(null);
  };

  const handleSaveStatus = async () => {
    try {
      setLoading(true);
      
      // Form validation
      if (!formData.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Status name is required',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // API'ye gönderilecek veriyi hazırla
      const statusData = {
        name: formData.name,
        order: formData.order,
        description: formData.description || null,
        color: formData.color
      };

      console.log('Sending data to API:', statusData);
      
      let result;
      
      if (editingStatus) {
        // Güncelleme işlemi
        result = await issueStatusService.update(editingStatus.id, statusData);
        
        if (result && result.data) {
          console.log('Update response:', result.data);
          
          // UI'daki veriyi güncelle
          setStatuses(prev => prev.map(status => 
            status.id === editingStatus.id 
              ? { 
                  ...status, 
                  name: formData.name,
                  order: formData.order,
                  description: formData.description,
                  color: formData.color
                }
              : status
          ));
          
          setSnackbar({
            open: true,
            message: 'Issue status updated successfully',
            severity: 'success'
          });
        }
      } else {
        // Yeni oluşturma işlemi
        result = await issueStatusService.create(statusData);
        
        if (result && result.data) {
          console.log('Create response:', result.data);
          
          // Yeni oluşturulan veriyi API'den alınan ID ile ekle
          const newStatus = {
            id: result.data.statusId,
            name: formData.name,
            order: formData.order,
            description: formData.description,
            color: formData.color
          };
          
          setStatuses(prev => [...prev, newStatus]);
          
          setSnackbar({
            open: true,
            message: 'Issue status created successfully',
            severity: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error saving issue status:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to save issue status'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseStatus();
    }
  };

  const handleDeleteStatus = async (id) => {
    if (!window.confirm('Are you sure you want to delete this status?')) {
      return;
    }
    
    try {
      setLoading(true);
      await issueStatusService.delete(id);
      setStatuses(prev => prev.filter(status => status.id !== id));
      setSnackbar({
        open: true,
        message: 'Issue status deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting issue status:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to delete issue status'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  if (loading && statuses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      p: 3
    }}>
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
              fontWeight: 600,
              fontSize: '28px',
              color: '#1a1a1a',
              mb: 1,
              fontFamily: 'inherit'
            }}
          >
            Issue Statuses
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666666',
              fontSize: '16px',
              fontWeight: 400,
              fontFamily: 'inherit'
            }}
          >
            Manage issue statuses for your workflow
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={() => handleOpenStatus()}
          sx={{
            backgroundColor: '#4F46E5',
            '&:hover': { backgroundColor: '#4338CA' },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontFamily: 'inherit'
          }}
        >
          Add Status
        </Button>
      </Box>

      {/* Error message if API fetch failed */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Status Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statuses.length === 0 ? (
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
                No issue statuses found. Click "Add Status" to create one.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          statuses.map((status) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={status.id}>
              <Card 
                sx={{ 
                  height: 180,
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
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: status.color || '#3B82F6',
                          flexShrink: 0
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '16px',
                          color: '#1a1a1a',
                          fontFamily: 'inherit'
                        }}
                      >
                        {status.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`Order: ${status.order}`}
                      size="small"
                      sx={{
                        backgroundColor: `${status.color || '#3B82F6'}15`,
                        color: status.color || '#3B82F6',
                        fontSize: '12px',
                        fontWeight: 500,
                        height: 20,
                        fontFamily: 'inherit'
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666666',
                      fontSize: '14px',
                      mb: 2,
                      flexGrow: 1,
                      fontFamily: 'inherit'
                    }}
                  >
                    {status.description || 'No description'}
                  </Typography>

                  {/* Actions */}
                  <Box display="flex" justifyContent="flex-end" gap={1} mt="auto">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenStatus(status)}
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
                      onClick={() => handleDeleteStatus(status.id)}
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

      {/* Status Table */}
      <Paper 
        sx={{ 
          border: '1px solid #E5E7EB',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '18px',
              color: '#1a1a1a',
              fontFamily: 'inherit'
            }}
          >
            All Statuses
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                  Order
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                  Color
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No issue statuses found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                statuses.sort((a, b) => a.order - b.order).map((status) => (
                  <TableRow key={status.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DragIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                          {status.order}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: status.color || '#3B82F6',
                          }}
                        />
                        <Typography 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#1a1a1a',
                            fontFamily: 'inherit'
                          }}
                        >
                          {status.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          fontSize: '14px',
                          color: '#666666',
                          fontFamily: 'inherit'
                        }}
                      >
                        {status.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: status.color || '#3B82F6',
                          borderRadius: '50%',
                          border: '1px solid #E5E7EB',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStatus(status)}
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
                        onClick={() => handleDeleteStatus(status.id)}
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Status Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseStatus} 
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
          fontWeight: 600,
          fontSize: '18px',
          color: '#1a1a1a',
          fontFamily: 'inherit'
        }}>
          {editingStatus ? 'Edit Status' : 'Add Status'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Status Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: 'inherit'
                }}
              >
                Status Color
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
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: 'inherit'
                }}
              >
                Preview
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: formData.color,
                  }}
                />
                <Typography 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '16px',
                    color: '#1a1a1a',
                    fontFamily: 'inherit'
                  }}
                >
                  {formData.name || 'Status Name'}
                </Typography>
                <Chip 
                  label={`Order: ${formData.order}`}
                  size="small"
                  sx={{
                    backgroundColor: `${formData.color}15`,
                    color: formData.color,
                    fontSize: '12px',
                    fontWeight: 500,
                    height: 20,
                    fontFamily: 'inherit'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseStatus}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: '#666666',
              fontFamily: 'inherit'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveStatus} 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              px: 3,
              fontFamily: 'inherit'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              editingStatus ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueStatusAdmin;
