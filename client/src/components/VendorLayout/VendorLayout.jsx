import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';
import VendorHeader from './VendorHeader';
import ToastNotification from './ToastNotification';
import { VendorProvider } from '../../context/VendorContext';
import './VendorLayout.css';

function VendorLayoutContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="vendor-dashboard-layout">
      {/* Dark Navy Sidebar */}
      <VendorSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Vendor Work Area */}
      <div
        className={`vendor-main-area ${
          isCollapsed ? 'vendor-main-collapsed' : ''
        }`}
      >
        <VendorHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="vendor-content-scroll">
          <div className="vendor-page-inner">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Toast Alerts */}
      <ToastNotification />
    </div>
  );
}

export default function VendorLayout() {
  return (
    <VendorProvider>
      <VendorLayoutContent />
    </VendorProvider>
  );
}
