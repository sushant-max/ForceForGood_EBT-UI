import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  Key,
  UserCheck,
  BarChart4,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LogoutConfirmationModal } from './LogoutConfirmationModal'
type SidebarProps = {
  collapsed?: boolean
  mobile?: boolean
  onClose?: () => void
  className?: string
}
export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  mobile = false,
  onClose,
  className = '',
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const isSuperAdmin = user?.role === 'super_admin'
  const isCorporateAdmin = user?.role === 'corporate_admin'
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['super_admin', 'corporate_admin'],
    },
    {
      name: 'Corporate Management',
      path: '/corporate-management',
      icon: <Building2 size={20} />,
      roles: ['super_admin'],
    },
    {
      name: 'Individual Management',
      path: '/individual-management',
      icon: <Users size={20} />,
      roles: ['super_admin'],
    },
    {
      name: 'Signup Requests',
      path: '/signup-requests',
      icon: <ClipboardList size={20} />,
      roles: ['super_admin'],
    },
    {
      name: 'Volunteer Management',
      path: '/volunteer-management',
      icon: <UserCheck size={20} />,
      roles: ['super_admin', 'corporate_admin'],
    },
    {
      name: 'Licenses',
      path: '/licenses',
      icon: <Key size={20} />,
      roles: ['corporate_admin'],
    },
    {
      name: 'Analytics & Reports',
      path: '/analytics-reports',
      icon: <BarChart4 size={20} />,
      roles: ['corporate_admin'],
    },
  ]
  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || ''),
  )
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }
  const handleLogoutConfirm = () => {
    logout()
    navigate('/login')
    setIsLogoutModalOpen(false)
  }
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false)
  }
  return (
    <>
      <aside
        className={`${className} ${collapsed ? 'w-[72px]' : 'w-[280px]'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full`}
      >
        {mobile && (
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1
            className={`font-bold text-[#466EE5] ${collapsed ? 'text-xl' : 'text-xl'}`}
          >
            {collapsed ? 'E' : 'Equibillion'}
          </h1>
        </div>
        <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                  ${isActive ? 'bg-[#F3F4F6] text-[#466EE5]' : 'text-[#374151] hover:bg-gray-50'}
                  flex items-center px-3 py-2 text-sm font-medium rounded-md
                  transition-colors duration-200
                `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-[#374151] rounded-md hover:bg-gray-50 transition-colors duration-200"
            aria-label="Logout"
          >
            <LogOut size={20} className="mr-3 text-[#374151]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  )
}
