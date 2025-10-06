import React, { useEffect, useState } from 'react';
import { Plus, Key, Building2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
interface LicenseAllocation {
  id: string;
  corporateId: string;
  corporate: string;
  totalLicenses: number;
  usedLicenses: number;
  allocatedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}
export const LicenseManagement: React.FC = () => {
  const [allocations, setAllocations] = useState<LicenseAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  useEffect(() => {
    fetchLicenseAllocations();
  }, []);
  const fetchLicenseAllocations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock data
      const mockAllocations: LicenseAllocation[] = [{
        id: '1',
        corporateId: '1',
        corporate: 'TechGiant Inc.',
        totalLicenses: 100,
        usedLicenses: 85,
        allocatedDate: '2023-01-15',
        expiryDate: '2024-01-15',
        status: 'active'
      }, {
        id: '2',
        corporateId: '2',
        corporate: 'Global Finance Ltd',
        totalLicenses: 75,
        usedLicenses: 72,
        allocatedDate: '2023-02-22',
        expiryDate: '2024-02-22',
        status: 'active'
      }, {
        id: '3',
        corporateId: '3',
        corporate: 'Acme Corporation',
        totalLicenses: 50,
        usedLicenses: 45,
        allocatedDate: '2023-03-10',
        expiryDate: '2024-03-10',
        status: 'active'
      }, {
        id: '4',
        corporateId: '4',
        corporate: 'Oceanic Airlines',
        totalLicenses: 30,
        usedLicenses: 0,
        allocatedDate: '2023-05-05',
        expiryDate: '2024-05-05',
        status: 'pending'
      }, {
        id: '5',
        corporateId: '5',
        corporate: 'Universal Systems',
        totalLicenses: 25,
        usedLicenses: 25,
        allocatedDate: '2022-05-18',
        expiryDate: '2023-05-18',
        status: 'expired'
      }];
      setAllocations(mockAllocations);
    } catch (err) {
      console.error('Failed to fetch license allocations:', err);
      setError('Failed to load license data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAllocation = (allocation: LicenseAllocation) => {
    // In a real app, this would call an API
    setAllocations(prev => prev.filter(a => a.id !== allocation.id));
  };
  const columns = [{
    header: 'Corporate',
    accessor: 'corporate',
    sortable: true
  }, {
    header: 'Total Licenses',
    accessor: 'totalLicenses',
    sortable: true
  }, {
    header: 'Used Licenses',
    accessor: (row: LicenseAllocation) => {
      return `${row.usedLicenses} (${Math.round(row.usedLicenses / row.totalLicenses * 100)}%)`;
    }
  }, {
    header: 'Utilization',
    accessor: (row: LicenseAllocation) => {
      return <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${row.status === 'expired' ? 'bg-gray-500' : row.usedLicenses / row.totalLicenses > 0.8 ? 'bg-amber-500' : 'bg-[#466EE5]'}`} style={{
          width: `${row.usedLicenses / row.totalLicenses * 100}%`
        }}></div>
          </div>;
    }
  }, {
    header: 'Allocated Date',
    accessor: (row: LicenseAllocation) => {
      const date = new Date(row.allocatedDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    sortable: true
  }, {
    header: 'Expiry Date',
    accessor: (row: LicenseAllocation) => {
      const date = new Date(row.expiryDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    sortable: true
  }, {
    header: 'Status',
    accessor: (row: LicenseAllocation) => {
      const statusStyles = {
        active: 'bg-green-100 text-green-800',
        expired: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
      };
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>;
    }
  }];
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          License Management
        </h1>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
          <Plus className="h-4 w-4 mr-2" />
          Allocate Licenses
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
              <Key size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Licenses</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : allocations.reduce((sum, item) => sum + item.totalLicenses, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#ECFDF5] text-green-600 mr-4">
              <Key size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Licenses</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : allocations.reduce((sum, item) => item.status === 'active' ? sum + item.usedLicenses : sum, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#F3F4F6] text-gray-600 mr-4">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Corporates</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : new Set(allocations.map(a => a.corporateId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchLicenseAllocations} />}

      {loading ? <LoadingSkeleton type="table" /> : allocations.length === 0 ? <EmptyState title="No license allocations" description="Get started by allocating licenses to a corporate partner." actionLabel="Allocate Licenses" onAction={() => setShowAddModal(true)} icon={<Key className="h-12 w-12 text-gray-400" />} /> : <DataTable columns={columns} data={allocations} keyField="id" onDelete={handleDeleteAllocation} searchable pagination />}
    </div>;
};