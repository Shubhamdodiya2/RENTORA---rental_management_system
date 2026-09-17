import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  PackageCheck,
  LayoutGrid,
  ShoppingCart,
  CreditCard,
  Truck,
  MessageSquareWarning,
  BarChart3,
  Bell,
  ShieldCheck,
  Sliders,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Shield
} from 'lucide-react';
import Logo from '../Logo/Logo';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const { currentAdmin, pendingApprovalsCount, openComplaintsCount, unreadNotificationsCount } = useAdmin();
  const { logout } = useAuth();

  const menuGroups = [
    {
      groupTitle: 'Core Management',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { 
          label: 'Vendors', 
          path: '/admin/vendors', 
          icon: Store,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
          badgeColor: 'bg-[#E63946]'
        },
        { label: 'Products', path: '/admin/products', icon: PackageCheck },
        { label: 'Categories', path: '/admin/categories', icon: LayoutGrid }
      ]
    },
    {
      groupTitle: 'Operations & Finance',
      items: [
        { label: 'Orders & Disputes', path: '/admin/orders', icon: ShoppingCart },
        { label: 'Payments & Escrow', path: '/admin/payments', icon: CreditCard },
        { label: 'Pickups & Returns', path: '/admin/pickups-returns', icon: Truck },
        { 
          label: 'Complaints & Support', 
          path: '/admin/complaints', 
          icon: MessageSquareWarning,
          badge: openComplaintsCount > 0 ? openComplaintsCount : null,
          badgeColor: 'bg-amber-500'
        }
      ]
    },
    {
      groupTitle: 'Analytics & Administration',
      items: [
        { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { 
          label: 'Notifications', 
          path: '/admin/notifications', 
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
          badgeColor: 'bg-[#E63946]'
        },
        { label: 'Admin Users & Roles', path: '/admin/admin-users', icon: ShieldCheck },
        { label: 'Platform Settings', path: '/admin/settings', icon: Sliders },
        { label: 'Activity Logs', path: '/admin/activity-logs', icon: History }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white text-slate-700 border-r border-slate-200/90 transition-all duration-300 ease-in-out shadow-xs ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-sm flex-shrink-0">
                <Shield size={18} />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-base font-['Sora'] tracking-tight text-slate-900 leading-tight">
                    Rentora<span className="text-blue-600">.</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                    <Sparkles size={10} className="text-blue-600" /> Super Admin
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 items-center justify-center border border-slate-200/60 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Current Admin Profile Card */}
        {!isCollapsed ? (
          <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate font-['Sora']">{currentAdmin.name}</h4>
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider mt-0.5 border border-blue-100">
                {currentAdmin.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="my-3 flex justify-center">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              title={`${currentAdmin.name} (${currentAdmin.role})`}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
            />
          </div>
        )}

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon size={16} className="flex-shrink-0 transition-transform group-hover:scale-105" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {item.badge && (
                      <span
                        className={`bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-auto ${
                          isCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-white' : ''
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-1">
          <Link
            to="/"
            target="_blank"
            title={isCollapsed ? 'Visit Marketplace Storefront' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ExternalLink size={15} />
            {!isCollapsed && <span>View Marketplace</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout Admin Session' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut size={15} />
            {!isCollapsed && <span>Admin Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
