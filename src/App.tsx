import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CorporateManagement } from './pages/CorporateManagement';
import { CorporateDetail } from './pages/CorporateDetail';
import { IndividualManagement } from './pages/IndividualManagement';
import { SignupRequests } from './pages/SignupRequests';
import { VolunteerManagement } from './pages/VolunteerManagement';
import { CorporateSignup } from './pages/CorporateSignup';
import { IndividualSignup } from './pages/IndividualSignup';
import { LicensesDashboard } from './pages/LicensesDashboard';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { ProtectedRoute } from './components/ProtectedRoute';
export function App() {
  return <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup/corporate" element={<CorporateSignup />} />
          <Route path="/signup/individual" element={<IndividualSignup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Protected Routes with role-based access */}
          <Route element={<ProtectedRoute>
                <Layout />
              </ProtectedRoute>}>
            {/* Super Admin and Corporate Admin Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'corporate_admin']}>
                  <Dashboard />
                </ProtectedRoute>} />
            <Route path="/volunteer-management" element={<ProtectedRoute allowedRoles={['super_admin', 'corporate_admin']}>
                  <VolunteerManagement />
                  
                </ProtectedRoute>} />


            {/* <Route path="/volunteer-management2" element={<ProtectedRoute allowedRoles={['super_admin', 'corporate_admin']}>
                  <VolunteerManagementOLD />
                </ProtectedRoute>} /> */}


            {/* Corporate Admin Only Routes */}
            <Route path="/licenses" element={<ProtectedRoute allowedRoles={['corporate_admin']}>
                  <LicensesDashboard />
                </ProtectedRoute>} />
            <Route path="/analytics-reports" element={<ProtectedRoute allowedRoles={['corporate_admin']}>
                  <AnalyticsReports />
                </ProtectedRoute>} />
            {/* Super Admin Only Routes */}
            <Route path="/corporate-management" element={<ProtectedRoute allowedRoles={['super_admin']}>
                  <CorporateManagement />
                </ProtectedRoute>} />
            <Route path="/corporate-management/:id" element={<ProtectedRoute allowedRoles={['super_admin']}>
                  <CorporateDetail />
                </ProtectedRoute>} />
            <Route path="/individual-management" element={<ProtectedRoute allowedRoles={['super_admin']}>
                  <IndividualManagement />
                </ProtectedRoute>} />
            <Route path="/signup-requests" element={<ProtectedRoute allowedRoles={['super_admin']}>
                  <SignupRequests />
                </ProtectedRoute>} />
          </Route>
          {/* Redirect root to appropriate dashboard based on role */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>;
}