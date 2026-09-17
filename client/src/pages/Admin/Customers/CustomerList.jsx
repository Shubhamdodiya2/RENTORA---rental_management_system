import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  UserX,
  UserCheck,
  AlertTriangle,
  MoreVertical,
  Download,
  Plus,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  CheckSquare,
  Square
} from 'lucide-react';
import { SearchBar, StatusBadge, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function CustomerList() {
  const navigate = useNavigate();
  const {
    customers,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,
    bulkUpdateCustomerStatus,
    bulkDeleteCustomers,
    requestConfirmation,
    showToast
  } = useAdmin();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'spending' | 'orders' | 'name'
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.city.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.accountStatus === statusFilter;
        const matchesKyc = kycFilter === 'all' || c.kycStatus === kycFilter;

        return matchesSearch && matchesStatus && matchesKyc;
      })
      .sort((a, b) => {
        if (sortBy === 'spending') return b.totalSpending - a.totalSpending;
        if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      });
  }, [customers, searchQuery, statusFilter, kycFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map((c) => c.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkActivate = () => {
    bulkUpdateCustomerStatus(selectedIds, 'Active');
    setSelectedIds([]);
  };

  const handleBulkSuspend = () => {
    requestConfirmation({
      title: `Suspend ${selectedIds.length} Customer Accounts?`,
      message: 'Suspended users will not be able to create new equipment rental bookings until reinstated.',
      confirmText: 'Suspend Accounts',
      confirmColor: 'red',
      onConfirm: () => {
        bulkUpdateCustomerStatus(selectedIds, 'Suspended');
        setSelectedIds([]);
      }
    });
  };

  const handleBulkDelete = () => {
    requestConfirmation({
      title: `Permanently Delete ${selectedIds.length} Customers?`,
      message: 'This will remove their profile data and KYC verification logs. This action cannot be undone.',
      confirmText: 'Delete Forever',
      confirmColor: 'red',
      onConfirm: () => {
        bulkDeleteCustomers(selectedIds);
        setSelectedIds([]);
      }
    });
  };

  const handleDeleteSingle = (customer) => {
    requestConfirmation({
      title: `Delete Customer: ${customer.name}?`,
      message: `Are you sure you want to delete ${customer.name} (${customer.id})? All active bookings must be completed first.`,
      confirmText: 'Delete Customer',
      confirmColor: 'red',
      onConfirm: () => deleteCustomer(customer.id)
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, editingCustomer);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-['Sora'] text-slate-900">Customer Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage verified renters, identity verification, spending ledgers, and account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Exporting customer dataset to CSV...', 'info')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, phone, city..."
          />

          {/* Account Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="all">All Statuses ({customers.length})</option>
              <option value="Active">Active</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Suspended">Suspended</option>
              <option value="Blocked">Blocked</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* KYC Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">KYC:</span>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="all">All KYC States</option>
              <option value="Verified">Verified</option>
              <option value="In Review">In Review</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="recent">Newest Registered</option>
              <option value="spending">Highest Spending (LTV)</option>
              <option value="orders">Most Orders</option>
              <option value="name">Name Alphabetical</option>
            </select>
          </div>

        </div>

        {/* Multi-Select Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 text-blue-950 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white">{selectedIds.length} Selected</span>
              <span className="text-blue-900">Bulk Actions:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkActivate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                Bulk Activate
              </button>
              <button
                onClick={handleBulkSuspend}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
              >
                Bulk Suspend
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
              >
                Bulk Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customers Data Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Select all on page"
                    >
                      {selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0 ? (
                        <CheckSquare size={15} className="text-blue-600" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Orders & Spend</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCustomers.map((customer) => {
                  const isSelected = selectedIds.includes(customer.id);
                  return (
                    <tr
                      key={customer.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleSelectRow(customer.id)}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label={`Select ${customer.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={15} className="text-blue-600" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <Link
                              to={`/admin/customers/${customer.id}`}
                              className="font-bold text-slate-900 font-['Sora'] hover:text-blue-600 transition-colors"
                            >
                              {customer.name}
                            </Link>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail size={11} />
                              <span className="truncate max-w-[150px]">{customer.email}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone size={11} />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span>{customer.city}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                          {customer.location}
                        </span>
                      </td>

                      {/* Orders & Spending */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 font-['Sora'] text-xs">
                          ₹{customer.totalSpending.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {customer.totalOrders} bookings
                        </span>
                      </td>

                      {/* KYC Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            customer.kycStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : customer.kycStatus === 'In Review'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <ShieldCheck size={11} />
                          <span>{customer.kycStatus}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={customer.accountStatus} />
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-medium text-[11px]">
                        {customer.registrationDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/customers/${customer.id}`}
                            title="View Full Customer Dossier"
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200/60"
                          >
                            <Eye size={14} />
                          </Link>

                          <button
                            onClick={() => setEditingCustomer({ ...customer })}
                            title="Quick Edit Profile"
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteSingle(customer)}
                            title="Delete Account"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200/50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No customers match your criteria"
            description="Try changing your search query or reset status filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setKycFilter('all');
            }}
          />
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* Quick Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-['Sora'] text-slate-900">Edit Customer Profile</h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-semibold text-slate-800">
              <div>
                <label className="block mb-1 text-slate-500 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">City</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.city}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px]">Account Status</label>
                  <select
                    value={editingCustomer.accountStatus}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, accountStatus: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase text-[10px]">Admin Internal Note</label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="Private notes visible only to Super Admin..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-normal focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
