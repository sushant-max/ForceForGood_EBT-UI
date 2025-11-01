import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Building2, Users, Key, CheckCircle, XCircle, AlertCircle, FileText, Clock, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

const LoadingSkeleton: React.FC<{ type: 'text' | 'card', count?: number, className?: string }> = ({ type, count = 1, className = '' }) => {
  const Card = () => (
    <div className={`bg-white rounded-xl shadow p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-2/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
  const Text = () => <div className={`h-6 bg-gray-200 rounded animate-pulse ${className}`} />;

  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        type === 'card' ? <Card key={i} /> : <Text key={i} />
      ))}
    </>
  );
};

// Placeholder for error state
const ErrorAlert: React.FC<{ message: string, onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-md flex items-start justify-between">
    <div className="flex items-center">
      <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-bold">Error Loading Data</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
    <button
      onClick={onRetry}
      className="ml-4 flex-shrink-0 text-sm font-medium text-red-700 hover:text-red-900 focus:outline-none"
    >
      <RefreshCw className="h-4 w-4 inline mr-1" />
      Retry
    </button>
  </div>
);

// Placeholder for empty state
const EmptyState: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
    <div className="mx-auto w-12 h-12 text-gray-400 mb-4">{icon}</div>
    <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

// --- Interface Definitions ---

interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface Document {
  id: string;
  name: string;
  uploadedAt: string | Date | FirebaseTimestamp;
  status: 'approved' | 'pending' | 'rejected';
  url?: string;
  type:string;

}

interface Corporate {
  id: string;
  corporate_id: string;
  corporate_name: string;
  // corporate_email: string;
  contact_number: number | string;
  address: string;
  gst_number: string;
  pan_number: string;
  documents: Document[];
  license_quota: number;
  created_at: FirebaseTimestamp;
  updated_at: FirebaseTimestamp;
  expiry_at: FirebaseTimestamp; // The new key for license expiry date
  status: 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected';
  volunteers: number; 
  rejectionDate: string,
  rejectionReason: string,
  approvalDate: string,
  
  // Mapped/Merged properties from Users collection
  admin_name: string; // Mapped from Users
  admin_email: string; // Mapped from Users

  // These are required by the UI but calculated from other fields:
  name: string; // Mapped from corporate_name
  joinedDate: string; // Mapped from created_at (for UI consistency)
  licenseExpiryDate: string; // Mapped from expiry_at (for UI consistency)
  
  // Omitted other large objects for brevity in snippet but kept in type
  auditTrail?: any[]; 
  notes?: any[];
}


export const CorporateDetail: React.FC = () => {
  const {getToken} = useAuth();
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
  const [isProcessing, setIsProcessing] = useState(false); // For Approve/Reject buttons
  const API_BASE_URL = 'https://us-central1-test-donate-tags.cloudfunctions.net/corporateManagementApi';


  // --- Utility Functions ---

  const formatDate = (dateInput: string | Date | FirebaseTimestamp) => {
    let date: Date;

    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (dateInput && typeof (dateInput as FirebaseTimestamp)._seconds === 'number') {
      // Handle Firebase Timestamp object structure
      date = new Date((dateInput as FirebaseTimestamp)._seconds * 1000);
    } else {
      return 'N/A';
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

const isExpiringWithin90Days = (expiryTimestamp: Timestamp | null | undefined): boolean => {
    // Check if the timestamp object exists and has the _seconds property
    if (!expiryTimestamp || !expiryTimestamp._seconds) {
        return false; // Not expiring, or date is not set (e.g., pending)
    }
    
    // Get the expiry date from seconds
    const expiryDate = new Date(expiryTimestamp._seconds * 1000); 
    
    // Calculate the date 90 days from now
    const today = new Date();
    const ninetyDaysFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    
    // Check if expiryDate is before the date 90 days from now
    // And ensure it's a future date
    return expiryDate.getTime() > today.getTime() && expiryDate.getTime() < ninetyDaysFromNow.getTime();
};

  /**
   * Checks if the license expiry date is today or in the past (expired).
   * This is the critical check for enabling the renewal button.
   * @param expiryTimestamp Firebase Timestamp object
   * @returns boolean
   */
const isExpiredOrExpiresToday = (expiryTimestamp: Timestamp | null | undefined): boolean => {
    // 1. Null-Safety Check: Return false immediately if the timestamp object is missing or invalid.
    if (!expiryTimestamp || typeof expiryTimestamp._seconds !== 'number' || expiryTimestamp._seconds <= 0) {
        return false;
    }

    // 2. Calculation: Convert the timestamp to a Date object.
    const expiryDate = new Date(expiryTimestamp._seconds * 1000); 

    // 3. Define Today's Date: Get the current date at the start of the day (00:00:00).
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // 4. Define Tomorrow's Date: Get tomorrow's date at the start of the day (00:00:00).
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 5. Comparison: Check if the expiryDate is less than tomorrow's date.
    // This means the expiry date is today (before 23:59:59) or any day in the past.
    return expiryDate.getTime() < tomorrow.getTime();
};

  const getStatusBadge = (status: Corporate['status']) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const statusIcons = {
      active: <CheckCircle className="h-4 w-4 mr-1" />,
      pending: <AlertCircle className="h-4 w-4 mr-1" />,
      inactive: <XCircle className="h-4 w-4 mr-1" />,
      terminated: <XCircle className="h-4 w-4 mr-1" />,
      rejected: <XCircle className="h-4 w-4 mr-1" />,
    };
    const styleKey = (status === 'terminated' || status === 'rejected') ? 'terminated' : status;
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[styleKey]}`}>
        {statusIcons[styleKey]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>;
  };


  // --- Data Fetching and Mutation ---

  useEffect(() => {
    fetchCorporateDetails();
  }, [id]);

  const fetchCorporateDetails = async () => {
    if (!id) {
      setError('Corporate ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = `${API_BASE_URL}/admin/corporates/${id}`;

    try {
      const token = getToken();
      const response = await fetch(endpoint, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const corporateDataFromApi = data;

      // **MAPPING BACKEND DATA TO FRONTEND INTERFACE**
      // Note: We use corporate_name for the primary 'name' display
      const mappedCorporate: Corporate = {
        ...corporateDataFromApi,
        id: corporateDataFromApi.id, // Firestore doc ID
        name: corporateDataFromApi.corporate_name || `Corporate ${corporateDataFromApi.corporate_id}`,
        // Map UI-specific date formats from Timestamp objects
        joinedDate: formatDate(corporateDataFromApi.created_at),
        licenseExpiryDate: formatDate(corporateDataFromApi.expiry_at),
        
        // Ensure arrays exist, even if empty from API
        documents: corporateDataFromApi.documents || [],
        license_quota: corporateDataFromApi.license_quota || 0,

        // Ensure status is valid
        status: corporateDataFromApi.status as Corporate['status'] || 'pending',
      };

      setCorporate(mappedCorporate);

    } catch (err) {
      console.error('Failed to fetch corporate details:', err);
      setError((err as Error).message || 'Failed to load corporate details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!corporate || corporate.status !== 'pending' || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    const endpoint = `${API_BASE_URL}/admin/corporates/${corporate.corporate_id}`; // Use corporate_id for the API route

    try {
      const token = getToken();
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'approve' })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Failed to approve corporate. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Success: Refetch data to update status and license expiry date
      await fetchCorporateDetails();

    } catch (err) {
      console.error('Failed to approve corporate:', err);
      setError(`Approval failed: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!corporate || corporate.status !== 'pending' || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    const endpoint = `${API_BASE_URL}/admin/corporates/${corporate.corporate_id}`;

    try {
      const token = getToken();
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject' })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Failed to reject corporate. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Success: Refetch data to update status
      await fetchCorporateDetails();

    } catch (err) {
      console.error('Failed to reject corporate:', err);
      setError(`Rejection failed: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewLicenses = async () => {
    if (!corporate || isProcessing) return;

    // Check again before processing to ensure it's expired
    if (!isExpiredOrExpiresToday(corporate.expiry_at)) {
        console.warn("Attempted renewal on a non-expired license. UI button should have been disabled.");
        setError("Licenses can only be renewed after the current license has expired.");
        return;
    }

    setIsProcessing(true);
    setError(null);
    setShowRenewModal(false);
    const endpoint = `${API_BASE_URL}/admin/corporates/${corporate.corporate_id}`;

    try {
      const token = getToken();
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'renew_license' })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Failed to renew licenses. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Success: Refetch data to update the expiry date in the UI
      await fetchCorporateDetails();

      setRenewalSuccess(true);
      setTimeout(() => {
        setRenewalSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Failed to renew licenses:', err);
      setError(`License renewal failed: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- UI Rendering Logic ---

  const renderTabContent = () => {
    if (!corporate) return null;
    const expiryTimestamp = corporate.expiry_at;
    const isExpiring = isExpiringWithin90Days(expiryTimestamp);
    // CRITICAL: Check if the license is fully expired or expires today
    const isExpired = isExpiredOrExpiresToday(expiryTimestamp); 

    let expiryStatusText = '';
    let expiryStatusColor = 'text-gray-700';

    if (isExpired) {
      expiryStatusText = 'LICENSE EXPIRED. Renewal required.';
      expiryStatusColor = 'text-red-600 font-bold';
    } else if (isExpiring) {
      expiryStatusText = 'Expiring soon (within 90 days).';
      expiryStatusColor = 'text-amber-600';
    }

    switch (activeTab) {
      case 'overview':
        return <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  Corporate Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium">
                      {corporate.address}
                      {/* Assuming city, state, postal code are available based on previous snippet */}
                      {/* {corporate.city}, {corporate.state_province} {corporate.postal_code} */}
                    </p>
                    {/* <p className="text-sm font-medium">{corporate.country}</p> */}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(corporate.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST/PAN</p>
                    <p className="text-sm font-medium">GST: {corporate.gst_number || 'N/A'}</p>
                    <p className="text-sm font-medium">PAN: {corporate.pan_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  Primary Contact / Admin
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium">
                      {corporate.admin_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">
                      {corporate.admin_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium">
                      {corporate.contact_number || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  License & Usage
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-50 text-purple-600 mr-3">
                      <Key size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Licenses Quota</p>
                      <p className="text-lg font-semibold">
                        {corporate.license_quota}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-50 text-green-600 mr-3">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Licenses Used (Volunteers)</p>
                      <p className="text-lg font-semibold">
                        {corporate.volunteers}
                      </p>
                    </div>
                  </div>
                  {corporate.license_quota > 0 && <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">
                        License utilization: {corporate.volunteers} /{' '}
                        {corporate.license_quota}(
                        {Math.round(corporate.volunteers / corporate.license_quota * 100)}
                        %)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className={`bg-[#466EE5] h-2.5 rounded-full`} style={{
                      width: `${corporate.volunteers > 0 ? Math.min(100, Math.round(corporate.volunteers / corporate.license_quota * 100)) : 0}%`
                    }}></div>
                      </div>
                    </div>}
                  {/* License Expiry Information */}
                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">License Expiry</p>
                    <p className={`text-sm font-medium ${expiryStatusColor}`}>
                      {(isExpiring || isExpired) && <AlertCircle className="h-4 w-4 inline mr-1" />}
                      {formatDate(expiryTimestamp)}
                      <span className="text-xs ml-2 text-gray-500">{expiryStatusText}</span>
                    </p>
                    
                    {/* RENEWAL BUTTON LOGIC: Enabled only if status is active AND license is expired (isExpired = true) */}
                    {corporate.status === 'inactive' && <div className="mt-3">
                        <button 
                            onClick={() => setShowRenewModal(true)} 
                            disabled={isProcessing || !isExpired} // KEY FIX: Disabled if processing OR if NOT expired
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                            title={isExpired ? "Renew expired licenses" : "Renewal is only available after the license expires."}
                        >
                          {isProcessing ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                          Renew Licenses
                        </button>
                        {!isExpired && <p className="text-xs text-gray-500 mt-1">
                            The license must be expired before renewal is permitted.
                          </p>}
                      </div>}
                    {renewalSuccess && <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Licenses successfully renewed
                      </div>}
                  </div>
                </div>
              </div>
            </div>
            {/* {(corporate.status === 'pending' || corporate.status === 'rejected') && <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  {corporate.status === 'pending' ? 'Approval Actions' : 'Review Actions'}
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button onClick={handleApprove} disabled={isProcessing} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve
                  </button>
                  <button onClick={handleReject} disabled={isProcessing} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request More Info
                  </button>
                </div>
              </div>} */}
          </div>;
      case 'documents':
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <p className="text-sm text-gray-500 mt-1">
          Corporate documents and verification files
        </p>
      </div>

      {corporate.documents.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {corporate.documents.map((doc, index) => (
            <li key={index} className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-3">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.type || 'Untitled Document'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">

                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-sm font-medium text-[#466EE5] hover:text-[#3355cc]"
                    >
                      View
                    </a>
                  ) : (
                    <span className="ml-4 text-sm text-gray-400 italic">
                      No link available
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-6">
          <EmptyState
            title="No documents"
            description="This corporate has not uploaded any documents yet."
            icon={<FileText className="h-12 w-12 text-gray-400" />}
          />
        </div>
      )}
    </div>
  );

    }
  };
  if (loading) {
    return <div className="space-y-6 p-6 md:p-10">
        <div className="flex items-center">
          <Link to="/corporate-management" className="text-[#466EE5] hover:text-[#3355cc] inline-flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Corporates
          </Link>
        </div>
        <LoadingSkeleton type="text" count={1} className="w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={3} />
        </div>
        <LoadingSkeleton type="card" className="h-64" />
      </div>;
  }
  if (error) {
    return <div className="space-y-6 p-6 md:p-10">
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
    return <div className="space-y-6 p-6 md:p-10">
        <div className="flex items-center">
          <Link to="/corporate-management" className="text-[#466EE5] hover:text-[#3355cc] inline-flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Corporates
          </Link>
        </div>
        <EmptyState title="Corporate not found" description="The corporate you are looking for does not exist or has been removed." icon={<Building2 className="h-12 w-12 text-gray-400" />} />
      </div>;
  }
  return <div className="p-6 md:p-10 space-y-6">
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
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button onClick={() => setActiveTab('overview')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={activeTab === 'overview' ? 'page' : undefined}>
              Overview
            </button>
            <button onClick={() => setActiveTab('documents')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={activeTab === 'documents' ? 'page' : undefined}>
              Documents ({corporate.documents.length})
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
                      Are you sure you want to renew {corporate.volunteers} licenses for {corporate.name}? The new expiry date will be one year from today.
                    </p>
                    <div className="mt-4 bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">
                          Current expiry date:
                        </span>
                        <span>{formatDate(corporate.expiry_at)}</span>
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
                <button type="button" disabled={isProcessing} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:col-start-2 sm:text-sm" onClick={handleRenewLicenses}>
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
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
