import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Compass,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CUSTOMER_PROFILE, CUSTOMER_NOTIFICATIONS } from '../../data/customerMockData';
import './CustomerTopbar.css';

const PAGE_TITLES = {
  '/customer/dashboard': 'Overview Dashboard',
  '/customer/rentals': 'My Rentals',
  '/customer/bookings': 'Booking History',
  '/customer/quotations': 'Quotations & Inquiries',
  '/customer/contracts': 'Rental Contracts',
  '/customer/invoices': 'Invoices & Billing',
  '/customer/payments': 'Payment History',
  '/customer/pickup-returns': 'Pickup & Return Schedules',
  '/customer/notifications': 'Notification Center',
  '/customer/profile': 'My Profile',
  '/customer/settings': 'Account Settings',
};

export default function CustomerTopbar({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const currentTitle = PAGE_TITLES[location.pathname] || 'Customer Portal';
  const unreadNotifs = CUSTOMER_NOTIFICATIONS.filter(n => !n.read);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="customer-topbar">
      {/* Left side: Hamburger & Page Title */}
      <div className="topbar-left">
        <button 
          onClick={onOpenSidebar} 
          className="topbar-hamburger-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-title-wrap">
          <div className="topbar-breadcrumbs">
            <Link to="/customer/dashboard" className="breadcrumb-root">Dashboard</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{currentTitle}</span>
          </div>
          <h1 className="topbar-page-heading">{currentTitle}</h1>
        </div>
      </div>

      {/* Right side: Actions, Notifications, Profile */}
      <div className="topbar-right">
        {/* Explore Products Button */}
        <Link to="/products" className="topbar-explore-btn">
          <Compass size={16} />
          <span>Explore Products</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="topbar-dropdown-container" ref={notifRef}>
          <button 
            className="topbar-icon-btn" 
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotifs.length > 0 && (
              <span className="topbar-badge-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="topbar-dropdown-menu notif-menu">
              <div className="dropdown-header">
                <div className="dropdown-header-title">
                  <Bell size={16} className="text-primary-red" />
                  <span>Notifications</span>
                </div>
                <span className="dropdown-header-badge">{unreadNotifs.length} unread</span>
              </div>

              <div className="notif-list">
                {CUSTOMER_NOTIFICATIONS.slice(0, 3).map(notif => (
                  <Link 
                    key={notif.id} 
                    to="/customer/notifications"
                    className={`notif-item-preview ${!notif.read ? 'notif-unread' : ''}`}
                    onClick={() => setNotifDropdownOpen(false)}
                  >
                    <div className="notif-dot" />
                    <div className="notif-preview-content">
                      <div className="notif-preview-title">{notif.title}</div>
                      <div className="notif-preview-msg">{notif.message}</div>
                      <div className="notif-preview-time">{notif.time}</div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="dropdown-footer">
                <Link 
                  to="/customer/notifications" 
                  className="dropdown-view-all"
                  onClick={() => setNotifDropdownOpen(false)}
                >
                  View All Notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="topbar-dropdown-container" ref={profileRef}>
          <button 
            className="topbar-user-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-label="User profile menu"
          >
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
              alt={user?.fullName || user?.name || 'Customer'} 
              className="topbar-user-avatar"
            />
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{user?.fullName || user?.name || 'Customer'}</span>
              <span className="topbar-user-role">Customer Account</span>
            </div>
            <ChevronDown size={16} className="topbar-chevron" />
          </button>

          {profileDropdownOpen && (
            <div className="topbar-dropdown-menu profile-menu">
              <div className="dropdown-profile-header">
                <div className="profile-hdr-name">{user?.fullName || user?.name || 'Customer'}</div>
                <div className="profile-hdr-email">{user?.email || 'customer@rentora.in'}</div>
                <div className="profile-hdr-badge">
                  <ShieldCheck size={13} />
                  <span>KYC Verified</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <Link 
                to="/customer/profile" 
                className="dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <Link 
                to="/customer/settings" 
                className="dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </Link>
              <Link 
                to="/customer/rentals" 
                className="dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Package size={16} />
                <span>Active Rentals (3)</span>
              </Link>

              <div className="dropdown-divider" />

              <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
