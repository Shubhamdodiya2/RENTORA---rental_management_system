import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  CalendarCheck,
  CreditCard,
  FileText,
  ShieldCheck,
  AlertCircle,
  Truck,
  Check,
  Loader2
} from 'lucide-react';
import api from '../../../services/api';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type ? n.type.toLowerCase() : 'system',
          read: Boolean(n.isRead),
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now',
          orderId: n.metadata?.bookingNumber || n.metadata?.orderId || null,
          actionUrl: n.actionUrl
        }));
        setNotifications(mapped);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('[Notifications] Fetch notice:', err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('[Notifications] Mark all read error:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('[Notifications] Clear all error:', err);
    }
  };

  const handleToggleRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;
    const newRead = !target.read;
    try {
      await api.patch(`/notifications/${id}/read`, { isRead: newRead });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: newRead } : n))
      );
    } catch (err) {
      console.error('[Notifications] Toggle read error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('[Notifications] Delete error:', err);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Returns') return n.type === 'qc' || n.type === 'booking' || n.type === 'return_reminder';
    if (activeFilter === 'Financials') return n.type === 'payment' || n.type === 'refund_processed';
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'return_reminder':
      case 'qc':
        return <Clock size={20} className="text-amber-500" />;
      case 'booking_confirmed':
      case 'booking':
      case 'order':
        return <CalendarCheck size={20} className="text-secondary-blue" />;
      case 'quotation_received':
      case 'approval':
        return <FileText size={20} className="text-primary-red" />;
      case 'refund_processed':
      case 'payment':
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      default:
        return <Bell size={20} className="text-navy" />;
    }
  };

  return (
    <div className="notifications-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Notification Center</h1>
          <p className="page-sub-heading">
            Stay updated with real-time rental returns, quotation alerts, and escrow releases.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="notif-top-actions">
            <button onClick={handleMarkAllAsRead} className="btn-notif-action">
              <Check size={14} />
              <span>Mark All as Read</span>
            </button>
            <button onClick={handleClearAll} className="btn-notif-action btn-notif-danger">
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="notif-filters-row">
        {['All', 'Unread', 'Returns', 'Financials'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`notif-tab ${activeFilter === tab ? 'notif-tab-active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="notifications-list-card">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#E63946] mx-auto" />
            <p className="text-xs font-semibold">Loading real-time notifications...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="notifs-empty-box py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E63946] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-navy font-['Sora']">No Notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You're all caught up! Real-time alerts for booking confirmations, return reminders, and escrow payouts will appear here.
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item-row ${!notif.read ? 'notif-unread-row' : ''}`}
            >
              <div className="notif-icon-circle">
                {getNotifIcon(notif.type)}
              </div>

              <div className="notif-main-content">
                <div className="notif-title-line">
                  <span className="notif-item-title">{notif.title}</span>
                  {!notif.read && <span className="notif-new-dot" />}
                  <span className="notif-item-time">{notif.time}</span>
                </div>
                <p className="notif-item-msg">{notif.message}</p>
                {notif.orderId && (
                  <span className="notif-ref-tag">Ref: {notif.orderId}</span>
                )}
              </div>

              <div className="notif-row-actions">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  className="btn-notif-toggle"
                  title={notif.read ? 'Mark as unread' : 'Mark as read'}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="btn-notif-delete"
                  title="Remove notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
