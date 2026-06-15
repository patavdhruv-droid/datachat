import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // While checking auth status, show a loading spinner
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Loader2 size={32} className="spin" />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          Loading DataChat...
        </p>
      </div>
    );
  }

  // If user is NOT logged in, redirect to /login
  // Save the page they tried to visit so we can send them back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in — show the protected page
  return children;
};

export default ProtectedRoute;