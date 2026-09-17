import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, ArrowLeft, KeyRound, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(initialToken ? 2 : 1); // 1: Request Email, 2: Reset with Token
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setSuccessMessage(`If ${email} is registered with Rentora, instructions have been dispatched.`);
      setStep(1.5); // Feedback state
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await resetPassword(token.trim(), newPassword);
      setSuccessMessage('Your password has been reset successfully! You can now log in.');
      setStep(3); // Completed state
    } catch (err) {
      setError(err.message || 'Invalid or expired password reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
            {step === 2 ? 'Set New Password' : 'Reset Password'}
          </h2>
          <p className="text-xs text-[#457B9D]">
            {step === 2
              ? 'Enter your reset token and your new strong password.'
              : "Enter your registered email and we'll send you an instant recovery verification link."}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1.5: Instructions Sent */}
        {step === 1.5 && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-sm text-emerald-900 font-['Sora']">
              Reset Request Processed
            </h3>
            <p className="text-xs text-emerald-700">
              {successMessage}
            </p>
            <div className="pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setStep(2); setError(''); }}
                className="w-full py-2.5 rounded-xl bg-[#1D3557] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <KeyRound size={14} />
                <span>I have a Reset Token</span>
              </button>
              <Link to="/login" className="text-xs font-bold text-[#E63946] hover:underline">
                Return to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 3: Password Successfully Reset */}
        {step === 3 && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-sm text-emerald-900 font-['Sora']">
              Password Reset Complete!
            </h3>
            <p className="text-xs text-emerald-700">
              {successMessage}
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Step 1: Request Reset Link Form */}
        {step === 1 && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                Your Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input-field"
                  disabled={isSubmitting}
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Request...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => { setStep(2); setError(''); }}
                className="font-bold text-[#457B9D] hover:underline"
              >
                Already have a token?
              </button>
              <Link to="/login" className="inline-flex items-center gap-1 font-bold text-[#E63946] hover:underline">
                <ArrowLeft size={13} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Reset Form with Token */}
        {step === 2 && (
          <form onSubmit={handleResetSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                Password Reset Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Paste 64-char reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="auth-input-field font-mono text-xs"
                  disabled={isSubmitting}
                />
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                New Password (Min 8 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input-field pr-10"
                  disabled={isSubmitting}
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input-field"
                  disabled={isSubmitting}
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#1D3557] hover:bg-[#15273f] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset & Save Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-xs font-bold text-[#457B9D] hover:underline"
              >
                Need to request a new token?
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
