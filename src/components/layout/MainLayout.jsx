import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import ErrorBoundary from '../common/ErrorBoundary';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
      {/* Persistent Customer Navigation Bar */}
      <Navbar />

      {/* Dynamic Content Area with Centralized Error Boundary */}
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

