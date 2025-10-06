import React, { useEffect, useState } from 'react'
import {
  Plus,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Key,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorAlert } from '../components/ErrorAlert'
import { EmptyState } from '../components/EmptyState'
interface Corporate {
  id: string
  name: string
  status: 'active' | 'pending' | 'inactive'
  totalLicenses: number
  usedLicenses: number
  volunteers: number
  joinedDate: string
  lastActivity: string
  adminName: string
  adminEmail: string
}
export const CorporateManagement: React.FC = () => {
  const [corporates, setCorporates] = useState<Corporate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(
    null,
  )
  const [editFormData, setEditFormData] = useState<{
    adminName: string
    adminEmail: string
    name: string
    status: 'active' | 'pending' | 'inactive'
  }>({
    adminName: '',
    adminEmail: '',
    name: '',
    status: 'active',
  })
  const [editFormErrors, setEditFormErrors] = useState<{
    adminName?: string
    adminEmail?: string
    name?: string
  }>({})
  const [stats, setStats] = useState({
    totalLicenses: 0,
    activeLicenses: 0,
    totalCorporates: 0,
    activeCorporates: 0,
  })
  const [licenseFormData, setLicenseFormData] = useState<{
    licenseCount: number
  }>({
    licenseCount: 0,
  })
  useEffect(() => {
    fetchCorporates()
  }, [])
  const fetchCorporates = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Mock consolidated data
      const mockCorporates: Corporate[] = [
        {
          id: '1',
          name: 'TechGiant Inc.',
          status: 'active',
          totalLicenses: 100,
          usedLicenses: 85,
          volunteers: 245,
          joinedDate: '2023-01-15',
          lastActivity: '2023-05-20',
          adminName: 'John Smith',
          adminEmail: 'john.smith@techgiant.com',
        },
        {
          id: '2',
          name: 'Global Finance Ltd',
          status: 'active',
          totalLicenses: 75,
          usedLicenses: 72,
          volunteers: 189,
          joinedDate: '2023-02-22',
          lastActivity: '2023-05-18',
          adminName: 'Sarah Johnson',
          adminEmail: 'sarah.j@globalfinance.com',
        },
        {
          id: '3',
          name: 'Acme Corporation',
          status: 'active',
          totalLicenses: 50,
          usedLicenses: 45,
          volunteers: 156,
          joinedDate: '2023-03-10',
          lastActivity: '2023-05-15',
          adminName: 'Michael Brown',
          adminEmail: 'michael.b@acme.com',
        },
        {
          id: '4',
          name: 'Oceanic Airlines',
          status: 'pending',
          totalLicenses: 30,
          usedLicenses: 0,
          volunteers: 0,
          joinedDate: '2023-05-05',
          lastActivity: '2023-05-05',
          adminName: 'Kate Austin',
          adminEmail: 'kate.a@oceanic.com',
        },
        {
          id: '5',
          name: 'Universal Systems',
          status: 'inactive',
          totalLicenses: 25,
          usedLicenses: 0,
          volunteers: 0,
          joinedDate: '2023-04-18',
          lastActivity: '2023-04-18',
          adminName: 'David Wilson',
          adminEmail: 'david.w@universal.com',
        },
      ]
      setCorporates(mockCorporates)
      // Calculate stats for dashboard cards
      const totalLicenses = mockCorporates.reduce(
        (sum, corp) => sum + corp.totalLicenses,
        0,
      )
      const activeLicenses = mockCorporates.reduce(
        (sum, corp) =>
          corp.status === 'active' ? sum + corp.usedLicenses : sum,
        0,
      )
      const totalCorporates = mockCorporates.length
      const activeCorporates = mockCorporates.filter(
        (corp) => corp.status === 'active',
      ).length
      setStats({
        totalLicenses,
        activeLicenses,
        totalCorporates,
        activeCorporates,
      })
    } catch (err) {
      console.error('Failed to fetch corporates:', err)
      setError('Failed to load corporate data. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteCorporate = (corporate: Corporate) => {
    // In a real app, this would call an API
    setCorporates((prev) => prev.filter((c) => c.id !== corporate.id))
    // Update stats
    setStats((prev) => ({
      ...prev,
      totalLicenses: prev.totalLicenses - corporate.totalLicenses,
      activeLicenses:
        corporate.status === 'active'
          ? prev.activeLicenses - corporate.usedLicenses
          : prev.activeLicenses,
      totalCorporates: prev.totalCorporates - 1,
      activeCorporates:
        corporate.status === 'active'
          ? prev.activeCorporates - 1
          : prev.activeCorporates,
    }))
  }
  const handleEditCorporate = (corporate: Corporate) => {
    setSelectedCorporate(corporate)
    setEditFormData({
      adminName: corporate.adminName,
      adminEmail: corporate.adminEmail,
      name: corporate.name,
      status: corporate.status,
    })
    setEditFormErrors({})
    setShowEditModal(true)
  }
  const handleManageLicenses = (corporate: Corporate) => {
    setSelectedCorporate(corporate)
    setLicenseFormData({
      licenseCount: corporate.totalLicenses,
    })
    setShowLicenseModal(true)
  }
  const handleLicenseUpdate = () => {
    if (!selectedCorporate || licenseFormData.licenseCount < 0) return
    // Calculate the difference in license count
    const licenseCountDifference =
      licenseFormData.licenseCount - selectedCorporate.totalLicenses
    // Update the corporate's license count in the table
    setCorporates((prev) =>
      prev.map((corp) =>
        corp.id === selectedCorporate.id
          ? {
              ...corp,
              totalLicenses: licenseFormData.licenseCount,
            }
          : corp,
      ),
    )
    // Update the stats to reflect the new license count
    setStats((prev) => ({
      ...prev,
      totalLicenses: prev.totalLicenses + licenseCountDifference,
    }))
    // Close the modal
    setShowLicenseModal(false)
  }
  const validateEditForm = () => {
    const errors: {
      adminName?: string
      adminEmail?: string
      name?: string
    } = {}
    let isValid = true
    if (!editFormData.adminName.trim()) {
      errors.adminName = 'Admin name is required'
      isValid = false
    }
    if (!editFormData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required'
      isValid = false
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editFormData.adminEmail)
    ) {
      errors.adminEmail = 'Invalid email address'
      isValid = false
    }
    if (!editFormData.name.trim()) {
      errors.name = 'Company name is required'
      isValid = false
    }
    setEditFormErrors(errors)
    return isValid
  }
  const handleSaveEdit = () => {
    if (!validateEditForm() || !selectedCorporate) return
    // In a real app, this would call an API to update the corporate
    setCorporates((prev) =>
      prev.map((corp) =>
        corp.id === selectedCorporate.id
          ? {
              ...corp,
              adminName: editFormData.adminName,
              adminEmail: editFormData.adminEmail,
              name: editFormData.name,
              status: editFormData.status,
            }
          : corp,
      ),
    )
    // Update active corporates count if status changed
    if (selectedCorporate.status !== editFormData.status) {
      setStats((prev) => ({
        ...prev,
        activeCorporates:
          selectedCorporate.status === 'active' &&
          editFormData.status !== 'active'
            ? prev.activeCorporates - 1
            : selectedCorporate.status !== 'active' &&
                editFormData.status === 'active'
              ? prev.activeCorporates + 1
              : prev.activeCorporates,
      }))
    }
    setShowEditModal(false)
  }
  const columns = [
    {
      header: 'Admin Name',
      accessor: 'adminName',
      sortable: true,
    },
    {
      header: 'Admin Email',
      accessor: 'adminEmail',
      sortable: true,
    },
    {
      header: 'Company',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row: Corporate) => {
        const statusStyles = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          inactive: 'bg-gray-100 text-gray-800',
        }
        const statusIcons = {
          active: <CheckCircle className="h-4 w-4 mr-1" />,
          pending: <AlertCircle className="h-4 w-4 mr-1" />,
          inactive: <XCircle className="h-4 w-4 mr-1" />,
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status]}`}
          >
            {statusIcons[row.status]}
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        )
      },
    },
    {
      header: 'Total Licenses',
      accessor: 'totalLicenses',
      sortable: true,
    },
    {
      header: 'Used Licenses',
      accessor: (row: Corporate) => {
        return row.status === 'active'
          ? `${row.usedLicenses} (${Math.round((row.usedLicenses / row.totalLicenses) * 100)}%)`
          : '0'
      },
    },
    {
      header: 'Utilization',
      accessor: (row: Corporate) => {
        return (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${row.status === 'inactive' ? 'bg-gray-500' : row.usedLicenses / row.totalLicenses > 0.8 ? 'bg-amber-500' : 'bg-[#466EE5]'}`}
              style={{
                width: `${row.status === 'active' ? (row.usedLicenses / row.totalLicenses) * 100 : 0}%`,
              }}
            ></div>
          </div>
        )
      },
    },
    {
      header: 'Volunteers',
      accessor: 'volunteers',
      sortable: true,
    },
    {
      header: 'Joined',
      accessor: (row: Corporate) => {
        const date = new Date(row.joinedDate)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
      sortable: true,
    },
  ]
  const renderActions = (corporate: Corporate) => (
    <div className="flex justify-end space-x-2">
      <Link
        to={`/corporate-management/${corporate.id}`}
        className="text-[#466EE5] hover:text-[#3355cc]"
        aria-label={`View ${corporate.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-eye"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Link>
      <button
        onClick={() => handleManageLicenses(corporate)}
        className="text-purple-600 hover:text-purple-700"
        aria-label={`Manage licenses for ${corporate.name}`}
      >
        <Key className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleEditCorporate(corporate)}
        className="text-amber-600 hover:text-amber-700"
        aria-label={`Edit ${corporate.name}`}
      >
        <Edit className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleDeleteCorporate(corporate)}
        className="text-red-600 hover:text-red-700"
        aria-label={`Delete ${corporate.name}`}
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Corporate Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Corporate
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
      {error && <ErrorAlert message={error} onRetry={fetchCorporates} />}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : corporates.length === 0 ? (
        <EmptyState
          title="No corporates found"
          description="Get started by adding your first corporate partner."
          actionLabel="Add Corporate"
          onAction={() => setShowAddModal(true)}
          icon={<Building2 className="h-12 w-12 text-gray-400" />}
        />
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
      {/* License Allocation Modal */}
      {showLicenseModal && selectedCorporate && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowLicenseModal(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Key className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    Manage License Allocation - {selectedCorporate.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Update the total number of licenses allocated to this
                      corporate.
                    </p>
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="font-medium text-gray-500">
                          Current allocation:
                        </span>
                        <span className="text-gray-900">
                          {selectedCorporate.totalLicenses} licenses
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">
                          Current usage:
                        </span>
                        <span className="text-gray-900">
                          {selectedCorporate.usedLicenses} licenses
                          {selectedCorporate.totalLicenses > 0 && (
                            <span className="text-gray-500 ml-1">
                              (
                              {Math.round(
                                (selectedCorporate.usedLicenses /
                                  selectedCorporate.totalLicenses) *
                                  100,
                              )}
                              %)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <label
                        htmlFor="licenseCount"
                        className="block text-sm font-medium text-gray-700 text-left"
                      >
                        New License Allocation
                      </label>
                      <input
                        type="number"
                        name="licenseCount"
                        id="licenseCount"
                        min={selectedCorporate.usedLicenses}
                        value={licenseFormData.licenseCount}
                        onChange={(e) =>
                          setLicenseFormData({
                            ...licenseFormData,
                            licenseCount: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm"
                      />
                      {licenseFormData.licenseCount <
                        selectedCorporate.usedLicenses && (
                        <p className="mt-1 text-sm text-red-600 text-left">
                          New allocation cannot be less than current usage (
                          {selectedCorporate.usedLicenses})
                        </p>
                      )}
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
                  disabled={
                    licenseFormData.licenseCount <
                    selectedCorporate.usedLicenses
                  }
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Licenses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Corporate Modal */}
      {showEditModal && selectedCorporate && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          aria-labelledby="edit-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowEditModal(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="edit-modal-title"
                  >
                    Edit Corporate
                  </h3>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="adminName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Admin Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="adminName"
                          id="adminName"
                          value={editFormData.adminName}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              adminName: e.target.value,
                            })
                          }
                          className={`mt-1 block w-full border ${editFormErrors.adminName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#466EE5] focus:border-[#466EE5]'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                          aria-invalid={
                            editFormErrors.adminName ? 'true' : 'false'
                          }
                          aria-describedby={
                            editFormErrors.adminName
                              ? 'adminName-error'
                              : undefined
                          }
                        />
                        {editFormErrors.adminName && (
                          <p
                            className="mt-1 text-sm text-red-600"
                            id="adminName-error"
                          >
                            {editFormErrors.adminName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="adminEmail"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Admin Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          id="adminEmail"
                          value={editFormData.adminEmail}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              adminEmail: e.target.value,
                            })
                          }
                          className={`mt-1 block w-full border ${editFormErrors.adminEmail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#466EE5] focus:border-[#466EE5]'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                          aria-invalid={
                            editFormErrors.adminEmail ? 'true' : 'false'
                          }
                          aria-describedby={
                            editFormErrors.adminEmail
                              ? 'adminEmail-error'
                              : undefined
                          }
                        />
                        {editFormErrors.adminEmail && (
                          <p
                            className="mt-1 text-sm text-red-600"
                            id="adminEmail-error"
                          >
                            {editFormErrors.adminEmail}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="companyName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          id="companyName"
                          value={editFormData.name}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              name: e.target.value,
                            })
                          }
                          className={`mt-1 block w-full border ${editFormErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#466EE5] focus:border-[#466EE5]'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                          aria-invalid={editFormErrors.name ? 'true' : 'false'}
                          aria-describedby={
                            editFormErrors.name
                              ? 'companyName-error'
                              : undefined
                          }
                        />
                        {editFormErrors.name && (
                          <p
                            className="mt-1 text-sm text-red-600"
                            id="companyName-error"
                          >
                            {editFormErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={editFormData.status}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              status: e.target.value as
                                | 'active'
                                | 'pending'
                                | 'inactive',
                            })
                          }
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm rounded-md"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Total Licenses:
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedCorporate.totalLicenses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Used Licenses:
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedCorporate.usedLicenses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Volunteers:
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedCorporate.volunteers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Joined Date:
                          </span>
                          <span className="text-sm text-gray-900">
                            {new Date(
                              selectedCorporate.joinedDate,
                            ).toLocaleDateString()}
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
  )
}
