import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import {
  VENDOR_PRODUCTS,
  VENDOR_ORDERS,
  VENDOR_QUOTATIONS,
  VENDOR_NOTIFICATIONS,
  VENDOR_CUSTOMERS,
  VENDOR_INVOICES,
  VENDOR_PAYMENTS,
  VENDOR_PROFILE
} from '../data/vendorMockData';

const VendorContext = createContext();

export function VendorProvider({ children }) {
  const { user, vendorProfile: authVendorProfile, isVendor, isAuthenticated } = useAuth();

  // Dynamic Vendor Profile derived from live auth context
  const dynamicVendorProfile = {
    id: authVendorProfile?.id || user?.id || 'vnd-store',
    businessName: authVendorProfile?.businessName || (user?.fullName ? `${user.fullName}'s Gear Store` : 'My Rental Store'),
    vendorName: user?.fullName || user?.name || 'Store Operator',
    role: 'Store Owner & Operator',
    email: authVendorProfile?.businessEmail || user?.email || 'vendor@rentora.in',
    phone: authVendorProfile?.businessPhone || user?.phone || '+91 98250 12345',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    logo: user?.avatar || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80',
    city: authVendorProfile?.city || 'Ahmedabad',
    state: authVendorProfile?.state || 'Gujarat',
    address: authVendorProfile?.businessAddress || 'Near SG Highway, Ahmedabad',
    gstNumber: authVendorProfile?.gstNumber || '24AAACP1234F1Z5',
    rating: 4.9,
    verifiedBadge: authVendorProfile?.verificationStatus === 'Approved' ? 'Rentora Verified Super Vendor' : 'Rentora Registered Vendor',
    verificationStatus: authVendorProfile?.verificationStatus || 'Approved',
    description: authVendorProfile?.description || 'Commercial camera, lighting, vehicle and equipment rentals.',
    upiId: authVendorProfile?.bankAccountMasked?.upiId || authVendorProfile?.upiId || (authVendorProfile?.businessName ? `${authVendorProfile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'vendor@okaxis'),
    qrCodeUrl: authVendorProfile?.bankAccountMasked?.qrCodeUrl || authVendorProfile?.qrCodeUrl || '',
    bankAccount: authVendorProfile?.bankAccountMasked?.bankName || 'HDFC Bank (Escrow Linked)'
  };

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(dynamicVendorProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setVendorProfile(dynamicVendorProfile);
  }, [user, authVendorProfile]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Fetch live vendor data from backend APIs
  const fetchVendorData = useCallback(async () => {
    const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');
    if (!token) return;

    setIsLoading(true);
    try {
      // 1. Fetch vendor products (clean, vendor-owned only)
      const prodRes = await api.get('/vendor/products').catch(() => null);
      const rawProducts = prodRes?.data?.data?.products || (Array.isArray(prodRes?.data?.data) ? prodRes.data.data : []);
      const formatted = rawProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'SKU-' + p.id.slice(0, 6).toUpperCase(),
        category: p.category?.name || 'General',
        categorySlug: p.category?.slug || 'cameras',
        brand: p.brand || 'Rentora',
        pricePerDay: Number(p.pricePerDay || 0),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        securityDeposit: Number(p.securityDeposit || 0),
        stock: p.inventory?.totalStock ?? 1,
        availableStock: p.inventory?.availableStock ?? 1,
        reservedStock: p.inventory?.reservedStock ?? 0,
        minStockAlert: p.inventory?.minStockAlert ?? 1,
        status: p.status || 'Active',
        approvalStatus: p.approvalStatus || 'Approved',
        createdDate: new Date(p.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        image: p.primaryImage || (p.images && p.images[0]?.imageUrl) || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
        images: p.images?.map((i) => (typeof i === 'string' ? i : i.imageUrl)) || ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'],
        description: p.description || '',
        totalRentals: 0,
        revenueGenerated: 0
      }));
      setProducts(formatted);

      // 2. Fetch vendor bookings
      const bookingsRes = await api.get('/vendor/bookings').catch(() => null);
      const rawBookings = Array.isArray(bookingsRes?.data?.data)
        ? bookingsRes.data.data
        : (bookingsRes?.data?.data?.results || bookingsRes?.data?.data?.rows || []);

      const formattedOrders = rawBookings.map((b) => {
        const firstItem = b.items && b.items[0];
        const prod = firstItem?.product;
        const prodImg = (prod?.images && prod.images[0]?.imageUrl) || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
        
        let displayStatus = 'Confirmed';
        if (b.status === 'PRODUCT_RESERVED' || b.status === 'BOOKING_CONFIRMED' || b.status === 'Confirmed') {
          displayStatus = 'Confirmed';
        } else if (b.status === 'PICKUP_SCHEDULED' || b.status === 'PRODUCT_HANDED_OVER' || b.status === 'Processing') {
          displayStatus = 'Processing';
        } else if (b.status === 'RENTAL_ACTIVE' || b.status === 'RETURN_SCHEDULED' || b.status === 'Active') {
          displayStatus = 'Active';
        } else if (b.status === 'PRODUCT_RETURNED' || b.status === 'DEPOSIT_RELEASED' || b.status === 'Completed') {
          displayStatus = 'Completed';
        } else if (b.status === 'CANCELLED') {
          displayStatus = 'Cancelled';
        }

        return {
          id: b.id,
          orderId: b.bookingNumber || b.id.slice(0, 8).toUpperCase(),
          customer: {
            id: b.customer?.id,
            name: b.customer?.fullName || 'Customer',
            email: b.customer?.email || 'customer@rentora.in',
            phone: b.customer?.phone || '+91 98250 12345',
            city: b.deliveryAddress || 'Ahmedabad',
            avatar: (b.customer?.avatarUrl && !b.customer.avatarUrl.includes('photo-1534528741775-53994a69daeb')) ? b.customer.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(b.customer?.fullName || 'Customer')}&background=1D3557&color=ffffff&bold=true`
          },
          product: {
            id: prod?.id,
            name: prod?.name || 'Rental Gear',
            brand: prod?.brand || 'Rentora',
            image: prodImg,
            sku: prod?.sku || 'SKU-001'
          },
          startDate: b.startDate,
          endDate: b.endDate,
          durationDays: b.totalRentalDays || 2,
          deliveryType: b.deliveryType || 'doorstep',
          handoverType: b.deliveryType === 'store_pickup' ? 'Store Pickup' : 'Doorstep Delivery',
          quantity: firstItem?.quantity || 1,
          totalAmount: Number(b.totalAmount || b.totalPayable || 0),
          rentalAmount: Number(b.rentalAmount || b.rentalSubtotal || 0),
          securityDeposit: Number(b.depositAmount || b.securityDeposit || 0),
          orderStatus: displayStatus,
          status: b.status,
          paymentStatus: b.paymentStatus || 'Paid',
          paymentPlan: b.paymentPlan || 'full',
          orderDate: new Date(b.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      });
      setOrders(formattedOrders);

      // Derive unique customers for Vendor Customer Directory
      const uniqueCustomers = [];
      const seenCustKeys = new Set();
      formattedOrders.forEach((o) => {
        const c = o.customer;
        const cKey = c.email || c.name;
        if (cKey && !seenCustKeys.has(cKey)) {
          seenCustKeys.add(cKey);
          const custOrders = formattedOrders.filter(x => (x.customer.email || x.customer.name) === cKey);
          uniqueCustomers.push({
            id: c.id || `cust-${seenCustKeys.size}`,
            name: c.name,
            company: 'Independent Creator',
            email: c.email,
            phone: c.phone,
            city: c.city || 'Ahmedabad',
            location: c.city || 'Ahmedabad',
            avatar: c.avatar,
            totalOrders: custOrders.length,
            lastOrderDate: custOrders[0]?.orderDate || 'Recent',
            totalSpending: `₹${custOrders.reduce((sum, x) => sum + x.totalAmount, 0).toLocaleString('en-IN')}`,
            trustScore: '98',
            status: 'Verified Client'
          });
        }
      });
      setCustomers(uniqueCustomers);

      // 3. Fetch vendor invoices
      const invoicesRes = await api.get('/invoices/vendor').catch(() => null);
      if (invoicesRes?.data?.success && Array.isArray(invoicesRes.data.data)) {
        setInvoices(invoicesRes.data.data);
      }

    } catch (err) {
      console.error('[VendorContext] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVendorData();
    }
  }, [isAuthenticated, fetchVendorData]);

  // Products CRUD - Connected to Live Backend
  const addProduct = async (newProd) => {
    try {
      const payload = {
        name: newProd.name,
        categoryId: newProd.categoryId || 'cameras',
        brand: newProd.brand || 'Rentora',
        description: newProd.description || '',
        pricePerDay: Number(newProd.pricePerDay || 1000),
        discountPrice: newProd.discountPrice ? Number(newProd.discountPrice) : null,
        securityDeposit: Number(newProd.securityDeposit || 0),
        stock: Number(newProd.stock || 1),
        minStockAlert: Number(newProd.minStockAlert || 1),
        dimensions: newProd.dimensions || null,
        weight: newProd.weight || null,
        tags: newProd.tags || [],
        specifications: newProd.specifications || [],
        images: newProd.images || (newProd.image ? [newProd.image] : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80']),
        approvalStatus: 'Approved'
      };

      const res = await api.post('/vendor/products', payload);
      if (res.data?.success) {
        await fetchVendorData();
        showToast(`Product "${payload.name}" published successfully!`, 'success');
        return res.data.data;
      }
    } catch (error) {
      console.warn('[VendorContext] Add product API call fallback:', error);
      // Local fallback for offline/test instances
      const created = {
        ...newProd,
        id: `prod-${Date.now()}`,
        createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        totalRentals: 0,
        revenueGenerated: 0
      };
      setProducts((prev) => [created, ...prev]);
      showToast(`Product "${created.name}" published to store!`, 'success');
      return created;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      await api.put(`/vendor/products/${id}`, updatedFields).catch(() => null);
      await fetchVendorData();
    } catch (e) {
      // Continue locally
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast('Product details updated successfully!', 'success');
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/vendor/products/${id}`).catch(() => null);
      await fetchVendorData();
    } catch (e) {
      // Continue locally
    }
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Product "${target?.name || 'Item'}" deleted.`, 'info');
  };

  const updateProductStatus = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Product status updated to ${newStatus}.`, 'success');
  };

  const adjustStock = async (id, delta, reason) => {
    try {
      await api.patch(`/vendor/products/${id}/inventory`, { deltaStock: delta, reason }).catch(() => null);
    } catch (e) {
      // Continue locally
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, (p.stock || 1) + delta);
          const newAvail = Math.max(0, (p.availableStock || 1) + delta);
          let newStatus = p.status;
          if (newStock === 0) newStatus = 'Out of Stock';
          else if (newStock <= (p.minStockAlert || 1)) newStatus = 'Low Stock';
          else newStatus = 'Active';
          return { ...p, stock: newStock, availableStock: newAvail, status: newStatus };
        }
        return p;
      })
    );
    showToast(`Stock updated (${delta > 0 ? `+${delta}` : delta} units) - ${reason}`, 'success');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId || o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    showToast(`Order ${orderId} updated to ${newStatus}.`, 'success');
  };

  const addQuotation = (newQuo) => {
    const created = {
      ...newQuo,
      id: `quo-${Date.now()}`,
      quotationNumber: `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Sent'
    };
    setQuotations((prev) => [created, ...prev]);
    showToast(`Quotation ${created.quotationNumber} sent to client!`, 'success');
    return created;
  };

  const updateQuotationStatus = (id, status) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    showToast(`Quotation marked as ${status}.`, 'info');
  };

  const uploadProductImageFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/vendor/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.data?.imageUrl) {
        showToast('Image uploaded successfully!', 'success');
        return res.data.data.imageUrl;
      }
    } catch (err) {
      console.warn('[VendorContext] Upload image API notice:', err.message);
    }
    // Fallback: convert to base64 or blob URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const updateVendorSettings = async (updates) => {
    try {
      const res = await api.patch('/auth/profile', updates);
      if (res.data?.success) {
        showToast('Store settings & UPI profile saved successfully!', 'success');
        if (res.data.data?.vendorProfile) {
          const vp = res.data.data.vendorProfile;
          setVendorProfile((prev) => ({
            ...prev,
            ...updates,
            upiId: vp.bankAccountMasked?.upiId || updates.upiId || prev.upiId,
            qrCodeUrl: vp.bankAccountMasked?.qrCodeUrl || updates.qrCodeUrl || prev.qrCodeUrl,
            businessName: vp.businessName || updates.businessName || prev.businessName,
            address: vp.businessAddress || updates.address || prev.address
          }));
        }
        return true;
      }
    } catch (err) {
      console.error('[VendorContext] Update settings error:', err);
      showToast(err.response?.data?.message || 'Failed to update settings', 'error');
      return false;
    }
  };

  return (
    <VendorContext.Provider
      value={{
        products,
        orders,
        quotations,
        notifications,
        customers,
        invoices,
        payments,
        vendorProfile,
        setVendorProfile,
        isLoading,
        toast,
        showToast,
        hideToast,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStatus,
        adjustStock,
        updateOrderStatus,
        addQuotation,
        updateQuotationStatus,
        setNotifications,
        uploadProductImageFile,
        updateVendorSettings,
        refreshVendorData: fetchVendorData
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}

