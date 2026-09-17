import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, roles, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Show sleek loading screen while session is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1FAEE] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#A8DADC]/40 flex flex-col items-center max-w-sm w-full text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
            <Loader2 size={32} className="animate-spin text-[#E63946]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1D3557] font-['Sora']">Verifying Session</h3>
            <p className="text-xs text-[#457B9D] mt-1">Securing your connection to Rentora Cloud...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. If unauthenticated, redirect to login with original target path preserved
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Check role authorization
  if (allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) =>
      roles.map((r) => r.toUpperCase()).includes(role.toUpperCase())
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname, allowedRoles }} replace />;
    }
  }

  // 4. Authorized: render child routes
  return <Outlet />;
}
