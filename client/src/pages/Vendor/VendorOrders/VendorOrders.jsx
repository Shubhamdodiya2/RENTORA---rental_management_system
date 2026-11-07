import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Receipt,
  FileText,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorOrders.css';

const TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Active', 'Completed'];

export default function VendorOrders() {
  const { orders, updateOrderStatus, acceptVendorOrder, refreshVendorData, showToast } = useVendor();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [docModal, setDocModal] = useState(null);

  React.useEffect(() => {
    if (refreshVendorData) {
      refreshVendorData();
    }
  }, []);

  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    if (activeTab !== 'All' && o.orderStatus !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.product?.name && o.product.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
    }
  };

  return (
    <div className="vendor-orders-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Orders & Rental Reservations</h1>
          <p className="page-sub-heading">
            Review customer bookings, manage equipment dispatch schedules, and inspect returns.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/vendor/quotations" className="btn-v-secondary">
            <FileText size={16} />
            <span>Commercial Quotes</span>
          </Link>
          <Link to="/vendor/pickups-returns" className="btn-v-primary">
            <Truck size={16} />
            <span>Pickup & Return Hub</span>
          </Link>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="v-filter-toolbar">
        <div className="v-status-filter-pills">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`v-filter-pill-btn ${activeTab === tab ? 'v-pill-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, customer, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer Name</th>
                <th>Reserved Gear</th>
                <th>Rental Schedule</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className={`v-table-row ${o.orderStatus === 'Pending' ? 'bg-amber-50/40' : ''}`}>
                    <td>
                      <span className="font-mono font-bold text-navy text-xs bg-slate-100 px-2 py-1 rounded block w-fit">
                        {o.orderId}
                      </span>
                      {o.isQuotationOrder && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 mt-1">
                          <Tag size={10} />
                          <span>Quotation Order</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="v-cust-cell">
                        <img
                          src={o.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={o.customer?.name || 'Customer'}
                          className="v-cust-thumb"
                        />
                        <div>
                          <span className="font-bold text-navy text-xs block">{o.customer?.name || 'Customer'}</span>
                          <span className="text-[11px] text-slate-400">{o.customer?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="v-prod-cell">
                        <img
                          src={o.product?.image || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'}
                          alt={o.product?.name || 'Equipment'}
                          className="v-prod-thumb"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-navy max-w-xs">{o.product?.name || 'Rental Gear'}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {o.product?.sku || 'SKU-001'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-navy">
                        {o.startDate || 'TBD'} &rarr; {o.endDate || 'TBD'}
                      </span>
                      <div className="text-[10px] text-slate-400">{o.durationDays || 1} Days ({o.handoverType || 'Standard'})</div>
                    </td>
                    <td>
                      <div className="font-bold text-navy text-xs">
                        ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        (₹{(o.securityDeposit || 0).toLocaleString('en-IN')} Escrow)
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span
                          className={`v-status-badge ${
                            o.orderStatus === 'Active'
                              ? 'status-active'
                              : o.orderStatus === 'Confirmed'
                              ? 'status-confirmed'
                              : o.orderStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : o.orderStatus === 'Processing'
                              ? 'status-processing'
                              : 'status-completed'
                          }`}
                        >
                          {o.orderStatus === 'Pending' ? 'Pending Acceptance' : o.orderStatus}
                        </span>
                        <div>
                          {o.paymentStatus === 'Success' || o.paymentStatus === 'Paid' ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 size={10} /> Paid
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Clock size={10} /> Payment Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                        className="v-status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Active">Active (Handed Over)</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {o.orderStatus === 'Pending' && (
                          <button
                            onClick={async () => {
                              await acceptVendorOrder(o.id);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                            title="Accept & Confirm Order"
                          >
                            <CheckCircle2 size={13} />
                            <span>Accept</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="btn-v-action-view"
                          title="View Order Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setDocModal({ type: 'invoice', id: o.orderId })}
                          className="btn-v-action-view"
                          title="Tax Invoice"
                        >
                          <Receipt size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="v-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="v-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{selectedOrder.orderId}</span>
                <h3 className="font-bold text-navy text-base">Rental Order Specifications</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body space-y-4">
              {/* Product info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <img src={selectedOrder.product.image} alt={selectedOrder.product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-navy text-sm">{selectedOrder.product.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">SKU: {selectedOrder.product.sku}</p>
                  <p className="text-xs font-bold text-primary-red mt-0.5">{selectedOrder.rentalPeriod}</p>
                </div>
              </div>

              {/* Customer coordinates */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div>
                  <span className="text-slate-400 block">Customer Name:</span>
                  <span className="font-bold text-navy">{selectedOrder.customer?.name || 'Customer'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone:</span>
                  <span className="font-bold text-navy">{selectedOrder.customer?.phone || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Delivery / Handover Address:</span>
                  <span className="font-medium text-navy">{selectedOrder.customer?.address || selectedOrder.customer?.city || 'Local Pickup / Standard Address'}</span>
                </div>
              </div>

              {/* Financials & Deposit */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Rental Fee ({selectedOrder.durationDays || 1} Days)</span>
                  <span className="font-semibold text-navy">₹{(selectedOrder.rentalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Deposit (Escrow Protected)</span>
                  <span className="font-semibold text-emerald-600">₹{(selectedOrder.securityDeposit || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-navy">
                  <span>Total Amount Paid</span>
                  <span>₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="v-modal-footer flex items-center justify-between">
              <button
                onClick={() => setDocModal({ type: 'invoice', id: selectedOrder.orderId })}
                className="btn-v-secondary"
              >
                <Receipt size={15} />
                <span>View Tax Invoice</span>
              </button>
              <div className="flex items-center gap-2">
                {selectedOrder.orderStatus === 'Pending' && (
                  <button
                    onClick={async () => {
                      await acceptVendorOrder(selectedOrder.id);
                      setSelectedOrder((prev) => ({ ...prev, orderStatus: 'Confirmed' }));
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Accept & Confirm Order</span>
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="btn-v-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Document Modal */}
      {docModal && (
        <DocumentModal
          type={docModal.type}
          docId={docModal.id}
          onClose={() => setDocModal(null)}
        />
      )}
    </div>
  );
}
