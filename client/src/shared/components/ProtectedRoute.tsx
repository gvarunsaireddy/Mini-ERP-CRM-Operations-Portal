import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
