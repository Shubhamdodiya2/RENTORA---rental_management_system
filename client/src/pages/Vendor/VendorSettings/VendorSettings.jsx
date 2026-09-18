import React, { useState, useRef, useEffect } from 'react';
import {
  Store,
  Building,
  ShieldCheck,
  Lock,
  Bell,
  Palette,
  Save,
  CheckCircle2,
  Camera,
  Smartphone,
  Mail,
  Clock,
  LogOut,
  MapPin,
  FileText,
  QrCode,
  Wallet,
  Upload,
  Copy,
  Check
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import { useAuth } from '../../../context/AuthContext';
import './VendorSettings.css';

const TABS = [
  { id: 'profile', label: 'Store Profile & KYC', icon: Store },
  { id: 'payout', label: 'UPI & Payment QR', icon: QrCode },
  { id: 'business', label: 'Operations & Policies', icon: Building },
  { id: 'security', label: 'Security & Credentials', icon: Lock },
  { id: 'notifications', label: 'Notification Channels', icon: Bell }
];

export default function VendorSettings() {
  const { vendorProfile, updateVendorSettings, uploadProductImageFile, showToast } = useVendor();
  const { changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const qrFileInputRef = useRef(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: vendorProfile.businessName || '',
    vendorName: vendorProfile.vendorName || '',
    email: vendorProfile.email || '',
    phone: vendorProfile.phone || '',
    address: vendorProfile.address || '',
    city: vendorProfile.city || '',
    gstNumber: vendorProfile.gstNumber || '',
    website: vendorProfile.website || '',
    workingHours: vendorProfile.workingHours || '09:00 AM - 08:00 PM',
    description: vendorProfile.description || '',
    bankAccount: vendorProfile.bankAccount || 'HDFC Bank (Escrow Linked)',
    upiId: vendorProfile.upiId || (vendorProfile.businessName ? `${vendorProfile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'vendor@okaxis'),
    qrCodeUrl: vendorProfile.qrCodeUrl || ''
  });

  useEffect(() => {
    if (vendorProfile) {
      setFormData((prev) => ({
        ...prev,
        businessName: vendorProfile.businessName || prev.businessName,
        vendorName: vendorProfile.vendorName || prev.vendorName,
        email: vendorProfile.email || prev.email,
        phone: vendorProfile.phone || prev.phone,
        address: vendorProfile.address || prev.address,
        city: vendorProfile.city || prev.city,
        gstNumber: vendorProfile.gstNumber || prev.gstNumber,
        website: vendorProfile.website || prev.website,
        workingHours: vendorProfile.workingHours || prev.workingHours,
        description: vendorProfile.description || prev.description,
        bankAccount: vendorProfile.bankAccount || prev.bankAccount,
        upiId: vendorProfile.upiId || prev.upiId,
        qrCodeUrl: vendorProfile.qrCodeUrl || prev.qrCodeUrl
      }));
    }
  }, [vendorProfile]);

  // Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyUpi = () => {
    if (formData.upiId) {
      navigator.clipboard.writeText(formData.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleQrFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingQr(true);
    try {
      const uploadedUrl = await uploadProductImageFile(file);
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, qrCodeUrl: uploadedUrl }));
        await updateVendorSettings({ ...formData, qrCodeUrl: uploadedUrl });
      }
    } catch (err) {
      console.error('[VendorSettings] QR Upload error:', err);
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateVendorSettings(formData);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) {
      showToast('New passwords do not match. Please re-enter.', 'error');
      return;
    }
    if (pwdForm.newPwd.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(pwdForm.current, pwdForm.newPwd);
      showToast('Merchant password updated successfully!', 'success');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      console.error('[VendorSettings] Password update error:', err);
      showToast(err.message || 'Failed to update password. Please check your current password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="vendor-settings-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Store Profile & Merchant Settings</h1>
          <p className="page-sub-heading">
            Configure merchant business credentials, GST taxation identifiers, and operating dispatch policies.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="v-settings-tabs-row">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`v-settings-tab-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & KYC */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="v-settings-section">
          {/* Avatar / Logo Banner */}
          <div className="v-card-box">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative w-20 h-20">
                <img src={vendorProfile.avatar} alt="Vendor" className="w-full h-full rounded-2xl object-cover border-2 border-slate-200" />
                <button type="button" className="absolute -bottom-1 -right-1 p-1.5 bg-primary-red text-white rounded-full border-2 border-white shadow">
                  <Camera size={13} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-navy text-base">{formData.businessName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {vendorProfile.verifiedBadge}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">GST: {formData.gstNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="v-card-box mt-5">
            <h3 className="v-card-title mb-4">Business & Registration Coordinates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="v-form-field">
                <label className="v-form-lbl">Business / Store Trade Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="v-form-input"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Owner / Operator Name *</label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  className="v-form-input"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Official Store Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="v-form-input"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Contact Mobile / Hotline *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="v-form-input"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">GSTIN Tax Registration Number *</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="v-form-input font-mono font-bold"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Store Website / Catalog URL</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="v-form-input"
                />
              </div>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Physical Store Hub & Pickup Address *</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                className="v-form-textarea"
                required
              />
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Store Profile Overview</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="v-form-textarea"
              />
            </div>

            <div className="flex justify-end mt-5">
              <button type="submit" className="btn-v-primary">
                <Save size={16} />
                <span>Save Store Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: UPI & Payment QR */}
      {activeTab === 'payout' && (
        <form onSubmit={handleSaveProfile} className="v-settings-section">
          <div className="v-card-box">
            <h3 className="v-card-title mb-2">Merchant UPI ID & Payment QR Configuration</h3>
            <p className="text-xs text-slate-500 mb-5">
              Configure the official UPI Virtual Payment Address (VPA) and QR code where customers make instant rental payments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* QR Preview & Upload Box */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-44 h-44 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center shadow-sm">
                  {formData.qrCodeUrl ? (
                    <img
                      src={formData.qrCodeUrl}
                      alt="Vendor Custom QR Code"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${formData.upiId || 'vendor@okaxis'}&pn=${encodeURIComponent(formData.businessName || 'Vendor')}&cu=INR`)}&margin=4`}
                      alt="Dynamic UPI QR Code"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  {formData.qrCodeUrl ? 'Custom Merchant QR Active' : 'Live Auto-Generated Payment QR'}
                </div>

                <div className="flex flex-col w-full gap-2">
                  <input
                    type="file"
                    ref={qrFileInputRef}
                    onChange={handleQrFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => qrFileInputRef.current?.click()}
                    disabled={isUploadingQr}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-[#1D3557] flex items-center justify-center gap-1.5 transition"
                  >
                    <Upload size={14} />
                    <span>{isUploadingQr ? 'Uploading QR...' : 'Upload QR Image (PC)'}</span>
                  </button>
                  {formData.qrCodeUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, qrCodeUrl: '' }))}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Reset to Auto-Generated QR
                    </button>
                  )}
                </div>
              </div>

              {/* UPI Form Fields */}
              <div className="md:col-span-8 space-y-4">
                <div className="v-form-field">
                  <label className="v-form-lbl">Official Store UPI VPA (ID) *</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="e.g. omshop@okaxis or yourname@upi"
                        className="v-form-input font-mono font-bold text-navy pr-10"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1D3557] rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customers will scan and transfer rental payouts & escrow deposits directly to this UPI address.
                  </p>
                </div>

                <div className="v-form-field">
                  <label className="v-form-lbl">Custom QR Code Image URL (Optional)</label>
                  <input
                    type="text"
                    name="qrCodeUrl"
                    value={formData.qrCodeUrl}
                    onChange={handleChange}
                    placeholder="https://... or uploaded image path"
                    className="v-form-input font-mono text-xs"
                  />
                </div>

                <div className="v-form-field">
                  <label className="v-form-lbl">Linked Settlement Bank Account</label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="v-form-input font-medium"
                  />
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Real-Time Payment Routing Enabled</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    This UPI ID & QR Code will be embedded into customer checkouts for all your product listings, order summary bills, and GST tax invoices.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="btn-v-primary">
                    <Save size={16} />
                    <span>Save UPI & QR Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Business Operations */}
      {activeTab === 'business' && (
        <div className="v-settings-section">
          <div className="v-card-box">
            <h3 className="v-card-title mb-4">Store Operating Schedule & Policies</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="v-form-field">
                <label className="v-form-lbl">Store Operating Hours</label>
                <input
                  type="text"
                  defaultValue={formData.workingHours}
                  className="v-form-input font-medium"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Settlement Bank Account</label>
                <input
                  type="text"
                  defaultValue={formData.bankAccount}
                  className="v-form-input font-mono"
                  disabled
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-5 text-xs text-navy space-y-2">
              <h4 className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-secondary-blue" />
                <span>Rentora Escrow Protection Guaranteed</span>
              </h4>
              <p className="text-slate-600">
                All rental bookings placed on your storefront are covered under 100% pre-authorized security deposits and verified KYC identification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Credentials */}
      {activeTab === 'security' && (
        <div className="v-settings-section">
          <div className="v-card-box">
            <h3 className="v-card-title mb-4">Change Merchant Password</h3>

            <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-3">
              <div className="v-form-field">
                <label className="v-form-lbl">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={pwdForm.current}
                  onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                  className="v-form-input"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">New Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={pwdForm.newPwd}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
                  className="v-form-input"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  className="v-form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="btn-v-primary mt-2"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Update Merchant Password'}
              </button>
            </form>
          </div>

          <div className="v-card-box mt-5">
            <h3 className="v-card-title mb-2">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Protect your rental payouts and equipment inventory with mandatory OTP on login.
            </p>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-600" />
                <span className="font-bold text-xs text-navy">SMS / WhatsApp OTP Verification</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="v-settings-section">
          <div className="v-card-box">
            <h3 className="v-card-title mb-4">Notification Channels & Store Alert Mediums</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-bold text-sm text-navy block">New Rental Booking Alerts</span>
                  <span className="text-xs text-slate-500">Receive instant SMS & Email whenever a customer books your equipment.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="w-5 h-5 accent-primary-red cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-bold text-sm text-navy block">Low Stock & Return Due Reminders</span>
                  <span className="text-xs text-slate-500">Automated morning summary of gear returning to your store hub.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={() => setSmsAlerts(!smsAlerts)}
                  className="w-5 h-5 accent-primary-red cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-navy block">WhatsApp Merchant Concierge</span>
                  <span className="text-xs text-slate-500">Direct WhatsApp updates for quotation acceptances and courier pickups.</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={() => setWhatsappAlerts(!whatsappAlerts)}
                  className="w-5 h-5 accent-primary-red cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => showToast('Notification preferences saved!', 'success')}
                className="btn-v-primary"
              >
                <Save size={16} />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
