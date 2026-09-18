import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Mail,
  UserCheck,
  Shield,
  Lock
} from 'lucide-react';
import { StatusBadge, ConfirmationModal } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function AdminUsersManager() {
  const {
    adminUsers,
    addAdminUser,
    updateAdminUser,
    updateAdminPermissions,
    toggleAdminStatus,
    deleteAdminUser,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPermissionsUser, setEditingPermissionsUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Super Admin',
    permissions: ['all_access']
  });

  const allAvailablePermissions = [
    { id: 'all_access', label: 'Super Admin Root Access (All Privileges)' },
    { id: 'vendor_approval', label: 'Vendor KYC & Store Approval' },
    { id: 'financial_payouts', label: 'Process Escrow Refunds & Payouts' },
    { id: 'system_settings', label: 'Edit Platform Commission & Taxes' },
    { id: 'dispute_resolution', label: 'Arbitrate Disputes & Penalties' },
    { id: 'order_dispatch', label: 'Manage Order Dispatch & Pickup Logistics' },
    { id: 'ticket_resolution', label: 'Reply & Resolve Support Complaints' }
  ];

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'Super Admin',
      permissions: ['all_access']
    });
    setCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) return;

    addAdminUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      permissions: formData.role === 'Super Admin' ? ['all_access'] : formData.permissions
    });

    setCreateModalOpen(false);
  };

  const handleTogglePermission = (permId) => {
    if (!editingPermissionsUser) return;
    const current = editingPermissionsUser.permissions || [];
    const next = current.includes(permId)
      ? current.filter((p) => p !== permId)
      : [...current, permId];

    setEditingPermissionsUser({ ...editingPermissionsUser, permissions: next });
  };

  const handleSavePermissions = () => {
    if (!editingPermissionsUser) return;
    updateAdminPermissions(editingPermissionsUser.id, editingPermissionsUser.permissions);
    setEditingPermissionsUser(null);
  };

  const handleDelete = (user) => {
    requestConfirmation({
      title: `Revoke Admin Access: ${user.name}?`,
      message: `Are you sure you want to delete admin account for ${user.name} (${user.email})?`,
      confirmText: 'Revoke Access',
      confirmColor: 'red',
      onConfirm: () => deleteAdminUser(user.id)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Admin Users & Access Control</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage platform operations staff, assign role-based permission sets, and supervise administrative access.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Admin Staff Member</span>
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Admin Staff</th>
                <th className="py-3.5 px-4">Role Title</th>
                <th className="py-3.5 px-4">Permissions Scope</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Added Date</th>
                <th className="py-3.5 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Name & Avatar */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 font-['Sora']">{user.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={11} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </td>

                  {/* Permissions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800">
                        {user.permissions?.includes('all_access') ? 'Full System Root' : `${user.permissions?.length} Assigned Modules`}
                      </span>
                      <button
                        onClick={() => setEditingPermissionsUser({ ...user })}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-900"
                        title="Edit Permissions Scope"
                      >
                        <Key size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Last Active */}
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {user.lastLogin}
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 text-slate-500">
                    {user.createdDate}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingPermissionsUser({ ...user })}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        title="Configure Role Permissions"
                      >
                        <Key size={14} />
                      </button>

                      <button
                        onClick={() => toggleAdminStatus(user.id)}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                        title="Toggle Active Status"
                      >
                        <UserCheck size={14} />
                      </button>

                      {user.role !== 'Super Admin' && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-colors"
                          title="Revoke Admin Access"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Modal */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-['Sora'] text-slate-900">
                  Configure Permissions: {editingPermissionsUser.name}
                </h3>
                <span className="text-xs text-blue-600 font-semibold uppercase">{editingPermissionsUser.role}</span>
              </div>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allAvailablePermissions.map((perm) => {
                const isChecked = editingPermissionsUser.permissions?.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-medium text-slate-800">{perm.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(perm.id)}
                      className="w-4 h-4 text-slate-900 rounded cursor-pointer accent-slate-900"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Admin Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-['Sora'] text-slate-900">Add New Staff Member</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Full Staff Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Official Email Address (Login Username)</label>
                <input
                  type="email"
                  required
                  placeholder="pooja.operations@rentora.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Login Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Role Assignment & Access Level</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer"
                >
                  <option value="Super Admin">Super Administrator (Full Root System Access)</option>
                  <option value="Operations Admin">Operations Admin (Dispatch & Pickups)</option>
                  <option value="Finance Admin">Finance Admin (Escrow & Payouts)</option>
                  <option value="Support Admin">Support Admin (Tickets & Complaints)</option>
                  <option value="Content Admin">Content Admin (Products & Categories)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
