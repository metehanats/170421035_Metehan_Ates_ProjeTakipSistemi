import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Tabs, Tab,
  Alert, Snackbar
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Email as EmailIcon,
  Phone as PhoneIcon, AdminPanelSettings as AdminIcon,
  Person as UserIcon, Block as BlockIcon, CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { userService } from '../../services/api';

const UsersAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '', 
    password: '',
    roleId: 1, 
    isActive: true
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userService.getAll();
        // API response formatını kontrol et
        const usersData = Array.isArray(response) ? response : (response.data || []);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const roles = [
    { value: 1, label: 'Administrator', color: '#E53E3E', icon: <AdminIcon /> },
    { value: 2, label: 'User', color: '#3182CE', icon: <UserIcon /> },
  ];

  const handleOpen = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        password: '', // Password boş bırakılır edit işleminde
        roleId: user.roleId || 1,
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        fullName: '',
        email: '', 
        password: '',
        roleId: 1, 
        isActive: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Form validation
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (!editingUser && !formData.password) {
        setError('Password is required for new users.');
        setLoading(false);
        return;
      }

      // FullName'i otomatik oluştur
      const updatedFormData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim()
      };

      if (editingUser) {
        // Update the user via the API
        const response = await userService.update(editingUser.userId, updatedFormData);
        const updatedUser = response.data || response;
        setUsers(prev => prev.map(user => (user.userId === updatedUser.userId ? updatedUser : user)));
        setSuccess('User updated successfully!');
      } else {
        // Create a new user via the API
        const response = await userService.create(updatedFormData);
        const newUser = response.data || response;
        setUsers(prev => [...prev, newUser]);
        setSuccess('User created successfully!');
      }
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(`Failed to ${editingUser ? 'update' : 'create'} user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        setError('');
        await userService.delete(userId);
        setUsers(prev => prev.filter(user => user.userId !== userId));
        setSuccess('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        setError(`Failed to delete user: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const user = users.find(u => u.userId === userId);
      const updatedData = { 
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId,
        isActive: !user.isActive 
      };
      
      const response = await userService.update(userId, updatedData);
      const updatedUser = response.data || response;
      setUsers(prev => prev.map(user => (user.userId === userId ? updatedUser : user)));
      setSuccess(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(`Failed to update user status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleId) => {
    return roles.find(r => r.value === roleId) || roles[1];
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return 'Invalid date';
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.roleId === 1).length;

  return (
    <Box>
      {/* Header and Add User Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">Users</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage user accounts and permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
          disabled={loading}
        >
          Add User
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: '#3182CE' }}>
                  <UserIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: '#38A169' }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: '#E53E3E' }}>
                  <AdminIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {adminUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administrators
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: '#FF8B00' }}>
                  <UserIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {users.filter(u => u.roleId === 2).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regular Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User List Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roleInfo = getRoleInfo(user.roleId);
                  return (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ backgroundColor: roleInfo.color }}>
                            {getInitials(user.fullName)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">{user.fullName || 'Unnamed User'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{user.email || 'No email'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={roleInfo.label} 
                          size="small" 
                          sx={{ 
                            backgroundColor: `${roleInfo.color}20`, 
                            color: roleInfo.color 
                          }} 
                          icon={roleInfo.icon} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={user.isActive ? 'success' : 'error'} 
                          icon={user.isActive ? <ActiveIcon /> : <BlockIcon />} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleUserStatus(user.userId)} 
                          color={user.isActive ? 'error' : 'success'}
                          disabled={loading}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <BlockIcon /> : <ActiveIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpen(user)}
                          disabled={loading}
                          title="Edit User"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(user.userId)} 
                          color="error"
                          disabled={loading}
                          title="Delete User"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField 
              fullWidth 
              label="First Name" 
              value={formData.firstName} 
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
              margin="normal" 
              required 
              disabled={loading}
            />
            <TextField 
              fullWidth 
              label="Last Name" 
              value={formData.lastName} 
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
              margin="normal" 
              required 
              disabled={loading}
            />
            <TextField 
              fullWidth 
              label="Email" 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              margin="normal" 
              required 
              disabled={loading}
            />
            {!editingUser && (
              <TextField 
                fullWidth 
                label="Password" 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                margin="normal" 
                required 
                disabled={loading}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select 
                value={formData.roleId} 
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} 
                label="Role"
                disabled={loading}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: role.color }}>{role.icon}</Box>
                      {role.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel 
              control={
                <Switch 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={loading}
                />
              } 
              label="Active User" 
              sx={{ mt: 2 }} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersAdmin;