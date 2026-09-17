import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { 
  ToastNotification, 
  ConfirmationModal, 
  DocumentPreviewModal 
} from './AdminComponents';
import { useAdmin } from '../../context/AdminContext';

export default function SuperAdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const {
    toast,
    hideToast,
    confirmationModal,
    closeConfirmation,
    documentModal,
    closeDocumentModal
  } = useAdmin();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased flex selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <AdminHeader setIsMobileOpen={setIsMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-5 px-4 sm:px-8 border-t border-slate-200/80 text-center text-xs text-slate-500 bg-white">
          <p>© {new Date().getFullYear()} Rentora Multi-Vendor Rental Marketplace • Super Admin Control Center</p>
        </footer>
      </div>

      {/* Global Modals & Notifications */}
      <ToastNotification toast={toast} onClose={hideToast} />
      <ConfirmationModal {...confirmationModal} onCancel={closeConfirmation} />
      <DocumentPreviewModal {...documentModal} onClose={closeDocumentModal} />

    </div>
  );
}
