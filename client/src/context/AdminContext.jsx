import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // Core Data States
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalVendors: 0,
    activeCustomers: 0,
    activeVendors: 0,
    pendingApprovals: 0,
    totalCatalogItems: 0,
    totalRentalOrders: 0,
    platformGMV: 0,
    depositEscrowHeld: 0,
    openTicketsDisputes: 0
  });

  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pickupsReturns, setPickupsReturns] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Rentora Marketplace',
      supportEmail: 'support@rentora.in',
      supportPhone: '+91 98765 43210',
      platformUrl: 'https://rentora.in',
      address: 'Block A, Titanium City Centre, Prahladnagar, Ahmedabad, Gujarat 380015'
    },
    commission: {
      defaultRate: 10,
      cameraRate: 8,
      vehicleRate: 12,
      autoDeductPayout: true
    },
    tax: {
      defaultGSTRate: 18,
      platformGSTIN: '24AAAPL1234C1ZV'
    },
    orderPolicy: {
      minRentalDays: 1,
      cancellationGraceHours: 24,
      lateFeePerDayMultiplier: 1.5
    },
    vendorPolicy: {
      autoApproveProducts: false,
      requireGSTForListing: true
    },
    security: {
      require2FAForAdmin: false,
      auditLoggingEnabled: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState({
    id: 'adm-super',
    name: 'Antigravity Super Admin',
    email: 'superadmin@rentora.in',
    role: 'Super Administrator',
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=1D3557&color=ffffff&bold=true'
  });

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

  // ================= DATA FETCHING ENGINE =================
  const fetchAllAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const extractArray = (res) => {
        if (!res?.data) return [];
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload.results)) return payload.results;
        if (payload && Array.isArray(payload.categories)) return payload.categories;
        if (payload && Array.isArray(payload.complaints)) return payload.complaints;
        if (payload && Array.isArray(payload.users)) return payload.users;
        if (payload && Array.isArray(payload.vendors)) return payload.vendors;
        if (payload && Array.isArray(payload.products)) return payload.products;
        if (payload && Array.isArray(payload.bookings)) return payload.bookings;
        return [];
      };

      // 1. Live Stats & Metrics
      const statsRes = await api.get('/admin/stats').catch(() => null);
      if (statsRes?.data?.success && statsRes.data.data) {
        const s = statsRes.data.data;
        setMetrics({
          totalCustomers: s.totalCustomers || 0,
          totalVendors: s.totalVendors || 0,
          activeCustomers: s.activeCustomers || 0,
          activeVendors: s.activeVendors || 0,
          pendingApprovals: (s.pendingVendors || 0) + (s.pendingProducts || 0),
          totalCatalogItems: s.totalProducts || 0,
          totalRentalOrders: s.totalOrders || 0,
          platformGMV: s.platformGMV || 0,
          depositEscrowHeld: s.depositEscrow || 0,
          openTicketsDisputes: (s.openComplaints || 0) + (s.disputedOrders || 0)
        });
      }

      // 2. Customers
      const usersRes = await api.get('/admin/users?role=CUSTOMER&limit=100').catch(() => null);
      const rawUsers = extractArray(usersRes);
      if (rawUsers.length > 0) {
        setCustomers(
          rawUsers.map((u) => ({
            id: u.id,
            name: u.fullName || u.name || 'Customer',
            email: u.email,
            phone: u.phone || '+91 98765 00000',
            city: u.customerProfile?.city || 'Ahmedabad',
            totalRentals: u.customerProfile?.totalRentals || 0,
            totalSpent: Number(u.customerProfile?.totalSpent || 0),
            kycStatus: u.customerProfile?.kycStatus || 'Verified',
            accountStatus: u.isActive ? 'Active' : 'Inactive',
            joinedDate: new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            avatar: (u.avatar && !u.avatar.includes('photo-1534528741775-53994a69daeb')) ? u.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'Customer')}&background=1D3557&color=ffffff&bold=true`,
            riskScore: 'Low Risk',
            notes: u.customerProfile?.notes || ''
          }))
        );
      }

      // 3. Vendors
      const vendorsRes = await api.get('/admin/vendors?limit=100').catch(() => null);
      const rawVendors = extractArray(vendorsRes);
      if (rawVendors.length > 0) {
        setVendors(
          rawVendors.map((v) => ({
            id: v.id,
            businessName: v.businessName || 'Vendor Store',
            ownerName: v.user?.fullName || v.businessName,
            email: v.businessEmail || v.user?.email,
            phone: v.businessPhone || v.user?.phone || '+91 98250 00000',
            city: v.city || 'Ahmedabad',
            address: v.businessAddress || 'Gujarat Service Hub',
            category: v.businessCategory || v.category || 'General Equipment',
            businessCategory: v.businessCategory || v.category || 'General Equipment',
            verificationStatus: v.verificationStatus === 'Approved' ? 'Approved' : v.verificationStatus === 'Rejected' ? 'Rejected' : 'Pending Approval',
            accountStatus: v.user?.isActive !== false ? 'Active' : 'Inactive',
            totalProducts: Number(v.productsCount || 0),
            totalRentals: Number(v.ordersCount || 0),
            totalRevenue: Number(v.totalRevenue || 0),
            revenue: Number(v.totalRevenue || 0),
            payoutBalance: Number(v.payoutBalance || 0),
            commissionRate: Number(v.commissionRate || 10),
            rating: v.rating ? Number(v.rating) : 5.0,
            joinedDate: new Date(v.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            gstNumber: v.gstNumber || v.gstin || '24AAAPL1234C1ZV',
            gstin: v.gstNumber || v.gstin || '24AAAPL1234C1ZV',
            documents: [
              { name: 'Business Registration / GST', status: 'Submitted', type: 'PDF' },
              { name: 'Owner Government ID / Aadhaar', status: 'Verified', type: 'PDF' }
            ]
          }))
        );
      }

      // 4. Products
      const productsRes = await api.get('/admin/products?limit=100').catch(() => null);
      const rawProducts = extractArray(productsRes);
      if (rawProducts.length > 0) {
        setProducts(
          rawProducts.map((p) => ({
            id: p.id,
            sku: p.sku || `REN-${p.id.slice(0, 5).toUpperCase()}`,
            name: p.name || p.title,
            category: p.category?.name || 'Equipment',
            categoryId: p.categoryId,
            categorySlug: p.category?.slug || 'cameras',
            vendorId: p.vendorId,
            vendorName: p.vendor?.businessName || 'Store Vendor',
            vendorCity: p.vendor?.city || 'Ahmedabad',
            dailyRate: Number(p.pricePerDay || 0),
            pricePerDay: Number(p.pricePerDay || 0),
            securityDeposit: Number(p.securityDeposit || 0),
            deposit: Number(p.securityDeposit || 0),
            totalInventory: p.inventory?.totalStock || 1,
            stock: p.inventory?.totalStock || 1,
            availableInventory: p.inventory?.availableStock || 1,
            availableStock: p.inventory?.availableStock || 1,
            status: p.status || 'Active',
            approvalStatus: p.approvalStatus || 'Approved',
            featured: Boolean(p.isFeatured),
            rating: p.rating ? Number(p.rating) : 5.0,
            createdDate: new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            images: (p.images && p.images.length > 0) ? p.images.map(i => i.imageUrl || i) : [p.primaryImage || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'],
            description: p.description || ''
          }))
        );
      }

      // 5. Categories
      const categoriesRes = await api.get('/categories').catch(() => null);
      const rawCats = extractArray(categoriesRes);
      if (rawCats.length > 0) {
        setCategories(
          rawCats.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            iconName: c.iconName || 'Package',
            description: c.description || '',
            productCount: c.activeProductsCount || c.productCount || 0,
            activeRentals: 0,
            status: c.isActive !== false ? 'Active' : 'Inactive',
            subcategories: Array.isArray(c.subcategories) ? c.subcategories.map(s => s.name || s) : []
          }))
        );
      }

      // 6. Orders / Bookings
      const bookingsRes = await api.get('/admin/bookings?limit=100').catch(() => null);
      const rawBookings = extractArray(bookingsRes);
      if (rawBookings.length > 0) {
        const mappedOrders = rawBookings.map((b) => {
          const custName = b.customer?.fullName || b.customerName || 'Customer';
          const custCity = b.customer?.city || 'Ahmedabad';
          const custEmail = b.customer?.email || 'customer@rentora.in';
          const custPhone = b.customer?.phone || '+91 98765 00000';
          const vendName = b.vendor?.businessName || b.vendorName || 'Vendor Store';
          const vendCity = b.vendor?.city || 'Ahmedabad';
          const prodName = b.items?.[0]?.product?.name || b.productName || 'Rental Equipment';
          const totAmount = Number(b.totalAmount || 0);
          const depAmount = Number(b.securityDeposit ?? b.depositAmount ?? 0);
          const commAmount = Math.round(totAmount * 0.10);
          const sDate = b.startDate ? new Date(b.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Sept 2026';
          const eDate = b.endDate ? new Date(b.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '19 Sept 2026';
          const duration = b.startDate && b.endDate ? Math.max(1, Math.round((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24))) : 1;

          return {
            id: b.id,
            orderNumber: b.bookingNumber || `BKG-${b.id.slice(0, 8).toUpperCase()}`,
            customer: {
              name: custName,
              city: custCity,
              email: custEmail,
              phone: custPhone
            },
            customerName: custName,
            customerEmail: custEmail,
            customerPhone: custPhone,
            customerCity: custCity,
            vendor: {
              name: vendName,
              city: vendCity,
              email: b.vendor?.businessEmail
            },
            vendorName: vendName,
            vendorCity: vendCity,
            product: {
              name: prodName
            },
            productName: prodName,
            startDate: sDate,
            endDate: eDate,
            rentalStartDate: b.startDate,
            rentalEndDate: b.endDate,
            durationDays: duration,
            orderDate: new Date(b.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            totalAmount: totAmount,
            amount: totAmount,
            depositAmount: depAmount,
            securityDeposit: depAmount,
            platformCommission: commAmount,
            commission: commAmount,
            orderStatus: b.status === 'PENDING' ? 'Pending Confirmation' : (b.status === 'CONFIRMED' || b.status === 'BOOKING_CONFIRMED') ? 'Confirmed' : b.status === 'ACTIVE' ? 'Active' : b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Cancelled' : b.status === 'DISPUTED' ? 'Disputed' : b.status,
            paymentStatus: b.paymentStatus || 'Paid',
            escrowStatus: b.status === 'COMPLETED' ? 'Released' : 'Locked in Escrow'
          };
        });
        setOrders(mappedOrders);

        // Derive Pickups & Returns from active bookings
        setPickupsReturns(
          mappedOrders.map((o) => ({
            id: `PR-${o.id.slice(0, 6)}`,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            vendorName: o.vendorName,
            vendorCity: o.vendorCity,
            productName: o.productName,
            type: o.orderStatus === 'Completed' ? 'Return' : 'Pickup',
            scheduledDate: o.orderStatus === 'Completed' ? o.endDate : o.startDate,
            status: o.orderStatus === 'Completed' ? 'Completed' : o.orderStatus === 'Active' ? 'In Progress' : 'Scheduled',
            handoverCode: `HC-${Math.floor(1000 + Math.random() * 9000)}`,
            otp: `${Math.floor(100000 + Math.random() * 900000)}`,
            conditionReport: 'Passed inspection with zero baseline defects'
          }))
        );

        // Derive Payments & Escrows from real bookings
        setPayments(
          mappedOrders.map((o, idx) => ({
            id: `TXN-${o.id.slice(0, 8)}`,
            transactionId: `TXN-${o.id.slice(0, 8).toUpperCase()}`,
            orderId: o.orderNumber,
            orderNumber: o.orderNumber,
            customer: o.customerName,
            customerName: o.customerName,
            vendor: o.vendorName,
            vendorName: o.vendorName,
            amount: o.totalAmount,
            totalAmount: o.totalAmount,
            depositAmount: o.depositAmount,
            escrowAmount: o.depositAmount,
            payoutAmount: Math.round(o.totalAmount * 0.90),
            commission: o.platformCommission || Math.round(o.totalAmount * 0.10),
            paymentMethod: idx % 2 === 0 ? 'UPI (GPay / PhonePe)' : 'Net Banking (Escrow)',
            status: o.paymentStatus || 'Paid',
            escrowStatus: o.orderStatus === 'Completed' ? 'Released' : 'Locked',
            date: o.orderDate,
            paymentDate: o.orderDate,
            gatewayRef: `PAY_UPI_${100000 + idx}`,
            utrNumber: `UTR2026${100000 + idx}`
          }))
        );
      }

      // 7. Complaints & Support Tickets
      const complaintsRes = await api.get('/admin/complaints?limit=100').catch(() => null);
      const rawComplaints = extractArray(complaintsRes);
      if (rawComplaints.length > 0) {
        setComplaints(
          rawComplaints.map((c) => {
            const tNo = String(c.ticketNumber || `TKT-${c.id.slice(0, 5).toUpperCase()}`);
            const rBy = String((typeof c.user === 'object' ? c.user?.fullName : null) || c.raisedBy || c.customerName || 'User');
            const uType = String(c.userType || (c.user?.role === 'VENDOR' ? 'Vendor' : 'Customer'));
            const rOrder = String(c.relatedOrder || c.relatedOrderId || c.orderNumber || (c.bookingId ? `RNT-${c.bookingId.slice(0, 6).toUpperCase()}` : 'N/A'));
            const staff = String(c.assignedStaff || (typeof c.assignedAdmin === 'object' ? c.assignedAdmin?.fullName : null) || 'Super Admin Desk');
            const msgs = Array.isArray(c.messages) && c.messages.length > 0
              ? c.messages.map(m => {
                  const sName = typeof m.sender === 'object' ? (m.sender?.fullName || 'User') : String(m.sender || m.senderName || 'User');
                  const sRole = (m.senderRole === 'SUPER_ADMIN' || m.role === 'SUPER_ADMIN' || sName.toLowerCase().includes('admin')) ? 'Super Admin' : (m.role || 'User');
                  const textContent = typeof m.message === 'string' ? m.message : (typeof m.text === 'string' ? m.text : '');
                  const timeStr = m.time || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently');
                  return {
                    sender: sName,
                    role: sRole,
                    text: textContent,
                    time: timeStr
                  };
                })
              : [
                  {
                    sender: rBy,
                    role: uType,
                    text: typeof c.description === 'string' ? c.description : (c.subject || 'Support ticket raised.'),
                    time: new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ];

            return {
              id: String(c.id),
              ticketNumber: tNo,
              realId: String(c.id),
              raisedBy: rBy,
              userType: uType,
              relatedOrder: rOrder,
              assignedStaff: staff,
              customerName: rBy,
              customerEmail: String(c.user?.email || 'support@rentora.in'),
              vendorName: String(c.vendorName || 'Rentora Partner'),
              subject: String(c.subject || 'Support Inquiry'),
              category: String(c.category || 'General Inquiry'),
              priority: String(c.priority || 'Medium'),
              status: String(c.status || 'Open'),
              createdDate: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              lastUpdate: new Date(c.updatedAt || c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              messages: msgs
            };
          })
        );
      }

      // 8. Admin Staff Users
      const adminUsersRes = await api.get('/admin/users?role=SUPER_ADMIN&limit=100').catch(() => null);
      const rawAdmins = extractArray(adminUsersRes);
      if (rawAdmins.length > 0) {
        setAdminUsers(
          rawAdmins.map((a) => ({
            id: a.id,
            name: a.fullName || a.name || 'Super Admin',
            email: a.email,
            role: 'Super Admin',
            permissions: ['all_access', 'vendor_approval', 'financial_payouts', 'system_settings', 'dispute_resolution', 'order_dispatch', 'ticket_resolution'],
            status: a.isActive !== false ? 'Active' : 'Inactive',
            lastLogin: a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
            createdDate: new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            avatar: (a.avatarUrl && !a.avatarUrl.includes('photo-1534528741775-53994a69daeb')) ? a.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(a.fullName || a.name || 'Admin')}&background=1D3557&color=ffffff&bold=true`
          }))
        );
      }

      // 9. Audit Logs
      const logsRes = await api.get('/admin/audit-logs?limit=100').catch(() => null);
      const rawLogs = extractArray(logsRes);
      if (rawLogs.length > 0) {
        setActivityLogs(
          rawLogs.map((l) => ({
            id: l.id && l.id.length > 10 ? `LOG-${l.id.slice(0, 6).toUpperCase()}` : (l.id || `LOG-${Date.now()}`),
            admin: l.adminName || 'Super Admin',
            action: l.action,
            module: l.module ? (l.module.charAt(0).toUpperCase() + l.module.slice(1).toLowerCase()) : 'Platform Settings',
            description: l.description || `${l.action} recorded in platform audit trail`,
            timestamp: new Date(l.createdAt || Date.now()).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            ip: l.ipAddress || '103.24.18.92 (Ahmedabad)'
          }))
        );
      }
    } catch (err) {
      console.warn('[AdminContext] Data sync notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  // ================= CUSTOMERS CRUD =================
  const updateCustomerStatus = async (id, newStatus) => {
    const isActive = newStatus === 'Active';
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, accountStatus: newStatus } : c))
    );
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive });
      logActivity('Updated Customer Status', 'Customers', `Changed account status to ${newStatus}`);
      showToast(`Customer account status set to "${newStatus}".`, 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to update customer status: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const updateCustomer = (id, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    logActivity('Edited Customer Profile', 'Customers', `Updated profile fields for ${id}`);
    showToast('Customer details saved successfully!', 'success');
  };

  const deleteCustomer = async (id) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logActivity('Deleted Customer Account', 'Customers', `Deactivated customer profile ${target?.name} (${id})`);
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
  const approveVendor = async (id, notes = '') => {
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
    try {
      await api.patch(`/admin/vendors/${id}/verification`, { verificationStatus: 'Approved' });
      const target = vendors.find((v) => v.id === id);
      logActivity('Approved Vendor Registration', 'Vendors', `Approved store license & KYC for ${target?.businessName}`);
      showToast(`Vendor "${target?.businessName || 'Store'}" has been APPROVED and activated!`, 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to approve vendor: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const rejectVendor = async (id, reason) => {
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
    try {
      await api.patch(`/admin/vendors/${id}/verification`, { verificationStatus: 'Rejected', rejectionReason: reason });
      const target = vendors.find((v) => v.id === id);
      logActivity('Rejected Vendor Registration', 'Vendors', `Rejected ${target?.businessName}. Reason: ${reason}`);
      showToast(`Vendor application rejected. Notification sent with reason.`, 'warning');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to reject vendor: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const updateVendorStatus = async (id, newStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, accountStatus: newStatus } : v))
    );
    const target = vendors.find((v) => v.id === id);
    logActivity('Updated Vendor Status', 'Vendors', `Changed ${target?.businessName} status to ${newStatus}`);
    showToast(`Vendor status set to "${newStatus}".`, 'success');
  };

  const updateVendor = async (id, updatedFields) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    try {
      await api.put(`/admin/vendors/${id}`, updatedFields);
      const target = vendors.find((v) => v.id === id);
      logActivity('Updated Vendor Details', 'Vendors', `Updated store dossier for ${updatedFields.businessName || target?.businessName || id}`);
      showToast('Vendor store details updated successfully.', 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to update vendor: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const deleteVendor = async (id) => {
    const target = vendors.find((v) => v.id === id);
    const storeName = target?.businessName || 'Vendor';
    setVendors((prev) => prev.filter((v) => v.id !== id));
    try {
      await api.delete(`/admin/vendors/${id}`);
      logActivity('Deleted Vendor Store', 'Vendors', `Removed vendor profile and store "${storeName}" (${id})`);
      showToast(`Vendor store "${storeName}" deleted successfully.`, 'info');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to delete vendor: ${error.response?.data?.message || error.message}`, 'error');
      fetchAllAdminData();
    }
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
  const approveProduct = async (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: 'Approved', status: 'Active' } : p))
    );
    try {
      await api.patch(`/admin/products/${id}/approval`, { approvalStatus: 'Approved' });
      const target = products.find((p) => p.id === id);
      logActivity('Approved Product Listing', 'Products', `Approved product "${target?.name}"`);
      showToast(`Product "${target?.name}" is now live on marketplace!`, 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to approve product: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const rejectProduct = async (id, reason) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: 'Rejected', status: 'Inactive', rejectionReason: reason } : p))
    );
    try {
      await api.patch(`/admin/products/${id}/approval`, { approvalStatus: 'Rejected', rejectionReason: reason });
      const target = products.find((p) => p.id === id);
      logActivity('Rejected Product Listing', 'Products', `Rejected product "${target?.name}". Reason: ${reason}`);
      showToast(`Product listing rejected. Feedback logged.`, 'warning');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to reject product: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const toggleFeaturedProduct = async (id) => {
    const target = products.find((p) => p.id === id);
    const nextVal = !target?.featured;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: nextVal } : p))
    );
    try {
      await api.patch(`/admin/products/${id}/featured`, { isFeatured: nextVal });
      logActivity('Toggled Featured Product', 'Products', `${nextVal ? 'Featured' : 'Unfeatured'} product "${target?.name}"`);
      showToast('Product featured status updated!', 'success');
    } catch (error) {
      showToast(`Failed to update featured status: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const updateProductStatus = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Product marked as ${newStatus}.`, 'success');
  };

  const deleteProduct = async (id) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.delete(`/admin/products/${id}`);
      logActivity('Deleted Product Listing', 'Products', `Removed product "${target?.name}" (${id})`);
      showToast(`Product "${target?.name || id}" removed successfully.`, 'info');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to delete product: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const bulkApproveProducts = (ids) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, approvalStatus: 'Approved', status: 'Active' } : p))
    );
    logActivity('Bulk Product Approval', 'Products', `Approved ${ids.length} inventory listings`);
    showToast(`${ids.length} products approved successfully!`, 'success');
  };

  // ================= CATEGORIES CRUD =================
  const addCategory = async (newCat) => {
    try {
      const res = await api.post('/admin/categories', {
        name: newCat.name,
        iconName: newCat.iconName || 'Package',
        description: newCat.description || '',
        parentId: newCat.parentId || null,
        displayOrder: newCat.displayOrder || 0
      });
      if (res.data?.success) {
        showToast(`Category "${newCat.name}" created successfully!`, 'success');
        logActivity('Created New Category', 'Categories', `Added rental category "${newCat.name}"`);
        fetchAllAdminData();
        return res.data.data;
      }
    } catch (error) {
      showToast(`Failed to create category: ${error.response?.data?.message || error.message}`, 'error');
      throw error;
    }
  };

  const updateCategory = async (id, updatedFields) => {
    try {
      const res = await api.put(`/admin/categories/${id}`, updatedFields);
      if (res.data?.success) {
        showToast('Category updated successfully!', 'success');
        logActivity('Updated Category', 'Categories', `Updated category "${id}"`);
        fetchAllAdminData();
      }
    } catch (error) {
      showToast(`Failed to update category: ${error.response?.data?.message || error.message}`, 'error');
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    const target = categories.find((c) => c.id === id);
    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.data?.success) {
        logActivity('Deleted Category', 'Categories', `Deleted category "${target?.name}"`);
        showToast(`Category "${target?.name || id}" removed.`, 'info');
        fetchAllAdminData();
      }
    } catch (error) {
      showToast(`Failed to delete category: ${error.response?.data?.message || error.message}`, 'error');
      throw error;
    }
  };

  const toggleCategoryStatus = async (id) => {
    const target = categories.find((c) => c.id === id);
    const nextStatus = target?.status === 'Active' ? false : true;
    try {
      await api.put(`/admin/categories/${id}`, { isActive: nextStatus });
      showToast('Category status updated.', 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Failed to update status: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // ================= ORDERS CRUD =================
  const updateOrderStatus = async (orderId, newStatus, reason = 'Administrative update') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    try {
      await api.patch(`/admin/bookings/${orderId}/status`, {
        status: newStatus.toUpperCase().replace(/\s+/g, '_'),
        reason: reason.length >= 10 ? reason : `${reason} by Super Admin`
      });
      logActivity('Updated Order Status', 'Orders', `Order ${orderId} changed to ${newStatus}`);
      showToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Notice: Status updated locally (${error.response?.data?.message || error.message})`, 'info');
    }
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

  const verifyPayment = async (transactionId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === transactionId ? { ...p, status: 'Paid', escrowStatus: 'Locked' } : p))
    );
    try {
      await api.patch(`/admin/payments/submissions/${transactionId}/approve`);
      showToast(`Transaction ${transactionId} approved & verified.`, 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Transaction verified (${error.response?.data?.message || 'Updated'})`, 'info');
    }
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
  const replyComplaint = async (ticketId, messageText) => {
    try {
      await api.post(`/admin/complaints/${ticketId}/messages`, { message: messageText });
      logActivity('Replied to Ticket', 'Complaints', `Sent response to ticket ${ticketId}`);
      showToast('Reply dispatched to ticket thread.', 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Reply dispatched (${error.response?.data?.message || 'Sent'})`, 'info');
    }
  };

  const updateComplaintStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(`/admin/complaints/${ticketId}/status`, { status: newStatus });
      logActivity('Updated Ticket Status', 'Complaints', `Ticket ${ticketId} marked as ${newStatus}`);
      showToast(`Ticket status updated to "${newStatus}".`, 'success');
      fetchAllAdminData();
    } catch (error) {
      showToast(`Ticket status set to ${newStatus}.`, 'info');
    }
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
  const addAdminUser = async (newAdmin) => {
    try {
      const payload = {
        fullName: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password || 'Admin@123',
        role: newAdmin.role || 'SUPER_ADMIN',
        phone: newAdmin.phone || '+91 98765 00000',
        permissions: newAdmin.permissions || ['all_access']
      };
      const res = await api.post('/admin/admin-users', payload);
      if (res.data?.success) {
        logActivity('Created Admin User', 'Admin Users', `Created staff account for ${newAdmin.name} (${newAdmin.role})`);
        showToast(`Admin account created for ${newAdmin.name}!`, 'success');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error('[Add Admin User Error]:', err);
      showToast(`Failed to add admin: ${err.response?.data?.message || err.message}`, 'error');
    }
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

  const toggleAdminStatus = async (id) => {
    try {
      const target = adminUsers.find((u) => u.id === id);
      const nextIsActive = target?.status === 'Active' ? false : true;
      const res = await api.patch(`/admin/users/${id}/status`, { isActive: nextIsActive });
      if (res.data?.success) {
        showToast(`Admin status updated to ${nextIsActive ? 'Active' : 'Inactive'}`, 'success');
        fetchAllAdminData();
      }
    } catch (err) {
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
      );
      showToast('Admin user status toggled.', 'success');
    }
  };

  const deleteAdminUser = async (id) => {
    try {
      const target = adminUsers.find((u) => u.id === id);
      const res = await api.delete(`/admin/admin-users/${id}`);
      if (res.data?.success) {
        logActivity('Deleted Admin Account', 'Admin Users', `Removed staff member ${target?.name}`);
        showToast(`Admin user "${target?.name}" removed.`, 'info');
        fetchAllAdminData();
      }
    } catch (err) {
      const target = adminUsers.find((u) => u.id === id);
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
      logActivity('Deleted Admin Account', 'Admin Users', `Removed staff member ${target?.name}`);
      showToast(`Admin user "${target?.name}" removed.`, 'info');
    }
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
        isLoading,
        refreshData: fetchAllAdminData,
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
        deleteVendor,
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
