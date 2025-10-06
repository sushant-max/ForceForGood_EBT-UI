import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
type ProfileModalProps = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    corporateId?: string;
  } | null;
  onClose: () => void;
};
export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    updateUserProfile
  } = useAuth();
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    // Focus trap
    const focusableElements = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements && focusableElements.length > 0) {
      ;
      (focusableElements[0] as HTMLElement).focus();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      // In a real app, this would call an API to update the user profile
      await updateUserProfile(user.id, {
        name,
        email
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <div className="flex justify-between items-center mb-4">
          <h2 id="profile-modal-title" className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Profile' : 'User Profile'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] rounded" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            {isEditing ? <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#466EE5] focus:ring-[#466EE5] sm:text-sm p-2 border" disabled={isSaving} /> : <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user?.name}
              </p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            {isEditing ? <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#466EE5] focus:ring-[#466EE5] sm:text-sm p-2 border" disabled={isSaving} /> : <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user?.email}
              </p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Corporate Admin'}
            </p>
          </div>
          {user?.role === 'corporate_admin' && <div>
              <label className="block text-sm font-medium text-gray-700">
                Corporate ID
              </label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user.corporateId}
              </p>
            </div>}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          {isEditing ? <>
              <button onClick={() => {
            setName(user?.name || '');
            setEmail(user?.email || '');
            setIsEditing(false);
          }} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]" disabled={isSaving}>
                Cancel
              </button>
              <button onClick={handleSave} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]" disabled={isSaving}>
                {isSaving ? <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </> : 'Save Changes'}
              </button>
            </> : <>
              <button onClick={onClose} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                Close
              </button>
              <button onClick={() => setIsEditing(true)} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
                Edit Profile
              </button>
            </>}
        </div>
      </div>
    </div>;
};