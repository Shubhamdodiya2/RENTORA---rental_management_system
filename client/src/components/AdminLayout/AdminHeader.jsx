import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Sliders,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  PlusCircle,
  Store,
  Layers,
  Send
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ setIsMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAdmin, notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead } = useAdmin();
  const { logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const quickRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target)) {
        setQuickActionOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pageTitleMap = {
    dashboard: 'Super Admin Overview',
    customers: 'Customer Management',
    vendors: 'Vendor & Store Hub',
    products: 'Product & Inventory Approvals',
    categories: 'Category & Subcategory Manager',
    orders: 'Orders & Dispute Resolution',
    payments: 'Payments, Escrow & Revenue',
    'pickups-returns': 'Pickups & Returns Operations',
    complaints: 'Support Tickets & Helpdesk',
    reports: 'Reports & Analytics Intelligence',
    notifications: 'Broadcast & Notification Center',
    'admin-users': 'Admin Staff & Access Roles',
    settings: 'Platform Configuration & Policies',
    'activity-logs': 'System Audit & Activity Trail'
  };

  const currentPageTitle = pageTitleMap[pathSegments[1]] || 'Super Admin Dashboard';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('cust') || q.includes('user')) navigate('/admin/customers');
    else if (q.includes('vend') || q.includes('store') || q.includes('shop')) navigate('/admin/vendors');
    else if (q.includes('order') || q.includes('disp')) navigate('/admin/orders');
    else if (q.includes('pay') || q.includes('payout') || q.includes('money')) navigate('/admin/payments');
    else if (q.includes('prod') || q.includes('camera') || q.includes('item')) navigate('/admin/products');
    else if (q.includes('comp') || q.includes('ticket')) navigate('/admin/complaints');
    else if (q.includes('set') || q.includes('comm')) navigate('/admin/settings');
    else navigate(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-xs">
      
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Link to="/admin/dashboard" className="hover:text-slate-700 transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold capitalize">{pathSegments[1] || 'Dashboard'}</span>
            {pathSegments[2] && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-mono font-semibold">{pathSegments[2]}</span>
              </>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 font-['Sora'] tracking-tight truncate max-w-xs sm:max-w-md">
            {currentPageTitle}
          </h1>
        </div>
      </div>

      {/* Center/Right: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customers, vendors, orders, products or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all shadow-xs"
          />
        </div>
      </form>

      {/* Right Controls: Quick Action, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        
        {/* Quick Action Shortcut */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <PlusCircle size={14} />
            <span>Quick Action</span>
            <ChevronDown size={12} className={`transition-transform ${quickActionOpen ? 'rotate-180' : ''}`} />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in space-y-0.5 text-xs">
              <Link
                to="/admin/vendors"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Store size={14} className="text-slate-500" />
                <span>Review Pending Vendors</span>
              </Link>
              <Link
                to="/admin/products"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Layers size={14} className="text-slate-500" />
                <span>Approve New Products</span>
              </Link>
              <Link
                to="/admin/notifications"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Send size={14} className="text-slate-500" />
                <span>Broadcast Notice</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors border border-slate-200/60"
            aria-label="View notifications"
          >
            <Bell size={17} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold font-['Sora'] text-slate-900">Notifications</h4>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                      {unreadNotificationsCount} New
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                        !n.read
                          ? 'bg-blue-50/40 border-blue-100 hover:border-blue-200'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">{n.title}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications.</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All Platform Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all"
          >
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-7 h-7 rounded-lg object-cover border border-slate-200"
            />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                {currentAdmin.name}
              </span>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                {currentAdmin.role}
              </span>
            </div>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in space-y-1 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentAdmin.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentAdmin.email}</div>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200/50 uppercase">
                  <ShieldCheck size={11} /> Root Admin Access
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Sliders size={14} className="text-slate-400" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/admin/activity-logs"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <User size={14} className="text-slate-400" />
                  <span>My Audit Trail</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
