// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { MainLayout } from './components/Layout';
import Login from './pages/Login';
import Profile from './pages/Profile'; // Profile import eklendi
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Issues from './pages/Issues';
import Sprints from './pages/Sprints';
import Board from './pages/Board';
import ProjectDetail from './components/ProjectDetail';
import ProjectBoards from './components/ProjectBoards';
import AdminLayout from '../src/components/Admin/AdminLayout';
import AdminDashboard from '../src/pages/Admin/AdminDashboard';
import IssueTypesAdmin from '../src/pages/Admin/IssueTypesAdmin';
import IssueStatusAdmin from './pages/Admin/IssueStatusAdmin';
import WorkflowsAdmin from './pages/Admin/WorkflowsAdmin';
import CustomFieldsAdmin from './pages/Admin/CustomFieldsAdmin';
import UsersAdmin from './pages/Admin/UsersAdmin';
import EmailSettingsAdmin from './pages/Admin/EmailSettingsAdmin';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0052CC',
    },
    secondary: {
      main: '#36B37E',
    },
    background: {
      default: '#F4F5F7',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? <Navigate to="/" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      
      <Route path="/project/:projectId" element={
        <ProtectedRoute>
          <ProjectDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/project/:projectId/boards" element={
        <ProtectedRoute>
          <ProjectBoards />
        </ProtectedRoute>
      } />
      
      <Route path="/issues" element={
        <ProtectedRoute>
          <Issues />
        </ProtectedRoute>
      } />
      
      <Route path="/issues/:issueId" element={
        <ProtectedRoute>
          <Issues />
        </ProtectedRoute>
      } />
      
      <Route path="/sprints" element={
        <ProtectedRoute>
          <Sprints />
        </ProtectedRoute>
      } />
      
      <Route path="/boards/:issueTypeId" element={
        <ProtectedRoute>
          <Board />
        </ProtectedRoute>
      } />
      
      <Route path="/board/:issueTypeId" element={
        <ProtectedRoute>
          <Board />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/issue-types" element={
        <AdminProtectedRoute>
          <IssueTypesAdmin />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/issue-status" element={
        <AdminProtectedRoute>
          <IssueStatusAdmin />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/workflows" element={
        <AdminProtectedRoute>
          <WorkflowsAdmin />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/custom-fields" element={
        <AdminProtectedRoute>
          <CustomFieldsAdmin />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <AdminProtectedRoute>
          <UsersAdmin />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/email-settings" element={
        <AdminProtectedRoute>
          <EmailSettingsAdmin />
        </AdminProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;