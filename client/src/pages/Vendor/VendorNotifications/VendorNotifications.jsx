import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  ShoppingBag,
  AlertTriangle,
  CreditCard,
  FileText,
  Sparkles
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorNotifications.css';

export default function VendorNotifications() {
  const { notifications, setNotifications, showToast } = useVendor();
  const [filterType, setFilterType] = useState('All');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'success');
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast('Cleared all notifications.', 'info');
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'Unread') return !n.read;
    if (filterType === 'Orders') return n.type === 'new_order';
    if (filterType === 'Inventory') return n.type === 'low_stock';
    if (filterType === 'Payouts') return n.type === 'payout_settled';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag size={18} className="text-secondary-blue" />;
      case 'quotation_accepted':
        return <Sparkles size={18} className="text-primary-red" />;
      case 'low_stock':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'payout_settled':
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      default:
        return <Bell size={18} className="text-navy" />;
    }
  };

  return (
    <div className="vendor-notifications-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Merchant Notification Center</h1>
          <p className="page-sub-heading">
            Live alerts for incoming customer rental bookings, stock warnings, and bank transfers.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleMarkAllRead} className="btn-v-secondary">
            <Check size={15} />
            <span>Mark All Read</span>
          </button>
          <button onClick={handleClearAll} className="btn-v-secondary text-rose-600 hover:text-rose-700">
            <Trash2 size={15} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="v-filter-toolbar">
        <div className="v-status-filter-pills">
          {['All', 'Unread', 'Orders', 'Inventory', 'Payouts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`v-filter-pill-btn ${filterType === tab ? 'v-pill-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="v-card-box p-0 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell size={48} className="mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-navy text-base">No Notifications</h3>
            <p className="text-xs text-slate-500">You're all caught up with your store notifications.</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`v-notif-full-row ${!n.read ? 'v-notif-row-unread' : ''}`}
            >
              <div className="v-notif-icon-box">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-navy text-sm">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-red" />}
                  <span className="text-[11px] text-slate-400 ml-auto">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                {n.orderId && (
                  <span className="font-mono text-[10px] text-secondary-blue font-semibold mt-1 inline-block bg-slate-100 px-1.5 py-0.5 rounded">
                    Ref: {n.orderId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
                <button
                  onClick={() => handleToggleRead(n.id)}
                  className="v-action-btn"
                  title={n.read ? 'Mark as Unread' : 'Mark as Read'}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="v-action-btn v-btn-del"
                  title="Delete Alert"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
