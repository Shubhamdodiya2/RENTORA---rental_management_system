import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Heart,
  FileCheck2,
  ShieldCheck,
  Receipt,
  CreditCard,
  Truck,
  Bell,
  User,
  Settings,
  Compass,
  LogOut,
  X,
  BadgeCheck,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import Logo from '../Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import './CustomerSidebar.css';

const navItems = [
  { path: '/customer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/customer/wishlist', label: 'Saved Wishlist', icon: Heart },
  { path: '/customer/rentals', label: 'My Rentals', icon: Package },
  { path: '/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
  { path: '/customer/quotations', label: 'Quotations', icon: FileCheck2 },
  { path: '/customer/contracts', label: 'Rental Contracts', icon: ShieldCheck },
  { path: '/customer/invoices', label: 'Invoices', icon: Receipt },
  { path: '/customer/payments', label: 'Payments', icon: CreditCard },
  { path: '/customer/pickup-returns', label: 'Pickup & Returns', icon: Truck },
  { path: '/customer/notifications', label: 'Notifications', icon: Bell },
  { path: '/customer/support', label: 'Help & Support', icon: HelpCircle },
  { path: '/customer/profile', label: 'My Profile', icon: User },
  { path: '/customer/settings', label: 'Settings', icon: Settings },
];

export default function CustomerSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`customer-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo-link" onClick={onClose}>
            <Logo size="normal" showTagline={false} />
          </Link>
          <button 
            className="sidebar-close-btn" 
            onClick={onClose} 
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer Mini Profile Card */}
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar-wrapper">
            <img 
              src={(user?.avatar && !user.avatar.includes('photo-1534528741775-53994a69daeb')) ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || 'Customer')}&background=1D3557&color=ffffff&bold=true`} 
              alt={user?.fullName || user?.name || 'Customer'} 
              className="sidebar-avatar-img"
            />
            <span className="sidebar-online-indicator" title="Online" />
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">
              <span>{user?.fullName || user?.name || 'Customer'}</span>
              <BadgeCheck size={16} className="text-emerald-500 fill-emerald-100" />
            </div>
            <span className="sidebar-profile-tag">Customer Account</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-title">PORTAL MENU</div>
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="sidebar-nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={18} className="sidebar-nav-icon" />
                    <span className="sidebar-nav-text">{item.label}</span>
                    {item.badge && (
                      <span className={`sidebar-nav-badge ${item.badge.includes('Due') ? 'badge-due' : item.badge.includes('New') ? 'badge-new' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Marketplace Switcher & Logout */}
        <div className="sidebar-footer">
          <Link 
            to="/products" 
            className="sidebar-explore-cta"
            onClick={onClose}
          >
            <Compass size={18} />
            <div className="sidebar-explore-text">
              <span className="sidebar-explore-title">Explore Rentals</span>
              <span className="sidebar-explore-sub">Browse 500+ products</span>
            </div>
            <Sparkles size={16} className="text-amber-300 ml-auto" />
          </Link>

          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
