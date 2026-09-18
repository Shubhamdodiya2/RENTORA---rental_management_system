import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserRound, 
  Store, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  const [role, setRole] = useState('customer'); // 'customer' | 'vendor'
  const [step, setStep] = useState(1); // 1: Choose Role, 2: Fill Details
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Customer Form State
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Ahmedabad',
    acceptTerms: true
  });

  // Vendor Form State
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

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (customerData.password !== customerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (customerData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!customerData.acceptTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signup({
        fullName: customerData.fullName.trim(),
        email: customerData.email.trim(),
        phone: customerData.phone.trim(),
        password: customerData.password,
        city: customerData.city,
        role: 'customer'
      });
      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: customerData.email.trim(),
          registeredRole: 'customer',
          successMessage: 'Account created successfully! Please log in with your email & password.'
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (vendorData.password !== vendorData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (vendorData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!vendorData.acceptTerms) {
      setError('Please agree to the Terms of Service & Vendor Agreement.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signup({
        ownerName: vendorData.ownerName.trim(),
        shopName: vendorData.shopName.trim(),
        email: vendorData.email.trim(),
        phone: vendorData.phone.trim(),
        password: vendorData.password,
        category: vendorData.category,
        city: vendorData.city,
        role: 'vendor'
      });
      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: vendorData.email.trim(),
          registeredRole: 'vendor',
          successMessage: 'Vendor store registered successfully! Please log in with your credentials.'
        }
      });
    } catch (err) {
      setError(err.message || 'Vendor registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background Decor */}
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
            Join 50,000+ creators and rental businesses across Gujarat.
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 ? (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider text-center">
              Select Your Account Type
            </label>

            <div className="grid grid-cols-1 gap-3">
              {/* Customer Option */}
              <div
                id="customer-signup-card"
                onClick={() => { setRole('customer'); setStep(2); setError(''); }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  role === 'customer'
                    ? 'border-[#1D3557] bg-[#F1FAEE] shadow-sm'
                    : 'border-[#A8DADC]/40 hover:border-[#1D3557]/40 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#1D3557] text-white flex items-center justify-center flex-shrink-0">
                  <UserRound size={22} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-extrabold text-sm text-[#1D3557]">I want to Rent Products</h3>
                  <p className="text-xs text-[#457B9D]">Borrow cameras, gaming consoles, bikes & event gear easily.</p>
                </div>
                <ArrowRight size={16} className="text-[#1D3557]" />
              </div>

              {/* Vendor Option */}
              <div
                id="vendor-signup-card"
                onClick={() => { setRole('vendor'); setStep(2); setError(''); }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  role === 'vendor'
                    ? 'border-[#E63946] bg-[#F1FAEE] shadow-sm'
                    : 'border-[#A8DADC]/40 hover:border-[#E63946]/40 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#E63946] text-white flex items-center justify-center flex-shrink-0">
                  <Store size={22} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-extrabold text-sm text-[#1D3557]">I am a Rental Store / Business</h3>
                  <p className="text-xs text-[#457B9D]">List equipment, manage inventory & accept manual UPI bookings.</p>
                </div>
                <ArrowRight size={16} className="text-[#E63946]" />
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Role Form */
          <div className="space-y-4">
            {/* Active Role Bar */}
            <div className="flex items-center justify-between bg-[#F1FAEE] p-2 rounded-xl border border-[#A8DADC]/40 text-xs">
              <span className="font-bold text-[#1D3557] flex items-center gap-1">
                {role === 'customer' ? <UserRound size={14} /> : <Store size={14} />}
                Signing up as <span className="text-[#E63946] uppercase">{role}</span>
              </span>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-[11px] font-bold text-[#457B9D] hover:underline"
              >
                Change Type
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-start gap-2">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Customer Form */}
            {role === 'customer' ? (
              <form onSubmit={handleCustomerSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      name="fullName"
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

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="aarav@example.com"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      className="auth-input-field"
                    />
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      name="phone"
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

                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 8 chars"
                        value={customerData.password}
                        onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                        className="auth-input-field pr-8 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat password"
                        value={customerData.confirmPassword}
                        onChange={(e) => setCustomerData({ ...customerData, confirmPassword: e.target.value })}
                        className="auth-input-field pr-8 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#457B9D] pt-1">
                  <input
                    name="acceptTerms"
                    type="checkbox"
                    checked={customerData.acceptTerms}
                    onChange={(e) => setCustomerData({ ...customerData, acceptTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E63946] accent-[#E63946]"
                  />
                  <span>I accept Rentora Terms of Service & Privacy Policy</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#1D3557] hover:bg-[#15273f] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating Customer Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Vendor Form */
              <form onSubmit={handleVendorSubmit} className="space-y-3">
                {/* Shop Name & Owner Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Shop / Store Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PixelCraft Rentals"
                      value={vendorData.shopName}
                      onChange={(e) => setVendorData({ ...vendorData, shopName: e.target.value })}
                      className="auth-input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Owner Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hardik Shah"
                      value={vendorData.ownerName}
                      onChange={(e) => setVendorData({ ...vendorData, ownerName: e.target.value })}
                      className="auth-input-field text-xs"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@pixelcraft.in"
                      value={vendorData.email}
                      onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                      className="auth-input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98250 12345"
                      value={vendorData.phone}
                      onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                      className="auth-input-field text-xs"
                    />
                  </div>
                </div>

                {/* Category & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Primary Category
                    </label>
                    <select
                      value={vendorData.category}
                      onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                      className="auth-input-field text-xs"
                    >
                      <option value="Cameras & Photography">Cameras & Photography</option>
                      <option value="Electronics & Gaming">Electronics & Gaming</option>
                      <option value="Vehicles & Superbikes">Vehicles & Superbikes</option>
                      <option value="Furniture & Workspaces">Furniture & Workspaces</option>
                      <option value="Event & Sound Gear">Event & Sound Gear</option>
                      <option value="Tools & Construction">Tools & Construction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmedabad"
                      value={vendorData.city}
                      onChange={(e) => setVendorData({ ...vendorData, city: e.target.value })}
                      className="auth-input-field text-xs"
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 8 chars"
                        value={vendorData.password}
                        onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })}
                        className="auth-input-field pr-8 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat password"
                        value={vendorData.confirmPassword}
                        onChange={(e) => setVendorData({ ...vendorData, confirmPassword: e.target.value })}
                        className="auth-input-field pr-8 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#457B9D] pt-1">
                  <input
                    type="checkbox"
                    checked={vendorData.acceptTerms}
                    onChange={(e) => setVendorData({ ...vendorData, acceptTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E63946] accent-[#E63946]"
                  />
                  <span>I agree to Rentora Vendor Agreement & Terms</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating Vendor Store...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Vendor Store</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-gray-100 text-xs text-[#457B9D]">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-bold text-[#E63946] hover:underline">
            Sign In Instead
          </Link>
        </div>

      </div>
    </div>
  );
}
