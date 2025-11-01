import React, { useEffect, useState } from 'react';
import { Plus, Building2, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Base URL for the API endpoint
const API_BASE_URL = "https://us-central1-test-donate-tags.cloudfunctions.net/corporateManagementApi/admin/corporates";

// Using the HTTPS endpoint for PUT/DELETE actions as typical for cloud functions
const API_ACTION_URL = "https://us-central1-test-donate-tags.cloudfunctions.net/corporateManagementApi/admin/corporates";

export interface Document {
  type: string;
  url: string;
}

export interface Corporate {
  id: string;
  corporate_id: string;
  corporate_name: string;
  corporate_email: string;
  contact_number: number | string;
  address: string;
  gst_number: string;
  pan_number: string;
  documents: Document[];
  licenses_used: number;
  license_quota: number;
  created_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  updated_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  expiry_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  status: 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected';
  // Additional properties for UI
  name?: string;
  adminEmail?: string;
  totalLicenses?: number;
  joinedDate?: string;
  adminName?: string;
  volunteers?: number; 

}

export const CorporateManagement: React.FC = () => {
  const {getToken} = useAuth();
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [editFormData, setEditFormData] = useState<{
    adminName: string;
    adminEmail: string;
    name: string;
    status: 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected';
  }>({
    adminName: '',
    adminEmail: '',
    name: '',
    status: 'active'
  });
  const [editFormErrors, setEditFormErrors] = useState<{
    adminName?: string;
    adminEmail?: string;
    name?: string;
  }>({});
  const [stats, setStats] = useState({
    totalLicenses: 0,
    activeLicenses: 0,
    totalCorporates: 0,
    activeCorporates: 0
  });
  const [licenseFormData, setLicenseFormData] = useState<{
    licenseCount: number;
  }>({
    licenseCount: 0
  });

  useEffect(() => {
    fetchCorporates();
  }, []);

  /**
   * FIX APPLIED: A robust function to safely parse the date regardless of its format 
   * (ISO string from server Date, or Timestamp object)
   */
  const parseDateSafely = (input: any): Date | null => {
      if (!input) return null;

      // Case 1: Firestore Timestamp structure { _seconds: number, _nanoseconds: number }
      if (typeof input === 'object' && input._seconds && typeof input._seconds === 'number') {
          return new Date(input._seconds * 1000);
      }
      
      // Case 2: ISO Date String (from server's Date object serialization) or YYYY-MM-DD string
      if (typeof input === 'string') {
          const date = new Date(input);
          if (!isNaN(date.getTime())) return date;
      }

      // Fallback for null/undefined or invalid formats
      return null;
  };

  const fetchCorporates = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}`,
        { headers: { Authorization : `Bearer ${token}` } }
      );

      // Filter out corporates with status 'pending'
      const corporatesData: Corporate[] = response.data
        .filter((corp: any) => {
          const status = (corp.status || '').toLowerCase();
          return status !== 'pending';
        })
        .map((corp: any) => {
          // Map status from API
          let status: 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected' = 'pending';
          if (corp.status) {
            const statusLower = corp.status.toLowerCase();
            if (['active', 'pending', 'inactive', 'terminated', 'rejected'].includes(statusLower)) {
              status = statusLower as 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected';
            }
          }

          return {
            id: corp.id,
            corporate_id: corp.corporate_id || corp.id,
            corporate_name: corp.corporate_name || corp.company || '',
            corporate_email: corp.corporate_email || corp.admin_email || '',
            contact_number: corp.contact_number || '',
            address: corp.address || '',
            gst_number: corp.gst_number || '',
            pan_number: corp.pan_number || '',
            documents: corp.documents || [],
            license_quota: corp.license_quota || corp.total_licenses || 0,
            volunteers: corp.volunteers || 0,
            updated_at: corp.updated_at || { _seconds: 0, _nanoseconds: 0 },
            expiry_at: corp.expiry_at || { _seconds: 0, _nanoseconds: 0 },
            status: status,
            // Additional UI properties
            name: corp.corporate_name || corp.company || '',
            adminEmail: corp.admin_email || '',
            totalLicenses: corp.license_quota || corp.total_licenses || 0,
            joinedDate: corp.approvalDate, // Set from the newly calculated joinedDate
            adminName: corp.admin_name || ''
          };
        });

      setCorporates(corporatesData);
      console.log("Fetched corporates:", corporatesData);

      // 📊 Dashboard stats
      // Only sum license_quota for active corporates
      const totalLicenses = corporatesData
        .filter(corp => corp.status === 'active')
        .reduce((sum, corp) => sum + (corp.license_quota || 0), 0);

      const activeLicenses = corporatesData.reduce(
        (sum, corp) => sum + (corp.volunteers || 0),
        0
      );

      const totalCorporates = corporatesData.length;

      const activeCorporates = corporatesData.filter(
        (corp) => corp.status === "active"
      ).length;

      setStats({
        totalLicenses,
        totalCorporates,
        activeCorporates,
        activeLicenses
      });
    } catch (err) {
      console.error("Failed to fetch corporates:", err);
      setError("Failed to load corporate data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * API INTEGRATION: Terminate Corporate (PUT /admin/corporates/:corporateId with action: 'terminate')
   * Only allow termination if the corporate is currently 'active'
   */
  const handleDeleteCorporate = async (corporate: Corporate) => {
    const confirmation = window.confirm(
      `Are you sure you want to deactivate ${corporate.corporate_name || 'this corporate'}?. It will revoke all the active license under the corporate`
    );
    if (!confirmation) return;

    try {
      const corporateId = corporate.corporate_id;
      const token = getToken();
      const response = await axios.put(
        `${API_ACTION_URL}/${corporateId}`,
        { action: 'inactive' },
        { headers: { 'Authorization' : `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        alert('Corporate deactivated successfully.');
        // Instead of removing, we update the status to 'inactive'
        setCorporates(prev => prev.map(c => 
          c.corporate_id === corporateId 
            ? { ...c, status: 'inactive' } // Change status to inactive
            : c
        ));
        fetchCorporates(); // Re-fetch data to update all stats and ensure consistency
      } else {
        alert(`Error terminating corporate: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error terminating corporate:', error);
      alert(`Failed to deactivate corporate. Error: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Unknown error'}`);
    }
  };

  const handleEditCorporate = (corporate: Corporate) => {
    setSelectedCorporate(corporate);
    setEditFormData({
      adminName: corporate.adminName || '',
      adminEmail: corporate.adminEmail || '',
      name: corporate.name || corporate.corporate_name,
      status: corporate.status
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const handleManageLicenses = (corporate: Corporate) => {
    setSelectedCorporate(corporate);
    setLicenseFormData({
      licenseCount: corporate.totalLicenses || corporate.license_quota || 0
    });
    setShowLicenseModal(true);
  };

  /**
   * API INTEGRATION: Update License Quota (PUT /admin/corporates/:corporateId with license_quota field)
   */
const handleLicenseUpdate = async () => {
    if (!selectedCorporate) return;
    
    // Determine the minimum required license count (active volunteers)
    const minActiveVolunteers = selectedCorporate.volunteers ?? selectedCorporate.licenses_used ?? 0;
    const newLicenseQuota = licenseFormData.licenseCount;

    // 🛑 NEW VALIDATION CHECK
    if (newLicenseQuota < minActiveVolunteers) {
        alert(`The new license allocation cannot be less than the current number of active volunteers i.e. ${minActiveVolunteers}`);
        return;
    }
    
    try {
      const corporateId = selectedCorporate.corporate_id;
      const newLicenseQuota = licenseFormData.licenseCount;
      const token = getToken();
      const response = await axios.put(
        `${API_ACTION_URL}/${corporateId}`,
        { license_quota: newLicenseQuota },
        { headers: { 'Authorization' : `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert('License quota updated successfully.');

        // Update local state to reflect the change
        const currentLicenses = selectedCorporate.totalLicenses || selectedCorporate.license_quota || 0;
        const licenseCountDifference = newLicenseQuota - currentLicenses;

        setCorporates(prev => prev.map(corp => 
          corp.corporate_id === corporateId 
            ? { ...corp, license_quota: newLicenseQuota, totalLicenses: newLicenseQuota } 
            : corp
        ));

        setStats(prev => ({
          ...prev,
          totalLicenses: prev.totalLicenses + licenseCountDifference
        }));
        
        setShowLicenseModal(false);
      } else {
        alert(`Error updating licenses: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating licenses:', error);
      alert(`Failed to update licenses. Error: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Unknown error'}`);
    }
  };

  const validateEditForm = () => {
    const errors: {
      adminName?: string;
      adminEmail?: string;
      name?: string;
    } = {};
    let isValid = true;
    if (!editFormData.adminName.trim()) {
      errors.adminName = 'Admin name is required';
      isValid = false;
    }
    if (!editFormData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editFormData.adminEmail)) {
      errors.adminEmail = 'Invalid email address';
      isValid = false;
    }
    if (!editFormData.name.trim()) {
      errors.name = 'Company name is required';
      isValid = false;
    }
    setEditFormErrors(errors);
    return isValid;
  };
/**
   * API INTEGRATION: Update Corporate Fields/Status (PUT /admin/corporates/:corporateId with fields/action)
   */
  const handleSaveEdit = async () => {
    if (!validateEditForm() || !selectedCorporate) return;

    try {
      const corporateId = selectedCorporate.corporate_id;
      const oldStatus = selectedCorporate.status;
      const newStatus = editFormData.status;
      
      const payload: { [key: string]: any } = {};
      
      // Determine if a status action is needed
      if (oldStatus !== newStatus) {
          
          const approvedFromStatuses = ['pending', 'terminated', 'rejected'];

          // 1. APPROVE Action: If status changes from pending/terminated/rejected -> active
          if (newStatus === 'active' && approvedFromStatuses.includes(oldStatus)) {
              payload.action = 'approve';
          } 
          // 2. TERMINATE Action: If status changes from active/inactive -> terminated
          else if (newStatus === 'terminated' && (oldStatus === 'active' || oldStatus === 'inactive')) {
              payload.action = 'terminate';
          }
          // 3. REJECT Action: If status changes from pending -> rejected
          else if (newStatus === 'rejected' && oldStatus === 'pending') {
              payload.action = 'reject';
          }
          // 4. INACTIVE Action: If status changes from pending -> rejected
          else if (newStatus === 'inactive' && oldStatus === 'active') {
              payload.action = 'inactive';
          }
          // 5. ACTIVE Action: If status changes from inactive -> active
          else if (newStatus === 'active' && oldStatus === 'inactive') {
              payload.action = 'active';
          }
          // 5. Simple Status Change: If no action was determined, send 'status' field for direct updates           
          else if (newStatus === 'pending' || newStatus === 'inactive') {
             // Only set status field if it's not an action
             if (!payload.action) {
                 payload.status = newStatus;
             }
          }
      }

      // Add non-status fields to the payload for a standard update
      if (editFormData.name !== selectedCorporate.corporate_name) payload.corporate_name = editFormData.name;
      if (editFormData.adminEmail !== selectedCorporate.adminEmail) payload.admin_email = editFormData.adminEmail;
      if (editFormData.adminName !== selectedCorporate.adminName) payload.admin_name = editFormData.adminName;

      // Check if we have any updates or an action
      if (Object.keys(payload).length === 0) {
          alert('No changes detected in editable fields or status.');
          setShowEditModal(false);
          return;
      }
      const token = getToken();
      const response = await axios.put(
        `${API_ACTION_URL}/${corporateId}`,
        payload,
        { headers: { 'Authorization' : `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert('Corporate details updated successfully.');
        
        // Update local state: status is read from API response if an action occurred
        setCorporates(prev => prev.map(corp => 
          corp.corporate_id === corporateId 
            ? {
                ...corp,
                adminName: editFormData.adminName, 
                adminEmail: editFormData.adminEmail, 
                corporate_email: editFormData.adminEmail, 
                name: editFormData.name, 
                corporate_name: editFormData.name, 
                // Use the status returned by the API (which is the final DB status), or the new status from the form if no action was taken
                status: response.data.status || editFormData.status, 
            } 
            : corp
        ));

        // Re-fetch to ensure all stats and dates are fresh, especially after an 'approve' action
        fetchCorporates(); 
        setShowEditModal(false);
      } else {
        alert(`Error saving changes: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving corporate changes:', error);
      alert(`Failed to save changes. Error: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Unknown error'}`);
    }
  };

  const columns = [
    {
      header: 'Admin Name',
      accessor: 'adminName',
      sortable: true
    },
    {
      header: 'Admin Email',
      accessor: 'adminEmail',
      sortable: true
    },
    {
      header: 'Company',
      accessor: 'name',
      sortable: true
    },
    {
      header: 'Status',
      accessor: (row: Corporate) => {
        const status = row.status.toLowerCase();
        const statusStyles: { [key: string]: string } = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          inactive: 'bg-gray-100 text-gray-800',
          terminated: 'bg-red-100 text-red-800',
          rejected: 'bg-orange-100 text-orange-800'
        };
        const statusIcons: { [key: string]: JSX.Element } = {
          active: <CheckCircle className="h-4 w-4 mr-1" />,
          pending: <AlertCircle className="h-4 w-4 mr-1" />,
          inactive: <XCircle className="h-4 w-4 mr-1" />,
          terminated: <XCircle className="h-4 w-4 mr-1" />,
          rejected: <XCircle className="h-4 w-4 mr-1" />
        };
        
        // Display friendly names
        const statusDisplayNames: { [key: string]: string } = {
          active: 'Active',
          pending: 'Pending',
          inactive: 'Inactive',
          terminated: 'Terminated',
          rejected: 'Rejected'
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.inactive}`}>
            {statusIcons[status] || statusIcons.inactive}
            {statusDisplayNames[status] || 'Unknown'}
          </span>
        );
      }
    },
    {
      header: 'Total Licenses',
      accessor: 'totalLicenses',
      sortable: true
    },
    {
      header: 'Joined',
      accessor: 'joinedDate',
      sortable: true
    }
  ];

  const renderActions = (corporate: Corporate) => (
    <div className="flex justify-end space-x-2">
      <Link to={`/corporate-management/${corporate.corporate_id}`} className="text-[#466EE5] hover:text-[#3355cc]" title="View Corporate" aria-label={`View ${corporate.corporate_name}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Link>
      <button onClick={() => handleManageLicenses(corporate)} className="text-purple-600 hover:text-purple-700" title="Update License" aria-label={`Manage licenses for ${corporate.corporate_name}`}>
        <Key className="h-5 w-5" />
      </button>
      <button onClick={() => handleEditCorporate(corporate)} className="text-amber-600 hover:text-amber-700" title="Edit Corporate" aria-label={`Edit ${corporate.corporate_name}`}>
        <Edit className="h-5 w-5" />
      </button>
      {/* Disable the delete button if corporate is already terminated to prevent confusion */}
      <button 
          onClick={() => handleDeleteCorporate(corporate)} 
          className={`h-5 w-5 ${corporate.status === 'inactive' || corporate.status === 'terminated' || corporate.status === 'rejected' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}`} 
          title="Delete Corporate"
          aria-label={`Terminate ${corporate.corporate_name}`}
          disabled={corporate.status === 'inactive' || corporate.status === 'terminated' || corporate.status === 'rejected'} // Disable if already inactive/terminated/rejected
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Corporate Management
        </h1>
        {/* <button onClick={() => setShowAddModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
          <Plus className="h-4 w-4 mr-2" />
          Add Corporate
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Corporates</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : stats.totalCorporates}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#ECFDF5] text-green-600 mr-4">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Corporates</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : stats.activeCorporates}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
              <Key size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Licenses</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : stats.totalLicenses}
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
                {loading ? '-' : stats.activeLicenses}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchCorporates} />}

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : corporates.length === 0 ? (
        <EmptyState
            title="No corporates found"
            // description="Get started by adding your first corporate partner."
            // actionLabel="Add Corporate"
            onAction={() => setShowAddModal(true)}
            icon={<Building2 className="h-12 w-12 text-gray-400" />} description={''}        />
      ) : (
        <DataTable
          columns={columns}
          data={corporates}
          keyField="id"
          renderActions={renderActions}
          searchable
          pagination
        />
      )}

      {/* License Allocation Modal (Unchanged) */}
      {showLicenseModal && selectedCorporate && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowLicenseModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Key className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Manage License Allocation - {selectedCorporate.name || selectedCorporate.corporate_name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Update the total number of licenses allocated to this corporate.
                    </p>
                    {/* <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">
                          Current allocation:
                        </span>
                        <span className="text-gray-900">
                          {selectedCorporate.totalLicenses || selectedCorporate.license_quota || 0} licenses
                        </span>
                      </div>
                    </div> */}
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">
                          Current active volunteers:
                        </span>
                        <span className="text-gray-900">
                          {selectedCorporate.volunteers ?? selectedCorporate.licenses_used ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="font-medium text-gray-500">
                          Current allocation:
                        </span>
                        <span className="text-gray-900">
                          {selectedCorporate.totalLicenses || selectedCorporate.license_quota || 0} licenses
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <label htmlFor="licenseCount" className="block text-sm font-medium text-gray-700 text-left">
                        New License Allocation
                      </label>
                      <input
                        type="number"
                        name="licenseCount"
                        id="licenseCount"
                        min="0"
                        value={licenseFormData.licenseCount}
                        onChange={e => setLicenseFormData({
                          ...licenseFormData,
                          licenseCount: parseInt(e.target.value) || 0
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowLicenseModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLicenseUpdate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm"
                >
                  Update Licenses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Corporate Modal (Unchanged UI) */}
      {showEditModal && selectedCorporate && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="edit-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowEditModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="edit-modal-title">
                    Edit Corporate
                  </h3>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                          Admin Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="adminName"
                          id="adminName"
                          value={editFormData.adminName}
                          onChange={e => setEditFormData({
                            ...editFormData,
                            adminName: e.target.value
                          })}
                          className={`mt-1 block w-full border ${editFormErrors.adminName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#466EE5] focus:border-[#466EE5]'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                          aria-invalid={editFormErrors.adminName ? 'true' : 'false'}
                          aria-describedby={editFormErrors.adminName ? 'adminName-error' : undefined}
                        />
                        {editFormErrors.adminName && (
                          <p className="mt-1 text-sm text-red-600" id="adminName-error">
                            {editFormErrors.adminName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                          Admin Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          id="adminEmail"
                          value={editFormData.adminEmail}
                          onChange={e => setEditFormData({
                            ...editFormData,
                            adminEmail: e.target.value
                          })}
                          className={`mt-1 block w-full border ${editFormErrors.adminEmail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#466EE5] focus:border-[#466EE5]'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                          aria-invalid={editFormErrors.adminEmail ? 'true' : 'false'}
                          aria-describedby={editFormErrors.adminEmail ? 'adminEmail-error' : undefined}
                        />
                        {editFormErrors.adminEmail && (
                          <p className="mt-1 text-sm text-red-600" id="adminEmail-error">
                            {editFormErrors.adminEmail}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          id="companyName"
                          value={editFormData.name}
                          onChange={e => setEditFormData({
                            ...editFormData,
                            name: e.target.value
                          })}
                          className={`mt-1 block w-full border ${editFormErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#466EE5] focus:border-[#466EE5]'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                          aria-invalid={editFormErrors.name ? 'true' : 'false'}
                          aria-describedby={editFormErrors.name ? 'companyName-error' : undefined}
                        />
                        {editFormErrors.name && (
                          <p className="mt-1 text-sm text-red-600" id="companyName-error">
                            {editFormErrors.name}
                          </p>
                        )}
                      </div>
                      {/* <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={editFormData.status}
                          onChange={e => setEditFormData({
                            ...editFormData,
                            status: e.target.value as 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected'
                          })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm rounded-md"
                        >
                          <option value="active">Approve</option>
                          <option value="pending">Pending</option>
                          // <option value="inactive">Inactive</option> 
                          <option value="terminated">Terminate</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </div> */}
                      {selectedCorporate && (() => {
                          const currentStatus = selectedCorporate.status;
                          const availableStatusOptions: { value: 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected', label: string }[] = [];

                          // Base option: always allow keeping the current status
                          availableStatusOptions.push({ value: currentStatus, label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) });
                          
                          // 1. Display 'Approve' (Value is 'active')
                          if (currentStatus === 'pending' || currentStatus === 'rejected') {
                              availableStatusOptions.push({ value: 'active', label: 'Approve' });
                          }

                          // 2. Display 'Reject' (Value is 'rejected')
                          if (currentStatus === 'pending') {
                              // We use 'rejected' as the value, only showing it if the current status is pending
                              availableStatusOptions.push({ value: 'rejected', label: 'Reject' });
                          }

                          // // 3. Display 'Terminate' (Value is 'terminated')
                          // if (currentStatus === 'active') {
                          //     availableStatusOptions.push({ value: 'terminated', label: 'Terminate' });
                          // }

                          // 4. Display 'Inactive' (Value is 'inactive')
                          if (currentStatus === 'active') {
                              availableStatusOptions.push({ value: 'inactive', label: 'Inactive' });
                          }

                          // 5. Display 'Activate' (Value is 'active')
                          if (currentStatus === 'inactive' || currentStatus === 'terminated') {
                              availableStatusOptions.push({ value: 'active', label: 'Activate' });
                          }
                          

                          return (
                              <div>
                                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                      Status
                                  </label>
                                  <select
                                      id="status"
                                      name="status"
                                      value={editFormData.status}
                                      onChange={e => setEditFormData({
                                          ...editFormData,
                                          status: e.target.value as 'active' | 'pending' | 'inactive' | 'terminated' | 'rejected'
                                      })}
                                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm rounded-md"
                                  >
                                      {/* Render dynamically generated options */}
                                      {availableStatusOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                              {option.label}
                                          </option>
                                      ))}
                                  </select>
                              </div>
                          );
                      })()}
                      <div className="bg-gray-50 p-4 rounded-md space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Total Licenses:
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedCorporate.totalLicenses || selectedCorporate.license_quota || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Joined Date:
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedCorporate.joinedDate }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-[#F3F4F6] text-base font-medium text-[#374151] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};