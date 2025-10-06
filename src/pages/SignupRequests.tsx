import React, { useEffect, useState, createElement } from 'react'
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  User,
  Calendar,
  Mail,
  FileText,
  AlertCircle,
  Clock,
  Download,
  ExternalLink,
} from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorAlert } from '../components/ErrorAlert'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { CorporateDocument, CorporateRecord } from './types'
interface RejectionRecord {
  id: string
  comment: string
  timestamp: string
  adminName: string
}
interface Document {
  id: string
  name: string
  type: string
  size: string
  url: string
  uploadedAt: string
}
interface SignupRequest {
  id: string
  name: string
  email: string
  type: 'corporate' | 'individual'
  companyName?: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  phone?: string
  address?: string
  reason?: string
  experience?: string
  rejectionHistory?: RejectionRecord[]
  approvalDate?: string
  rejectionDate?: string
  // Corporate specific fields
  city?: string
  state?: string
  postalCode?: string
  country?: string
  adminFirstName?: string
  adminLastName?: string
  adminEmail?: string
  // Individual specific fields
  firstName?: string
  lastName?: string
  corporateCode?: string
  // Document fields
  documents?: Document[]
}
export const SignupRequests: React.FC = () => {
  const [requests, setRequests] = useState<CorporateRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CorporateRecord | null>(
    null,
  )
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionComment, setRejectionComment] = useState('')
  const [rejectionCommentError, setRejectionCommentError] = useState('')
  const [previewDocument, setPreviewDocument] = useState<CorporateDocument | null>(null)
  const { user } = useAuth()
  useEffect(() => {
    fetchRequests()
  }, [])
  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {

      const response = await axios.get(
        'https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/signup-requests'
      )
      const signupRequests: CorporateRecord[] = response.data;
      
      // Only include pending and rejected requests
      setRequests(signupRequests);
    } catch (err) {
      console.error('Failed to fetch signup requests:', err)
      setError('Failed to load signup requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const handleViewRequest = (request: CorporateRecord) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }
  const handleApproveRequest = async (request: CorporateRecord) => {
    try {
      axios
      .put(
        `https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/corporates/status/${request.corporate_id}`,
        { status: 'active' },
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Error updating status. Please try again.')
          return
        }
        fetchRequests();
      })
      .catch(() => {
        setError('Error updating status. Please try again.')
      })
      // Close the modal if we're approving from there
      if (showDetailModal) {
        closeDetailModal()
      }
      // Show success message based on type
      const type = request.corporate_id ? 'Corporate' : 'Individual'
      const destination =
        request.corporate_id
          ? 'Corporate Management'
          : 'Individual Management'
      alert(
        `Request approved successfully! The ${type} has been moved to ${destination}.`,
      )
    } catch (error) {
      console.error('Failed to approve request:', error)
      alert('Failed to approve request. Please try again.')
    }
  }
  const handleRejectRequest = async (request: CorporateRecord) => {
    axios
      .put(
        `https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/corporates/status/${request.corporate_id}`,
        { status: 'inactive', 'rejectionReason': rejectionComment },
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Error updating status. Please try again.')
          return
        }
        fetchRequests();
      })
      .catch(() => {
        setError('Error updating status. Please try again.')
      })
    if (showDetailModal) {
      // If we're in the detail modal, show the rejection modal
      setShowRejectionModal(true)
    } else {
      // If we're in the table view, select the request and show both modals
      setSelectedRequest(request)
      setShowRejectionModal(true)
      setShowDetailModal(false)
    }
  }
  const handleConfirmRejection = async () => {
    if (!selectedRequest) return
    // Validate comment
    if (!rejectionComment.trim()) {
      setRejectionCommentError('Please provide a reason for rejection')
      return
    }
    try {
      // In a real application, this would be an API call
      // await rejectRequestApi(selectedRequest.id, rejectionComment);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newRejectionRecord: RejectionRecord = {
        id: Date.now().toString(),
        comment: rejectionComment,
        timestamp: new Date().toISOString(),
        adminName: user?.name || 'Admin User',
      }
      // const updatedRequest = {
      //   ...selectedRequest,
      //   status: 'rejected' as const,
      //   rejectionDate: new Date().toISOString().split('T')[0],
      //   rejectionHistory: [
      //     ...(selectedRequest.rejectionHistory || []),
      //     newRejectionRecord,
      //   ],
      // }
      // setRequests((prev) =>
      //   prev.map((r) => (r.id === selectedRequest.id ? updatedRequest : r)),
      // )
      // Reset and close modals
      setRejectionComment('')
      setRejectionCommentError('')
      setShowRejectionModal(false)
      // setSelectedRequest(updatedRequest)
      // Show success message
      alert('Request rejected successfully!')
    } catch (error) {
      console.error('Failed to reject request:', error)
      alert('Failed to reject request. Please try again.')
    }
  }
  const handleCancelRejection = () => {
    setRejectionComment('')
    setRejectionCommentError('')
    setShowRejectionModal(false)
  }
  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedRequest(null)
  }
  const openDocumentPreview = (document: CorporateDocument) => {
    setPreviewDocument(document)
    // In a real application, this might open a document viewer or redirect to the document URL
    window.open(document.url, '_blank')
  }
  const downloadDocument = (document: CorporateDocument) => {
    // In a real application, this would trigger a download
    // For now, we'll just simulate by opening the URL
    const link = document.createElement('a')
    link.href = document.url
    link.download = document.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const closeDocumentPreview = () => {
    setPreviewDocument(null)
  }
  // Filter requests to only show pending and rejected
  const filteredRequests = requests.filter(
    (req) => req.status === 'pending' || req.status === 'rejected',
  )
  const columns = [
    {
      header: 'Name',
      accessor: (row: CorporateRecord) => {
        return row.admin?.user_details.name || 'Unknown';
      },
      sortable: true,
    },
    {
      header: 'Email',
      accessor: (row: CorporateRecord) => {
        return row.admin?.user_details.email_id || 'Unknown';
      },
      sortable: true,
    },
    {
      header: 'Type',
      accessor: (row: CorporateRecord) => {
        const type = row.corporate_id ? 'Corporate' : 'Individual';
        return type;
      },
      sortable: true,
    },
    {
      header: 'Company',
      accessor: (row: CorporateRecord) => {
        return row.corporate_name || '-'
      },
      sortable: true,
    },
    {
      header: 'Request Date',
      accessor: (row: CorporateRecord) => {
        if (!row.created_at) return '-'
        const date = new Date(row.created_at)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row: CorporateRecord) => {
        const statusStyles = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status]}`}
          >
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        )
      },
    },
    {
      header: 'Actions',
      accessor: (row: CorporateRecord) => {
        return (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleViewRequest(row)
              }}
              className="text-[#466EE5] hover:text-[#3355cc]"
              aria-label="View details"
            >
              <Eye size={18} />
            </button>
            {row.status === 'pending' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApproveRequest(row)
                  }}
                  className="text-green-600 hover:text-green-700"
                  aria-label="Approve request"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRejectRequest(row)
                  }}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Reject request"
                >
                  <XCircle size={18} />
                </button>
              </>
            )}
          </div>
        )
      },
    },
  ]
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">Signup Requests</h1>
      </div>
      {error && <ErrorAlert message={error} onRetry={fetchRequests} />}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No signup requests"
          description="There are no pending or rejected signup requests to review at this time."
          icon={<ClipboardList className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredRequests}
          keyField="id"
          searchable
          pagination
        />
      )}
      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="request-detail-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={closeDetailModal}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    Request Details
                  </h3>
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div
                        className={`p-2 rounded-full ${selectedRequest.corporate_id ? 'bg-blue-100' : 'bg-green-100'}`}
                      >
                        {selectedRequest.corporate_id ? (
                          <Building2
                            className={`h-5 w-5 ${selectedRequest.corporate_id ? 'text-blue-600' : 'text-green-600'}`}
                          />
                        ) : (
                          <User
                            className={`h-5 w-5 ${selectedRequest.corporate_id ? 'text-blue-600' : 'text-green-600'}`}
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRequest.corporate_id ? 'Corporate' : 'Individual'}{' '}
                          Request
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRequest.status === 'pending'
                            ? 'Awaiting review'
                            : selectedRequest.status === 'approved'
                              ? 'Approved'
                              : 'Rejected'}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {selectedRequest.status.charAt(0).toUpperCase() +
                            selectedRequest.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-4 mt-4">
                      {selectedRequest.corporate_id ? (
                        <>
                          {/* Corporate Request Details */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Company Information
                            </h4>
                            <div className="mt-2 grid grid-cols-1 gap-y-2">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {selectedRequest.corporate_name}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-400 mr-2 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="text-sm text-gray-900">
                                  {selectedRequest.address},{' '}
                                  {selectedRequest.city},{' '}
                                  {selectedRequest.state}{' '}
                                  {selectedRequest.postalCode},{' '}
                                  {selectedRequest.country}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Admin Information
                            </h4>
                            <div className="mt-2 grid grid-cols-1 gap-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {selectedRequest.admin.user_details.name}{' '}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {selectedRequest.admin.user_details.email_id}
                                </span>
                              </div>
                              {selectedRequest.contact_number && (
                                <div className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-900">
                                    {selectedRequest.contact_number}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Individual Request Details */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Personal Information
                            </h4>
                            <div className="mt-2 grid grid-cols-1 gap-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {selectedRequest.admin.user_details.name}{' '}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {selectedRequest.admin.user_details.email_id}
                                </span>
                              </div>
                              {selectedRequest.contact_number && (
                                <div className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-900">
                                    {selectedRequest.contact_number}
                                  </span>
                                </div>
                              )}
                              {selectedRequest.address && (
                                <div className="flex items-start">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400 mr-2 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-900">
                                    {selectedRequest.address}
                                  </span>
                                </div>
                              )}
                              {selectedRequest.corporate_id && (
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">
                                    Corporate Code:{' '}
                                    {selectedRequest.corporate_id}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Request Information
                        </h4>
                        <div className="mt-2 grid grid-cols-1 gap-y-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              Requested on{' '}
                              {new Date(
                                selectedRequest.created_at,
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          {selectedRequest.status === 'approved' &&
                            selectedRequest.approvalDate && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm text-gray-900">
                                  Approved on{' '}
                                  {new Date(
                                    selectedRequest.approvalDate,
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                          {selectedRequest.status === 'rejected' &&
                            selectedRequest.rejectionDate && (
                              <div className="flex items-center">
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-sm text-gray-900">
                                  Rejected on{' '}
                                  {new Date(
                                    selectedRequest.rejectionDate,
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                      {/* Submitted Documents Section */}
                      {selectedRequest.documents &&
                        selectedRequest.documents.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Submitted Documents
                            </h4>
                            <div className="mt-2 space-y-2">
                              {selectedRequest.documents.map((document, index) => (
                                <div
                                  key={index}
                                  className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {document.type}
                                      </p>
                                      {/* <p className="text-xs text-gray-500">
                                        {document.size} • Uploaded{' '}
                                      </p> */}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        openDocumentPreview(document)
                                      }
                                      className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                                      aria-label={`Preview ${document.type}`}
                                    >
                                      <ExternalLink size={16} />
                                    </button>
                                    <button
                                      onClick={() => downloadDocument(document)}
                                      className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                                      aria-label={`Download ${document.type}`}
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      {/* Rejection History Section */}
                      {/* {selectedRequest.rejectionHistory &&
                        selectedRequest.rejectionHistory.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Rejection History
                            </h4>
                            <div className="mt-2 space-y-3">
                              {selectedRequest.rejectionHistory.map(
                                (rejection) => (
                                  <div
                                    key={rejection.id}
                                    className="bg-red-50 p-3 rounded border border-red-100"
                                  >
                                    <div className="flex items-start">
                                      <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-900">
                                          {rejection.comment}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3 mr-1" />
                                          <span>
                                            {new Date(
                                              rejection.timestamp,
                                            ).toLocaleString()}{' '}
                                            by {rejection.adminName}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )} */}
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons with consistent spacing */}
              {selectedRequest.status === 'pending' && (
                <div className="mt-6 sm:mt-5 px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleApproveRequest(selectedRequest)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleRejectRequest(selectedRequest)}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={closeDetailModal}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {selectedRequest.status !== 'pending' && (
                <div className="mt-6 sm:mt-5 px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:w-auto sm:text-sm"
                    onClick={closeDetailModal}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Rejection Comment Modal */}
      {showRejectionModal && selectedRequest && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="rejection-comment-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <XCircle
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    Reject Request
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please provide a reason for rejecting this request. This
                      comment will be logged and visible to other
                      administrators.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="rejection-comment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="rejection-comment"
                    name="rejection-comment"
                    rows={4}
                    className={`shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border ${rejectionCommentError ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    placeholder="Explain why this request is being rejected..."
                    value={rejectionComment}
                    onChange={(e) => {
                      setRejectionComment(e.target.value)
                      if (e.target.value.trim()) {
                        setRejectionCommentError('')
                      }
                    }}
                    aria-invalid={!!rejectionCommentError}
                    aria-describedby={
                      rejectionCommentError
                        ? 'rejection-comment-error'
                        : undefined
                    }
                  />
                  {rejectionCommentError && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="rejection-comment-error"
                    >
                      {rejectionCommentError}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleConfirmRejection}
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleCancelRejection}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
