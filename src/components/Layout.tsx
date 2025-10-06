import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileSidebarOpen(!mobileSidebarOpen);
  return <div className="flex h-screen bg-[#F9FAFB]">
      {/* Desktop sidebar */}
      <Sidebar collapsed={sidebarCollapsed} className="hidden md:block" />
      {/* Mobile sidebar */}
      {mobileSidebarOpen && <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex z-40 w-full max-w-[280px]">
            <Sidebar mobile={true} onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>}
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} toggleMobileMenu={toggleMobileMenu} sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>;
};