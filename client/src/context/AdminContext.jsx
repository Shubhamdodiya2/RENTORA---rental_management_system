import React, { createContext, useContext, useState } from 'react';
import {
  ADMIN_METRICS,
  ADMIN_CUSTOMERS,
  ADMIN_VENDORS,
  ADMIN_CATEGORIES,
  ADMIN_PRODUCTS,
  ADMIN_ORDERS,
  ADMIN_PAYMENTS,
  ADMIN_PICKUPS_RETURNS,
  ADMIN_COMPLAINTS,
  ADMIN_NOTIFICATIONS,
  ADMIN_USERS,
  ADMIN_ACTIVITY_LOGS,
  ADMIN_SETTINGS
} from '../data/adminMockData';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [metrics, setMetrics] = useState(ADMIN_METRICS);
  const [customers, setCustomers] = useState(ADMIN_CUSTOMERS);
  const [vendors, setVendors] = useState(ADMIN_VENDORS);
  const [categories, setCategories] = useState(ADMIN_CATEGORIES);
  const [products, setProducts] = useState(ADMIN_PRODUCTS);
  const [orders, setOrders] = useState(ADMIN_ORDERS);
  const [payments, setPayments] = useState(ADMIN_PAYMENTS);
  const [pickupsReturns, setPickupsReturns] = useState(ADMIN_PICKUPS_RETURNS);
  const [complaints, setComplaints] = useState(ADMIN_COMPLAINTS);
  const [notifications, setNotifications] = useState(ADMIN_NOTIFICATIONS);
  const [adminUsers, setAdminUsers] = useState(ADMIN_USERS);
  const [activityLogs, setActivityLogs] = useState(ADMIN_ACTIVITY_LOGS);
  const [settings, setSettings] = useState(ADMIN_SETTINGS);

  const [currentAdmin, setCurrentAdmin] = useState(ADMIN_USERS[0]);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const hideToast = () => setToast(null);

  // Confirmation Modal System
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'red',
    onConfirm: null
  });

  const requestConfirmation = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'red',
    onConfirm
  }) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmColor,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Document / KYC Modal System
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    documentData: null
  });

  const openDocumentModal = (doc) => {
    setDocumentModal({ isOpen: true, documentData: doc });
  };

  const closeDocumentModal = () => {
    setDocumentModal({ isOpen: false, documentData: null });
  };

  // Activity Logging Helper
  const logActivity = (action, module, description) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      admin: currentAdmin?.name || 'Super Admin',
      action,
      module,
      description,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      ip: '103.24.18.92 (Ahmedabad)'
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // ================= CUSTOMERS CRUD =================
  const updateCustomerStatus = (id, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, accountStatus: newStatus } : c))
    );
    const target = customers.find((c) => c.id === id);
    logActivity('Updated Customer Status', 'Customers', `Changed ${target?.name} account status to ${newStatus}`);
    showToast(`Customer account status updated to "${newStatus}".`, 'success');
  };

  const updateCustomer = (id, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    logActivity('Edited Customer Profile', 'Customers', `Updated profile fields for ${id}`);
    showToast('Customer details saved successfully!', 'success');
  };

  const deleteCustomer = (id) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logActivity('Deleted Customer Account', 'Customers', `Deleted customer profile ${target?.name} (${id})`);
    showToast(`Customer "${target?.name}" removed from platform.`, 'info');
  };

  const bulkUpdateCustomerStatus = (ids, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, accountStatus: newStatus } : c))
    );
    logActivity('Bulk Customer Status Update', 'Customers', `Updated ${ids.length} customers to ${newStatus}`);
    showToast(`Updated ${ids.length} customer accounts to "${newStatus}".`, 'success');
  };

  const bulkDeleteCustomers = (ids) => {
    setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
    logActivity('Bulk Customer Deletion', 'Customers', `Deleted ${ids.length} customer records`);
    showToast(`Successfully deleted ${ids.length} customers.`, 'info');
  };

  const addCustomerAdminNote = (id, note) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: (c.notes ? c.notes + '\n\n' : '') + `[${new Date().toLocaleDateString()} Admin Note]: ` + note } : c))
    );
    showToast('Admin note appended to customer file.', 'success');
  };

  // ================= VENDORS CRUD & APPROVAL =================
  const approveVendor = (id, notes = '') => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              verificationStatus: 'Approved',
              accountStatus: 'Active',
              notes: (v.notes || '') + (notes ? `\n[Approval Note]: ${notes}` : '')
            }
          : v
      )
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Approved Vendor Registration', 'Vendors', `Approved store license & KYC for ${target?.businessName}`);
    showToast(`Vendor "${target?.businessName}" has been APPROVED and activated!`, 'success');
  };

  const rejectVendor = (id, reason) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              verificationStatus: 'Rejected',
              accountStatus: 'Inactive',
              notes: (v.notes || '') + `\n[Rejection Reason]: ${reason}`
            }
          : v
      )
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Rejected Vendor Registration', 'Vendors', `Rejected ${target?.businessName}. Reason: ${reason}`);
    showToast(`Vendor application rejected. Notification sent with reason.`, 'warning');
  };

  const updateVendorStatus = (id, newStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, accountStatus: newStatus } : v))
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Updated Vendor Status', 'Vendors', `Changed ${target?.businessName} status to ${newStatus}`);
    showToast(`Vendor status set to "${newStatus}".`, 'success');
  };

  const updateVendor = (id, updatedFields) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    showToast('Vendor store details updated.', 'success');
  };

  const disburseVendorPayout = (id, amount) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, payoutBalance: Math.max(0, v.payoutBalance - amount) } : v))
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Disbursed Vendor Payout', 'Payments', `Disbursed ₹${amount.toLocaleString('en-IN')} to ${target?.businessName}`);
    showToast(`₹${amount.toLocaleString('en-IN')} disbursed to ${target?.businessName} bank account.`, 'success');
  };

  // ================= PRODUCTS CRUD & APPROVAL =================
  const approveProduct = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: 'Approved', status: 'Active' } : p))
    );
    const target = products.find((p) => p.id === id);
    logActivity('Approved Product Listing', 'Products', `Approved product "${target?.name}" (${target?.sku})`);
    showToast(`Product "${target?.name}" is now live on marketplace!`, 'success');
  };

  const rejectProduct = (id, reason) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: 'Rejected', status: 'Inactive', rejectionReason: reason } : p))
    );
    const target = products.find((p) => p.id === id);
    logActivity('Rejected Product Listing', 'Products', `Rejected product "${target?.name}". Reason: ${reason}`);
    showToast(`Product listing rejected. Feedback logged.`, 'warning');
  };

  const toggleFeaturedProduct = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextVal = !p.featured;
          logActivity('Toggled Featured Product', 'Products', `${nextVal ? 'Featured' : 'Unfeatured'} product "${p.name}"`);
          return { ...p, featured: nextVal };
        }
        return p;
      })
    );
    showToast('Product featured status updated!', 'success');
  };

  const updateProductStatus = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Product marked as ${newStatus}.`, 'success');
  };

  const deleteProduct = (id) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity('Deleted Product Listing', 'Products', `Removed product "${target?.name}" (${id})`);
    showToast(`Product "${target?.name || id}" removed.`, 'info');
  };

  const bulkApproveProducts = (ids) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, approvalStatus: 'Approved', status: 'Active' } : p))
    );
    logActivity('Bulk Product Approval', 'Products', `Approved ${ids.length} inventory listings`);
    showToast(`${ids.length} products approved successfully!`, 'success');
  };

  // ================= CATEGORIES CRUD =================
  const addCategory = (newCat) => {
    const created = {
      id: `cat-${Date.now()}`,
      slug: newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount: 0,
      activeRentals: 0,
      status: 'Active',
      subcategories: newCat.subcategories || [],
      ...newCat
    };
    setCategories((prev) => [created, ...prev]);
    logActivity('Created New Category', 'Categories', `Added rental category "${created.name}"`);
    showToast(`Category "${created.name}" created successfully!`, 'success');
    return created;
  };

  const updateCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    showToast('Category updated successfully!', 'success');
  };

  const deleteCategory = (id) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logActivity('Deleted Category', 'Categories', `Deleted category "${target?.name}"`);
    showToast(`Category "${target?.name}" deleted.`, 'info');
  };

  const toggleCategoryStatus = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
    showToast('Category status updated.', 'success');
  };

  // ================= ORDERS CRUD =================
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    logActivity('Updated Order Status', 'Orders', `Order ${orderId} changed to ${newStatus}`);
    showToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
  };

  const updateOrderPaymentStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
    );
    showToast(`Order payment marked as ${newStatus}.`, 'success');
  };

  const resolveOrderDispute = (orderId, resolutionDetails) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'Resolved',
              escrowStatus: resolutionDetails.depositAction || 'Refunded',
              notes: (o.notes || '') + `\n[Dispute Resolved]: ${resolutionDetails.notes}`
            }
          : o
      )
    );
    logActivity('Resolved Order Dispute', 'Orders', `Resolved dispute on ${orderId} with ${resolutionDetails.depositAction}`);
    showToast(`Dispute on ${orderId} resolved! Escrow updated.`, 'success');
  };

  const addOrderAdminNote = (orderId, note) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, notes: (o.notes || '') + `\n[Admin Note]: ${note}` } : o))
    );
    showToast('Internal note saved on order.', 'success');
  };

  // ================= PAYMENTS & REFUNDS =================
  const processRefund = (transactionId, refundAmount, reason) => {
    setPayments((prev) =>
      prev.map((p) => (p.transactionId === transactionId || p.id === transactionId ? { ...p, status: 'Refunded', escrowStatus: 'Refunded' } : p))
    );
    logActivity('Processed Payment Refund', 'Payments', `Refunded ₹${refundAmount.toLocaleString('en-IN')} for ${transactionId}. Reason: ${reason}`);
    showToast(`Refund of ₹${refundAmount.toLocaleString('en-IN')} successfully initiated.`, 'success');
  };

  const verifyPayment = (transactionId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === transactionId ? { ...p, status: 'Paid', escrowStatus: 'Locked' } : p))
    );
    showToast(`Transaction ${transactionId} verified.`, 'success');
  };

  // ================= PICKUPS & RETURNS =================
  const schedulePickup = (requestId, scheduledDate, notes) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Scheduled', scheduledDate, notes: notes || r.notes } : r))
    );
    logActivity('Scheduled Pickup', 'Pickups & Returns', `Scheduled logistics pickup for request ${requestId}`);
    showToast(`Pickup scheduled for ${scheduledDate}. Driver assigned.`, 'success');
  };

  const approveReturn = (requestId, notes) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Completed', notes: notes || r.notes } : r))
    );
    logActivity('Approved Return Inspection', 'Pickups & Returns', `Approved return checklist for ${requestId}`);
    showToast(`Return approved! Security deposit marked for release.`, 'success');
  };

  const rejectReturn = (requestId, reason) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Disputed', notes: (r.notes || '') + `\n[QC Failure]: ${reason}` } : r))
    );
    logActivity('Flagged Return Damage', 'Pickups & Returns', `Flagged damage on return ${requestId}: ${reason}`);
    showToast(`Return flagged for damage assessment. Ticket created.`, 'warning');
  };

  const completeReturn = (requestId, qcReport) => {
    setPickupsReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Completed', qcChecklist: qcReport } : r))
    );
    showToast(`QC inspection recorded for ${requestId}.`, 'success');
  };

  // ================= COMPLAINTS & TICKETS =================
  const replyComplaint = (ticketId, messageText) => {
    setComplaints((prev) =>
      prev.map((t) => {
        if (t.id === ticketId || t.ticketNumber === ticketId) {
          const newMsg = {
            sender: currentAdmin?.name || 'Super Admin',
            role: 'Super Admin',
            time: 'Just now',
            text: messageText
          };
          return {
            ...t,
            status: t.status === 'Open' ? 'In Progress' : t.status,
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );
    logActivity('Replied to Ticket', 'Complaints', `Sent response to ticket ${ticketId}`);
    showToast('Reply dispatched to ticket thread.', 'success');
  };

  const updateComplaintStatus = (ticketId, newStatus) => {
    setComplaints((prev) =>
      prev.map((t) => (t.id === ticketId || t.ticketNumber === ticketId ? { ...t, status: newStatus } : t))
    );
    logActivity('Updated Ticket Status', 'Complaints', `Ticket ${ticketId} marked as ${newStatus}`);
    showToast(`Ticket status updated to "${newStatus}".`, 'success');
  };

  const assignComplaintStaff = (ticketId, staffName) => {
    setComplaints((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignedStaff: staffName } : t))
    );
    showToast(`Ticket assigned to ${staffName}.`, 'success');
  };

  const updateComplaintPriority = (ticketId, newPriority) => {
    setComplaints((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, priority: newPriority } : t))
    );
    showToast(`Priority updated to ${newPriority}.`, 'info');
  };

  // ================= NOTIFICATIONS BROADCAST =================
  const broadcastNotification = (newNotif) => {
    const created = {
      id: `NOTIF-${Date.now()}`,
      time: 'Just now',
      read: false,
      ...newNotif
    };
    setNotifications((prev) => [created, ...prev]);
    logActivity('Sent Broadcast Notification', 'Notifications', `Sent "${created.title}" to ${created.recipientType || 'all users'}`);
    showToast(`Broadcast "${created.title}" dispatched successfully!`, 'success');
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification removed.', 'info');
  };

  // ================= ADMIN USERS CRUD =================
  const addAdminUser = (newAdmin) => {
    const created = {
      id: `ADM-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      lastLogin: 'Never',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      ...newAdmin
    };
    setAdminUsers((prev) => [created, ...prev]);
    logActivity('Created Admin User', 'Admin Users', `Created staff account for ${created.name} (${created.role})`);
    showToast(`Admin account created for ${created.name}!`, 'success');
  };

  const updateAdminUser = (id, updatedFields) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedFields } : u))
    );
    showToast('Admin staff details updated.', 'success');
  };

  const updateAdminPermissions = (id, permissions) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, permissions } : u))
    );
    logActivity('Updated Staff Permissions', 'Admin Users', `Modified permissions for admin ${id}`);
    showToast('Role permissions updated successfully.', 'success');
  };

  const toggleAdminStatus = (id) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
    showToast('Admin user status toggled.', 'success');
  };

  const deleteAdminUser = (id) => {
    const target = adminUsers.find((u) => u.id === id);
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Deleted Admin Account', 'Admin Users', `Removed staff member ${target?.name}`);
    showToast(`Admin user "${target?.name}" removed.`, 'info');
  };

  // ================= SETTINGS =================
  const updateSettings = (sectionKey, newValues) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        ...newValues
      }
    }));
    logActivity('Updated Platform Settings', 'Platform Settings', `Updated configuration for [${sectionKey}]`);
    showToast(`Platform [${sectionKey.toUpperCase()}] settings saved!`, 'success');
  };

  // Active counts for badges
  const pendingApprovalsCount = vendors.filter((v) => v.verificationStatus === 'Pending Approval').length + products.filter((p) => p.approvalStatus === 'Pending Approval').length;
  const openComplaintsCount = complaints.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminContext.Provider
      value={{
        metrics,
        customers,
        vendors,
        categories,
        products,
        orders,
        payments,
        pickupsReturns,
        complaints,
        notifications,
        adminUsers,
        activityLogs,
        settings,
        currentAdmin,
        setCurrentAdmin,
        toast,
        showToast,
        hideToast,
        confirmationModal,
        requestConfirmation,
        closeConfirmation,
        documentModal,
        openDocumentModal,
        closeDocumentModal,
        logActivity,

        // Counts
        pendingApprovalsCount,
        openComplaintsCount,
        unreadNotificationsCount,

        // Customer handlers
        updateCustomerStatus,
        updateCustomer,
        deleteCustomer,
        bulkUpdateCustomerStatus,
        bulkDeleteCustomers,
        addCustomerAdminNote,

        // Vendor handlers
        approveVendor,
        rejectVendor,
        updateVendorStatus,
        updateVendor,
        disburseVendorPayout,

        // Product handlers
        approveProduct,
        rejectProduct,
        toggleFeaturedProduct,
        updateProductStatus,
        deleteProduct,
        bulkApproveProducts,

        // Category handlers
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,

        // Order handlers
        updateOrderStatus,
        updateOrderPaymentStatus,
        resolveOrderDispute,
        addOrderAdminNote,

        // Payment handlers
        processRefund,
        verifyPayment,

        // Pickup / Return handlers
        schedulePickup,
        approveReturn,
        rejectReturn,
        completeReturn,

        // Complaint handlers
        replyComplaint,
        updateComplaintStatus,
        assignComplaintStaff,
        updateComplaintPriority,

        // Notification handlers
        broadcastNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,

        // Admin User handlers
        addAdminUser,
        updateAdminUser,
        updateAdminPermissions,
        toggleAdminStatus,
        deleteAdminUser,

        // Settings handlers
        updateSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
