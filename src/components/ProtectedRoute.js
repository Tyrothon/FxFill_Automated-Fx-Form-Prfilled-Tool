import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Render login screen directly when unauthenticated to avoid blank screen issues
    return <LoginPage />;
  }

  return children;
};

export default ProtectedRoute;