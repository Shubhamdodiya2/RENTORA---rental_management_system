import React, { createContext, useContext, useState } from 'react';
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
  const [products, setProducts] = useState(VENDOR_PRODUCTS);
  const [orders, setOrders] = useState(VENDOR_ORDERS);
  const [quotations, setQuotations] = useState(VENDOR_QUOTATIONS);
  const [notifications, setNotifications] = useState(VENDOR_NOTIFICATIONS);
  const [customers, setCustomers] = useState(VENDOR_CUSTOMERS);
  const [invoices, setInvoices] = useState(VENDOR_INVOICES);
  const [payments, setPayments] = useState(VENDOR_PAYMENTS);
  const [vendorProfile, setVendorProfile] = useState(VENDOR_PROFILE);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Products CRUD
  const addProduct = (newProd) => {
    const created = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalRentals: 0,
      revenueGenerated: 0
    };
    setProducts((prev) => [created, ...prev]);
    showToast(`Product "${created.name}" published successfully!`, 'success');
    return created;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast('Product details updated successfully!', 'success');
  };

  const deleteProduct = (id) => {
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

  // Stock adjustments
  const adjustStock = (id, delta, reason) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          const newAvail = Math.max(0, p.availableStock + delta);
          let newStatus = p.status;
          if (newStock === 0) newStatus = 'Out of Stock';
          else if (newStock <= p.minStockAlert) newStatus = 'Low Stock';
          else newStatus = 'Active';
          return { ...p, stock: newStock, availableStock: newAvail, status: newStatus };
        }
        return p;
      })
    );
    showToast(`Stock updated (${delta > 0 ? `+${delta}` : delta} units) - ${reason}`, 'success');
  };

  // Orders update
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    showToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
  };

  // Quotation CRUD
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
        setNotifications
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
