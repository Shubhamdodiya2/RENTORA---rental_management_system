import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  Receipt,
  LogOut,
  Sparkles,
  ExternalLink,
  Store,
  CheckCircle2,
  PackagePlus,
  Plus
} from 'lucide-react';
import { useVendor } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';
import './VendorHeader.css';

const VENDOR_PAGE_TITLES = {
  '/vendor/dashboard': 'Vendor Dashboard Overview',
  '/vendor/products': 'Product Management',
  '/vendor/products/add': 'Add New Product Listing',
  '/vendor/inventory': 'Inventory & Stock Control',
  '/vendor/pricing': 'Rental Pricing & Rate Cards',
  '/vendor/orders': 'Orders & Rental Reservations',
  '/vendor/quotations': 'Commercial Quotations',
  '/vendor/quotations/create': 'Create Custom Quotation',
  '/vendor/pickups-returns': 'Pickup & Return Logistics',
  '/vendor/customers': 'Customer Directory',
  '/vendor/invoices': 'Invoices & Tax Billing',
  '/vendor/payments': 'Payouts & Escrow Settlements',
  '/vendor/reports': 'Performance Reports & Analytics',
  '/vendor/notifications': 'Notification Center',
  '/vendor/settings': 'Store & Business Settings',
};

export default function VendorHeader({ onOpenMobileMenu }) {
  const { vendorProfile, notifications } = useVendor();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifsRef = useRef(null);
  const helpRef = useRef(null);

  const currentTitle = VENDOR_PAGE_TITLES[location.pathname] || 'Vendor Portal';
  const unreadNotifs = notifications.filter((n) => !n.read);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setNotifsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vendor/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="vendor-header">
      {/* Left side: Hamburger & Title */}
      <div className="vendor-header-left">
        <button
          onClick={onOpenMobileMenu}
          className="vendor-header-hamburger"
          aria-label="Open Mobile Menu"
        >
          <Menu size={22} />
        </button>

        <div className="vendor-title-wrapper">
          <div className="vendor-breadcrumbs">
            <Link to="/vendor/dashboard" className="v-bread-root">Vendor Hub</Link>
            <span className="v-bread-sep">/</span>
            <span className="v-bread-active">{currentTitle}</span>
          </div>
          <h1 className="vendor-page-title">{currentTitle}</h1>
        </div>
      </div>

      {/* Center / Search Bar */}
      <div className="vendor-header-center">
        <form onSubmit={handleSearch} className="vendor-search-bar">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search products, orders, SKU, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vendor-search-input"
          />
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </div>

      {/* Right side: Quick Add CTA, Help, Notifications, Profile */}
      <div className="vendor-header-right">
        {/* Quick Add Product Button */}
        <Link to="/vendor/products/add" className="btn-header-add-product">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Product</span>
        </Link>

        {/* Help & Support Dropdown */}
        <div className="header-dropdown-wrap" ref={helpRef}>
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="vendor-icon-circle-btn"
            title="Vendor Help & Support"
            aria-label="Help"
          >
            <HelpCircle size={19} />
          </button>

          {helpOpen && (
            <div className="v-dropdown-menu help-dropdown">
              <div className="v-dropdown-hdr">
                <span className="font-bold text-sm text-navy">Vendor Support & Guide</span>
              </div>
              <div className="p-3 text-xs text-slate-600 space-y-2">
                <p><strong>Store Hub Address:</strong> {vendorProfile.address}</p>
                <p><strong>Merchant Hotline:</strong> +91 98250 12345</p>
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                  <a
                    href="https://rentora.in/vendor-guide"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-red font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Read Rentora Vendor SOP</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="header-dropdown-wrap" ref={notifsRef}>
          <button
            onClick={() => setNotifsOpen(!notifsOpen)}
            className="vendor-icon-circle-btn"
            aria-label="Vendor Notifications"
          >
            <Bell size={19} />
            {unreadNotifs.length > 0 && (
              <span className="vendor-notif-pulse">{unreadNotifs.length}</span>
            )}
          </button>

          {notifsOpen && (
            <div className="v-dropdown-menu notif-dropdown">
              <div className="v-dropdown-hdr flex items-center justify-between">
                <span className="font-bold text-sm text-navy">Store Alerts</span>
                <span className="text-xs bg-rose-50 text-primary-red px-2 py-0.5 rounded-full font-bold">
                  {unreadNotifs.length} new
                </span>
              </div>
              <div className="v-notif-scroll-list">
                {notifications.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    to="/vendor/notifications"
                    onClick={() => setNotifsOpen(false)}
                    className={`v-notif-row ${!n.read ? 'v-notif-unread' : ''}`}
                  >
                    <div className="v-notif-dot" />
                    <div className="flex-1">
                      <div className="v-notif-title">{n.title}</div>
                      <div className="v-notif-msg">{n.message}</div>
                      <div className="v-notif-time">{n.time}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="v-dropdown-footer">
                <Link
                  to="/vendor/notifications"
                  onClick={() => setNotifsOpen(false)}
                  className="v-view-all-link"
                >
                  View All Notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Vendor Profile Menu */}
        <div className="header-dropdown-wrap" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="vendor-profile-btn"
            aria-label="Vendor Profile Menu"
          >
            <img
              src={vendorProfile.avatar}
              alt={vendorProfile.vendorName}
              className="v-header-avatar"
            />
            <div className="v-header-meta hidden md:flex">
              <span className="v-meta-name">{vendorProfile.vendorName}</span>
              <span className="v-meta-biz">{vendorProfile.businessName}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="v-dropdown-menu profile-dropdown">
              <div className="v-dropdown-hdr">
                <div className="font-bold text-sm text-navy">{vendorProfile.businessName}</div>
                <div className="text-xs text-slate-500">{vendorProfile.email}</div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>GST: {vendorProfile.gstNumber}</span>
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/vendor/settings"
                  onClick={() => setProfileOpen(false)}
                  className="v-dropdown-item"
                >
                  <Settings size={15} />
                  <span>Store Settings & KYC</span>
                </Link>
                <Link
                  to="/vendor/invoices"
                  onClick={() => setProfileOpen(false)}
                  className="v-dropdown-item"
                >
                  <Receipt size={15} />
                  <span>Billing & Payouts</span>
                </Link>
                <Link
                  to="/products"
                  onClick={() => setProfileOpen(false)}
                  className="v-dropdown-item text-secondary-blue font-semibold"
                >
                  <Store size={15} />
                  <span>View Public Storefront</span>
                </Link>
              </div>
              <div className="border-t border-slate-100 p-1">
                <button
                  onClick={handleLogout}
                  className="v-dropdown-item v-dropdown-danger"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
