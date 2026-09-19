import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Package,
  Star,
  Download,
  AlertTriangle
} from 'lucide-react';
import { SearchBar, StatusBadge, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function VendorList() {
  const navigate = useNavigate();
  const {
    vendors,
    approveVendor,
    rejectVendor,
    updateVendorStatus,
    updateVendor,
    deleteVendor,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Rejection Modal State
  const [rejectingVendor, setRejectingVendor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        (v.businessName && v.businessName.toLowerCase().includes(q)) ||
        (v.ownerName && v.ownerName.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.gstNumber && v.gstNumber.toLowerCase().includes(q)) ||
        (v.gstin && v.gstin.toLowerCase().includes(q));

      const matchesVerification = verificationFilter === 'all' || v.verificationStatus === verificationFilter;
      const matchesCategory = categoryFilter === 'all' || !v.category || v.category === categoryFilter;
      const matchesCity = cityFilter === 'all' || (v.city && v.city.toLowerCase() === cityFilter.toLowerCase());

      return matchesSearch && matchesVerification && matchesCategory && matchesCity;
    });
  }, [vendors, searchQuery, verificationFilter, categoryFilter, cityFilter]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApprove = (vendor) => {
    requestConfirmation({
      title: `Approve Vendor: ${vendor.businessName}?`,
      message: `Are you sure you want to verify and approve ${vendor.businessName}? Their inventory will be enabled for customer bookings across Gujarat.`,
      confirmText: 'Approve & Activate',
      confirmColor: 'blue',
      onConfirm: () => approveVendor(vendor.id, 'Verified via Vendor Management Queue')
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectingVendor || !rejectionReason.trim()) return;
    rejectVendor(rejectingVendor.id, rejectionReason);
    setRejectingVendor(null);
    setRejectionReason('');
  };

  // Edit Vendor Modal State
  const [editingVendor, setEditingVendor] = useState(null);

  const handleDeleteVendor = (vendor) => {
    requestConfirmation({
      title: `Delete Vendor: ${vendor.businessName}?`,
      message: `Are you sure you want to permanently delete "${vendor.businessName}"? This will remove all their listed catalog products and vendor profile. This action cannot be undone.`,
      confirmText: 'Delete Vendor',
      confirmColor: 'red',
      onConfirm: () => deleteVendor(vendor.id)
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-['Sora'] text-slate-900">Vendor & Store Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Verify local equipment rental shops, review trade licenses, and monitor merchant payout balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Exporting vendor merchant ledger...', 'info')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Vendors CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search store name, GSTIN, city..."
          />

          {/* Verification Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">KYC:</span>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="all">All KYC Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved / Active</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Cameras & Cinema">Cameras & Cinema</option>
              <option value="Drones & Aerial">Drones & Aerial</option>
              <option value="Vehicles & SUVs">Vehicles & SUVs</option>
              <option value="Event & Sound">Event & Sound</option>
              <option value="Electronics & Gaming">Electronics & Gaming</option>
              <option value="Designer Outfits">Designer Outfits</option>
            </select>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="all">All Gujarat Cities</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Rajkot">Rajkot</option>
            </select>
          </div>

        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedVendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">Vendor & Store Info</th>
                  <th className="py-3 px-4">Owner & Contact</th>
                  <th className="py-3 px-4">City / Category</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Inventory & Orders</th>
                  <th className="py-3 px-4">Total Revenue</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Store Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold flex-shrink-0">
                          <Store size={18} />
                        </div>
                        <div>
                          <Link
                            to={`/admin/vendors/${vendor.id}`}
                            className="font-bold text-slate-900 font-['Sora'] hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {vendor.businessName}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            GST: {vendor.gstin}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{vendor.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{vendor.phone}</div>
                    </td>

                    {/* City & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{vendor.city}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold inline-block mt-0.5">
                        {vendor.category}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={vendor.verificationStatus} />
                    </td>

                    {/* Inventory & Orders */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{vendor.totalProducts || 0} items listed</div>
                      <span className="text-[11px] text-slate-500">{vendor.totalRentals || vendor.totalOrders || 0} fulfilled</span>
                    </td>

                    {/* Revenue */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 font-['Sora'] text-xs">
                        ₹{(Number(vendor.revenue ?? vendor.totalRevenue ?? 0)).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Bal: ₹{(Number(vendor.payoutBalance ?? 0)).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      {vendor.rating > 0 ? (
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span>{vendor.rating}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unrated</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {vendor.verificationStatus === 'Pending Approval' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingVendor(vendor)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] border border-rose-200/50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <Link
                          to={`/admin/vendors/${vendor.id}`}
                          title="Inspect Vendor Store Dossier"
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60"
                        >
                          <Eye size={14} />
                        </Link>

                        <button
                          onClick={() => setEditingVendor({
                            ...vendor,
                            category: vendor.category || 'General',
                            commissionRate: vendor.commissionRate || 10,
                            address: vendor.address || '',
                            accountStatus: vendor.accountStatus || 'Active'
                          })}
                          title="Quick Edit Vendor Details"
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors border border-slate-200/60"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          title="Delete Vendor Store"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200/50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Store}
            title="No vendors found"
            description="Adjust your search filters or clear the active criteria."
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setVerificationFilter('all');
              setCategoryFilter('all');
              setCityFilter('all');
            }}
          />
        )}

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredVendors.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">
              Reject Registration: {rejectingVendor.businessName}
            </h3>
            <p className="text-xs text-slate-500">
              Please specify the rejection reason (e.g. invalid GSTIN, blurred trade license, unverified bank account).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection to be emailed to store owner..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingVendor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Rejection
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
                    Update store profile, verification status, and commission rates.
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
