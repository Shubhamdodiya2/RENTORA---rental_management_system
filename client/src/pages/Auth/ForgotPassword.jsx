import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
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
            Reset Password
          </h2>
          <p className="text-xs text-[#457B9D]">
            Enter your registered email and we'll send you an instant recovery verification link.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-sm text-emerald-900 font-['Sora']">
              Reset Instructions Sent!
            </h3>
            <p className="text-xs text-emerald-700">
              We've dispatched a password reset link to <strong>{email}</strong>. Please check your inbox and spam folders.
            </p>
            <div className="pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline">
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input-field"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Send Recovery Link</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#457B9D] hover:text-[#1D3557]">
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
