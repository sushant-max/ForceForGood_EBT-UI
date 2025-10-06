import React, { useEffect, useState, useRef } from 'react';
import { Menu, ChevronLeft, ChevronRight, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal';
type HeaderProps = {
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  sidebarCollapsed: boolean;
};
export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  toggleMobileMenu,
  sidebarCollapsed
}) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Add keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsProfileModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };
  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    setIsDropdownOpen(false);
  };
  return <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button onClick={toggleMobileMenu} className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] rounded" aria-label="Open sidebar">
            <Menu size={24} />
          </button>
          <button onClick={toggleSidebar} className="hidden md:block text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] rounded ml-1" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="ml-4 md:ml-6">
            <h1 className="text-lg font-semibold text-[#111827]">
              Equibillion Foundation
            </h1>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button ref={buttonRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5] rounded p-1 transition-colors duration-200 ${isDropdownOpen ? 'bg-gray-100' : ''}`} aria-expanded={isDropdownOpen} aria-haspopup="true">
            <div className="mr-2">
              <p className="text-sm font-medium text-[#111827]">{user?.name}</p>
              <p className="text-xs text-[#374151]">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Corporate Admin'}
              </p>
            </div>
            <div className={`bg-gray-100 p-2 rounded-full ${isDropdownOpen ? 'ring-2 ring-[#466EE5]' : ''}`}>
              <User size={20} className="text-gray-600" />
            </div>
          </button>
          {/* Dropdown Menu */}
          {isDropdownOpen && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100" onClick={handleProfileClick} role="menuitem" tabIndex={0}>
                <Settings size={16} className="mr-2" />
                <span>View/Edit Profile</span>
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100" onClick={handleLogout} role="menuitem" tabIndex={0}>
                <LogOut size={16} className="mr-2" />
                <span>Logout</span>
              </button>
            </div>}
        </div>
      </div>
      {/* Profile Modal */}
      {isProfileModalOpen && <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />}
    </header>;
};