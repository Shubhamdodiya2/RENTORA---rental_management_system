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
  Package
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, customerProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || 'Customer',
    email: user?.email || '',
    phone: user?.phone || '',
    address: customerProfile?.address || '402, Shivalik Highstreet, Bodakdev',
    city: customerProfile?.city || 'Ahmedabad',
    state: customerProfile?.state || 'Gujarat',
    pincode: customerProfile?.pincode || '380015'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
        pincode: customerProfile?.pincode || prev.pincode
      }));
    }
  }, [user, customerProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Customer Profile</h1>
          <p className="page-sub-heading">
            Manage your personal credentials, contact coordinates, and KYC trust level.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`btn-toggle-edit ${isEditing ? 'btn-editing-active' : ''}`}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="profile-success-banner">
          <CheckCircle2 size={18} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-container">
          <img
            src={user?.avatar || CUSTOMER_PROFILE.avatar}
            alt={formData.name}
            className="profile-large-avatar"
          />
          {isEditing && (
            <button className="avatar-upload-btn" title="Change Avatar Photo">
              <Camera size={16} />
            </button>
          )}
        </div>

        <div className="profile-hero-meta">
          <div className="flex items-center gap-2">
            <h2 className="profile-name-title">{formData.name}</h2>
            <div className="kyc-pill-tag">
              <ShieldCheck size={14} />
              <span>{CUSTOMER_PROFILE.kycStatus}</span>
            </div>
          </div>
          <p className="profile-membership-line">
            <Sparkles size={14} className="text-amber-500 inline mr-1" />
            {CUSTOMER_PROFILE.kycBadge}
          </p>
          <div className="profile-hero-chips">
            <span className="profile-chip">
              <Calendar size={13} />
              <span>Member since {CUSTOMER_PROFILE.joinedDate}</span>
            </span>
            <span className="profile-chip">
              <Package size={13} />
              <span>{CUSTOMER_PROFILE.totalRentalsCompleted} Rentals Completed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="profile-form-card">
        <h3 className="form-card-title">Personal & Contact Coordinates</h3>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-row-2">
            <div className="form-field">
              <label className="field-label">Full Name</label>
              <div className="field-input-box">
                <User size={16} className="text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="profile-input"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Email Address</label>
              <div className="field-input-box">
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="profile-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label className="field-label">Mobile Number</label>
              <div className="field-input-box">
                <Phone size={16} className="text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="profile-input"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">City</label>
              <div className="field-input-box">
                <MapPin size={16} className="text-slate-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="profile-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Primary Delivery & Handover Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="profile-textarea"
              required
            />
          </div>

          {isEditing && (
            <div className="form-submit-row">
              <button type="submit" className="btn-save-profile">
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
