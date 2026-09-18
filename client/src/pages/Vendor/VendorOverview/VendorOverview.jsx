import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  ClipboardList,
  Wallet,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Plus,
  Compass,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import { VENDOR_CHARTS, VENDOR_METRICS } from '../../../data/vendorMockData';
import './VendorOverview.css';

export default function VendorOverview() {
  const { products, orders, vendorProfile } = useVendor();
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Compute live stats
  const activeProducts = products.filter((p) => p.status === 'Active' || p.status === 'PUBLISHED').length;
  const lowStockProducts = products.filter((p) => (p.availableStock !== undefined ? p.availableStock <= (p.minStockAlert || 1) : false)).length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing' || o.status === 'BOOKING_CONFIRMED' || o.status === 'CONFIRMED').length;

  const totalRevenueNum = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.rentalAmount || 0), 0);
  const totalRevenueFormatted = `₹${totalRevenueNum.toLocaleString('en-IN')}`;

  const pendingPayoutNum = orders
    .filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Active' || o.status === 'BOOKING_CONFIRMED')
    .reduce((sum, o) => sum + Number(o.rentalAmount || 0), 0);
  const pendingPayoutFormatted = `₹${pendingPayoutNum.toLocaleString('en-IN')}`;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'All' && o.orderStatus !== orderFilter && o.status !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.product?.name && o.product.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const maxRevenue = Math.max(10000, ...VENDOR_CHARTS.monthlyRevenue.map((d) => d.revenue));

  return (
    <div className="vendor-overview-page">
      {/* Welcome Top Banner */}
      <div className="vendor-welcome-banner">
        <div className="v-welcome-left">
          <div className="v-verified-badge">
            <Sparkles size={14} className="text-amber-300" />
            <span>{vendorProfile.verifiedBadge || 'Rentora Verified Vendor'} &bull; Store Rating {vendorProfile.rating || 4.9} ★</span>
          </div>
          <h1 className="v-welcome-heading">Welcome, {vendorProfile.vendorName || 'Store Owner'}! 👋</h1>
          <p className="v-welcome-sub">
            Here is your live rental operations pulse for <strong>{vendorProfile.businessName}</strong>.
          </p>

          <div className="v-welcome-actions">
            <Link to="/vendor/products/add" className="btn-v-primary">
              <Plus size={16} />
              <span>Add New Equipment</span>
            </Link>
            <Link to="/vendor/orders" className="btn-v-secondary">
              <ClipboardList size={16} />
              <span>Manage Active Orders</span>
            </Link>
            <Link to="/vendor/quotations/create" className="btn-v-secondary">
              <Plus size={16} />
              <span>Create Quotation</span>
            </Link>
          </div>
        </div>

        <div className="v-welcome-right">
          <div className="v-earnings-capsule">
            <span className="v-earn-label">Store Revenue</span>
            <span className="v-earn-value">{totalRevenueFormatted}</span>
            <span className="v-earn-trend text-emerald-300">
              <TrendingUp size={13} className="inline mr-1" />
              Live Ledger Balance
            </span>
          </div>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="vendor-stats-grid">
        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Total Products</span>
            <div className="v-stat-icon bg-navy-light">
              <Package size={20} className="text-navy" />
            </div>
          </div>
          <div className="v-stat-val">{products.length}</div>
          <div className="v-stat-footer">
            <span className="text-slate-500 font-medium">{activeProducts} live on catalog</span>
            <Link to="/vendor/products" className="v-stat-link">View &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Active Products</span>
            <div className="v-stat-icon bg-emerald-light">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className="v-stat-val text-emerald-600">{activeProducts}</div>
          <div className="v-stat-footer">
            <span className="text-emerald-600 font-semibold">{products.length > 0 ? `${Math.round((activeProducts / products.length) * 100)}% available` : '0 listed'}</span>
            <Link to="/vendor/products" className="v-stat-link">Catalog &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Pending Orders</span>
            <div className="v-stat-icon bg-blue-light">
              <ClipboardList size={20} className="text-secondary-blue" />
            </div>
          </div>
          <div className="v-stat-val text-secondary-blue">{pendingOrders}</div>
          <div className="v-stat-footer">
            <span className="text-amber-600 font-semibold">{pendingOrders > 0 ? 'Require dispatch' : 'All clear'}</span>
            <Link to="/vendor/orders" className="v-stat-link">Fulfill &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Total Revenue</span>
            <div className="v-stat-icon bg-coral-light">
              <Wallet size={20} className="text-primary-red" />
            </div>
          </div>
          <div className="v-stat-val text-primary-red">{totalRevenueFormatted}</div>
          <div className="v-stat-footer">
            <span className="text-emerald-600 font-semibold">{orders.length} total orders</span>
            <Link to="/vendor/reports" className="v-stat-link">Analytics &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Low Stock Alert</span>
            <div className="v-stat-icon bg-amber-light">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
          </div>
          <div className="v-stat-val text-amber-600">{lowStockProducts}</div>
          <div className="v-stat-footer">
            <span className="text-amber-700 font-medium">Re-stock or adjust units</span>
            <Link to="/vendor/inventory" className="v-stat-link">Stock &rarr;</Link>
          </div>
        </div>

        <div className="v-stat-card">
          <div className="v-stat-header">
            <span className="v-stat-title">Pending Escrow Payout</span>
            <div className="v-stat-icon bg-aqua-light">
              <CreditCard size={20} className="text-secondary-blue" />
            </div>
          </div>
          <div className="v-stat-val text-navy">{pendingPayoutFormatted}</div>
          <div className="v-stat-footer">
            <span className="text-slate-500 font-medium">Settles after return check</span>
            <Link to="/vendor/payments" className="v-stat-link">Ledger &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Analytics & Performance Charts Grid */}
      <div className="v-charts-grid">
        {/* Left Chart: Revenue Overview */}
        <div className="v-card-box v-chart-card">
          <div className="v-card-hdr">
            <div>
              <h3 className="v-card-title">Monthly Rental Revenue Trajectory</h3>
              <p className="v-card-sub">Gross earnings from completed equipment reservations</p>
            </div>
            <div className="v-chart-badge">FY 2026-27</div>
          </div>

          <div className="v-bar-chart-container">
            {VENDOR_CHARTS.monthlyRevenue.map((d) => {
              const heightPct = Math.round((d.revenue / maxRevenue) * 100);
              const isCurrent = d.month === 'Sep';
              return (
                <div key={d.month} className="v-bar-col">
                  <div className="v-bar-tooltip">
                    ₹{d.revenue.toLocaleString('en-IN')} ({d.orders} orders)
                  </div>
                  <div className="v-bar-track">
                    <div
                      className={`v-bar-fill ${isCurrent ? 'v-bar-current' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`v-bar-month ${isCurrent ? 'v-month-bold' : ''}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chart: Category Distribution */}
        <div className="v-card-box v-chart-side-card">
          <div className="v-card-hdr">
            <div>
              <h3 className="v-card-title">Revenue by Equipment Category</h3>
              <p className="v-card-sub">Performance share across inventory classes</p>
            </div>
          </div>

          <div className="v-cat-breakdown-list">
            {VENDOR_CHARTS.categoryShare.map((cat, idx) => (
              <div key={idx} className="v-cat-item">
                <div className="v-cat-top-row">
                  <span className="v-cat-name font-semibold text-navy text-sm">{cat.category}</span>
                  <span className="v-cat-val font-bold text-sm text-primary-red">{cat.amount}</span>
                </div>
                <div className="v-cat-bar-bg">
                  <div
                    className="v-cat-bar-fill"
                    style={{
                      width: `${cat.share}%`,
                      backgroundColor: idx === 0 ? '#E63946' : idx === 1 ? '#457B9D' : idx === 2 ? '#1D3557' : '#A8DADC'
                    }}
                  />
                </div>
                <div className="v-cat-sub-share">{cat.share}% of total rental volume</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="v-card-box">
        <div className="v-card-hdr flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="v-card-title">Recent Rental Orders & Bookings</h3>
            <p className="v-card-sub">Monitor upcoming customer dispatches and returns</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Pills */}
            <div className="v-status-filter-pills">
              {['All', 'Active', 'Confirmed', 'Processing', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`v-filter-pill-btn ${orderFilter === st ? 'v-pill-active' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Link to="/vendor/orders" className="btn-v-view-all">
              <span>View All ({orders.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Rental Dates</th>
                <th>Total Billed</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="v-table-row">
                    <td>
                      <span className="font-mono font-bold text-navy text-xs bg-slate-100 px-2 py-1 rounded">
                        {o.orderId}
                      </span>
                    </td>
                    <td>
                      <div className="v-cust-cell">
                        <img src={(o.customer?.avatar && !o.customer.avatar.includes('photo-1534528741775-53994a69daeb')) ? o.customer.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(o.customer?.name || 'Customer')}&background=1D3557&color=ffffff&bold=true`} alt={o.customer?.name || 'Customer'} className="v-cust-thumb" />
                        <div>
                          <div className="v-cust-name font-semibold text-navy text-xs">{o.customer?.name || 'Customer'}</div>
                          <div className="text-[11px] text-slate-400">{o.customer?.city || 'Ahmedabad'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="v-prod-cell">
                        <img src={o.product?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'} alt={o.product?.name || 'Item'} className="v-prod-thumb" />
                        <div>
                          <div className="v-prod-name text-xs font-semibold text-navy">{o.product?.name || 'Equipment'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {o.product?.sku || 'SKU-001'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600 font-medium">
                        {o.startDate} &rarr; {o.endDate}
                      </span>
                      <div className="text-[10px] text-slate-400">{o.durationDays} Days Duration</div>
                    </td>
                    <td>
                      <div className="font-bold text-navy text-xs">
                        ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-600">
                        (₹{o.securityDeposit || 0} Escrow)
                      </div>
                    </td>
                    <td>
                      <span
                        className={`v-status-badge ${
                          o.orderStatus === 'Active'
                            ? 'status-active'
                            : o.orderStatus === 'Confirmed'
                            ? 'status-confirmed'
                            : o.orderStatus === 'Processing'
                            ? 'status-processing'
                            : 'status-completed'
                        }`}
                      >
                        {o.orderStatus || 'Confirmed'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="btn-v-action-view"
                        title="View Order Details"
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No rental orders received yet. Once customers reserve your equipment, new bookings will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Quick View Modal */}
      {selectedOrder && (
        <div className="v-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="v-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{selectedOrder.orderId}</span>
                <h3 className="text-base font-bold text-navy mt-0.5">Order Overview & Dispatch</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body">
              <div className="v-modal-prod-strip">
                <img src={selectedOrder.product.image} alt={selectedOrder.product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-navy text-sm">{selectedOrder.product.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">SKU: {selectedOrder.product.sku}</p>
                  <p className="text-xs font-semibold text-secondary-blue mt-1">{selectedOrder.rentalPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Customer Name:</span>
                  <span className="font-bold text-navy">{selectedOrder.customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone:</span>
                  <span className="font-bold text-navy">{selectedOrder.customer.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Handover Mode & Address:</span>
                  <span className="font-semibold text-navy">{selectedOrder.handoverType} &bull; {selectedOrder.customer.address}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Special Instructions:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            <div className="v-modal-footer">
              <Link
                to={`/vendor/orders`}
                onClick={() => setSelectedOrder(null)}
                className="btn-v-primary"
              >
                Go to Full Orders Management &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
