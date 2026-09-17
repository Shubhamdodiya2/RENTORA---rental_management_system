import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserRound, 
  Store, 
  ShoppingBag, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Check
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [role, setRole] = useState('customer'); // 'customer' | 'vendor'
  const [step, setStep] = useState(1); // 1: Choose Role, 2: Fill Details

  // Customer Form
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true
  });

  // Vendor Form
  const [vendorData, setVendorData] = useState({
    ownerName: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: 'Cameras & Photography',
    city: 'Ahmedabad',
    acceptTerms: true
  });

  const [error, setError] = useState('');

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (customerData.password !== customerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    signup({ ...customerData, role: 'customer' });
    navigate('/products');
  };

  const handleVendorSubmit = (e) => {
    e.preventDefault();
    if (vendorData.password !== vendorData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    signup({ ...vendorData, role: 'vendor' });
    navigate('/products');
  };

  return (
    <div className="auth-page-container">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#A8DADC]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#E63946]/10 blur-3xl pointer-events-none" />

      <div className="auth-card space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-[#457B9D]">
            Join 50,000+ creators and 1,200+ rental businesses across Gujarat.
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 ? (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#457B9D]">
                Step 1 of 2
              </span>
              <h3 className="text-lg font-bold text-[#1D3557] font-['Sora'] mt-1">
                How do you want to use Rentora?
              </h3>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* Customer Role Card */}
              <div
                onClick={() => setRole('customer')}
                className={`role-card ${role === 'customer' ? 'role-card-selected' : 'role-card-unselected'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  role === 'customer' ? 'bg-[#E63946] text-white' : 'bg-[#A8DADC]/40 text-[#1D3557]'
                }`}>
                  <ShoppingBag size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#1D3557] font-['Sora']">
                      Customer
                    </h4>
                    {role === 'customer' && (
                      <span className="w-5 h-5 rounded-full bg-[#E63946] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#E63946] mt-0.5">“I want to rent products”</p>
                  <p className="text-[11px] text-[#457B9D] mt-1 leading-snug">
                    Discover gear, compare rental rates, reserve dates, and manage all your active rentals.
                  </p>
                </div>
              </div>

              {/* Vendor Role Card */}
              <div
                onClick={() => setRole('vendor')}
                className={`role-card ${role === 'vendor' ? 'role-card-selected' : 'role-card-unselected'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  role === 'vendor' ? 'bg-[#1D3557] text-white' : 'bg-[#A8DADC]/40 text-[#1D3557]'
                }`}>
                  <Store size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#1D3557] font-['Sora']">
                      Vendor / Rental Business
                    </h4>
                    {role === 'vendor' && (
                      <span className="w-5 h-5 rounded-full bg-[#1D3557] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#1D3557] mt-0.5">“I want to rent out my products”</p>
                  <p className="text-[11px] text-[#457B9D] mt-1 leading-snug">
                    List inventory, set hourly/daily prices, receive booking orders & automate deposit verification.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-3 bg-[#A8DADC]/20 rounded-xl text-[11px] text-[#457B9D] flex items-center gap-2">
              <Sparkles size={14} className="text-[#E63946] flex-shrink-0" />
              <span>Unified Account: You can enable vendor or customer tools anytime from your profile.</span>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>Continue as {role === 'customer' ? 'Customer' : 'Vendor'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Step 2: Details Form */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#1D3557] flex items-center gap-1">
                {role === 'customer' ? <ShoppingBag size={14} className="text-[#E63946]" /> : <Store size={14} className="text-[#1D3557]" />}
                <span>{role === 'customer' ? 'Customer Registration' : 'Vendor Registration'}</span>
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#457B9D] hover:underline"
              >
                ← Change Role
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            {role === 'customer' ? (
              /* Customer Form */
              <form onSubmit={handleCustomerSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Patel"
                      value={customerData.fullName}
                      onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                      className="auth-input-field"
                    />
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="aarav@gmail.com"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        className="auth-input-field"
                      />
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+91 98250 12345"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className="auth-input-field"
                      />
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={customerData.password}
                        onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                        className="auth-input-field"
                      />
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={customerData.confirmPassword}
                        onChange={(e) => setCustomerData({ ...customerData, confirmPassword: e.target.value })}
                        className="auth-input-field"
                      />
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#457B9D]">
                    <input
                      type="checkbox"
                      checked={customerData.acceptTerms}
                      onChange={(e) => setCustomerData({ ...customerData, acceptTerms: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E63946] accent-[#E63946]"
                    />
                    <span>I agree to Rentora's Terms of Rental & Privacy Policy</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all"
                >
                  <span>Complete Customer Signup</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* Vendor Form */
              <form onSubmit={handleVendorSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Owner Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Shah"
                        value={vendorData.ownerName}
                        onChange={(e) => setVendorData({ ...vendorData, ownerName: e.target.value })}
                        className="auth-input-field"
                      />
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Shop / Business Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. PixelGear Rentals"
                        value={vendorData.shopName}
                        onChange={(e) => setVendorData({ ...vendorData, shopName: e.target.value })}
                        className="auth-input-field"
                      />
                      <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Business Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="contact@store.in"
                        value={vendorData.email}
                        onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                        className="auth-input-field"
                      />
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+91 99090 12345"
                        value={vendorData.phone}
                        onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                        className="auth-input-field"
                      />
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Primary Category
                    </label>
                    <select
                      value={vendorData.category}
                      onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                    >
                      <option value="Cameras & Photography">Cameras & Video Gear</option>
                      <option value="Electronics & Gaming">Electronics & PS5</option>
                      <option value="Vehicles & Superbikes">Vehicles & 4x4 SUVs</option>
                      <option value="Event & Sound Gear">Event Sound & DJ</option>
                      <option value="Tools & Construction">Tools & Generators</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      City / Hub
                    </label>
                    <select
                      value={vendorData.city}
                      onChange={(e) => setVendorData({ ...vendorData, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                    >
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Surat">Surat</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Rajkot">Rajkot</option>
                      <option value="Gandhinagar">Gandhinagar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={vendorData.password}
                        onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })}
                        className="auth-input-field"
                      />
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={vendorData.confirmPassword}
                        onChange={(e) => setVendorData({ ...vendorData, confirmPassword: e.target.value })}
                        className="auth-input-field"
                      />
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#457B9D]">
                    <input
                      type="checkbox"
                      checked={vendorData.acceptTerms}
                      onChange={(e) => setVendorData({ ...vendorData, acceptTerms: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E63946] accent-[#E63946]"
                    />
                    <span>I agree to Vendor Merchant Agreement & 0% Fee Terms</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <span>Launch Vendor Store on Rentora</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Bottom Link */}
        <div className="text-center pt-2 border-t border-gray-100 text-xs text-[#457B9D]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#E63946] hover:underline">
            Log In here
          </Link>
        </div>

      </div>
    </div>
  );
}
