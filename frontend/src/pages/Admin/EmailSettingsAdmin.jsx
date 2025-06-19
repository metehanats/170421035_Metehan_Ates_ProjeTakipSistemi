import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Science as TestIcon, 
  History as HistoryIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

const EmailSettingsAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  const [smtpSettings, setSmtpSettings] = useState({
    enabled: true,
    host: 'smtp.company.com',
    port: 587,
    username: 'noreply@company.com',
    password: '••••••••',
    encryption: 'TLS',
    fromName: 'Issue Tracker System',
    fromEmail: 'noreply@company.com'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    issueCreated: true,
    issueUpdated: true,
    issueAssigned: true,
    issueCompleted: true,
    commentAdded: true,
    statusChanged: true,
    priorityChanged: false,
    dueDateReminder: true
  });

  const [emailTemplates] = useState([
    {
      id: 1,
      name: 'Issue Created',
      subject: 'New Issue Created: {{issue.title}}',
      description: 'Sent when a new issue is created',
      lastModified: '2024-01-28',
      active: true
    },
    {
      id: 2,
      name: 'Issue Assigned',
      subject: 'Issue Assigned to You: {{issue.title}}',
      description: 'Sent when an issue is assigned to a user',
      lastModified: '2024-01-25',
      active: true
    },
    {
      id: 3,
      name: 'Issue Updated',
      subject: 'Issue Updated: {{issue.title}}',
      description: 'Sent when an issue is updated',
      lastModified: '2024-01-22',
      active: true
    },
    {
      id: 4,
      name: 'Issue Completed',
      subject: 'Issue Completed: {{issue.title}}',
      description: 'Sent when an issue is marked as completed',
      lastModified: '2024-01-20',
      active: false
    }
  ]);

  const [emailHistory] = useState([
    {
      id: 1,
      recipient: 'john.doe@company.com',
      subject: 'New Issue Created: Login Bug',
      template: 'Issue Created',
      status: 'Delivered',
      sentAt: '2024-01-28 14:30',
      deliveredAt: '2024-01-28 14:31'
    },
    {
      id: 2,
      recipient: 'jane.smith@company.com',
      subject: 'Issue Assigned to You: UI Enhancement',
      template: 'Issue Assigned',
      status: 'Delivered',
      sentAt: '2024-01-28 13:15',
      deliveredAt: '2024-01-28 13:16'
    },
    {
      id: 3,
      recipient: 'mike.johnson@company.com',
      subject: 'Issue Updated: Performance Issue',
      template: 'Issue Updated',
      status: 'Failed',
      sentAt: '2024-01-28 12:00',
      deliveredAt: null,
      error: 'SMTP connection timeout'
    }
  ]);

  const handleSmtpChange = (field, value) => {
    setSmtpSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestEmail = () => {
    setTestDialogOpen(true);
  };

  const sendTestEmail = () => {
    // Test email logic here
    setTestDialogOpen(false);
    // Show success message
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Failed': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Email Settings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Configure email notifications and SMTP settings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<TestIcon />}
          onClick={handleTestEmail}
        >
          Test Email
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="SMTP Configuration" icon={<SettingsIcon />} />
        <Tab label="Notifications" icon={<NotificationIcon />} />
        <Tab label="Email Templates" icon={<EmailIcon />} />
        <Tab label="Email History" icon={<HistoryIcon />} />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  SMTP Server Configuration
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={smtpSettings.enabled}
                      onChange={(e) => handleSmtpChange('enabled', e.target.checked)}
                    />
                  }
                  label="Enable Email Notifications"
                  sx={{ mb: 3 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      value={smtpSettings.host}
                      onChange={(e) => handleSmtpChange('host', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Port"
                      type="number"
                      value={smtpSettings.port}
                      onChange={(e) => handleSmtpChange('port', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={smtpSettings.username}
                      onChange={(e) => handleSmtpChange('username', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={smtpSettings.password}
                      onChange={(e) => handleSmtpChange('password', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!smtpSettings.enabled}>
                      <InputLabel>Encryption</InputLabel>
                      <Select
                        value={smtpSettings.encryption}
                        onChange={(e) => handleSmtpChange('encryption', e.target.value)}
                        label="Encryption"
                      >
                        <MenuItem value="None">None</MenuItem>
                        <MenuItem value="TLS">TLS</MenuItem>
                        <MenuItem value="SSL">SSL</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Sender Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="From Name"
                      value={smtpSettings.fromName}
                      onChange={(e) => handleSmtpChange('fromName', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="From Email"
                      type="email"
                      value={smtpSettings.fromEmail}
                      onChange={(e) => handleSmtpChange('fromEmail', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" startIcon={<SendIcon />}>
                    Save SMTP Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Connection Status
                </Typography>
                
                <Alert severity={smtpSettings.enabled ? "success" : "warning"} sx={{ mb: 2 }}>
                  {smtpSettings.enabled ? "SMTP is enabled" : "SMTP is disabled"}
                </Alert>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Test: January 28, 2024 14:30
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status: Connection successful
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emails sent today: 23
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Notification Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configure which events should trigger email notifications
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Issue Events
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.issueCreated}
                      onChange={(e) => handleNotificationChange('issueCreated', e.target.checked)}
                    />
                  }
                  label="Issue Created"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.issueUpdated}
                      onChange={(e) => handleNotificationChange('issueUpdated', e.target.checked)}
                    />
                  }
                  label="Issue Updated"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.issueAssigned}
                      onChange={(e) => handleNotificationChange('issueAssigned', e.target.checked)}
                    />
                  }
                  label="Issue Assigned"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.issueCompleted}
                      onChange={(e) => handleNotificationChange('issueCompleted', e.target.checked)}
                    />
                  }
                  label="Issue Completed"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Activity Events
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.commentAdded}
                      onChange={(e) => handleNotificationChange('commentAdded', e.target.checked)}
                    />
                  }
                  label="Comment Added"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.statusChanged}
                      onChange={(e) => handleNotificationChange('statusChanged', e.target.checked)}
                    />
                  }
                  label="Status Changed"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.priorityChanged}
                      onChange={(e) => handleNotificationChange('priorityChanged', e.target.checked)}
                    />
                  }
                  label="Priority Changed"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.dueDateReminder}
                      onChange={(e) => handleNotificationChange('dueDateReminder', e.target.checked)}
                    />
                  }
                  label="Due Date Reminder"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained">
                Save Notification Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Email Templates
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTemplateDialogOpen(true)}
              >
                Add Template
              </Button>
            </Box>

            <List>
              {emailTemplates.map((template) => (
                <ListItem key={template.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight="bold">{template.name}</Typography>
                        <Chip
                          label={template.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={template.active ? 'success' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Subject: {template.subject}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Last modified: {template.lastModified}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => setTemplateDialogOpen(true)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {tabValue === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Email History
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Recent email notifications sent by the system
            </Typography>

            <List>
              {emailHistory.map((email) => (
                <ListItem key={email.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight="bold">{email.subject}</Typography>
                        <Chip
                          label={email.status}
                          size="small"
                          color={getStatusColor(email.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          To: {email.recipient} • Template: {email.template}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sent: {email.sentAt}
                          {email.deliveredAt && ` • Delivered: ${email.deliveredAt}`}
                          {email.error && ` • Error: ${email.error}`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Test Email Address"
            type="email"
            defaultValue="admin@company.com"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Subject"
            defaultValue="Test Email from Issue Tracker"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            defaultValue="This is a test email to verify SMTP configuration."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button onClick={sendTestEmail} variant="contained">
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Email Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            defaultValue="Issue Created"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Subject"
            defaultValue="New Issue Created: {{issue.title}}"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email Body"
            multiline
            rows={8}
            defaultValue="A new issue has been created..."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setTemplateDialogOpen(false)} variant="contained">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailSettingsAdmin;
