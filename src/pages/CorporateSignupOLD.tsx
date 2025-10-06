import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, CheckCircle, AlertCircle, File, FileText } from 'lucide-react';
export const CorporateSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<{
    id: string;
    name: string;
    file: File;
    size: string;
    type: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
  }[]>([]);
  const [formStep, setFormStep] = useState(1);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      return (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('docx')) && file.size <= 10 * 1024 * 1024;
    });
    if (validFiles.length !== selectedFiles.length) {
      setFormError('Some files were skipped. Only PDF and DOC files under 10MB are accepted.');
      setTimeout(() => setFormError(''), 5000);
    }
    const newFiles = validFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      file: file,
      size: formatFileSize(file.size),
      type: file.type,
      status: 'idle' as const,
      progress: 0
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    // Check if at least one document is uploaded
    if (uploadedFiles.length === 0) {
      setFormError('Please upload at least one document');
      return;
    }
    // Check if all files are uploaded successfully
    const hasUploadingFiles = uploadedFiles.some(file => file.status === 'uploading' || file.status === 'idle');
    if (hasUploadingFiles) {
      setFormError('Please wait for all files to finish uploading');
      return;
    }
    setFormStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
    }, 2000);
  };
  const nextStep = () => {
    setFormStep(2);
  };
  const prevStep = () => {
    setFormStep(1);
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">
            Equibillion Foundation
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-[#374151]">
            Corporate Registration
          </h2>
          <p className="mt-2 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#466EE5] hover:text-[#3355cc]">
              Sign in
            </Link>
          </p>
        </div>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 1 ? 'bg-[#466EE5] text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`h-1 w-12 ${formStep >= 2 ? 'bg-[#466EE5]' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 2 ? 'bg-[#466EE5] text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-xs text-center w-32">Company Information</div>
            <div className="text-xs text-center w-32">Admin & Documents</div>
          </div>
        </div>
        {formError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{formError}</span>
          </div>}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            {formStep === 1 && <div className="p-6 sm:p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Company Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="companyName" id="companyName" required value={formData.companyName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="address" id="address" required value={formData.address} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="city" id="city" required value={formData.city} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="state" id="state" required value={formData.state} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="postalCode" id="postalCode" required value={formData.postalCode} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="country" id="country" required value={formData.country} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                  </div>
                </div>
              </div>}
            {formStep === 2 && <div className="p-6 sm:p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Primary Admin & Documents
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="adminFirstName" id="adminFirstName" required value={formData.adminFirstName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                    <div>
                      <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="adminLastName" id="adminLastName" required value={formData.adminLastName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input type="email" name="adminEmail" id="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input type="password" name="adminPassword" id="adminPassword" required value={formData.adminPassword} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                    <div>
                      <label htmlFor="adminConfirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input type="password" name="adminConfirmPassword" id="adminConfirmPassword" required value={formData.adminConfirmPassword} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Upload Documents <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Please upload your company documents (MOU, Registration,
                      Tax documents, etc.)
                    </p>
                    <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging ? 'border-[#466EE5] bg-blue-50' : 'border-gray-300'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleFileDrop}>
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-sm text-center text-gray-700 mb-1">
                          Drag and drop your files here, or{' '}
                          <label className="text-[#466EE5] hover:text-[#3355cc] cursor-pointer font-medium">
                            browse
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" multiple onChange={handleFileInputChange} />
                          </label>
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 10MB each
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
                                    <FileText className="h-5 w-5 text-gray-400" />
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
                </div>
              </div>}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              {formStep === 1 ? <div></div> : <button type="button" onClick={prevStep} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                  Back
                </button>}
              {formStep === 1 ? <button type="button" onClick={nextStep} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                  Next
                </button> : <button type="submit" disabled={formStatus === 'submitting'} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] disabled:opacity-70">
                  {formStatus === 'submitting' ? <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span> : 'Submit Application'}
                </button>}
            </div>
          </form>
        </div>
      </div>
    </div>;
};