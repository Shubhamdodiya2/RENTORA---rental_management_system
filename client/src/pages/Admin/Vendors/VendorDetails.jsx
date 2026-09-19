import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  FileText,
  IndianRupee,
  Package,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Download,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { StatusBadge, ConfirmationModal } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    vendors,
    products,
    orders,
    approveVendor,
    rejectVendor,
    updateVendorStatus,
    updateVendor,
    deleteVendor,
    disburseVendorPayout,
    openDocumentModal,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'products' | 'orders' | 'payouts'
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const vendor = vendors.find((v) => v.id === id) || vendors[0];

  const vendorProducts = products.filter((p) => p.vendorId === vendor.id || p.vendorName?.toLowerCase().includes(vendor.businessName?.toLowerCase().slice(0, 5)));
  const vendorOrders = orders.filter((o) => o.vendor?.id === vendor.id || o.vendor?.name?.toLowerCase().includes(vendor.businessName?.toLowerCase().slice(0, 5)));

  const handleDisburse = (e) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmount);
    if (!amt || amt <= 0) return;
    disburseVendorPayout(vendor.id, amt);
    setPayoutModalOpen(false);
    setPayoutAmount('');
  };

  const handleToggleStatus = (newStatus) => {
    requestConfirmation({
      title: `Set Vendor Status to ${newStatus}?`,
      message: `Change status for ${vendor.businessName} to "${newStatus}"?`,
      confirmText: `Set ${newStatus}`,
      confirmColor: newStatus === 'Active' ? 'blue' : 'red',
      onConfirm: () => updateVendorStatus(vendor.id, newStatus)
    });
  };

  // Edit Vendor State & Handlers
  const [editingVendor, setEditingVendor] = useState(null);

  const handleDeleteVendor = () => {
    requestConfirmation({
      title: `Delete Vendor: ${vendor?.businessName}?`,
      message: `Are you sure you want to permanently delete "${vendor?.businessName}"? All their catalog listings and vendor account will be removed.`,
      confirmText: 'Delete Vendor',
      confirmColor: 'red',
      onConfirm: async () => {
        await deleteVendor(vendor.id);
        navigate('/admin/vendors');
      }
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    await updateVendor(editingVendor.id, editingVendor);
    setEditingVendor(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/vendors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to All Vendors</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingVendor({
              ...vendor,
              category: vendor.category || 'General',
              commissionRate: vendor.commissionRate || 10,
              address: vendor.address || '',
              accountStatus: vendor.accountStatus || 'Active'
            })}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Edit2 size={13} />
            <span>Edit Store</span>
          </button>

          <button
            onClick={handleDeleteVendor}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 size={13} />
            <span>Delete Store</span>
          </button>

          {vendor.verificationStatus === 'Pending Approval' ? (
            <>
              <button
                onClick={() => approveVendor(vendor.id, 'Approved from Vendor Details inspection')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Approve Store Listing</span>
              </button>
              <button
                onClick={() => rejectVendor(vendor.id, 'Documents require re-upload')}
                className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Reject Registration</span>
              </button>
            </>
          ) : (
            <>
              {vendor.accountStatus === 'Active' ? (
                <button
                  onClick={() => handleToggleStatus('Suspended')}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold"
                >
                  Suspend Store
                </button>
              ) : (
                <button
                  onClick={() => handleToggleStatus('Active')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Reactivate Store
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Vendor Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-extrabold text-2xl font-['Sora'] shadow-xs flex-shrink-0">
              <Store size={32} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold font-['Sora'] text-slate-900">
                  {vendor.businessName}
                </h1>
                <StatusBadge status={vendor.verificationStatus} />
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                  {vendor.category}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                <span>Owner: <strong className="text-slate-800">{vendor.ownerName}</strong></span>
                <span className="flex items-center gap-1"><Mail size={12} /> {vendor.email}</span>
                <span className="flex items-center gap-1"><Phone size={12} /> {vendor.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {vendor.address}</span>
              </div>
            </div>
          </div>

          {/* Payout Balance Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-end gap-1.5 self-start md:self-auto min-w-[190px]">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Merchant Payout Balance</span>
            <div className="text-xl font-extrabold text-slate-900 font-['Sora']">
              ₹{(Number(vendor.payoutBalance || 0)).toLocaleString('en-IN')}
            </div>
            {vendor.payoutBalance > 0 && (
              <button
                onClick={() => setPayoutModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all w-full text-center"
              >
                Disburse Payout
              </button>
            )}
          </div>
        </div>

        {/* 4 Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Generated</span>
            <div className="text-lg font-extrabold text-slate-900 font-['Sora'] mt-0.5">
              ₹{(Number(vendor.revenue ?? vendor.totalRevenue ?? 0)).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Platform Commission</span>
            <div className="text-lg font-extrabold text-blue-600 font-['Sora'] mt-0.5">
              ₹{(Number(vendor.commissionPaid ?? Math.round((vendor.revenue || vendor.totalRevenue || 0) * 0.10))).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Inventory Listings</span>
            <div className="text-lg font-extrabold text-slate-900 font-['Sora'] mt-0.5">
              {vendor.totalProducts || 0} Equipment Units
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer Rating</span>
            <div className="text-lg font-extrabold text-amber-600 font-['Sora'] mt-0.5 flex items-center gap-1">
              <Star size={16} fill="currentColor" />
              <span>{vendor.rating > 0 ? vendor.rating : 'New'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          KYC & Business Documents ({vendor.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Store Inventory ({vendorProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Fulfilled Orders ({vendorOrders.length})
        </button>
      </div>

      {/* Tab 1: Documents & KYC */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Submitted Store Compliance Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {vendor.documents?.map((doc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-xs text-slate-900">{doc.name}</span>
                  <StatusBadge status={doc.status} />
                </div>
                <div className="text-[11px] text-slate-500">Submitted: {doc.date}</div>
                <button
                  onClick={() => openDocumentModal(doc)}
                  className="w-full py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileText size={14} className="text-slate-500" />
                  <span>Inspect Original</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Inventory */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Listed Gear Catalog</h3>
          {vendorProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/60">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rate / Day</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 flex items-center gap-2.5 font-semibold text-slate-900">
                        <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{p.category}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">₹{p.pricePerDay}</td>
                      <td className="py-3.5 px-4">{p.stock} units</td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.approvalStatus} /></td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to="/admin/products" className="font-semibold text-blue-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No inventory items added yet.</p>
          )}
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Order Fulfillment History</h3>
          {vendorOrders.length > 0 ? (
            <div className="space-y-2.5">
              {vendorOrders.map((ord) => (
                <div key={ord.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-semibold text-xs text-slate-900">{ord.orderNumber}</span>
                    <h4 className="text-xs font-semibold text-slate-900">{ord.product?.name}</h4>
                    <p className="text-[11px] text-slate-500">Rented by {ord.customer?.name} • {ord.startDate} - {ord.endDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-['Sora']">₹{ord.vendorEarnings} net</div>
                    <StatusBadge status={ord.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No completed orders on file.</p>
          )}
        </div>
      )}

      {/* Disburse Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Disburse Merchant Payout</h3>
            <p className="text-xs text-slate-500">
              Available balance to disburse for {vendor.businessName}: <strong className="text-slate-900">₹{vendor.payoutBalance.toLocaleString('en-IN')}</strong>
            </p>

            <form onSubmit={handleDisburse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase text-[10px] mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={vendor.payoutBalance}
                  min={100}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={`Max ₹${vendor.payoutBalance}`}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Payout Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Sora'] text-slate-900">
                    Edit Vendor Store
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update store details, verification status, and commission rates.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-semibold text-slate-800">
              {/* Store & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Store / Business Name</label>
                  <input
                    type="text"
                    required
                    value={editingVendor.businessName || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Store Category</label>
                  <select
                    value={editingVendor.category || 'Cameras & Cinema'}
                    onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white cursor-pointer"
                  >
                    <option value="Cameras & Cinema">Cameras & Cinema</option>
                    <option value="Drones & Aerial">Drones & Aerial</option>
                    <option value="Vehicles & SUVs">Vehicles & SUVs</option>
                    <option value="Event & Sound">Event & Sound</option>
                    <option value="Electronics & Gaming">Electronics & Gaming</option>
                    <option value="Designer Outfits">Designer Outfits</option>
                    <option value="Furniture & Workspaces">Furniture & Workspaces</option>
                    <option value="General Equipment">General Equipment</option>
                  </select>
                </div>
              </div>

              {/* Owner & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Owner Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingVendor.ownerName || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingVendor.phone || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Email & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Business Email</label>
                  <input
                    type="email"
                    required
                    value={editingVendor.email || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">GST Number / GSTIN</label>
                  <input
                    type="text"
                    value={editingVendor.gstNumber || editingVendor.gstin || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, gstNumber: e.target.value, gstin: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 uppercase"
                  />
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">City</label>
                  <input
                    type="text"
                    required
                    value={editingVendor.city || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Address</label>
                  <input
                    type="text"
                    value={editingVendor.address || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                    placeholder="Shop / Area address"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Verification, Account Status & Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">KYC Verification</label>
                  <select
                    value={editingVendor.verificationStatus || 'Approved'}
                    onChange={(e) => setEditingVendor({ ...editingVendor, verificationStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Account Status</label>
                  <select
                    value={editingVendor.accountStatus || 'Active'}
                    onChange={(e) => setEditingVendor({ ...editingVendor, accountStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Platform Comm. (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editingVendor.commissionRate ?? 10}
                    onChange={(e) => setEditingVendor({ ...editingVendor, commissionRate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Save Store Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
