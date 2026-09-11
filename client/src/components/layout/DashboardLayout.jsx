import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../dashboard/Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import ErrorBoundary from '../common/ErrorBoundary';

export default function DashboardLayout({ role }) {
  const { user } = useSelector((state) => state.auth);
  const activeRole = role || user?.role || 'restaurant_owner';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-orange-500 selection:text-white flex">
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Persistent Sidebar Navigation - Drawer on Mobile, Sticky/Fixed on Desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          role={activeRole}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Dashboard Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Persistent Top Header */}
        <DashboardHeader
          role={activeRole}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dynamic Content Area for Role-Specific Dashboards with Error Boundary */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

