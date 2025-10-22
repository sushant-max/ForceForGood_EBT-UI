import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserProfile } from './types'
import { DataTable } from '../components/DataTable'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorAlert } from '../components/ErrorAlert'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import * as XLSX from 'xlsx'; 

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
  KeyRound,
  KeySquare,
} from 'lucide-react'

export const VolunteerManagement: React.FC = () => {
  const { user,getToken } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [volunteers, setVolunteers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  // New state for status edit modal
  const [showStatusEditModal, setShowStatusEditModal] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<UserProfile | null>(
    null,
  )
  // New state for status selection
  const [newStatus, setNewStatus] = useState<'active' | 'pending' | 'inactive'>('active')

  // License feature states (corporate admin only)
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [isSendingLicense, setIsSendingLicense] = useState(false)
  const [licenseSentSuccess, setLicenseSentSuccess] = useState<string | null>(
    null,
  )
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]) // For row selection
  const [showBulkSendModal, setShowBulkSendModal] = useState(false)
  const [bulkSendStatus, setBulkSendStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle')
  // Initialize with a mock value to match NEW.tsx for visual consistency
  const [availableLicenses, setAvailableLicenses] = useState<number>(25)

  // Form states
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    email: '',
  })
  const [editVolunteer, setEditVolunteer] = useState<UserProfile | null>(null)
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

  const corporateName = isSuperAdmin
    ? 'All Corporates'
    : user?.corporateName ? user?.corporateName : 'Unknown Corporate';

  useEffect(() => {
    fetchVolunteers()
    // If backend exposes an endpoint for available licenses, fetch and set here.
    // For now, it's a static mock value
    // setAvailableLicenses(fetchAvailableLicenses())
  }, [user])

  const exportToXLSX = async (data: UserProfile[], corporateName: string): Promise<string> => {
    // 1. Map data to the desired sheet format
    const wsData = data.map(v => ({
        'EMAIL ADDRESS': v.user_details.email_id,
        'LICENSE KEY': v.license_key,
        'NAME': v.user_details.name || '',
    }));

    // 2. Create a worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LicenseKeys");

    // 3. Generate a file name
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `${corporateName}_Licenses_${date}.xlsx`;

    // 4. Write and download the file
    await XLSX.writeFile(wb, fileName);
    
    return fileName;
  };

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      if(isSuperAdmin) {
        const response = await axios.get(
          'https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const apiUsers: UserProfile[] = response.data;
        const corporateUsers = apiUsers.filter((individual) => individual.user_roles[0] === 'corporate_individual');
        setVolunteers(corporateUsers);
      } else {
        const response = await axios.get(
          `https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteers/${user?.corporateId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const apiUsers: UserProfile[] = response.data;
        const corporateUsers = apiUsers.filter((v) => v.corporateId === user?.corporateId && v.user_roles[0] === 'corporate_individual');
        setVolunteers(corporateUsers);
      }
    } catch (err) {
      console.error('Failed to fetch volunteers:', err)
      setError('Failed to load volunteer data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVolunteer = () => {
    if (!newVolunteer.name.trim() || !newVolunteer.email.trim()) return
    const token = getToken();
    axios
      .post('https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteer', {
          corporateId: user?.corporateId,
          emailId: newVolunteer.email.trim(),
          name: newVolunteer.name.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Failed to add volunteer. Please try again.');
          return;
        }
        fetchVolunteers();
      })
      .catch(() => {
        setError('Failed to add volunteer. Please try again.')
      });
    setNewVolunteer({ name: '', email: '' });
    setShowAddModal(false);
  }

  const handleBulkUpload = () => {
    if (!bulkFile) return
    setBulkUploadStatus('uploading');
    const formData = new FormData();
    formData.append('corporateId', user?.corporateId || '');
    formData.append('data', bulkFile);
    let progress = 0;
    setBulkUploadProgress(progress)
    const token = getToken();
    axios
      .post(
        'https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteers',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      )
      .then((response) => {
        if (response.status !== 200) {
          setBulkUploadStatus('error');
          setError('Bulk upload failed. Please try again.');
        }
        setBulkUploadStatus('success');
        fetchVolunteers();
        setBulkFile(null);
        setBulkUploadProgress(100);
        setShowBulkUploadModal(false);
        setBulkUploadStatus('idle');
        setPreviewData([]);
        setBulkUploadProgress(0);
      })
      .catch(() => {
        setBulkUploadStatus('error');
        setError('Bulk upload failed. Please try again.');
      });
  }

  const handleFileRemove = () => {
    setBulkFile(null);
    setPreviewData([]);
    setBulkUploadProgress(0);
    setBulkUploadStatus('idle');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setBulkFile(file);
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const reader = new FileReader();

      reader.onload = async (event) => {
        let result: { name: string; email: string }[] = [];
        if (fileExt === 'csv') {
          const text = event.target?.result as string;
          const lines = text.split(/\r?\n/).filter(Boolean);
          let header: string[] = [];
          lines.forEach((line, idx) => {
            const cols = line.split(',');
            if (idx === 0) {
              header = cols.map((h) => h.trim());
            } else {
              const obj: any = {};
              header.forEach((h, i) => {
                obj[h] = cols[i]?.trim();
              });
              if (obj.emailId && obj.name) {
                result.push({ name: obj.name, email: obj.emailId });
              }
            }
          });
          setPreviewData(result);
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
          try {
            // Dynamically import xlsx only when needed
            const XLSX = await import('xlsx');
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            result = json
              .filter((row) => row.emailId && row.name)
              .map((row) => ({
                name: row.name,
                email: row.emailId,
              }));
            setPreviewData(result);
          } catch (err) {
            setPreviewData([]);
            setError('Failed to parse Excel file.');
          }
        }
      };

      if (fileExt === 'csv') {
        reader.readAsText(file);
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        reader.readAsArrayBuffer(file);
      }
    } else {
      setBulkFile(null)
      setPreviewData([])
    }
  }

  const handleUpdateVolunteer = () => {
    if (!editVolunteer) return
    const token = getToken();
    axios
      .put(
        `https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteers/${user?.corporateId}/${editVolunteer.user_uid}`,
        { status: editVolunteer.registration_status, name: editVolunteer.user_details?.name , emailId: editVolunteer.user_details?.email_id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Error updating status. Please try again.');
          return;
        }
        fetchVolunteers();
      })
      .catch(() => {
        setError('Error updating status. Please try again.');
      });
    setShowEditModal(false);
    setEditVolunteer(null);
  }

  const handleAddPoints = () => {
    if (!selectedVolunteer || pointsToAdd <= 0) return
    // Points are not part of backend schema here; close modal
    setShowPointsModal(false)
    setSelectedVolunteer(null)
    setPointsToAdd(0)
  }

  // License helpers (corporate admin only)
  const toggleVolunteerSelection = (volunteerId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId)
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId],
    )
  }

  const toggleSelectAll = () => {
    if (selectedVolunteers.length === volunteers.length) {
      setSelectedVolunteers([])
    } else {
      setSelectedVolunteers(volunteers.map((v) => v.id))
    }
  }

  const handleViewLicense = (volunteer: UserProfile) => {
    setSelectedVolunteer(volunteer)
    setShowLicenseModal(true)
  }

  const handleSendLicense = async (volunteer: UserProfile) => {
    if (!volunteer.license_id) {
      alert('No license available to send.')
      return
    }
    setIsSendingLicense(true)
    try {
      const subject = `License Key under ${corporateName} for Equibillion Foundation`;
      const bodyText = `
        Dear User,

        You have been successfully onboarded under ${corporateName} for Equibillion Foundation.

        Here is your unique license key:
        ---
        ${volunteer.license_key}
        ---

        Please keep this key secure.
        Reach out to the sender of this email for any assistance.

        Regards,
        ${corporateName} Support Team
      `;
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(bodyText);

      const mailtoLink = 
        `mailto:${volunteer.user_details.email_id}` + 
        `?subject=${encodedSubject}` +
        `&body=${encodedBody}`;

      // Navigate the browser to the mailto link, opening the default client
      setIsSendingLicense(false);
      window.location.href = mailtoLink;
    } catch (e) {
      console.error('Failed to send license', e)
      alert('Failed to send license. Please try again.')
    } finally {
      setIsSendingLicense(false)
    }
  }

  const handleBulkSendLicenses = async () => {
    if (selectedVolunteers.length === 0) {
      alert('Please select at least one volunteer to send licenses.')
      return
    }

    const volunteersToSend = volunteers.filter(
      (v) =>
        selectedVolunteers.includes(v.id) && // Filter by selected IDs
        v.registration_status === 'active' &&
        !!v.license_id,
    )

    const fileName = await exportToXLSX(volunteersToSend, corporateName);
    if(!fileName) {
      alert('Failed to generate license file. Please try again.');
      return;
    }
    alert(`License keys exported to ${fileName}. Please send this file to the selected volunteers via email.`);

    if (volunteersToSend.length === 0) {
      alert('No selected volunteers with licenses to send.')
      return
    }

    setBulkSendStatus('processing')
    try {
      // Example integration:
      // await axios.post(`/corporateapi/corporate/licenses/bulk-send/${user?.corporateId}`, { userUids: volunteersToSend.map(v => v.user_uid) })\
      setBulkSendStatus('success')
      setTimeout(() => {
        setShowBulkSendModal(false)
        setBulkSendStatus('idle')
        setSelectedVolunteers([]) // Clear selection after successful bulk send
      }, 1500)
      const subject = `Bulk License Key Distribution - File Attached`;

      const recipientList = volunteersToSend.map(v => v.user_details.email_id).join(',');

    // 3. Construct the email body with instructions
    const instructionBody = `
      Dear Team,

      The bulk license keys for all volunteers are contained in the attached Excel file (${fileName}).

      This email is for internal distribution only.

      Regards,
      ${corporateName} Admin
    `;

    // 4. Construct the mailto link
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(instructionBody);
    
    // Set the TO field to the full list of recipients
    const mailtoLink = 
        `mailto:${recipientList}` + 
        `?subject=${encodedSubject}` +
        `&body=${encodedBody}`;

    // IMPORTANT: Warn about long URL (large number of recipients)
    if (mailtoLink.length > 2000) {
        alert("Warning: The recipient list is very long. Your email client may reject or truncate the address list. Check the TO field carefully.");
    }
    
    // 5. Navigate the browser to the mailto link
    window.location.href = mailtoLink;

    } catch (e) {
      console.error('Failed to bulk send licenses', e)
      setBulkSendStatus('error')
    }
  }

  const handleDeleteVolunteer = (volunteer: UserProfile) => {
    if (confirm(`Are you sure you want to remove ${volunteer.user_details?.name || 'this user'}?`)) {
      const token = getToken();
      if(isSuperAdmin) {
        axios
        .delete(
          `https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers/${volunteer.user_uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.status !== 200) {
            alert('Error deleting user. Please try again.')
            return
          }
          fetchVolunteers();
        })
        .catch(() => {
          alert('Error deleting user. Please try again.')
        })
      } else {
        axios
        .delete(
          `https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteers/${user?.corporateId}/${volunteer.user_uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.status !== 200) {
            alert('Error deleting user. Please try again.')
            return
          }
          fetchVolunteers();
        })
        .catch(() => {
          alert('Error deleting user. Please try again.')
        })
      }
    }
  }

  const handleActivateVolunteer = (volunteer: UserProfile) => {
    const token = getToken();
    axios
      .put(
        `https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteers/${user?.corporateId}/${volunteer.user_uid}`,
        { status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Error updating status. Please try again.');
          return;
        }
        fetchVolunteers();
      })
      .catch(() => {
        setError('Error updating status. Please try again.');
      });
  }

  const handleDeactivateVolunteer = (volunteer: UserProfile) => {
    const token = getToken();
    axios
      .put(
        `https://us-central1-test-donate-tags.cloudfunctions.net/corporateapi/corporate/volunteers/${user?.corporateId}/${volunteer.user_uid}`,
        { status: 'inactive' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Error updating status. Please try again.');
          return;
        }
        fetchVolunteers();
      })
      .catch(() => {
        setError('Error updating status. Please try again.');
      });
  }

  const handleEditVolunteer = (volunteer: UserProfile) => {
    setEditVolunteer({
      ...volunteer,
    })
    setShowEditModal(true)
  }

  const handleOpenPointsModal = (volunteer: UserProfile) => {
    setSelectedVolunteer(volunteer)
    setShowPointsModal(true)
  }

  // New function to handle opening the status edit modal
  const handleOpenStatusEditModal = (volunteer: UserProfile) => {
    setSelectedVolunteer(volunteer)
    setNewStatus(volunteer.registration_status)
    setShowStatusEditModal(true)
  }

  // New function to handle status update from modal
  const handleStatusUpdateFromModal = () => {
    if (!selectedVolunteer) return;
    if(isSuperAdmin) {
      const token = getToken();
      axios
      .put(
        `https://us-central1-test-donate-tags.cloudfunctions.net/api/admin/volunteers/status/${selectedVolunteer.user_uid}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.status !== 200) {
          setError('Error updating status. Please try again.')
          return
        }
        fetchVolunteers();
        setShowStatusEditModal(false);
        setSelectedVolunteer(null);
      })
      .catch(() => {
        setError('Error updating status. Please try again.');
        setShowStatusEditModal(false);
        setSelectedVolunteer(null);
      })
      }
  }

  // Update renderSuperAdminActions to remove the status toggle icons
  const renderSuperAdminActions = (volunteer: UserProfile) => {
    return (
      <div className="flex justify-end space-x-2 items-center">
        <button
          onClick={() => handleOpenStatusEditModal(volunteer)}
          className="text-amber-600 hover:text-amber-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
          title="Edit Status"
          aria-label={`Edit status for ${volunteer.user_details?.name ?? 'Unknown'}`}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDeleteVolunteer(volunteer)}
          className="text-red-600 hover:text-red-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]"
          title="Delete Volunteer"
          aria-label={`Delete ${volunteer.user_details?.name ?? 'Unknown'}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    )
  }

  const renderCorporateAdminActions = (volunteer: UserProfile) => {
    return (
      <div className="flex justify-end space-x-2">
        {volunteer.registration_status !== 'active' && (
          <button
            onClick={() => handleActivateVolunteer(volunteer)}
            className="text-green-600 hover:text-green-700"
            title="Activate Volunteer"
          >
            <UserPlus className="h-5 w-5" />
            <span className="sr-only">Activate</span>
          </button>
        )}
        {volunteer.registration_status === 'active' && (
          <button
            onClick={() => handleDeactivateVolunteer(volunteer)}
            className="text-gray-600 hover:text-gray-700"
            title="Deactivate Volunteer"
          >
            <UserMinus className="h-5 w-5" />
            <span className="sr-only">Deactivate</span>
          </button>
        )}
        <button
          onClick={() => handleEditVolunteer(volunteer)}
          className="text-amber-600 hover:text-amber-700"
          title="Edit Volunteer"
        >
          <Edit className="h-5 w-5" />
          <span className="sr-only">Edit</span>
        </button>
        <button
          onClick={() => handleOpenPointsModal(volunteer)}
          className="text-blue-600 hover:text-blue-700"
          title="Assign Points"
        >
          <Award className="h-5 w-5" />
          <span className="sr-only">Assign Points</span>
        </button>
        <button
          onClick={() => handleDeleteVolunteer(volunteer)}
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
                    should have columns called 'emailId' and 'name'.
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
                          onClick={handleFileRemove}
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
    if (!editVolunteer) return null
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
                value={editVolunteer.user_details.name}
                onChange={(e) =>
                  setEditVolunteer({
                    ...editVolunteer,
                    user_details: { ...editVolunteer.user_details, name: e.target.value },
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
                value={editVolunteer.user_details.email_id}
                onChange={(e) =>
                  setEditVolunteer({
                    ...editVolunteer,
                    user_details: { ...editVolunteer.user_details, email_id: e.target.value },
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
              <input disabled
                type="number"
                id="edit-points"
                value={100}
                onChange={() => {}}
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
                value={editVolunteer.registration_status}
                onChange={(e) =>
                  setEditVolunteer({
                    ...editVolunteer,
                    registration_status: e.target.value as 'active' | 'pending' | 'inactive',
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
    if (!selectedVolunteer) return null
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
                  {100}
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
                      {100 + pointsToAdd}
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

  // Add the Status Edit Modal component
  const renderStatusEditModal = () => {
    if (!selectedVolunteer) return null
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
                    Update the status for {selectedVolunteer.user_details.name}
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

  // Define columns based on user role
  const getSuperAdminColumns = () => [
    {
      header: 'Name',
      accessor: (row: UserProfile) => row.user_details?.name || 'Unknown',
      sortAccessor: (row: UserProfile) => row.user_details?.name || '',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: (row: UserProfile) => row.user_details?.email_id || 'Unknown',
      sortAccessor: (row: UserProfile) => row.user_details?.email_id || '',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row: UserProfile) => {
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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.registration_status]}`}
          >
            {statusIcons[row.registration_status]}
            {row.registration_status.charAt(0).toUpperCase() + row.registration_status.slice(1)}
          </span>
        )
      },
      sortAccessor: (row: UserProfile) => row.registration_status,
    },
    {
      header: 'Corporate',
      accessor: (row: UserProfile) => row.corporate_name || 'Unknown',
      sortAccessor: (row: UserProfile) => row.corporate_name || '',
      sortable: true,
    },
    {
      header: 'Points',
      accessor: (_row: UserProfile) => 100,
      sortAccessor: (_row: UserProfile) => 100,
      sortable: true,
    },
    {
      header: 'Joined',
      accessor: (row: UserProfile) => {
        const rawDate = row.register_date
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
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
      sortAccessor: (row: UserProfile) => {
        const rawDate = row.register_date as unknown
        if (typeof rawDate === 'string') {
          const parts = rawDate.split('/')
          if (parts.length === 3) {
            const [month, day, year] = parts
            return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
          }
        }
        if (
          rawDate &&
          typeof rawDate === 'object' &&
          Object.prototype.toString.call(rawDate) === '[object Date]'
        ) {
          return (rawDate as Date).getTime()
        }
        return 0
      },
      sortable: true,
    },
  ]

  const getCorporateAdminColumns = () => [
    {
      header: (
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-[#466EE5] focus:ring-[#466EE5] border-gray-300 rounded"
            checked={selectedVolunteers.length > 0 && selectedVolunteers.length === volunteers.length}
            onChange={toggleSelectAll}
            aria-label="Select all volunteers"
          />
          <span className="ml-2">Name</span>
        </div>
      ),
      accessor: (row: UserProfile) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-[#466EE5] focus:ring-[#466EE5] border-gray-300 rounded mr-2"
            checked={selectedVolunteers.includes(row.id)}
            onChange={() => toggleVolunteerSelection(row.id)}
            onClick={(e) => e.stopPropagation()} // Prevent row click from triggering
            aria-label={`Select ${row.user_details?.name || 'Unknown'}`}
          />
          {row.user_details?.name || 'Unknown'}
        </div>
      ),
      sortAccessor: (row: UserProfile) => row.user_details?.name || '',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: (row: UserProfile) => row.user_details?.email_id || 'Unknown',
      sortAccessor: (row: UserProfile) => row.user_details?.email_id || '',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row: UserProfile) => {
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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.registration_status]}`}
          >
            {statusIcons[row.registration_status]}
            {row.registration_status.charAt(0).toUpperCase() + row.registration_status.slice(1)}
          </span>
        )
      },
      sortAccessor: (row: UserProfile) => row.registration_status,
    },
    {
      header: 'Points',
      accessor: (_row: UserProfile) => 100, // Placeholder, as per NEW.tsx
      sortAccessor: (_row: UserProfile) => 100, // Placeholder
      sortable: true,
    },
    {
      header: 'Joined',
      accessor: (row: UserProfile) => {
        const rawDate = row.register_date
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
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
      sortAccessor: (row: UserProfile) => {
        const rawDate = row.register_date as unknown
        if (typeof rawDate === 'string') {
          const parts = rawDate.split('/')
          if (parts.length === 3) {
            const [month, day, year] = parts
            return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
          }
        }
        if (
          rawDate &&
          typeof rawDate === 'object' &&
          Object.prototype.toString.call(rawDate) === '[object Date]'
        ) {
          return (rawDate as Date).getTime()
        }
        return 0
      },
      sortable: true,
    },
    {
      header: 'License',
      accessor: (row: UserProfile) =>
        row.registration_status !== 'active' ? (
          <span className="text-gray-400 text-sm italic">N/A</span>
        ) : row.license_id ? (
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
        ) : (
          <span className="text-gray-400 text-sm italic">No License</span>
        ),
      sortAccessor: (row: UserProfile) => (row.license_id ? '1' : '0'),
      sortable: true,
    },
  ]

  const columns = isSuperAdmin
    ? getSuperAdminColumns()
    : getCorporateAdminColumns()

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


      {error && <ErrorAlert message={error} onRetry={fetchVolunteers} />}

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : volunteers.length === 0 ? (
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
        <>
          {selectedVolunteers.length > 0 && !isSuperAdmin && (
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
              isSuperAdmin ? renderSuperAdminActions : renderCorporateAdminActions
            }
            searchable
            pagination
          />
        </>
      )}

      {showAddModal && renderAddVolunteerModal()}
      {showBulkUploadModal && renderBulkUploadModal()}
      {showEditModal && renderEditVolunteerModal()}
      {showPointsModal && renderAssignPointsModal()}
      {showStatusEditModal && renderStatusEditModal()}

      {/* License Details Modal */}
      {selectedVolunteer && showLicenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">License Details</h3>
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
            {!selectedVolunteer.license_id ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <KeyRound className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No License Assigned</h3>
                <p className="mt-1 text-sm text-gray-500">This volunteer doesn't have a license assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">{selectedVolunteer.user_details?.name}</h4>
                  <p className="text-sm text-gray-500">{selectedVolunteer.user_details?.email_id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center mb-2">
                    <p className="text-sm font-medium text-gray-500">License Key</p>
                    <p className="text-lg font-mono font-semibold text-gray-900 mt-1 break-all">{selectedVolunteer.license_key}</p>
                  </div>
                  {/* Assuming licenseExpiryDate could be added to UserProfile if backend provides it */}
                 
                {/* <div className="grid grid-cols-2 gap-4 mt-4">

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
                  </div> */}


                </div>
                {licenseSentSuccess && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{licenseSentSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                onClick={() => selectedVolunteer && handleSendLicense(selectedVolunteer)}
                disabled={isSendingLicense || !selectedVolunteer.license_id}
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
                  'Send License'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Send Licenses Modal */}
      {showBulkSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Send Licenses</h3>
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
                      <span className="text-sm font-medium text-gray-500">Selected volunteers:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedVolunteers.length}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-gray-500">With licenses:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {
                          volunteers.filter(
                            (v) =>
                              selectedVolunteers.includes(v.id) &&
                              v.registration_status === 'active' &&
                              !!v.license_id,
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                  {volunteers.filter((v) => selectedVolunteers.includes(v.id) && v.registration_status === 'active' && !!v.license_id).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Volunteers to receive licenses ({
                          volunteers.filter((v) => selectedVolunteers.includes(v.id) && v.registration_status === 'active' && !!v.license_id).length
                        })
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
                            {volunteers.filter((v) => selectedVolunteers.includes(v.id) && v.registration_status === 'active' && !!v.license_id).map((volunteer) => (
                              <tr key={volunteer.id}>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {volunteer.user_details?.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {volunteer.user_details?.email_id}
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
                    disabled={
                      selectedVolunteers.filter(
                        (id) =>
                          volunteers.find(
                            (v) =>
                              v.id === id && v.registration_status === 'active' && !!v.license_id,
                          ),
                      ).length === 0
                    }
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sending Licenses</h3>
                <p className="mt-1 text-sm text-gray-500">This may take a moment...</p>
              </div>
            ) : bulkSendStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Licenses Sent Successfully</h3>
                <p className="mt-1 text-sm text-gray-500">Licenses have been sent to the selected volunteers.</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Error Sending Licenses</h3>
                <p className="mt-1 text-sm text-gray-500">There was an error sending licenses. Please try again.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkSendStatus('idle')
                      setSelectedVolunteers([]) // Clear selection on retry
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
      )}
    </div>
  )
}