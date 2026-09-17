import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  Building,
  Percent,
  Receipt,
  ShoppingCart,
  Store,
  CreditCard,
  Bell,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

export default function PlatformSettings() {
  const { settings, updateSettings, showToast } = useAdmin();
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);

  const tabs = [
    { id: 'general', label: 'General Info', icon: Building },
    { id: 'commission', label: 'Commission & Rates', icon: Percent },
    { id: 'tax', label: 'GST & Taxes', icon: Receipt },
    { id: 'orderPolicy', label: 'Order Rules', icon: ShoppingCart },
    { id: 'vendorPolicy', label: 'Vendor Rules', icon: Store },
    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck }
  ];

  const handleSaveSection = (sectionKey) => {
    updateSettings(sectionKey, localSettings[sectionKey]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Platform Settings & Configuration</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage platform commission structures, GST tax calculation modes, KYC thresholds, and security parameters.
          </p>
        </div>

        <button
          onClick={() => handleSaveSection(activeTab)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Save size={15} />
          <span>Save Current Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
        
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Marketplace Identity & Public Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Platform Legal Name</label>
                <input
                  type="text"
                  value={localSettings.general.platformName}
                  onChange={(e) => setLocalSettings({ ...localSettings, general: { ...localSettings.general, platformName: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Support Email</label>
                <input
                  type="email"
                  value={localSettings.general.supportEmail}
                  onChange={(e) => setLocalSettings({ ...localSettings, general: { ...localSettings.general, supportEmail: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Customer Helpline Phone</label>
                <input
                  type="text"
                  value={localSettings.general.supportPhone}
                  onChange={(e) => setLocalSettings({ ...localSettings, general: { ...localSettings.general, supportPhone: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Website URL</label>
                <input
                  type="text"
                  value={localSettings.general.platformUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, general: { ...localSettings.general, platformUrl: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Registered Headquarters Address</label>
                <input
                  type="text"
                  value={localSettings.general.address}
                  onChange={(e) => setLocalSettings({ ...localSettings, general: { ...localSettings.general, address: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Commission */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Platform Take-Rate & Category Overrides</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Default Commission (%)</label>
                <input
                  type="number"
                  value={localSettings.commission.defaultRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, commission: { ...localSettings.commission, defaultRate: parseInt(e.target.value) || 0 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Cameras & Optics Rate (%)</label>
                <input
                  type="number"
                  value={localSettings.commission.cameraRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, commission: { ...localSettings.commission, cameraRate: parseInt(e.target.value) || 0 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Vehicles & 4x4 Fleet (%)</label>
                <input
                  type="number"
                  value={localSettings.commission.vehicleRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, commission: { ...localSettings.commission, vehicleRate: parseInt(e.target.value) || 0 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong className="block text-xs text-slate-900 font-semibold">Automatic Payout Commission Deduction</strong>
                <span className="text-[11px] text-slate-500">Deduct platform commission before sending payouts to vendor bank accounts.</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.commission.autoDeductPayout}
                onChange={(e) => setLocalSettings({ ...localSettings, commission: { ...localSettings.commission, autoDeductPayout: e.target.checked } })}
                className="w-4 h-4 text-slate-900 rounded accent-slate-900 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Tax */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Goods & Services Tax (GST) Policy</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Default GST Percentage (%)</label>
                <input
                  type="number"
                  value={localSettings.tax.defaultGSTRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, tax: { ...localSettings.tax, defaultGSTRate: parseInt(e.target.value) || 0 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Platform Master GSTIN</label>
                <input
                  type="text"
                  value={localSettings.tax.platformGSTIN}
                  onChange={(e) => setLocalSettings({ ...localSettings, tax: { ...localSettings.tax, platformGSTIN: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Order Policy */}
        {activeTab === 'orderPolicy' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Rental Order & Escrow Rules</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Min Rental Days</label>
                <input
                  type="number"
                  value={localSettings.orderPolicy.minRentalDays}
                  onChange={(e) => setLocalSettings({ ...localSettings, orderPolicy: { ...localSettings.orderPolicy, minRentalDays: parseInt(e.target.value) || 1 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Cancellation Grace Hours</label>
                <input
                  type="number"
                  value={localSettings.orderPolicy.cancellationGraceHours}
                  onChange={(e) => setLocalSettings({ ...localSettings, orderPolicy: { ...localSettings.orderPolicy, cancellationGraceHours: parseInt(e.target.value) || 0 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Late Penalty Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.orderPolicy.lateFeePerDayMultiplier}
                  onChange={(e) => setLocalSettings({ ...localSettings, orderPolicy: { ...localSettings.orderPolicy, lateFeePerDayMultiplier: parseFloat(e.target.value) || 1.0 } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Vendor Policy */}
        {activeTab === 'vendorPolicy' && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Vendor Verification & Listing Constraints</h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900">Mandatory Super Admin Product Approval</strong>
                <span className="text-[11px] text-slate-500">Prevent vendors from publishing items until approved by Super Admin.</span>
              </div>
              <input
                type="checkbox"
                checked={!localSettings.vendorPolicy.autoApproveProducts}
                onChange={(e) => setLocalSettings({ ...localSettings, vendorPolicy: { ...localSettings.vendorPolicy, autoApproveProducts: !e.target.checked } })}
                className="w-4 h-4 text-slate-900 rounded accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900">Require Verified GST Certificate for Merchant Onboarding</strong>
                <span className="text-[11px] text-slate-500">Only verified businesses with valid GSTIN can list inventory.</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.vendorPolicy.requireGSTForListing}
                onChange={(e) => setLocalSettings({ ...localSettings, vendorPolicy: { ...localSettings.vendorPolicy, requireGSTForListing: e.target.checked } })}
                className="w-4 h-4 text-slate-900 rounded accent-slate-900 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 6: Security */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Security, Authentication & Audit Governance</h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900">Mandatory 2FA Multi-Factor for Admin Staff</strong>
                <span className="text-[11px] text-slate-500">Require OTP authentication on every admin login session.</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.security.require2FAForAdmin}
                onChange={(e) => setLocalSettings({ ...localSettings, security: { ...localSettings.security, require2FAForAdmin: e.target.checked } })}
                className="w-4 h-4 text-slate-900 rounded accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900">Immutable System Audit Logging</strong>
                <span className="text-[11px] text-slate-500">Record all administrative status changes, refunds, and permission edits.</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.security.auditLoggingEnabled}
                onChange={(e) => setLocalSettings({ ...localSettings, security: { ...localSettings.security, auditLoggingEnabled: e.target.checked } })}
                className="w-4 h-4 text-slate-900 rounded accent-slate-900 cursor-pointer"
              />
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
