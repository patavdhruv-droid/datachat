import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';
import InsightsPage from './pages/InsightsPage';
import SavedAnalysesPage from './pages/SavedAnalysesPage';
import DatasetDetailsPage from './pages/DatasetDetailsPage';
import DocsPage from './pages/DocsPage';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analysis/:id" element={<ProtectedRoute><NewAnalysis /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/analyses" element={<ProtectedRoute><SavedAnalysesPage /></ProtectedRoute>} />
        <Route path="/dataset/:id" element={<ProtectedRoute><DatasetDetailsPage /></ProtectedRoute>} />
        <Route path="/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;