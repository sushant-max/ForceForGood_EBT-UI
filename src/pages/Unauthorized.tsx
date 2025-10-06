import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export const Unauthorized: React.FC = () => {
  const {
    user
  } = useAuth();
  // Determine home route based on user role
  const homeRoute = user?.role === 'corporate_admin' ? '/licenses' : '/dashboard';
  return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#111827] mb-2">
          Unauthorized Access
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Link to={homeRoute} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>;
};