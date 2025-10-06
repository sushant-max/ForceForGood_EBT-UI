import React from 'react';
import { Link } from 'react-router-dom';
export const NotFound: React.FC = () => {
  return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-[#466EE5]">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-[#111827]">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-500">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>;
};