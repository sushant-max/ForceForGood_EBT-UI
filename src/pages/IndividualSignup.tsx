import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Upload, X, FileText, Image } from 'lucide-react';
import { IndividualRegistration } from './types';
import axios from 'axios';
export const IndividualSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    corporateCode: '',
    termsAccepted: false
  });
  const [uploadedFiles, setUploadedFiles] = useState<{
    id: string;
    name: string;
    file: File;
    size: string;
    type: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
    isImage: boolean;
  }[]>([]);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(Array.from(e.dataTransfer.files));
    }
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleFileSelection = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      const fileType = file.type.toLowerCase();
      return (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('docx') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png')) && file.size <= 10 * 1024 * 1024;
    });
    if (validFiles.length !== selectedFiles.length) {
      setFormError('Some files were skipped. Only PDF, DOC, JPG, and PNG files under 10MB are accepted.');
      setTimeout(() => setFormError(''), 5000);
    }
    const newFiles = validFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      file: file,
      size: formatFileSize(file.size),
      type: file.type,
      status: 'idle' as const,
      progress: 0,
      isImage: file.type.startsWith('image/')
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Auto-start upload for new files
    newFiles.forEach(fileObj => {
      simulateFileUpload(fileObj.id);
    });
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(Array.from(e.target.files));
    }
  };
  const simulateFileUpload = (fileId: string) => {
    setUploadedFiles(prev => prev.map(file => file.id === fileId ? {
      ...file,
      status: 'uploading'
    } : file));
    const interval = setInterval(() => {
      setUploadedFiles(prev => {
        const fileIndex = prev.findIndex(file => file.id === fileId);
        if (fileIndex === -1) {
          clearInterval(interval);
          return prev;
        }
        const file = prev[fileIndex];
        if (file.progress >= 100) {
          clearInterval(interval);
          const newFiles = [...prev];
          newFiles[fileIndex] = {
            ...file,
            status: 'success',
            progress: 100
          };
          return newFiles;
        }
        const newFiles = [...prev];
        newFiles[fileIndex] = {
          ...file,
          progress: file.progress + 10
        };
        return newFiles;
      });
    }, 300);
  };
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-gray-400" />;
    }
    return <FileText className="h-5 w-5 text-gray-400" />;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (!formData.termsAccepted) {
      setFormError('You must accept the terms and conditions');
      return;
    }
    // Check if any documents are uploaded
    if (uploadedFiles.length === 0) {
      setFormError('Please upload at least one verification document');
      return;
    }
    // Check if all files are uploaded successfully
    const hasUploadingFiles = uploadedFiles.some(file => file.status === 'uploading' || file.status === 'idle');
    if (hasUploadingFiles) {
      setFormError('Please wait for all files to finish uploading');
      return;
    }
    setFormStatus('submitting');
    const payload: IndividualRegistration = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      emailId: formData.email,
      password: formData.password,
      // Map uploaded files to document structure
      documents: uploadedFiles.map((file) => ({
        type: file.name.includes('PAN') ? 'PAN_CARD' : file.name.includes('GST') ? 'GST_CERTIFICATE' : 'OTHER',
        url: `https://example.com/uploads/${file.id}`, // Placeholder URL
      })),
    };
    axios
      .post('https://us-central1-test-donate-tags.cloudfunctions.net/register/individual', payload)
      .then(() => {
        setFormStatus('success');
      })
      .catch((error) => {
        if(error.response?.status === 409) {
          setFormStatus('error');
          setFormError('An account with this email already exists. Please use a different email or log in.');
        } else {
          setFormStatus('error');
          setFormError(
            error.response?.data?.message ||
            'An error occurred while submitting the application.'
          );
        }
      });
    return;
  };
  if (formStatus === 'success') {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Application Submitted
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for your interest in Equibillion Foundation. We have
              received your application and will review it shortly.
            </p>
            <div className="mt-6">
              <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">
            Equibillion
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-[#374151]">
            Individual Registration
          </h2>
          <p className="mt-2 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#466EE5] hover:text-[#3355cc]">
              Sign in
            </Link>
          </p>
        </div>
        {formError && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{formError}</span>
          </div>}
        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="firstName" id="firstName" required value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="lastName" id="lastName" required value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input type="password" name="password" id="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input type="password" name="confirmPassword" id="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                </div>
              </div>
              <div>
                <label htmlFor="corporateCode" className="block text-sm font-medium text-gray-700">
                  Corporate Code (Optional)
                </label>
                <input type="text" name="corporateCode" id="corporateCode" value={formData.corporateCode} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" placeholder="Enter code if you're joining through a corporate partner" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Verification Documents <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Please upload your identification documents (government ID,
                  corporate ID, etc.)
                </p>
                <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging ? 'border-[#466EE5] bg-blue-50' : 'border-gray-300'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleFileDrop}>
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-center text-gray-700 mb-1">
                      Drag and drop your files here, or{' '}
                      <label className="text-[#466EE5] hover:text-[#3355cc] cursor-pointer font-medium">
                        browse
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple onChange={handleFileInputChange} />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>
                {uploadedFiles.length > 0 && <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files ({uploadedFiles.length})
                    </h5>
                    <ul className="space-y-3">
                      {uploadedFiles.map(file => <li key={file.id} className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {getFileIcon(file.type)}
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {file.size} •{' '}
                                  {file.type.split('/')[1].toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center ml-4">
                              {file.status === 'uploading' && <div className="mr-3">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-[#466EE5] h-1.5 rounded-full" style={{
                              width: `${file.progress}%`
                            }}></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {file.progress}%
                                  </p>
                                </div>}
                              {file.status === 'success' && <span className="flex items-center text-xs text-green-600 mr-3">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Uploaded
                                </span>}
                              <button type="button" onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-gray-500 focus:outline-none" aria-label="Remove file">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </li>)}
                    </ul>
                  </div>}
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleInputChange} className="h-4 w-4 text-[#466EE5] focus:ring-[#466EE5] border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-[#466EE5]">
                      terms and conditions
                    </a>
                  </label>
                </div>
              </div>
              <div>
                <button type="submit" disabled={formStatus === 'submitting'} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-70">
                  {formStatus === 'submitting' ? <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span> : 'Register'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>;
};