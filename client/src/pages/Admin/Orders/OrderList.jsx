import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Calendar,
  IndianRupee,
  ShieldAlert,
  Download,
  AlertTriangle,
  User,
  Store,
  ChevronDown
} from 'lucide-react';
import { SearchBar, StatusBadge, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function OrderList() {
  const navigate = useNavigate();
  const {
    orders,
    updateOrderStatus,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const orderStatuses = [
    'all',
    'Confirmed',
    'Processing',
    'Delivered',
    'Returned',
    'Disputed',
    'Cancelled'
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.product?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Orders & Booking Operations</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track multi-vendor rental orders, manage dispatch pipelines, resolve disputes, and supervise deposit escrow.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting order ledger to CSV...', 'info')}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download size={14} className="text-slate-500" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search order #, customer, vendor, gear..."
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Order State:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              {orderStatuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'all' ? `All Orders (${orders.length})` : st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              <option value="all">All Payments</option>
              <option value="Paid">Paid (Verified)</option>
              <option value="Refunded">Refunded</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order ID / Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Rented Gear</th>
                  <th className="py-3.5 px-4">Total / Commission</th>
                  <th className="py-3.5 px-4">Deposit Escrow</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-4 px-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-semibold text-slate-900 font-mono hover:text-blue-600 block"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="text-[10px] text-slate-400">{order.orderDate}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{order.customer?.name}</div>
                      <div className="text-[11px] text-slate-500">{order.customer?.city}</div>
                    </td>

                    {/* Vendor */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{order.vendor?.name}</div>
                      <div className="text-[10px] text-slate-400">{order.vendor?.city}</div>
                    </td>

                    {/* Gear */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{order.product?.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {order.startDate} → {order.endDate} ({order.durationDays}d)
                      </div>
                    </td>

                    {/* Total & Commission */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 font-['Sora']">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Comm: ₹{order.platformCommission}
                      </span>
                    </td>

                    {/* Escrow */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-emerald-700">₹{order.depositAmount}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium inline-block mt-0.5">
                        {order.escrowStatus}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={order.orderStatus} />
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          aria-label="Change order status"
                          className="bg-transparent text-[10px] text-slate-400 hover:text-slate-700 border-0 cursor-pointer focus:outline-none"
                        >
                          {orderStatuses.filter((s) => s !== 'all').map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description="No bookings match your current filter selection."
            actionText="Reset Order Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPaymentFilter('all');
            }}
          />
        )}

        <div className="p-4 bg-white border-t border-slate-200/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

    </div>
  );
}
