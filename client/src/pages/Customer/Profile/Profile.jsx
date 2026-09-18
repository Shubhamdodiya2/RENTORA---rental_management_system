import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Save,
  Sparkles,
  Calendar,
  Package,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './Profile.css';

export default function Profile() {
  const { user, customerProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || 'Customer',
    email: user?.email || '',
    phone: user?.phone || '',
    address: customerProfile?.address || '402, Shivalik Highstreet, Bodakdev',
    city: customerProfile?.city || 'Ahmedabad',
    state: customerProfile?.state || 'Gujarat',
    pincode: customerProfile?.pincode || '380015',
    refundUpi: customerProfile?.refundUpi || (user?.email ? `${user.email.split('@')[0]}@okaxis` : 'customer@okaxis')
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: customerProfile?.address || prev.address,
        city: customerProfile?.city || prev.city,
        state: customerProfile?.state || prev.state,
        pincode: customerProfile?.pincode || prev.pincode,
        refundUpi: customerProfile?.refundUpi || prev.refundUpi
      }));
    }
  }, [user, customerProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        fullName: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        refundUpi: formData.refundUpi
      };

      if (updateProfile) {
        await updateProfile(payload);
      } else {
        await api.patch('/auth/profile', payload);
      }
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026';
  const kycStatus = customerProfile?.kycStatus || 'VERIFIED';
  const kycBadge = customerProfile?.kycBadge || 'Rentora Verified Customer (Instant Booking Enabled)';

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Customer Profile & Refund Settings</h1>
          <p className="page-sub-heading">
            Manage your personal contact details, primary delivery address, and escrow deposit refund UPI ID.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="profile-success-banner animate-in fade-in">
          <CheckCircle2 size={18} />
          <span>Profile, delivery address & deposit refund UPI ID saved to database successfully!</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-container">
          <img
            src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1D3557&color=ffffff&bold=true`}
            alt={formData.name}
            className="profile-large-avatar"
          />
        </div>

        <div className="profile-hero-meta">
          <div className="flex items-center gap-2">
            <h2 className="profile-name-title">{formData.name}</h2>
            <div className="kyc-pill-tag">
              <ShieldCheck size={14} />
              <span>{kycStatus}</span>
            </div>
          </div>
          <p className="profile-membership-line">
            <Sparkles size={14} className="text-amber-500 inline mr-1" />
            {kycBadge}
          </p>
          <div className="profile-hero-chips">
            <span className="profile-chip">
              <Calendar size={13} />
              <span>Member since {memberYear}</span>
            </span>
            <span className="profile-chip">
              <Package size={13} />
              <span>Verified Customer Account</span>
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="profile-form-card">
        <h3 className="form-card-title">Personal Coordinates & Refund Settings</h3>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-row-2">
            <div className="form-field">
              <label className="field-label">Full Name *</label>
              <div className="field-input-box">
                <User size={16} className="text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="profile-input"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Email Address (Login Account)</label>
              <div className="field-input-box">
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="profile-input opacity-70 bg-slate-100 cursor-not-allowed"
                  title="Email is locked to your account"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label className="field-label">Mobile Number *</label>
              <div className="field-input-box">
                <Phone size={16} className="text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="profile-input"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">City *</label>
              <div className="field-input-box">
                <MapPin size={16} className="text-slate-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="profile-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Primary Delivery & Handover Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="profile-textarea"
              placeholder="Enter your full street address, house/flat no, area & pincode"
              required
            />
          </div>

          <div className="form-field">
            <div className="flex items-center justify-between mb-1">
              <label className="field-label flex items-center gap-1.5 text-emerald-800 font-bold">
                <Wallet size={15} className="text-emerald-600" />
                <span>Default Security Deposit Refund UPI ID *</span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                100% Instant Escrow Refund Destination
              </span>
            </div>
            <div className="field-input-box">
              <Wallet size={16} className="text-emerald-600" />
              <input
                type="text"
                name="refundUpi"
                value={formData.refundUpi}
                onChange={handleChange}
                placeholder="e.g. yourname@okhdfcbank"
                className="profile-input font-mono font-bold text-emerald-950 border-emerald-300 focus:border-emerald-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              When you return rented gear in healthy condition, Rentora & vendors automatically refund your security deposit directly to this UPI address.
            </p>
          </div>

          <div className="form-submit-row mt-6">
            <button type="submit" disabled={isSubmitting} className="btn-save-profile w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors">
              <Save size={18} />
              <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile & Deposit Refund UPI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
