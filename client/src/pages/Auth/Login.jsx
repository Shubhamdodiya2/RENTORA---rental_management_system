import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  UserCheck,
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'admin'

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your registered email and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      
      // Determine redirection target
      const returnTarget = location.state?.from;

      if (result.roles.includes('SUPER_ADMIN')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (result.roles.includes('VENDOR') && role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else if (returnTarget) {
        navigate(returnTarget, { replace: true });
      } else if (result.roles.includes('VENDOR')) {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('aarav.creator@rentora.in');
    setPassword('DemoCustomer2026!');
    setRole('customer');
    setError('');
  };

  const fillDemoVendor = () => {
    setEmail('pixelcraft.owner@rentora.in');
    setPassword('DemoVendor2026!');
    setRole('vendor');
    setError('');
  };

  const fillDemoAdmin = () => {
    setEmail('superadmin@rentora.in');
    setPassword('AdminSecure2026!');
    setRole('admin');
    setError('');
  };

  return (
    <div className="auth-page-container">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#A8DADC]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#E63946]/10 blur-3xl pointer-events-none" />

      <div className="auth-card space-y-6">
        
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
            {role === 'admin' ? 'Super Admin Portal' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#457B9D]">
            {role === 'admin'
              ? 'Authorized administrative staff & operations login only.'
              : 'Sign in to access your rental dashboard, contracts & operations.'}
          </p>
        </div>

        {/* Demo Fill Helper Buttons */}
        <div className="bg-[#F1FAEE] p-2.5 rounded-2xl border border-[#A8DADC]/40 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <span className="font-bold text-[#1D3557] flex items-center gap-1 text-[11px]">
            <Sparkles size={13} className="text-[#E63946]" /> 1-Click Demo:
          </span>
          <div className="flex gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={fillDemoCustomer}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors ${role === 'customer' ? 'bg-[#1D3557] text-white border-[#1D3557]' : 'bg-white border-[#A8DADC] text-[#1D3557] hover:bg-[#A8DADC]/30'}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={fillDemoVendor}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors ${role === 'vendor' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white border-[#A8DADC] text-[#E63946] hover:bg-[#E63946]/10'}`}
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors ${role === 'admin' ? 'bg-[#457B9D] text-white border-[#457B9D]' : 'bg-white border-[#A8DADC] text-[#457B9D] hover:bg-[#457B9D]/10'}`}
            >
              Super Admin
            </button>
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F1FAEE] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setRole('customer'); setError(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              role === 'customer' ? 'bg-[#1D3557] text-white shadow-sm' : 'text-[#457B9D]'
            }`}
          >
            <UserCheck size={13} />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('vendor'); setError(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              role === 'vendor' ? 'bg-[#1D3557] text-white shadow-sm' : 'text-[#457B9D]'
            }`}
          >
            <Store size={13} />
            <span>Vendor</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              role === 'admin' ? 'bg-[#1D3557] text-white shadow-sm' : 'text-[#457B9D]'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
              {role === 'admin' ? 'Super Admin Email' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder={role === 'admin' ? 'admin@rentora.in' : 'name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-field"
                disabled={isSubmitting}
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">
                Password
              </label>
              {role !== 'admin' && (
                <Link to="/forgot-password" className="text-xs font-bold text-[#E63946] hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field pr-10"
                disabled={isSubmitting}
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-[#457B9D]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#E63946] accent-[#E63946]"
              />
              <span className="font-semibold text-[#1D3557]">Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>{role === 'admin' ? 'Access Super Admin Panel' : 'Log In to Rentora'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer: Hide signup option on Super Admin login screen */}
        {role !== 'admin' ? (
          <div className="text-center pt-2 border-t border-gray-100 text-xs text-[#457B9D]">
            Don't have an account yet?{' '}
            <Link to="/signup" state={location.state} className="font-bold text-[#E63946] hover:underline">
              Create an Account
            </Link>
          </div>
        ) : (
          <div className="text-center pt-2 border-t border-gray-100 text-[11px] text-[#457B9D]">
            <span className="font-semibold text-[#1D3557]">🔒 Super Admin credentials are provisioned via environment configuration.</span>
          </div>
        )}

      </div>
    </div>
  );
}
