import React, { useEffect, useState } from 'react';
import { Key, Calendar, Download } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { ChartContainer } from '../components/ChartContainer';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'


export const LicensesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetchLicenses();
  }, []);
  const fetchLicenses = async () => {
    setLoading(true);
    setError(null);
    try {

      const response = await axios.get(
        `https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/license-details/${user?.corporateId}`
      );
      const date  = response.data.expiryAt;
      const rawDate = date;
        let dateObj: Date
        if (typeof rawDate === 'string') {
          const [month, day, year] = rawDate.split('/')
          dateObj = new Date(Number(year), Number(month) - 1, Number(day))
        } else if (
          rawDate &&
          typeof rawDate === 'object' &&
          Object.prototype.toString.call(rawDate) === '[object Date]'
        ) {
          dateObj = rawDate as Date
        } else {
          dateObj = new Date()
        }
      const finalDate =  dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      response.data.expiryAt = finalDate;

      setStats(response.data);
    } catch (err) {
      console.error('Failed to license data:', err);
      setError('Failed to load license data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Licenses Dashboard
        </h1>
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      {error && <ErrorAlert message={error} onRetry={fetchLicenses} />}
      {loading ? <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoadingSkeleton type="chart" />
            <LoadingSkeleton type="chart" />
          </div>
          <LoadingSkeleton type="table" />
        </> : <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
                  <Key size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Quota</p>
                  <p className="text-2xl font-bold">{stats?.quota || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#ECFDF5] text-green-600 mr-4">
                  <Key size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold">{stats?.active || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#FEF3C7] text-amber-600 mr-4">
                  <Key size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold">{stats?.inactive || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#FEE2E2] text-red-600 mr-4">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiring At</p>
                  <p className="text-2xl font-bold">{stats?.expiryAt || ''}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="License Status Distribution" type="bar" />
            <ChartContainer title="License Usage Over Time" type="line" />
          </div>
        </>}
    </div>;
};