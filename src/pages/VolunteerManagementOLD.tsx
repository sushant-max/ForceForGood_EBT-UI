import React, { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { Plus, UserCheck, CheckCircle, XCircle, AlertCircle, Upload, Edit, Award, UserMinus, UserPlus, Trash2, X, FileSpreadsheet } from 'lucide-react';
import { UserProfile } from './types';
import axios from 'axios';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  corporate: string;
  corporateId: string;
  points: number;
  joinedDate: string;
  lastActivity: string;
}
export const VolunteerManagementOLD: React.FC = () => {
  const {
    user
  } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [volunteers, setVolunteers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<UserProfile | null>(null);
  // Form states
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    email: ''
  });
  const [editVolunteer, setEditVolunteer] = useState<UserProfile | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  // Bulk upload states
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadStatus, setBulkUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<{
    name: string;
    email: string;
  }[]>([]);
  const getCorporateNameById = (corporateId: string): string => {
    const corporateMap: {
      [key: string]: string;
    } = {
      '1': 'TechGiant Inc.',
      '2': 'Global Finance Ltd',
      '3': 'Acme Corporation',
      '4': 'Oceanic Airlines'
    };
    return corporateMap[corporateId] || 'Unknown Corporate';
  };
  const corporateName = isSuperAdmin ? 'All Corporates' : user?.corporateId ? getCorporateNameById(user.corporateId) : '';
  useEffect(() => {
    fetchVolunteers();
  }, [user]);
  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers');
      const corporateData: UserProfile[] = response.data;
      const filteredVolunteers = isSuperAdmin ? corporateData.filter(individual => individual.user_roles[0] === 'corporate_individual') : corporateData.filter(v => v.corporateId === user?.corporateId);
      setVolunteers(filteredVolunteers);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
      setError('Failed to load volunteer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleAddVolunteer = () => {
    if (!newVolunteer.name.trim() || !newVolunteer.email.trim()) return;
    const newId = `${Date.now()}`;
    const corporateId = user?.corporateId || '1';
    const corporate = getCorporateNameById(corporateId);
    // const volunteer: Volunteer = {
    //   id: newId,
    //   name: newVolunteer.name,
    //   email: newVolunteer.email,
    //   status: 'pending',
    //   corporate,
    //   corporateId,
    //   points: 0,
    //   joinedDate: new Date().toISOString(),
    //   lastActivity: new Date().toISOString()
    // };
    // setVolunteers(prev => [...prev, volunteer]);
    setNewVolunteer({
      name: '',
      email: ''
    });
    setShowAddModal(false);
  };
  const handleBulkUpload = () => {
    if (!bulkFile) return;
    setBulkUploadStatus('uploading');
    // Simulate processing the file
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setBulkUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setBulkUploadStatus('success');
        // Add the preview data as new volunteers
        const newVolunteers = previewData.map((data, index) => {
          const newId = `bulk-${Date.now()}-${index}`;
          const corporateId = user?.corporateId || '1';
          const corporate = getCorporateNameById(corporateId);
          return {
            id: newId,
            name: data.name,
            email: data.email,
            status: 'pending' as const,
            corporate,
            corporateId,
            points: 0,
            joinedDate: new Date().toISOString(),
            lastActivity: new Date().toISOString()
          };
        });
        // setVolunteers(prev => [...prev, ...newVolunteers]);
        setTimeout(() => {
          setBulkFile(null);
          setBulkUploadProgress(0);
          setBulkUploadStatus('idle');
          setPreviewData([]);
          setShowBulkUploadModal(false);
        }, 1500);
      }
    }, 300);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBulkFile(file);
      // Simulate parsing the file and showing preview
      // In a real app, you would use a library like xlsx or papaparse
      setTimeout(() => {
        const mockPreviewData = [{
          name: 'John Doe',
          email: 'john.doe@example.com'
        }, {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }, {
          name: 'Robert Johnson',
          email: 'robert.j@example.com'
        }];
        setPreviewData(mockPreviewData);
      }, 500);
    }
  };
  const handleUpdateVolunteer = () => {
    if (!editVolunteer) return;
    // setVolunteers(prev => prev.map(v => v.id === editVolunteer.id ? editVolunteer : v));
    setShowEditModal(false);
    setEditVolunteer(null);
  };
  const handleAddPoints = () => {
    if (!selectedVolunteer || pointsToAdd <= 0) return;
    const updatedVolunteer = {
      ...selectedVolunteer,
      points: /*selectedVolunteer.points*/100 + pointsToAdd
    };
    // setVolunteers(prev => prev.map(v => v.id === selectedVolunteer.id ? updatedVolunteer : v));
    setShowPointsModal(false);
    setSelectedVolunteer(null);
    setPointsToAdd(0);
  };
  const handleDeleteVolunteer = (volunteer: UserProfile) => {
    if (window.confirm(`Are you sure you want to delete ${volunteer.user_details?.name || 'this user'}?`)) {
      axios.delete(`https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers/${volunteer.user_uid}`)
        .then(response => {
          if (response.status !== 200) {
            alert('Error deleting user. Please try again.');
            return;
          }
          fetchVolunteers();
        })
        .catch(() => {
          alert('Error deleting user. Please try again.');
        });
    }
  };
  const handleActivateVolunteer = (volunteer: UserProfile) => {
    setVolunteers(prev => prev.map(v => v.id === volunteer.id ? {
      ...v,
      status: 'active'
    } : v));
  };
  const handleDeactivateVolunteer = (volunteer: UserProfile) => {
    setVolunteers(prev => prev.map(v => v.id === volunteer.id ? {
      ...v,
      status: 'inactive'
    } : v));
  };
  const handleEditVolunteer = (volunteer: UserProfile) => {
    setEditVolunteer({
      ...volunteer
    });
    setShowEditModal(true);
  };
  const handleOpenPointsModal = (volunteer: UserProfile) => {
    setSelectedVolunteer(volunteer);
    setShowPointsModal(true);
  };
  // Define columns based on user role
  const getSuperAdminColumns = () => [{
    header: 'Name',
    accessor: (row: UserProfile) => {
      return row.user_details?.name || 'Unknown';
    },
    sortable: true
  }, {
    header: 'Email',
    accessor: (row: UserProfile) => {
      return row.user_details?.email_id || 'Unknown';
    },
    sortable: true
  }, {
    header: 'Status',
    accessor: (row: UserProfile) => {
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
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.registration_status]}`}>
            {row.registration_status ? statusIcons[row.registration_status]: statusIcons['pending']}
            {row.registration_status ? row.registration_status.charAt(0).toUpperCase() + row.registration_status.slice(1) : 'Pending'}
          </span>;
    }
  }, {
    header: 'Corporate',
    accessor: (row: UserProfile) => {
      return row.corporate_name || 'Unknown';
    },
    sortable: true
  }, {
    header: 'Points',
    accessor: () => { return 100; },
    sortable: true
  }, {
    header: 'Joined',
    accessor: (row: UserProfile) => {
      // Accepts date string like "04/11/2011" or Date object
      const rawDate = row.register_date;
      let dateObj: Date;
      if (typeof row.register_date === 'string') {
      // Parse MM/DD/YYYY format
      const [month, day, year] = rawDate.split('/');
      dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      } else if (rawDate && typeof rawDate === 'object' && Object.prototype.toString.call(rawDate) === '[object Date]') {
      dateObj = rawDate as Date;
      } else {
      dateObj = new Date();
      }
      return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
      });
    },
    sortable: true
  }];
  const getCorporateAdminColumns = () => [{
    header: 'Name',
    accessor: 'name',
    sortable: true
  }, {
    header: 'Email',
    accessor: 'email',
    sortable: true
  }, {
    header: 'Status',
    accessor: (row: Volunteer) => {
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
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
            {statusIcons[row.status]}
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>;
    }
  }, {
    header: 'Points',
    accessor: 'points',
    sortable: true
  }, {
    header: 'Joined',
    accessor: (row: Volunteer) => {
      const date = new Date(row.joinedDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    sortable: true
  }];
  const columns = isSuperAdmin ? getSuperAdminColumns() : getCorporateAdminColumns();
  const renderSuperAdminActions = (volunteer: UserProfile) => {
    return <div className="flex justify-end space-x-2">
        {volunteer.registration_status !== 'active' && <button onClick={() => handleActivateVolunteer(volunteer)} className="text-green-600 hover:text-green-700" title="Activate Volunteer">
            <UserPlus className="h-5 w-5" />
            <span className="sr-only">Activate</span>
          </button>}
        {volunteer.registration_status === 'active' && <button onClick={() => handleDeactivateVolunteer(volunteer)} className="text-gray-600 hover:text-gray-700" title="Deactivate Volunteer">
            <UserMinus className="h-5 w-5" />
            <span className="sr-only">Deactivate</span>
          </button>}
        <button onClick={() => handleDeleteVolunteer(volunteer)} className="text-red-600 hover:text-red-700" title="Delete Volunteer">
          <Trash2 className="h-5 w-5" />
          <span className="sr-only">Delete</span>
        </button>
      </div>;
  };
  const renderCorporateAdminActions = (volunteer: UserProfile) => {
    return <div className="flex justify-end space-x-2">
        {volunteer.registration_status !== 'active' && <button onClick={() => handleActivateVolunteer(volunteer)} className="text-green-600 hover:text-green-700" title="Activate Volunteer">
            <UserPlus className="h-5 w-5" />
            <span className="sr-only">Activate</span>
          </button>}
        {volunteer.registration_status === 'active' && <button onClick={() => handleDeactivateVolunteer(volunteer)} className="text-gray-600 hover:text-gray-700" title="Deactivate Volunteer">
            <UserMinus className="h-5 w-5" />
            <span className="sr-only">Deactivate</span>
          </button>}
        <button onClick={() => handleEditVolunteer(volunteer)} className="text-amber-600 hover:text-amber-700" title="Edit Volunteer">
          <Edit className="h-5 w-5" />
          <span className="sr-only">Edit</span>
        </button>
        <button onClick={() => handleOpenPointsModal(volunteer)} className="text-blue-600 hover:text-blue-700" title="Assign Points">
          <Award className="h-5 w-5" />
          <span className="sr-only">Assign Points</span>
        </button>
        <button onClick={() => handleDeleteVolunteer(volunteer)} className="text-red-600 hover:text-red-700" title="Delete Volunteer">
          <Trash2 className="h-5 w-5" />
          <span className="sr-only">Delete</span>
        </button>
      </div>;
  };
  const renderAddVolunteerModal = () => {
    return <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Volunteer</h3>
            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input type="text" id="name" value={newVolunteer.name} onChange={e => setNewVolunteer({
              ...newVolunteer,
              name: e.target.value
            })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" id="email" value={newVolunteer.email} onChange={e => setNewVolunteer({
              ...newVolunteer,
              email: e.target.value
            })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Corporate
              </label>
              <div className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md py-2 px-3 text-gray-700">
                {corporateName}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Volunteers are automatically assigned to your corporate account
              </p>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
              Cancel
            </button>
            <button type="button" onClick={handleAddVolunteer} disabled={!newVolunteer.name || !newVolunteer.email} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed">
              Add Volunteer
            </button>
          </div>
        </div>
      </div>;
  };
  const renderBulkUploadModal = () => {
    return <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Bulk Upload Volunteers
            </h3>
            <button onClick={() => setShowBulkUploadModal(false)} className="text-gray-400 hover:text-gray-500" disabled={bulkUploadStatus === 'uploading'}>
              <X className="h-5 w-5" />
            </button>
          </div>
          {bulkUploadStatus !== 'success' ? <>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload a CSV or Excel file with volunteer details. The file
                    should have columns for Name and Email.
                  </p>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Corporate
                    </label>
                    <div className="block w-full border border-gray-200 bg-gray-50 rounded-md py-2 px-3 text-gray-700">
                      {corporateName}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      All volunteers will be assigned to your corporate account
                    </p>
                  </div>
                  {!bulkFile ? <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Drag and drop your file here, or{' '}
                          <label className="text-[#466EE5] hover:text-[#3355cc] cursor-pointer">
                            browse
                            <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                          </label>
                        </p>
                        <p className="text-xs text-gray-400">
                          Supported formats: .csv, .xlsx, .xls
                        </p>
                      </div>
                    </div> : <div className="mt-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 mr-3">
                          <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {bulkFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(bulkFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button type="button" onClick={() => setBulkFile(null)} className="ml-4 text-sm font-medium text-[#466EE5] hover:text-[#3355cc]" disabled={bulkUploadStatus === 'uploading'}>
                          Remove
                        </button>
                      </div>
                      {bulkUploadStatus === 'uploading' && <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div className="bg-[#466EE5] h-2.5 rounded-full" style={{
                      width: `${bulkUploadProgress}%`
                    }}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Processing: {bulkUploadProgress}%
                          </p>
                        </div>}
                    </div>}
                </div>
                {previewData.length > 0 && <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Preview ({previewData.length} volunteers)
                    </h4>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.map((data, index) => <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {data.name}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {data.email}
                              </td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>}
              </div>
              <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowBulkUploadModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]" disabled={bulkUploadStatus === 'uploading'}>
                  Cancel
                </button>
                <button type="button" onClick={handleBulkUpload} disabled={!bulkFile || bulkUploadStatus === 'uploading' || previewData.length === 0} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed">
                  {bulkUploadStatus === 'uploading' ? 'Uploading...' : 'Upload & Create Volunteers'}
                </button>
              </div>
            </> : <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Upload Successful
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {previewData.length} volunteers have been successfully added.
              </p>
              <div className="mt-6">
                <button type="button" onClick={() => {
              setBulkFile(null);
              setBulkUploadProgress(0);
              setBulkUploadStatus('idle');
              setPreviewData([]);
              setShowBulkUploadModal(false);
            }} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                  Close
                </button>
              </div>
            </div>}
        </div>
      </div>;
  };
  const renderEditVolunteerModal = () => {
    if (!editVolunteer) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Edit Volunteer
            </h3>
            <button onClick={() => {
            setShowEditModal(false);
            setEditVolunteer(null);
          }} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input type="text" id="edit-name" value={editVolunteer.user_details.name} onChange={e => setEditVolunteer({
              ...editVolunteer,
              user_details: {
                ...editVolunteer.user_details,
                name: e.target.value
              }
            })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input type="email" id="edit-email" value={editVolunteer.user_details.email_id} onChange={e => setEditVolunteer({
              ...editVolunteer,
              user_details: {
                ...editVolunteer.user_details,
                email_id: e.target.value
              }
            })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
            </div>
            <div>
              <label htmlFor="edit-points" className="block text-sm font-medium text-gray-700">
                Points
              </label>
              <input type="number" id="edit-points" value={100/*editVolunteer.points*/} onChange={e => setEditVolunteer({
              ...editVolunteer,
              // points: parseInt(e.target.value) || 0
            })} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
            </div>
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select id="edit-status" value={editVolunteer.registration_status} onChange={e => setEditVolunteer({
              ...editVolunteer,
              registration_status: e.target.value as 'active' | 'pending' | 'inactive'
            })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
            <button type="button" onClick={() => {
            setShowEditModal(false);
            setEditVolunteer(null);
          }} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
              Cancel
            </button>
            <button type="button" onClick={handleUpdateVolunteer} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
              Save Changes
            </button>
          </div>
        </div>
      </div>;
  };
  const renderAssignPointsModal = () => {
    if (!selectedVolunteer) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Assign Points</h3>
            <button onClick={() => {
            setShowPointsModal(false);
            setSelectedVolunteer(null);
            setPointsToAdd(0);
          }} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Assigning points to{' '}
                <span className="font-medium">{selectedVolunteer.user_details.name}</span>
              </p>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Current Points
                </p>
                <p className="text-lg font-semibold">
                  {/*selectedVolunteer.points*/100}
                </p>
              </div>
            </div>
            <div>
              <label htmlFor="points-to-add" className="block text-sm font-medium text-gray-700">
                Points to Add
              </label>
              <input type="number" id="points-to-add" value={pointsToAdd} onChange={e => setPointsToAdd(parseInt(e.target.value) || 0)} min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    New total will be:{' '}
                    <span className="font-bold">
                      {/*selectedVolunteer.points*/100 + pointsToAdd}
                    </span>{' '}
                    points
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
            <button type="button" onClick={() => {
            setShowPointsModal(false);
            setSelectedVolunteer(null);
            setPointsToAdd(0);
          }} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
              Cancel
            </button>
            <button type="button" onClick={handleAddPoints} disabled={pointsToAdd <= 0} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed">
              Assign Points
            </button>
          </div>
        </div>
      </div>;
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Volunteer Management
        </h1>
        {!isSuperAdmin && <div className="flex space-x-2">
            <button onClick={() => setShowBulkUploadModal(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </button>
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
              <Plus className="h-4 w-4 mr-2" />
              Add Volunteer
            </button>
          </div>}
      </div>
      {error && <ErrorAlert message={error} onRetry={fetchVolunteers} />}
      {loading ? <LoadingSkeleton type="table" /> : volunteers.length === 0 ? <EmptyState title="No volunteers found" description={isSuperAdmin ? 'No volunteers have been added to the system yet.' : 'Get started by adding your first volunteer or uploading a list of volunteers.'} actionLabel={isSuperAdmin ? undefined : 'Add Volunteer'} onAction={isSuperAdmin ? undefined : () => setShowAddModal(true)} icon={<UserCheck className="h-12 w-12 text-gray-400" />} /> : <DataTable columns={columns} data={volunteers} keyField="id" onDelete={handleDeleteVolunteer} renderActions={isSuperAdmin ? renderSuperAdminActions : renderCorporateAdminActions} searchable pagination />}
      {showAddModal && renderAddVolunteerModal()}
      {showBulkUploadModal && renderBulkUploadModal()}
      {showEditModal && renderEditVolunteerModal()}
      {showPointsModal && renderAssignPointsModal()}
    </div>;
};