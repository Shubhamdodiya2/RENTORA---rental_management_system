import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import CustomerTopbar from './CustomerTopbar';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="customer-dashboard-layout">
      {/* Sidebar navigation */}
      <CustomerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content body */}
      <div className="customer-main-area">
        <CustomerTopbar 
          onOpenSidebar={() => setSidebarOpen(true)} 
        />

        <main className="customer-content-scroll">
          <div className="customer-page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
