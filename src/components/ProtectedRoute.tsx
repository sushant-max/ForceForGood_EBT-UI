import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['super_admin', 'corporate_admin']
}) => {
  const {
    isAuthenticated,
    loading,
    user,
    hasPermission
  } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#466EE5]"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{
      from: location
    }} replace />;
  }
  // Check if user has permission to access this route
  if (!hasPermission(allowedRoles)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'super_admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === 'corporate_admin') {
      return <Navigate to="/licenses" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  return <>{children}</>;
};