import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    Suspense,
    Component,
  } from 'react'
  import { DataTable } from '../components/DataTable'
  import { LoadingSkeleton } from '../components/LoadingSkeleton'
  import { ErrorAlert } from '../components/ErrorAlert'
  import { EmptyState } from '../components/EmptyState'
  import { useAuth } from '../context/AuthContext'
  import {
    Plus,
    UserCheck,
    CheckCircle,
    XCircle,
    AlertCircle,
    Upload,
    Edit,
    Award,
    UserMinus,
    UserPlus,
    Trash2,
    X,
    FileSpreadsheet,
    Key,
    KeyRound,
    KeySquare,
    ShieldCheck,
  } from 'lucide-react'
  // Add an ErrorBoundary component
  class ErrorBoundary extends Component<
    {
      children: React.ReactNode
      fallback: React.ReactNode
    },
    {
      hasError: boolean
    }
  > {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
      super(props)
      this.state = {
        hasError: false,
      }
    }
    static getDerivedStateFromError() {
      return {
        hasError: true,
      }
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Volunteer Management Error:', error, errorInfo)
    }
    render() {
      if (this.state.hasError) {
        return this.props.fallback
      }
      return this.props.children
    }
  }
  // Define interfaces for better type safety
  interface Volunteer {
    id: string
    name: string
    email: string
    status: 'active' | 'pending' | 'inactive'
    corporate: string
    corporateId: string
    points: number
    joinedDate: string
    lastActivity: string
    hasLicense: boolean
    licenseKey?: string
    licenseExpiryDate?: string
  }
  interface LicenseKey {
    id: string
    key: string
    isAssigned: boolean
    expiryDate: string
  }
  // Main component wrapped with ErrorBoundary
  export const VolunteerManagementNEW: React.FC = () => {
    return (
      <ErrorBoundary
        fallback={
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  An error occurred while loading the Volunteer Management page
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Please refresh the page or contact support if the problem
                    persists.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <VolunteerManagementContent />
      </ErrorBoundary>
    )
  }
  // Separate the content to be wrapped by ErrorBoundary
  const VolunteerManagementContent: React.FC = () => {
    const { user } = useAuth()
    const isSuperAdmin = user?.role === 'super_admin'
    const [volunteers, setVolunteers] = useState<Volunteer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // License states
    const [showLicenseModal, setShowLicenseModal] = useState(false)
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
      null,
    )
    const [availableLicenses, setAvailableLicenses] = useState(25)
    const [isAssigningLicense, setIsAssigningLicense] = useState(false)
    // License keys pool
    const [licenseKeysPool, setLicenseKeysPool] = useState<LicenseKey[]>([])
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showPointsModal, setShowPointsModal] = useState(false)
    const [showStatusEditModal, setShowStatusEditModal] = useState(false)
    // New state for status selection
    const [newStatus, setNewStatus] = useState<'active' | 'pending' | 'inactive'>(
      'active',
    )
    // Form states
    const [newVolunteer, setNewVolunteer] = useState({
      name: '',
      email: '',
    })
    const [editVolunteer, setEditVolunteer] = useState<Volunteer | null>(null)
    const [pointsToAdd, setPointsToAdd] = useState(0)
    // Bulk upload states
    const [bulkFile, setBulkFile] = useState<File | null>(null)
    const [bulkUploadProgress, setBulkUploadProgress] = useState(0)
    const [bulkUploadStatus, setBulkUploadStatus] = useState<
      'idle' | 'uploading' | 'success' | 'error'
    >('idle')
    const [previewData, setPreviewData] = useState<
      {
        name: string
        email: string
      }[]
    >([])
    // License sending states
    const [isSendingLicense, setIsSendingLicense] = useState(false)
    const [licenseSentSuccess, setLicenseSentSuccess] = useState<string | null>(
      null,
    )
    const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])
    const [showBulkSendModal, setShowBulkSendModal] = useState(false)
    const [bulkSendStatus, setBulkSendStatus] = useState<
      'idle' | 'processing' | 'success' | 'error'
    >('idle')
    const getCorporateNameById = useCallback((corporateId: string): string => {
      const corporateMap: {
        [key: string]: string
      } = {
        '1': 'TechGiant Inc.',
        '2': 'Global Finance Ltd',
        '3': 'Acme Corporation',
        '4': 'Oceanic Airlines',
      }
      return corporateMap[corporateId] || 'Unknown Corporate'
    }, [])
    const corporateName = isSuperAdmin
      ? 'All Corporates'
      : user?.corporateId
        ? getCorporateNameById(user.corporateId)
        : 'Your Corporate'
    // Memoize the fetchVolunteers function to prevent unnecessary re-renders
    const fetchVolunteers = useCallback(async () => {
      setLoading(true)
      setError(null)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mockVolunteers: Volunteer[] = [
          {
            id: '1',
            name: 'Michael Brown',
            email: 'michael.b@techgiant.com',
            status: 'active',
            corporate: 'TechGiant Inc.',
            corporateId: '1',
            points: 240,
            joinedDate: '2023-02-10',
            lastActivity: '2023-05-19',
            hasLicense: true,
            licenseKey: 'TG-2023-MB-7A9F3D1E',
            licenseExpiryDate: '2024-05-19',
          },
          {
            id: '2',
            name: 'Emily Davis',
            email: 'emily.d@techgiant.com',
            status: 'active',
            corporate: 'TechGiant Inc.',
            corporateId: '1',
            points: 170,
            joinedDate: '2023-03-05',
            lastActivity: '2023-05-15',
            hasLicense: true,
            licenseKey: 'TG-2023-ED-5B2C8F7A',
            licenseExpiryDate: '2024-05-15',
          },
          {
            id: '3',
            name: 'James Wilson',
            email: 'james.w@globalfinance.com',
            status: 'active',
            corporate: 'Global Finance Ltd',
            corporateId: '2',
            points: 130,
            joinedDate: '2023-03-15',
            lastActivity: '2023-05-10',
            hasLicense: false,
          },
          {
            id: '4',
            name: 'Sophia Martinez',
            email: 'sophia.m@acme.com',
            status: 'active',
            corporate: 'Acme Corporation',
            corporateId: '3',
            points: 80,
            joinedDate: '2023-04-02',
            lastActivity: '2023-05-05',
            hasLicense: false,
          },
          {
            id: '5',
            name: 'David Johnson',
            email: 'david.j@oceanic.com',
            status: 'pending',
            corporate: 'Oceanic Airlines',
            corporateId: '4',
            points: 0,
            joinedDate: '2023-05-10',
            lastActivity: '2023-05-10',
            hasLicense: false,
          },
        ]
        // Check if user exists before filtering
        if (!user) {
          throw new Error('User information not available')
        }
        const filteredVolunteers = isSuperAdmin
          ? mockVolunteers
          : mockVolunteers.filter((v) => v.corporateId === user?.corporateId)
        setVolunteers(filteredVolunteers)
      } catch (err) {
        console.error('Failed to fetch volunteers:', err)
        setError('Failed to load volunteer data. Please try again.')
      } finally {
        setLoading(false)
      }
    }, [isSuperAdmin, user])
    // Generate a pool of license keys
    const generateLicenseKeysPool = useCallback(() => {
      // Create a pool of 50 license keys (more than our available 25 licenses)
      const corporatePrefixes = ['TG', 'GF', 'AC', 'OA', 'US']
      const pool: LicenseKey[] = []
      for (let i = 0; i < 50; i++) {
        const corporatePrefix =
          corporatePrefixes[Math.floor(Math.random() * corporatePrefixes.length)]
        const year = new Date().getFullYear()
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const initials = `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}`
        const randomId = Math.random().toString(16).substring(2, 10).toUpperCase()
        const key = `${corporatePrefix}-${year}-${initials}-${randomId}`
        const expiryDate = generateExpiryDate()
        pool.push({
          id: `license-${i + 1}`,
          key,
          isAssigned: false,
          expiryDate,
        })
      }
      setLicenseKeysPool(pool)
    }, [])
    useEffect(() => {
      // Only proceed if user data is available
      if (user) {
        fetchVolunteers()
        generateLicenseKeysPool()
      }
    }, [user, fetchVolunteers, generateLicenseKeysPool])
    const generateExpiryDate = (): string => {
      // Generate an expiry date one year from now
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      return expiryDate.toISOString().split('T')[0]
    }
    const getRandomUnassignedLicense = (): LicenseKey | null => {
      // Get all unassigned license keys
      const unassignedKeys = licenseKeysPool.filter(
        (license) => !license.isAssigned,
      )
      if (unassignedKeys.length === 0) {
        return null
      }
      // Select a random unassigned license key
      const randomIndex = Math.floor(Math.random() * unassignedKeys.length)
      return unassignedKeys[randomIndex]
    }
    const handleAssignLicense = async (volunteer: Volunteer) => {
      if (availableLicenses <= 0) {
        alert('No available licenses. Please purchase more licenses.')
        return
      }
      setIsAssigningLicense(true)
      try {
        // Simulate API call to assign license
        await new Promise((resolve) => setTimeout(resolve, 800))
        // Get a random unassigned license key
        const randomLicense = getRandomUnassignedLicense()
        if (!randomLicense) {
          throw new Error('No available license keys in the pool.')
        }
        // Mark the license key as assigned in the pool
        setLicenseKeysPool((prev) =>
          prev.map((license) =>
            license.id === randomLicense.id
              ? {
                  ...license,
                  isAssigned: true,
                }
              : license,
          ),
        )
        // Update volunteer with license info
        setVolunteers((prev) =>
          prev.map((v) =>
            v.id === volunteer.id
              ? {
                  ...v,
                  hasLicense: true,
                  licenseKey: randomLicense.key,
                  licenseExpiryDate: randomLicense.expiryDate,
                }
              : v,
          ),
        )
        // Decrease available licenses count
        setAvailableLicenses((prev) => prev - 1)
      } catch (error) {
        console.error('Failed to assign license:', error)
        alert('Failed to assign license. Please try again.')
      } finally {
        setIsAssigningLicense(false)
      }
    }
    const handleViewLicense = (volunteer: Volunteer) => {
      setSelectedVolunteer(volunteer)
      setShowLicenseModal(true)
    }
    const handleAddVolunteer = () => {
      if (!newVolunteer.name.trim() || !newVolunteer.email.trim()) return
      const newId = `${Date.now()}`
      const corporateId = user?.corporateId || '1'
      const corporate = getCorporateNameById(corporateId)
      // Create volunteer with license automatically assigned if they're active
      const isActive = true // New volunteers are active by default
      let hasLicense = false
      let licenseKey = undefined
      let licenseExpiryDate = undefined
      // Automatically assign a license if the volunteer is active
      if (isActive && availableLicenses > 0) {
        const randomLicense = getRandomUnassignedLicense()
        if (randomLicense) {
          hasLicense = true
          licenseKey = randomLicense.key
          licenseExpiryDate = randomLicense.expiryDate
          // Mark the license as assigned in the pool
          setLicenseKeysPool((prev) =>
            prev.map((license) =>
              license.id === randomLicense.id
                ? {
                    ...license,
                    isAssigned: true,
                  }
                : license,
            ),
          )
          // Decrease available licenses count
          setAvailableLicenses((prev) => prev - 1)
        }
      }
      const volunteer: Volunteer = {
        id: newId,
        name: newVolunteer.name,
        email: newVolunteer.email,
        status: 'active',
        corporate,
        corporateId,
        points: 0,
        joinedDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        hasLicense,
        ...(licenseKey && {
          licenseKey,
        }),
        ...(licenseExpiryDate && {
          licenseExpiryDate,
        }),
      }
      setVolunteers((prev) => [...prev, volunteer])
      setNewVolunteer({
        name: '',
        email: '',
      })
      setShowAddModal(false)
    }
    const handleBulkUpload = () => {
      if (!bulkFile) return
      setBulkUploadStatus('uploading')
      // Simulate processing the file
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setBulkUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          setBulkUploadStatus('success')
          // Add the preview data as new volunteers with automatically assigned licenses
          const newVolunteers = previewData.map((data, index) => {
            const newId = `bulk-${Date.now()}-${index}`
            const corporateId = user?.corporateId || '1'
            const corporate = getCorporateNameById(corporateId)
            // Auto-assign a license if available
            let hasLicense = false
            let licenseKey = undefined
            let licenseExpiryDate = undefined
            if (availableLicenses > 0) {
              const randomLicense = getRandomUnassignedLicense()
              if (randomLicense) {
                hasLicense = true
                licenseKey = randomLicense.key
                licenseExpiryDate = randomLicense.expiryDate
                // Mark the license as assigned in the pool
                setLicenseKeysPool((prev) =>
                  prev.map((license) =>
                    license.id === randomLicense.id
                      ? {
                          ...license,
                          isAssigned: true,
                        }
                      : license,
                  ),
                )
                // Decrease available licenses count
                setAvailableLicenses((prev) => prev - 1)
              }
            }
            return {
              id: newId,
              name: data.name,
              email: data.email,
              status: 'active' as const,
              corporate,
              corporateId,
              points: 0,
              joinedDate: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
              hasLicense,
              ...(licenseKey && {
                licenseKey,
              }),
              ...(licenseExpiryDate && {
                licenseExpiryDate,
              }),
            }
          })
          setVolunteers((prev) => [...prev, ...newVolunteers])
          setTimeout(() => {
            setBulkFile(null)
            setBulkUploadProgress(0)
            setBulkUploadStatus('idle')
            setPreviewData([])
            setShowBulkUploadModal(false)
          }, 1500)
        }
      }, 300)
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0]
        setBulkFile(file)
        // Simulate parsing the file and showing preview
        setTimeout(() => {
          const mockPreviewData = [
            {
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            {
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
            },
            {
              name: 'Robert Johnson',
              email: 'robert.j@example.com',
            },
          ]
          setPreviewData(mockPreviewData)
        }, 500)
      }
    }
    const handleUpdateVolunteer = () => {
      if (!editVolunteer) return
      setVolunteers((prev) =>
        prev.map((v) => (v.id === editVolunteer.id ? editVolunteer : v)),
      )
      setShowEditModal(false)
      setEditVolunteer(null)
    }
    const handleAddPoints = () => {
      if (!selectedVolunteer || pointsToAdd <= 0) return
      const updatedVolunteer = {
        ...selectedVolunteer,
        points: selectedVolunteer.points + pointsToAdd,
      }
      setVolunteers((prev) =>
        prev.map((v) => (v.id === selectedVolunteer.id ? updatedVolunteer : v)),
      )
      setShowPointsModal(false)
      setSelectedVolunteer(null)
      setPointsToAdd(0)
    }
    const handleDeleteVolunteer = (volunteer: Volunteer) => {
      if (window.confirm(`Are you sure you want to delete ${volunteer.name}?`)) {
        setVolunteers((prev) => prev.filter((v) => v.id !== volunteer.id))
        // If the volunteer being deleted is selected, clear the selection
        if (selectedVolunteers.includes(volunteer.id)) {
          setSelectedVolunteers((prev) =>
            prev.filter((id) => id !== volunteer.id),
          )
        }
      }
    }
    const handleActivateVolunteer = (volunteer: Volunteer) => {
      // When activating a volunteer, automatically assign a license if available
      let hasLicense = volunteer.hasLicense
      let licenseKey = volunteer.licenseKey
      let licenseExpiryDate = volunteer.licenseExpiryDate
      if (!hasLicense && availableLicenses > 0) {
        const randomLicense = getRandomUnassignedLicense()
        if (randomLicense) {
          hasLicense = true
          licenseKey = randomLicense.key
          licenseExpiryDate = randomLicense.expiryDate
          // Mark the license as assigned in the pool
          setLicenseKeysPool((prev) =>
            prev.map((license) =>
              license.id === randomLicense.id
                ? {
                    ...license,
                    isAssigned: true,
                  }
                : license,
            ),
          )
          // Decrease available licenses count
          setAvailableLicenses((prev) => prev - 1)
        }
      }
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === volunteer.id
            ? {
                ...v,
                status: 'active',
                hasLicense,
                ...(licenseKey && {
                  licenseKey,
                }),
                ...(licenseExpiryDate && {
                  licenseExpiryDate,
                }),
              }
            : v,
        ),
      )
    }
    const handleDeactivateVolunteer = (volunteer: Volunteer) => {
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === volunteer.id
            ? {
                ...v,
                status: 'inactive',
              }
            : v,
        ),
      )
    }
    const handleEditVolunteer = (volunteer: Volunteer) => {
      setEditVolunteer({
        ...volunteer,
      })
      setShowEditModal(true)
    }
    const handleOpenPointsModal = (volunteer: Volunteer) => {
      setSelectedVolunteer(volunteer)
      setPointsToAdd(0) // Reset points to add
      setShowPointsModal(true)
    }
    const handleOpenStatusEditModal = (volunteer: Volunteer) => {
      setSelectedVolunteer(volunteer)
      setNewStatus(volunteer.status)
      setShowStatusEditModal(true)
    }
    const handleStatusUpdateFromModal = () => {
      if (!selectedVolunteer) return
      // If changing status to active and volunteer doesn't have a license, assign one
      let hasLicense = selectedVolunteer.hasLicense
      let licenseKey = selectedVolunteer.licenseKey
      let licenseExpiryDate = selectedVolunteer.licenseExpiryDate
      if (newStatus === 'active' && !hasLicense && availableLicenses > 0) {
        const randomLicense = getRandomUnassignedLicense()
        if (randomLicense) {
          hasLicense = true
          licenseKey = randomLicense.key
          licenseExpiryDate = randomLicense.expiryDate
          // Mark the license as assigned in the pool
          setLicenseKeysPool((prev) =>
            prev.map((license) =>
              license.id === randomLicense.id
                ? {
                    ...license,
                    isAssigned: true,
                  }
                : license,
            ),
          )
          // Decrease available licenses count
          setAvailableLicenses((prev) => prev - 1)
        }
      }
      // Update the volunteer's status
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === selectedVolunteer.id
            ? {
                ...v,
                status: newStatus,
                hasLicense,
                ...(licenseKey && {
                  licenseKey,
                }),
                ...(licenseExpiryDate && {
                  licenseExpiryDate,
                }),
              }
            : v,
        ),
      )
      // Close the modal and reset state
      setShowStatusEditModal(false)
      setSelectedVolunteer(null)
    }
    const handleStatusChange = (
      volunteer: Volunteer,
      newStatus: 'active' | 'pending' | 'inactive',
    ) => {
      // If changing status to active and volunteer doesn't have a license, assign one
      let hasLicense = volunteer.hasLicense
      let licenseKey = volunteer.licenseKey
      let licenseExpiryDate = volunteer.licenseExpiryDate
      if (newStatus === 'active' && !hasLicense && availableLicenses > 0) {
        const randomLicense = getRandomUnassignedLicense()
        if (randomLicense) {
          hasLicense = true
          licenseKey = randomLicense.key
          licenseExpiryDate = randomLicense.expiryDate
          // Mark the license as assigned in the pool
          setLicenseKeysPool((prev) =>
            prev.map((license) =>
              license.id === randomLicense.id
                ? {
                    ...license,
                    isAssigned: true,
                  }
                : license,
            ),
          )
          // Decrease available licenses count
          setAvailableLicenses((prev) => prev - 1)
        }
      }
      // In a real app, this would call an API endpoint
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === volunteer.id
            ? {
                ...v,
                status: newStatus,
                hasLicense,
                ...(licenseKey && {
                  licenseKey,
                }),
                ...(licenseExpiryDate && {
                  licenseExpiryDate,
                }),
              }
            : v,
        ),
      )
    }
    // Add function to handle sending a license to a volunteer
    const handleSendLicense = async (volunteer: Volunteer) => {
      if (!volunteer.licenseKey) {
        alert('No license key available to send.')
        return
      }
      setIsSendingLicense(true)
      try {
        // Simulate API call to send license
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // In a real app, this would call an API to send an email
        console.log(`License ${volunteer.licenseKey} sent to ${volunteer.email}`)
        // Show success message
        setLicenseSentSuccess(`License successfully sent to ${volunteer.name}.`)
        // Clear success message after 3 seconds
        setTimeout(() => {
          setLicenseSentSuccess(null)
        }, 3000)
      } catch (error) {
        console.error('Failed to send license:', error)
        alert('Failed to send license. Please try again.')
      } finally {
        setIsSendingLicense(false)
      }
    }
    // Add function to handle bulk sending of licenses
    const handleBulkSendLicenses = async () => {
      if (selectedVolunteers.length === 0) {
        alert('Please select at least one volunteer.')
        return
      }
      // Get the selected volunteer objects
      const volunteersToSend = volunteers.filter(
        (v) => selectedVolunteers.includes(v.id) && v.hasLicense,
      )
      if (volunteersToSend.length === 0) {
        alert('None of the selected volunteers have licenses to send.')
        return
      }
      setBulkSendStatus('processing')
      try {
        // Simulate API call to bulk send licenses
        await new Promise((resolve) => setTimeout(resolve, 1500))
        // In a real app, this would call an API to send emails
        volunteersToSend.forEach((volunteer) => {
          console.log(
            `License ${volunteer.licenseKey} sent to ${volunteer.email}`,
          )
        })
        setBulkSendStatus('success')
        // Close modal after success
        setTimeout(() => {
          setShowBulkSendModal(false)
          setBulkSendStatus('idle')
          // Clear selections
          setSelectedVolunteers([])
        }, 1500)
      } catch (error) {
        console.error('Failed to bulk send licenses:', error)
        setBulkSendStatus('error')
      }
    }
    // Add function to toggle volunteer selection
    const toggleVolunteerSelection = (volunteerId: string) => {
      setSelectedVolunteers((prev) =>
        prev.includes(volunteerId)
          ? prev.filter((id) => id !== volunteerId)
          : [...prev, volunteerId],
      )
    }
    // Add function to select/deselect all volunteers
    const toggleSelectAll = () => {
      if (selectedVolunteers.length === volunteers.length) {
        // If all are selected, deselect all
        setSelectedVolunteers([])
      } else {
        // Otherwise, select all
        setSelectedVolunteers(volunteers.map((v) => v.id))
      }
    }
    // Status Toggle Component for Super Admin
    const StatusToggle = ({ volunteer }: { volunteer: Volunteer }) => {
      return (
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStatusChange(volunteer, 'active')
            }}
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] ${volunteer.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
            aria-label={
              volunteer.status === 'active'
                ? 'Currently active'
                : 'Set status to active'
            }
            title="Active"
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStatusChange(volunteer, 'pending')
            }}
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] ${volunteer.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
            aria-label={
              volunteer.status === 'pending'
                ? 'Currently pending'
                : 'Set status to pending'
            }
            title="Pending"
          >
            <AlertCircle className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStatusChange(volunteer, 'inactive')
            }}
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] ${volunteer.status === 'inactive' ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
            aria-label={
              volunteer.status === 'inactive'
                ? 'Currently inactive'
                : 'Set status to inactive'
            }
            title="Inactive"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )
    }
    const renderSuperAdminActions = (volunteer: Volunteer) => {
      return (
        <div className="flex justify-end space-x-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenStatusEditModal(volunteer)
            }}
            className="text-amber-600 hover:text-amber-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
            title="Edit Status"
            aria-label={`Edit status for ${volunteer.name}`}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteVolunteer(volunteer)
            }}
            className="text-red-600 hover:text-red-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
            title="Delete Volunteer"
            aria-label={`Delete ${volunteer.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
    const renderCorporateAdminActions = (volunteer: Volunteer) => {
      return (
        <div className="flex justify-end space-x-2">
          {volunteer.status !== 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleActivateVolunteer(volunteer)
              }}
              className="text-green-600 hover:text-green-700"
              title="Activate Volunteer"
            >
              <UserPlus className="h-5 w-5" />
              <span className="sr-only">Activate</span>
            </button>
          )}
          {volunteer.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeactivateVolunteer(volunteer)
              }}
              className="text-gray-600 hover:text-gray-700"
              title="Deactivate Volunteer"
            >
              <UserMinus className="h-5 w-5" />
              <span className="sr-only">Deactivate</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEditVolunteer(volunteer)
            }}
            className="text-amber-600 hover:text-amber-700"
            title="Edit Volunteer"
          >
            <Edit className="h-5 w-5" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenPointsModal(volunteer)
            }}
            className="text-blue-600 hover:text-blue-700"
            title="Assign Points"
          >
            <Award className="h-5 w-5" />
            <span className="sr-only">Assign Points</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteVolunteer(volunteer)
            }}
            className="text-red-600 hover:text-red-700"
            title="Delete Volunteer"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      )
    }
    const renderAddVolunteerModal = () => {
      if (!showAddModal) return null
      return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Volunteer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={newVolunteer.name}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={newVolunteer.email}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                  required
                />
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
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <KeyRound className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      A license will be automatically assigned to this volunteer
                      upon creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddVolunteer}
                disabled={!newVolunteer.name || !newVolunteer.email}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Volunteer
              </button>
            </div>
          </div>
        </div>
      )
    }
    const renderBulkUploadModal = () => {
      if (!showBulkUploadModal) return null
      return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Bulk Upload Volunteers
              </h3>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={bulkUploadStatus === 'uploading'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {bulkUploadStatus !== 'success' ? (
              <>
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
                    <div className="bg-blue-50 p-4 rounded-md mt-2">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <KeyRound className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            Licenses will be automatically assigned to all
                            uploaded volunteers.
                          </p>
                        </div>
                      </div>
                    </div>
                    {!bulkFile ? (
                      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Drag and drop your file here, or{' '}
                            <label className="text-[#466EE5] hover:text-[#3355cc] cursor-pointer">
                              browse
                              <input
                                type="file"
                                className="hidden"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-400">
                            Supported formats: .csv, .xlsx, .xls
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
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
                          <button
                            type="button"
                            onClick={() => setBulkFile(null)}
                            className="ml-4 text-sm font-medium text-[#466EE5] hover:text-[#3355cc]"
                            disabled={bulkUploadStatus === 'uploading'}
                          >
                            Remove
                          </button>
                        </div>
                        {bulkUploadStatus === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-[#466EE5] h-2.5 rounded-full"
                                style={{
                                  width: `${bulkUploadProgress}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Processing: {bulkUploadProgress}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {previewData.length > 0 && (
                    <div>
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
                            {previewData.map((data, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {data.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {data.email}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                    disabled={bulkUploadStatus === 'uploading'}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    disabled={
                      !bulkFile ||
                      bulkUploadStatus === 'uploading' ||
                      previewData.length === 0
                    }
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkUploadStatus === 'uploading'
                      ? 'Uploading...'
                      : 'Upload & Create Volunteers'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
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
                  <button
                    type="button"
                    onClick={() => {
                      setBulkFile(null)
                      setBulkUploadProgress(0)
                      setBulkUploadStatus('idle')
                      setPreviewData([])
                      setShowBulkUploadModal(false)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
    const renderEditVolunteerModal = () => {
      if (!editVolunteer || !showEditModal) return null
      return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Volunteer
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditVolunteer(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editVolunteer.name}
                  onChange={(e) =>
                    setEditVolunteer({
                      ...editVolunteer,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="edit-email"
                  value={editVolunteer.email}
                  onChange={(e) =>
                    setEditVolunteer({
                      ...editVolunteer,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-points"
                  className="block text-sm font-medium text-gray-700"
                >
                  Points
                </label>
                <input
                  type="number"
                  id="edit-points"
                  value={editVolunteer.points}
                  onChange={(e) =>
                    setEditVolunteer({
                      ...editVolunteer,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editVolunteer.status}
                  onChange={(e) =>
                    setEditVolunteer({
                      ...editVolunteer,
                      status: e.target.value as 'active' | 'pending' | 'inactive',
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {editVolunteer.status === 'active' &&
                !editVolunteer.hasLicense &&
                availableLicenses > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <KeyRound className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          A license will be automatically assigned to this
                          volunteer when saved as active.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditVolunteer(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateVolunteer}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )
    }
    const renderAssignPointsModal = () => {
      if (!selectedVolunteer || !showPointsModal) return null
      return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assign Points</h3>
              <button
                onClick={() => {
                  setShowPointsModal(false)
                  setSelectedVolunteer(null)
                  setPointsToAdd(0)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Assigning points to{' '}
                  <span className="font-medium">{selectedVolunteer.name}</span>
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
                    {selectedVolunteer.points}
                  </p>
                </div>
              </div>
              <div>
                <label
                  htmlFor="points-to-add"
                  className="block text-sm font-medium text-gray-700"
                >
                  Points to Add
                </label>
                <input
                  type="number"
                  id="points-to-add"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
                />
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
                        {selectedVolunteer.points + pointsToAdd}
                      </span>{' '}
                      points
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowPointsModal(false)
                  setSelectedVolunteer(null)
                  setPointsToAdd(0)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPoints}
                disabled={pointsToAdd <= 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Points
              </button>
            </div>
          </div>
        </div>
      )
    }
    const renderStatusEditModal = () => {
      if (!selectedVolunteer || !showStatusEditModal) return null
      return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
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
                      Update the status for {selectedVolunteer.name}
                    </p>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) =>
                          setNewStatus(
                            e.target.value as 'active' | 'pending' | 'inactive',
                          )
                        }
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5] sm:text-sm rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    {newStatus === 'active' &&
                      !selectedVolunteer.hasLicense &&
                      availableLicenses > 0 && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <KeyRound className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                A license will be automatically assigned to this
                                volunteer when saved as active.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowStatusEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:mt-0 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdateFromModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    const renderLicenseDetailsModal = () => {
      if (!selectedVolunteer || !showLicenseModal) return null
      // If the volunteer doesn't have a license, show a message
      if (!selectedVolunteer.hasLicense) {
        return (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  License Details
                </h3>
                <button
                  onClick={() => {
                    setShowLicenseModal(false)
                    setSelectedVolunteer(null)
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="py-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <KeyRound className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No License Assigned
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This volunteer doesn't have a license assigned yet.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLicenseModal(false)
                      setSelectedVolunteer(null)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                License Details
              </h3>
              <button
                onClick={() => {
                  setShowLicenseModal(false)
                  setSelectedVolunteer(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-center">
                <div className="bg-blue-50 p-4 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-gray-900">
                  {selectedVolunteer.name}
                </h4>
                <p className="text-sm text-gray-500">{selectedVolunteer.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-2">
                  <p className="text-sm font-medium text-gray-500">License Key</p>
                  <p className="text-lg font-mono font-semibold text-gray-900 mt-1 break-all">
                    {selectedVolunteer.licenseKey || 'N/A'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Expiry Date
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedVolunteer.licenseExpiryDate
                        ? new Date(
                            selectedVolunteer.licenseExpiryDate,
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              {licenseSentSuccess && (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {licenseSentSuccess}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <KeyRound className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This license provides full access to all platform features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowLicenseModal(false)
                  setSelectedVolunteer(null)
                }}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSendLicense(selectedVolunteer)}
                disabled={isSendingLicense || !selectedVolunteer.licenseKey}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#466EE5] text-base font-medium text-white hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] sm:text-sm disabled:opacity-50"
              >
                {isSendingLicense ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>Send License</>
                )}
              </button>
            </div>
          </div>
        </div>
      )
    }
    const renderBulkSendLicensesModal = () => {
      if (!showBulkSendModal) return null
      // Get the selected volunteer objects
      const volunteersToSend = volunteers.filter(
        (v) => selectedVolunteers.includes(v.id) && v.hasLicense,
      )
      return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Bulk Send Licenses
              </h3>
              <button
                onClick={() => setShowBulkSendModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={bulkSendStatus === 'processing'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {bulkSendStatus === 'idle' ? (
              <>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <KeySquare className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          This will send license keys via email to the selected
                          volunteers.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Selected volunteers:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedVolunteers.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-gray-500">
                        With licenses:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {volunteersToSend.length}
                      </span>
                    </div>
                  </div>
                  {volunteersToSend.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Volunteers to receive licenses ({volunteersToSend.length})
                      </h4>
                      <div className="border border-gray-200 rounded-md overflow-hidden max-h-40 overflow-y-auto">
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
                            {volunteersToSend.map((volunteer) => (
                              <tr key={volunteer.id}>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {volunteer.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {volunteer.email}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkSendModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkSendLicenses}
                    disabled={volunteersToSend.length === 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Licenses
                  </button>
                </div>
              </>
            ) : bulkSendStatus === 'processing' ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full">
                  <svg
                    className="animate-spin h-8 w-8 text-[#466EE5]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Sending Licenses
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This may take a moment...
                </p>
              </div>
            ) : bulkSendStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Licenses Sent Successfully
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {volunteersToSend.length} licenses have been sent to volunteers.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkSendModal(false)
                      setBulkSendStatus('idle')
                      setSelectedVolunteers([])
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Error Sending Licenses
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  There was an error sending licenses. Please try again.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkSendStatus('idle')
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
    // Define columns based on user role
    const getSuperAdminColumns = useCallback(
      () => [
        {
          header: 'Name',
          accessor: 'name',
          sortable: true,
        },
        {
          header: 'Email',
          accessor: 'email',
          sortable: true,
        },
        {
          header: 'Status',
          accessor: (row: Volunteer) => {
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
          header: 'Corporate',
          accessor: 'corporate',
          sortable: true,
        },
        {
          header: 'Points',
          accessor: 'points',
          sortable: true,
        },
        {
          header: 'Joined',
          accessor: (row: Volunteer) => {
            try {
              const date = new Date(row.joinedDate)
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            } catch (error) {
              console.error('Invalid date format:', row.joinedDate)
              return 'Invalid date'
            }
          },
          sortable: true,
        },
      ],
      [],
    )
    const getCorporateAdminColumns = useCallback(
      () => [
        {
          header: (
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#466EE5] focus:ring-[#466EE5] border-gray-300 rounded"
                checked={
                  selectedVolunteers.length > 0 &&
                  selectedVolunteers.length === volunteers.length
                }
                onChange={toggleSelectAll}
                aria-label="Select all volunteers"
              />
              <span className="ml-2">Name</span>
            </div>
          ),
          accessor: (row: Volunteer) => (
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#466EE5] focus:ring-[#466EE5] border-gray-300 rounded mr-2"
                checked={selectedVolunteers.includes(row.id)}
                onChange={() => toggleVolunteerSelection(row.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${row.name}`}
              />
              {row.name}
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Email',
          accessor: 'email',
          sortable: true,
        },
        {
          header: 'Status',
          accessor: (row: Volunteer) => {
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
          header: 'Points',
          accessor: 'points',
          sortable: true,
        },
        {
          header: 'Joined',
          accessor: (row: Volunteer) => {
            try {
              const date = new Date(row.joinedDate)
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            } catch (error) {
              console.error('Invalid date format:', row.joinedDate)
              return 'Invalid date'
            }
          },
          sortable: true,
        },
        {
          header: 'License',
          accessor: (row: Volunteer) => {
            if (row.status !== 'active') {
              return <span className="text-gray-400 text-sm italic">N/A</span>
            }
            // Always show View License button, regardless of whether they have a license
            if (row.hasLicense) {
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewLicense(row)
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-[#466EE5] bg-[#EFF6FF] hover:bg-[#DBEAFE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                >
                  <KeyRound className="h-3.5 w-3.5 mr-1" />
                  View License
                </button>
              )
            } else {
              // For volunteers without a license, show "No License" text
              return (
                <span className="text-gray-400 text-sm italic">No License</span>
              )
            }
          },
        },
      ],
      [volunteers.length, selectedVolunteers, toggleSelectAll, handleViewLicense],
    )
    const columns = useMemo(
      () => (isSuperAdmin ? getSuperAdminColumns() : getCorporateAdminColumns()),
      [isSuperAdmin, getSuperAdminColumns, getCorporateAdminColumns],
    )
    // Render loading state or error outside of the main content
    if (loading) {
      return <LoadingSkeleton type="table" />
    }
    if (error) {
      return <ErrorAlert message={error} onRetry={fetchVolunteers} />
    }
    // If user data is not available, show a loading state
    if (!user) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      )
    }
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#111827]">
            Volunteer Management
          </h1>
          {!isSuperAdmin && (
            <div className="flex space-x-2">
              {selectedVolunteers.length > 0 ? (
                <button
                  onClick={() => setShowBulkSendModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
                >
                  <KeySquare className="h-4 w-4 mr-2" />
                  Bulk Send Licenses ({selectedVolunteers.length})
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                >
                  <KeySquare className="h-4 w-4 mr-2" />
                  Bulk Send Licenses
                </button>
              )}
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Volunteer
              </button>
            </div>
          )}
        </div>
        {!isSuperAdmin && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
                  <KeySquare size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Licenses</p>
                  <p className="text-2xl font-bold">{availableLicenses}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#ECFDF5] text-green-600 mr-4">
                  <KeyRound size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Licenses</p>
                  <p className="text-2xl font-bold">
                    {volunteers.filter((v) => v.hasLicense).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically assigned to active volunteers
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#FEF3C7] text-amber-600 mr-4">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Volunteers</p>
                  <p className="text-2xl font-bold">
                    {volunteers.filter((v) => v.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {volunteers.length === 0 ? (
          <EmptyState
            title="No volunteers found"
            description={
              isSuperAdmin
                ? 'No volunteers have been added to the system yet.'
                : 'Get started by adding your first volunteer or uploading a list of volunteers.'
            }
            actionLabel={isSuperAdmin ? undefined : 'Add Volunteer'}
            onAction={isSuperAdmin ? undefined : () => setShowAddModal(true)}
            icon={<UserCheck className="h-12 w-12 text-gray-400" />}
          />
        ) : (
          <Suspense fallback={<LoadingSkeleton type="table" />}>
            {selectedVolunteers.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-blue-700">
                    {selectedVolunteers.length} volunteer
                    {selectedVolunteers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedVolunteers([])}
                    className="text-blue-700 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => setShowBulkSendModal(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send Licenses
                  </button>
                </div>
              </div>
            )}
            <DataTable
              columns={columns}
              data={volunteers}
              keyField="id"
              onDelete={handleDeleteVolunteer}
              renderActions={
                isSuperAdmin
                  ? renderSuperAdminActions
                  : renderCorporateAdminActions
              }
              searchable
              pagination
            />
          </Suspense>
        )}
        {showAddModal && renderAddVolunteerModal()}
        {showBulkUploadModal && renderBulkUploadModal()}
        {showEditModal && renderEditVolunteerModal()}
        {showPointsModal && renderAssignPointsModal()}
        {showStatusEditModal && renderStatusEditModal()}
        {showLicenseModal && renderLicenseDetailsModal()}
        {showBulkSendModal && renderBulkSendLicensesModal()}
      </div>
    )
  }
  