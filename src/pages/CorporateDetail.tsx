import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Building2, Users, Key, CheckCircle, XCircle, AlertCircle, FileText, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
interface Corporate {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  licenses: number;
  volunteers: number;
  joinedDate: string;
  lastActivity: string;
  licenseExpiryDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: 'approved' | 'pending' | 'rejected';
  }[];
  auditTrail: {
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details?: string;
  }[];
  notes: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }[];
}
export const CorporateDetail: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [corporate, setCorporate] = useState<Corporate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  useEffect(() => {
    fetchCorporateDetails();
  }, [id]);
  const fetchCorporateDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock data
      if (id === '1') {
        setCorporate({
          id: '1',
          name: 'TechGiant Inc.',
          status: 'active',
          address: '123 Tech Blvd',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
          licenses: 100,
          volunteers: 85,
          joinedDate: '2023-01-15',
          lastActivity: '2023-05-20',
          licenseExpiryDate: '2024-01-15',
          contactName: 'John Smith',
          contactEmail: 'john.smith@techgiant.com',
          contactPhone: '+1 (555) 123-4567',
          documents: [{
            id: 'd1',
            name: 'MOU Document',
            type: 'pdf',
            uploadedAt: '2023-01-10',
            status: 'approved'
          }, {
            id: 'd2',
            name: 'Company Registration',
            type: 'pdf',
            uploadedAt: '2023-01-10',
            status: 'approved'
          }, {
            id: 'd3',
            name: 'Tax Document',
            type: 'pdf',
            uploadedAt: '2023-01-10',
            status: 'approved'
          }],
          auditTrail: [{
            id: 'a1',
            action: 'Corporate approved',
            performedBy: 'Admin User',
            timestamp: '2023-01-15T10:30:00Z',
            details: 'Corporate application approved'
          }, {
            id: 'a2',
            action: 'Licenses allocated',
            performedBy: 'Admin User',
            timestamp: '2023-01-16T14:45:00Z',
            details: 'Allocated 100 licenses'
          }, {
            id: 'a3',
            action: 'Document uploaded',
            performedBy: 'John Smith',
            timestamp: '2023-02-20T09:15:00Z',
            details: 'Uploaded quarterly report'
          }],
          notes: [{
            id: 'n1',
            author: 'Admin User',
            content: 'Initial meeting went well. They are planning to onboard 200+ volunteers over the next quarter.',
            timestamp: '2023-01-20T11:00:00Z'
          }, {
            id: 'n2',
            author: 'Admin User',
            content: 'Follow-up call scheduled for next month to discuss license utilization.',
            timestamp: '2023-02-05T15:30:00Z'
          }]
        });
      } else if (id === '2') {
        setCorporate({
          id: '2',
          name: 'Global Finance Ltd',
          status: 'active',
          address: '456 Finance Ave',
          city: 'New York',
          state: 'NY',
          postalCode: '10004',
          country: 'USA',
          licenses: 75,
          volunteers: 72,
          joinedDate: '2023-02-22',
          lastActivity: '2023-05-18',
          licenseExpiryDate: '2023-08-22',
          contactName: 'Sarah Johnson',
          contactEmail: 'sarah.j@globalfinance.com',
          contactPhone: '+1 (555) 987-6543',
          documents: [{
            id: 'd1',
            name: 'MOU Document',
            type: 'pdf',
            uploadedAt: '2023-02-15',
            status: 'approved'
          }, {
            id: 'd2',
            name: 'Company Registration',
            type: 'pdf',
            uploadedAt: '2023-02-15',
            status: 'approved'
          }, {
            id: 'd3',
            name: 'Tax Document',
            type: 'pdf',
            uploadedAt: '2023-02-15',
            status: 'approved'
          }],
          auditTrail: [{
            id: 'a1',
            action: 'Corporate approved',
            performedBy: 'Admin User',
            timestamp: '2023-02-22T09:00:00Z',
            details: 'Corporate application approved'
          }, {
            id: 'a2',
            action: 'Licenses allocated',
            performedBy: 'Admin User',
            timestamp: '2023-02-23T11:30:00Z',
            details: 'Allocated 75 licenses'
          }],
          notes: [{
            id: 'n1',
            author: 'Admin User',
            content: 'They have a strong ESG program and are looking to expand their volunteer initiatives.',
            timestamp: '2023-02-25T14:15:00Z'
          }]
        });
      } else {
        // For other IDs, create a generic response
        setCorporate({
          id: id || '0',
          name: `Corporate ${id}`,
          status: 'pending',
          address: '789 Corporate St',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'USA',
          licenses: 0,
          volunteers: 0,
          joinedDate: '2023-05-01',
          lastActivity: '2023-05-01',
          licenseExpiryDate: '2024-05-01',
          contactName: 'Contact Person',
          contactEmail: 'contact@corporate.com',
          contactPhone: '+1 (555) 555-5555',
          documents: [{
            id: 'd1',
            name: 'MOU Document',
            type: 'pdf',
            uploadedAt: '2023-05-01',
            status: 'pending'
          }],
          auditTrail: [{
            id: 'a1',
            action: 'Corporate application submitted',
            performedBy: 'System',
            timestamp: '2023-05-01T12:00:00Z'
          }],
          notes: []
        });
      }
    } catch (err) {
      console.error('Failed to fetch corporate details:', err);
      setError('Failed to load corporate details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = () => {
    if (corporate) {
      setCorporate({
        ...corporate,
        status: 'active',
        auditTrail: [{
          id: `a${corporate.auditTrail.length + 1}`,
          action: 'Corporate approved',
          performedBy: 'Admin User',
          timestamp: new Date().toISOString(),
          details: 'Corporate application approved'
        }, ...corporate.auditTrail]
      });
    }
  };
  const handleReject = () => {
    if (corporate) {
      setCorporate({
        ...corporate,
        status: 'inactive',
        auditTrail: [{
          id: `a${corporate.auditTrail.length + 1}`,
          action: 'Corporate rejected',
          performedBy: 'Admin User',
          timestamp: new Date().toISOString(),
          details: 'Corporate application rejected'
        }, ...corporate.auditTrail]
      });
    }
  };
  const handleRenewLicenses = () => {
    if (corporate) {
      // Calculate new expiry date (1 year from now)
      const currentDate = new Date();
      const newExpiryDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)).toISOString().split('T')[0];
      // Update corporate with new expiry date
      setCorporate({
        ...corporate,
        licenseExpiryDate: newExpiryDate,
        auditTrail: [{
          id: `a${corporate.auditTrail.length + 1}`,
          action: 'Licenses renewed',
          performedBy: 'Admin User',
          timestamp: new Date().toISOString(),
          details: `Renewed ${corporate.licenses} licenses until ${formatDate(newExpiryDate)}`
        }, ...corporate.auditTrail]
      });
      // Show success message and close modal
      setRenewalSuccess(true);
      setShowRenewModal(false);
      // Reset success message after 3 seconds
      setTimeout(() => {
        setRenewalSuccess(false);
      }, 3000);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const isExpiringWithin90Days = (expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
  };
  const getStatusBadge = (status: 'active' | 'pending' | 'inactive') => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    const statusIcons = {
      active: <CheckCircle className="h-4 w-4 mr-1" />,
      pending: <AlertCircle className="h-4 w-4 mr-1" />,
      inactive: <XCircle className="h-4 w-4 mr-1" />
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>;
  };
  const renderTabContent = () => {
    if (!corporate) return null;
    switch (activeTab) {
      case 'overview':
        return <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Corporate Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium">
                      {corporate.address}, {corporate.city}, {corporate.state}{' '}
                      {corporate.postalCode}
                    </p>
                    <p className="text-sm font-medium">{corporate.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(corporate.joinedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Activity</p>
                    <p className="text-sm font-medium">
                      {formatDate(corporate.lastActivity)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Primary Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium">
                      {corporate.contactName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">
                      {corporate.contactEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium">
                      {corporate.contactPhone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  License & Volunteer Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-50 text-purple-600 mr-3">
                      <Key size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Licenses</p>
                      <p className="text-lg font-semibold">
                        {corporate.licenses}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-50 text-green-600 mr-3">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Volunteers</p>
                      <p className="text-lg font-semibold">
                        {corporate.volunteers}
                      </p>
                    </div>
                  </div>
                  {corporate.licenses > 0 && <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">
                        License utilization: {corporate.volunteers} /{' '}
                        {corporate.licenses}(
                        {Math.round(corporate.volunteers / corporate.licenses * 100)}
                        %)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className={`bg-[#466EE5] h-2.5 rounded-full`} style={{
                      width: `${corporate.volunteers > 0 ? Math.min(100, Math.round(corporate.volunteers / corporate.licenses * 100)) : 0}%`
                    }}></div>
                      </div>
                    </div>}
                  {/* License Expiry Information */}
                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">License Expiry</p>
                    <p className={`text-sm font-medium ${isExpiringWithin90Days(corporate.licenseExpiryDate) ? 'text-amber-600' : 'text-gray-700'}`}>
                      {isExpiringWithin90Days(corporate.licenseExpiryDate) && <AlertCircle className="h-4 w-4 inline mr-1 text-amber-600" />}
                      {formatDate(corporate.licenseExpiryDate)}
                      {isExpiringWithin90Days(corporate.licenseExpiryDate) && <span className="text-xs ml-2 text-amber-600">
                          (Expiring soon)
                        </span>}
                    </p>
                    {corporate.status === 'active' && <button onClick={() => setShowRenewModal(true)} className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Renew Licenses
                      </button>}
                    {renewalSuccess && <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Licenses successfully renewed
                      </div>}
                  </div>
                </div>
              </div>
            </div>
            {corporate.status === 'pending' && <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Approval Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button onClick={handleApprove} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button onClick={handleReject} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request More Info
                  </button>
                </div>
              </div>}
          </div>;
      case 'documents':
        return <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <p className="text-sm text-gray-500 mt-1">
                Corporate documents and verification files
              </p>
            </div>
            {corporate.documents.length > 0 ? <ul className="divide-y divide-gray-200">
                {corporate.documents.map(doc => <li key={doc.id} className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-3">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'approved' ? 'bg-green-100 text-green-800' : doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                        <button className="ml-4 text-sm font-medium text-[#466EE5] hover:text-[#3355cc]">
                          View
                        </button>
                      </div>
                    </div>
                  </li>)}
              </ul> : <div className="p-6">
                <EmptyState title="No documents" description="This corporate has not uploaded any documents yet." icon={<FileText className="h-12 w-12 text-gray-400" />} />
              </div>}
          </div>;
      default:
        return null;
    }
  };
  if (loading) {
    return <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/corporate-management" className="text-[#466EE5] hover:text-[#3355cc] inline-flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Corporates
          </Link>
        </div>
        <LoadingSkeleton type="text" count={1} className="w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
        <LoadingSkeleton type="card" className="h-64" />
      </div>;
  }
  if (error) {
    return <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/corporate-management" className="text-[#466EE5] hover:text-[#3355cc] inline-flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Corporates
          </Link>
        </div>
        <ErrorAlert message={error} onRetry={fetchCorporateDetails} />
      </div>;
  }
  if (!corporate) {
    return <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/corporate-management" className="text-[#466EE5] hover:text-[#3355cc] inline-flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Corporates
          </Link>
        </div>
        <EmptyState title="Corporate not found" description="The corporate you are looking for does not exist or has been removed." icon={<Building2 className="h-12 w-12 text-gray-400" />} />
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center">
        <Link to="/corporate-management" className="text-[#466EE5] hover:text-[#3355cc] inline-flex items-center">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Corporates
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              {corporate.name}
            </h1>
            <div className="mt-1">{getStatusBadge(corporate.status)}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button onClick={() => setActiveTab('overview')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={activeTab === 'overview' ? 'page' : undefined}>
              Overview
            </button>
            <button onClick={() => setActiveTab('documents')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={activeTab === 'documents' ? 'page' : undefined}>
              Documents
            </button>
          </nav>
        </div>
      </div>
      {renderTabContent()}
      {/* License Renewal Confirmation Modal */}
      {showRenewModal && <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowRenewModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <RefreshCw className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Renew Licenses
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to renew {corporate.licenses}{' '}
                      licenses for {corporate.name}? The new expiry date will be
                      one year from today.
                    </p>
                    <div className="mt-4 bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">
                          Current expiry date:
                        </span>
                        <span>{formatDate(corporate.licenseExpiryDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="font-medium text-gray-500">
                          New expiry date:
                        </span>
                        <span className="font-medium text-green-600">
                          {formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:col-start-2 sm:text-sm" onClick={handleRenewLicenses}>
                  Renew Licenses
                </button>
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:col-start-1 sm:text-sm" onClick={() => setShowRenewModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};