import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Lock,
  ShieldCheck,
  Smartphone,
  Mail,
  Clock,
  LogOut,
  Trash2,
  CheckCircle2,
  Save,
  FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [leadTime, setLeadTime] = useState('24h');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password state
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Account Settings & Preferences</h1>
          <p className="page-sub-heading">
            Configure return reminder schedules, multi-channel notifications, and account credentials.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="settings-saved-banner">
          <CheckCircle2 size={18} />
          <span>Your preferences have been updated!</span>
        </div>
      )}

      {/* 1. Return Reminder & Lead Time Preferences */}
      <div className="settings-card">
        <div className="settings-card-header">
          <Clock size={20} className="text-primary-red" />
          <div>
            <h3 className="settings-card-title">Rental Return Reminders</h3>
            <p className="settings-card-sub">Choose when Rentora alerts you before an item is due for return.</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="reminder-options-grid">
            {[
              { id: '6h', label: '6 Hours Before', sub: 'Urgent final reminder' },
              { id: '24h', label: '1 Day Before (Recommended)', sub: 'Standard buffer for packaging & courier drop' },
              { id: '48h', label: '2 Days Before', sub: 'Early advance planning' }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`reminder-option-label ${leadTime === opt.id ? 'option-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="leadTime"
                  value={opt.id}
                  checked={leadTime === opt.id}
                  onChange={(e) => setLeadTime(e.target.value)}
                  className="radio-input"
                />
                <div className="option-text">
                  <span className="option-title">{opt.label}</span>
                  <span className="option-sub">{opt.sub}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Multi-Channel Notifications */}
      <div className="settings-card">
        <div className="settings-card-header">
          <Bell size={20} className="text-secondary-blue" />
          <div>
            <h3 className="settings-card-title">Notification Channels</h3>
            <p className="settings-card-sub">Select which mediums you wish to receive booking and dispatch updates on.</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="toggles-list">
            <div className="toggle-row">
              <div className="toggle-info">
                <Mail size={18} className="text-slate-500" />
                <div>
                  <span className="toggle-title">Email Notifications</span>
                  <p className="toggle-sub">Receive PDF invoices, booking summaries, and contracts in your inbox.</p>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                />
                <span className="slider round" />
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <Smartphone size={18} className="text-slate-500" />
                <div>
                  <span className="toggle-title">SMS & OTP Alerts</span>
                  <p className="toggle-sub">Instant courier dispatch OTPs and delivery driver updates.</p>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={() => setSmsAlerts(!smsAlerts)}
                />
                <span className="slider round" />
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <span className="text-emerald-600 font-bold text-base">💬</span>
                <div>
                  <span className="toggle-title">WhatsApp Rental Concierge</span>
                  <p className="toggle-sub">Receive instant return reminders and direct vendor coordination via WhatsApp.</p>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={() => setWhatsappAlerts(!whatsappAlerts)}
                />
                <span className="slider round" />
              </label>
            </div>
          </div>

          <div className="save-prefs-row">
            <button onClick={handleSavePreferences} className="btn-save-prefs">
              <Save size={16} />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Password & Security */}
      <div className="settings-card">
        <div className="settings-card-header">
          <Lock size={20} className="text-navy" />
          <div>
            <h3 className="settings-card-title">Change Password</h3>
            <p className="settings-card-sub">Update your authentication password to safeguard your rental account.</p>
          </div>
        </div>

        <div className="settings-card-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Password updated successfully!');
              setPwdForm({ current: '', newPwd: '', confirm: '' });
            }}
            className="pwd-form"
          >
            <div className="form-field">
              <label className="field-label">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                className="pwd-input"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label className="field-label">New Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={pwdForm.newPwd}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
                  className="pwd-input"
                  required
                />
              </div>
              <div className="form-field">
                <label className="field-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  className="pwd-input"
                  required
                />
              </div>
            </div>

            <div className="pwd-btn-row">
              <button type="submit" className="btn-update-pwd">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Legal & Danger Zone */}
      <div className="settings-card danger-card">
        <div className="settings-card-header">
          <LogOut size={20} className="text-primary-red" />
          <div>
            <h3 className="settings-card-title text-primary-red">Session & Account Actions</h3>
            <p className="settings-card-sub">Sign out or terminate your active customer session.</p>
          </div>
        </div>

        <div className="settings-card-body flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="font-semibold text-sm text-navy block">End Current Portal Session</span>
            <span className="text-xs text-slate-500">Sign out across this browser securely.</span>
          </div>
          <button onClick={handleSignOut} className="btn-logout-danger">
            <LogOut size={16} />
            <span>Sign Out of Rentora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
