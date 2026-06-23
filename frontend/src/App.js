import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import OffresPage from './pages/OffresPage';
import LoginPage from './pages/LoginPage';
import MesCandidaturesPage from './pages/MesCandidaturesPage';
import PostulerPage from './pages/PostulerPage';
import AdminDashboard from './pages/AdminDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import UserDashboard from './pages/UserDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { authenticated, initialized } = useAuth();
  
  console.log('🛡️ ProtectedRoute check - initialized:', initialized, 'authenticated:', authenticated);
  console.log('🔍 Current timestamp:', new Date().toISOString());
  
  if (!initialized) {
    console.log('⏳ Still initializing, showing loading...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!authenticated) {
    console.log('❌ Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Authenticated, rendering protected content');
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        {/* ✅ Router au niveau racine — stable, ne se recrée pas */}
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Role-based dashboard selector
const DashboardSelector = () => {
  const { hasRole } = useAuth();
  
  if (hasRole('ADMIN')) {
    return <AdminDashboard />;
  } else if (hasRole('RECRUITER')) {
    return <RecruiterDashboard />;
  } else {
    return <UserDashboard />;
  }
};

function AppContent() {
  const { initialized, authenticated } = useAuth();

  if (!initialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - Role-based dashboards */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy route for backwards compatibility */}
        <Route 
          path="/offres" 
          element={
            <ProtectedRoute>
              <OffresPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/postuler/:id"
          element={
            <ProtectedRoute>
              <PostulerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-candidatures"
          element={
            <ProtectedRoute>
              <MesCandidaturesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/offres"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/candidatures"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            authenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
