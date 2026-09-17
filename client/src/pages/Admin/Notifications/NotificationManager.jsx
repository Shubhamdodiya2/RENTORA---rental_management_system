import React, { useState, useMemo } from 'react';
import {
  Bell,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Users,
  Store,
  Sparkles,
  Info,
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import { SearchBar, StatusBadge, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function NotificationManager() {
  const {
    notifications,
    broadcastNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'System',
    recipientType: 'All Users',
    link: '/products'
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || n.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [notifications, searchQuery, typeFilter]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    broadcastNotification({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      recipientType: formData.recipientType,
      link: formData.link
    });

    setFormData({
      title: '',
      message: '',
      type: 'System',
      recipientType: 'All Users',
      link: '/products'
    });
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Broadcast & Notification Hub</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch system announcements, promotional banners, policy updates, and operational alerts to users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Check size={14} className="text-emerald-600" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Send size={14} />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notifications..."
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Filter Category:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              <option value="all">All Notifications ({notifications.length})</option>
              <option value="Vendor">Vendor Notices</option>
              <option value="Product">Product Alerts</option>
              <option value="Complaint">Disputes & Complaints</option>
              <option value="Payment">Financial / Payouts</option>
              <option value="System">System Announcements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl transition-all border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !notif.read
                  ? 'bg-blue-50/20 border-blue-200 shadow-xs'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                    !notif.read ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell size={16} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 font-['Sora']">{notif.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60">
                      {notif.type}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl">{notif.message}</p>
                  <div className="text-[10px] text-slate-400 pt-0.5">{notif.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 text-xs font-medium transition-colors"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications in feed"
            description="You are completely caught up."
          />
        )}
      </div>

      {/* Broadcast Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-['Sora'] text-slate-900">Broadcast Platform Notification</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navratri Weekend Discount Promotion Active"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Recipient Audience</label>
                  <select
                    value={formData.recipientType}
                    onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer"
                  >
                    <option value="All Users">All Users (Customers + Vendors)</option>
                    <option value="All Customers">All Verified Customers</option>
                    <option value="All Vendors">All Registered Vendors</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Alert Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer"
                  >
                    <option value="System">System Announcement</option>
                    <option value="Promo">Special Promo</option>
                    <option value="Vendor">Vendor Policy</option>
                    <option value="Security">Security Warning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write clear notification copy..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
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
                  Dispatch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
