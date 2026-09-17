import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Store, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, primaryRole } = useAuth();

  const getDashboardPath = () => {
    if (roles.includes('SUPER_ADMIN')) return '/admin/dashboard';
    if (roles.includes('VENDOR')) return '/vendor/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F1FAEE] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E63946]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#A8DADC]/30 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#A8DADC]/40 shadow-2xl relative z-10 text-center space-y-6">
        
        {/* Header Logo */}
        <div className="flex justify-center">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        {/* 403 Badge & Icon */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-[#E63946] shadow-inner">
            <ShieldAlert size={40} className="text-[#E63946]" />
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black tracking-widest uppercase">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-[#1D3557] font-['Sora']">
            Access Restricted
          </h1>
          <p className="text-xs text-[#457B9D] leading-relaxed">
            You do not have the necessary role or permissions to access this portal or resource.
          </p>
        </div>

        {/* Current Active Role Indicator */}
        {user && (
          <div className="bg-[#F1FAEE] p-3 rounded-2xl border border-[#A8DADC]/40 text-left text-xs space-y-1">
            <div className="flex items-center justify-between text-[#1D3557] font-bold">
              <span>Logged In As:</span>
              <span className="text-[#457B9D]">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-[#1D3557] font-bold">
              <span>Your Active Roles:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#1D3557] text-white text-[10px] font-black uppercase">
                {roles.join(', ') || 'CUSTOMER'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            to={getDashboardPath()}
            className="w-full py-3 rounded-xl bg-[#1D3557] hover:bg-[#15273f] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {roles.includes('SUPER_ADMIN') ? (
              <ShieldCheck size={16} />
            ) : roles.includes('VENDOR') ? (
              <Store size={16} />
            ) : (
              <UserCheck size={16} />
            )}
            <span>Return to My Dashboard</span>
          </Link>

          <Link
            to="/"
            className="w-full py-3 rounded-xl bg-white border border-[#A8DADC] hover:bg-[#A8DADC]/20 text-[#1D3557] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home size={16} />
            <span>Go to Marketplace Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
