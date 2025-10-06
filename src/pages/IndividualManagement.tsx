import React, { useEffect, useState } from 'react';
import { Plus, Users, CheckCircle, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { UserProfile } from './types';
import axios from 'axios';

// New interface for the add individual form
interface AddIndividualFormData {
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
}
export const IndividualManagement: React.FC = () => {
  const [individuals, setIndividuals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState<UserProfile | null>(null);
  // const [newStatus, setNewStatus] = useState<'active' | 'pending' | 'inactive'>('active');
  const [newStatus, setNewStatus] = useState('active');
  // Add form state for the new individual
  const [formData, setFormData] = useState<AddIndividualFormData>({
    name: '',
    email: '',
    status: 'active'
  });
  // Add validation state
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  // Add form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    fetchIndividuals();
  }, []);
  const fetchIndividuals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await axios.get('https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers');
      const individualsData: UserProfile[] = response.data;
      // Mock data
      // const mockIndividuals: Individual[] = [{
      //   id: '1',
      //   name: 'John Smith',
      //   email: 'john.smith@techgiant.com',
      //   status: 'active',
      //   corporate: 'TechGiant Inc.',
      //   corporateId: '1',
      //   role: 'Corporate Admin',
      //   joinedDate: '2023-01-20',
      //   lastActivity: '2023-05-20'
      // }, {
      //   id: '2',
      //   name: 'Sarah Johnson',
      //   email: 'sarah.j@globalfinance.com',
      //   status: 'active',
      //   corporate: 'Global Finance Ltd',
      //   corporateId: '2',
      //   role: 'Corporate Admin',
      //   joinedDate: '2023-02-25',
      //   lastActivity: '2023-05-18'
      // }, {
      //   id: '3',
      //   name: 'Michael Brown',
      //   email: 'michael.b@techgiant.com',
      //   status: 'active',
      //   corporate: 'TechGiant Inc.',
      //   corporateId: '1',
      //   role: 'Volunteer',
      //   joinedDate: '2023-02-10',
      //   lastActivity: '2023-05-19'
      // }, {
      //   id: '4',
      //   name: 'Emily Davis',
      //   email: 'emily.d@techgiant.com',
      //   status: 'active',
      //   corporate: 'TechGiant Inc.',
      //   corporateId: '1',
      //   role: 'Volunteer',
      //   joinedDate: '2023-03-05',
      //   lastActivity: '2023-05-15'
      // }, {
      //   id: '5',
      //   name: 'David Wilson',
      //   email: 'david.w@acme.com',
      //   status: 'pending',
      //   corporate: 'Acme Corporation',
      //   corporateId: '3',
      //   role: 'Volunteer',
      //   joinedDate: '2023-05-10',
      //   lastActivity: '2023-05-10'
      // },
      // // Adding independent individuals without corporate associations
      // {
      //   id: '6',
      //   name: 'Jessica Taylor',
      //   email: 'jessica.t@gmail.com',
      //   status: 'active',
      //   corporate: '',
      //   corporateId: '',
      //   role: 'Individual',
      //   joinedDate: '2023-03-15',
      //   lastActivity: '2023-05-17'
      // }, {
      //   id: '7',
      //   name: 'Robert Chen',
      //   email: 'robert.c@outlook.com',
      //   status: 'active',
      //   corporate: '',
      //   corporateId: '',
      //   role: 'Individual',
      //   joinedDate: '2023-04-05',
      //   lastActivity: '2023-05-16'
      // }, {
      //   id: '8',
      //   name: 'Maria Rodriguez',
      //   email: 'maria.r@yahoo.com',
      //   status: 'inactive',
      //   corporate: '',
      //   corporateId: '',
      //   role: 'Individual',
      //   joinedDate: '2023-02-18',
      //   lastActivity: '2023-04-20'
      // }];
      // Filter to only include individuals without corporate associations
      const independentIndividuals = individualsData.filter(individual => individual.user_roles[0] === 'individual');
      setIndividuals(independentIndividuals);
    } catch (err) {
      console.error('Failed to fetch individuals:', err);
      setError('Failed to load individual data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteIndividual = (individual: UserProfile) => {
    if (window.confirm(`Are you sure you want to delete ${individual.user_details?.name || 'this user'}?`)) {
      axios.delete(`https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers/${individual.user_uid}`)
        .then(response => {
          if (response.status !== 200) {
            alert('Error deleting user. Please try again.');
            return;
          }
          fetchIndividuals();
        })
        .catch(() => {
          alert('Error deleting user. Please try again.');
        });
    }
  };
  const handleEditIndividual = (individual: UserProfile) => {
    setSelectedIndividual(individual);
    setNewStatus(individual.registration_status);
    setShowEditModal(true);
  };
  const handleStatusUpdate = () => {
    if (!selectedIndividual) return;
    // Update status via API
    axios.put(
      `https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers/status/${selectedIndividual.user_uid}`,
      { status: newStatus }
    ).then(response => {
      if (response.status !== 200) {
      setError('Error updating status. Please try again.');
      return;
      }
      // Update the individual's status in state
      fetchIndividuals();
      setShowEditModal(false);
      setSelectedIndividual(null);
    }).catch(err => {
      setError('Error updating status. Please try again.');
      setShowEditModal(false);
      setSelectedIndividual(null);
    });
  };
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  // Validate form
  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
    } = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Handle form submission
  const handleAddIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/individual',
        {
          emailId: formData.email,
          name: formData.name,
          status: formData.status
        }
      );
      // If not created, show error dialog
      if (response.status !== 201) {
        setError('Error creating user. Please try again.');
        setFormData({
          name: '',
          email: '',
          status: 'active'
        });
        setShowAddModal(false);
        return;
      }
      // Add to state
      fetchIndividuals();
      // setIndividuals(prev => [...prev, newIndividual]);
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        status: 'active'
      });
      setShowAddModal(false);
    } catch (err) {
      setShowAddModal(false);
      console.error('Failed to add individual:', err);
      setError('Failed to add individual. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Reset form when modal closes
  const handleCloseAddModal = () => {
    setFormData({
      name: '',
      email: '',
      status: 'active'
    });
    setFormErrors({});
    setShowAddModal(false);
  };
  const columns = [{
    header: 'Name',
    accessor: (row: UserProfile) => {
      return row.user_details?.name || 'Unknown';
    },
    sortAccessor: (row: UserProfile) => row.user_details?.name || '',
    sortable: true
  }, {
    header: 'Email',
    accessor: (row: UserProfile) => {
      return row.user_details?.email_id || 'Unknown';
    },
    sortAccessor: (row: UserProfile) => row.user_details?.email_id || '',
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
            {row.registration_status.charAt(0).toUpperCase() + row.registration_status.slice(1)}
          </span>;
    },
    sortAccessor: (row: UserProfile) => row.registration_status,
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
    sortAccessor: (row: UserProfile) => {
      const rawDate = row.register_date as unknown;
      if (typeof rawDate === 'string') {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const [month, day, year] = parts;
          return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
        }
      }
      if (rawDate && typeof rawDate === 'object' && Object.prototype.toString.call(rawDate) === '[object Date]') {
        return (rawDate as Date).getTime();
      }
      return 0;
    },
    sortable: true
    }, {
    header: 'Last Activity',
    accessor: (row: UserProfile) => {
      const date = new Date();
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    sortAccessor: (_row: UserProfile) => new Date().getTime(),
    sortable: true
  }];
  const renderActions = (individual: UserProfile) => <div className="flex justify-end space-x-2">
      <button onClick={() => handleEditIndividual(individual)} className="text-amber-600 hover:text-amber-700" aria-label={`Edit ${individual.user_details?.name ?? 'Unknown'}`}>
        <Edit className="h-5 w-5" />
      </button>
      <button onClick={() => handleDeleteIndividual(individual)} className="text-red-600 hover:text-red-700" aria-label={`Delete ${individual.user_details?.name ?? 'Unknown'}`}>
        <Trash2 className="h-5 w-5" />
      </button>
    </div>;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Individual Management
        </h1>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
          <Plus className="h-4 w-4 mr-2" />
          Add Individual
        </button>
      </div>
      {error && <ErrorAlert message={error} onRetry={fetchIndividuals} />}
      {loading ? <LoadingSkeleton type="table" /> : individuals.length === 0 ? <EmptyState title="No independent individuals found" description="Get started by adding your first independent individual user." actionLabel="Add Individual" onAction={() => setShowAddModal(true)} icon={<Users className="h-12 w-12 text-gray-400" />} /> : <DataTable columns={columns} data={individuals} keyField="id" renderActions={renderActions} searchable pagination />}
      {/* Add Individual Modal */}
      {showAddModal && <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseAddModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add New Individual
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleAddIndividual}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm`} placeholder="Enter full name" aria-invalid={formErrors.name ? 'true' : 'false'} aria-describedby={formErrors.name ? 'name-error' : undefined} />
                          {formErrors.name && <p className="mt-2 text-sm text-red-600" id="name-error">
                              {formErrors.name}
                            </p>}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className={`mt-1 block w-full border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm`} placeholder="Enter email address" aria-invalid={formErrors.email ? 'true' : 'false'} aria-describedby={formErrors.email ? 'email-error' : undefined} />
                          {formErrors.email && <p className="mt-2 text-sm text-red-600" id="email-error">
                              {formErrors.email}
                            </p>}
                        </div>
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm rounded-md">
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                        <button type="button" onClick={handleCloseAddModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:text-sm">
                          Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm disabled:opacity-70">
                          {isSubmitting ? <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span> : 'Add Individual'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}
      {/* Edit Status Modal */}
      {showEditModal && selectedIndividual && <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Edit Individual Status
                  </h3>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Update the status for {selectedIndividual.user_details.name}
                    </p>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value as 'active' | 'pending' | 'inactive')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm rounded-md">
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:text-sm">
                  Cancel
                </button>
                <button type="button" onClick={handleStatusUpdate} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};