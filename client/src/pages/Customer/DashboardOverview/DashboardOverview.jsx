import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CalendarClock,
  CalendarCheck,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertCircle,
  Truck,
  TrendingUp,
  FileText,
  Eye,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  CUSTOMER_PROFILE,
  CUSTOMER_METRICS,
  CUSTOMER_RENTALS,
  CUSTOMER_NOTIFICATIONS,
  SPENDING_CHART_DATA
} from '../../../data/customerMockData';
import { FEATURED_PRODUCTS } from '../../../data/mockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './DashboardOverview.css';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeRentalDetail, setActiveRentalDetail] = useState(null);
  const [liveBookings, setLiveBookings] = useState([]);
  const [liveInvoices, setLiveInvoices] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  const customerName = user?.fullName || user?.name || 'Customer';
  const firstName = customerName.split(' ')[0] || 'Customer';

  useEffect(() => {
    const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');
    if (token) {
      Promise.all([
        fetch('/api/v1/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json())
          .catch(() => null),
        fetch('/api/v1/invoices/my', { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json())
          .catch(() => null)
      ]).then(([bRes, iRes]) => {
        if (bRes && bRes.success && Array.isArray(bRes.data)) {
          setLiveBookings(bRes.data);
        }
        if (iRes && iRes.success && Array.isArray(iRes.data)) {
          setLiveInvoices(iRes.data);
        }
        setHasFetched(true);
      });
    } else {
      setHasFetched(true);
    }
  }, [user]);

  // Derived metrics
  const isNewCustomer = hasFetched && user && liveBookings.length === 0;

  const displayBookings = liveBookings.length > 0
    ? liveBookings.map((b) => ({
        id: b.id,
        orderId: b.bookingNumber || b.id.slice(0, 8).toUpperCase(),
        title: b.items && b.items[0] ? (b.items[0].product ? b.items[0].product.name : 'Rental Gear') : 'Rental Gear',
        image: b.items && b.items[0] && b.items[0].product ? (b.items[0].product.primaryImage || FEATURED_PRODUCTS[0].images[0]) : FEATURED_PRODUCTS[0].images[0],
        vendor: {
          id: b.vendorId,
          name: b.vendor ? b.vendor.businessName : 'Rentora Store',
          city: b.vendor ? b.vendor.city : 'Ahmedabad'
        },
        startDate: b.startDate,
        endDate: b.endDate,
        durationDays: b.totalRentalDays || 2,
        rentalAmount: Number(b.rentalSubtotal || 0),
        securityDeposit: Number(b.securityDeposit || 0),
        totalPaid: Number(b.totalPayable || 0),
        paymentStatus: b.paymentStatus || 'Pending',
        rentalStatus: b.status === 'BOOKING_CONFIRMED' ? 'Active' : b.status,
        daysRemaining: 2,
        currentStep: 1,
        rawBooking: b
      }))
    : isNewCustomer
    ? []
    : CUSTOMER_RENTALS;

  const activeRentals = displayBookings.filter(
    (r) => r.rentalStatus === 'Active' || r.rentalStatus === 'BOOKING_CONFIRMED' || r.rentalStatus === 'Return Scheduled'
  );

  const upcomingReturns = displayBookings.filter(
    (r) => r.daysRemaining > 0 && r.daysRemaining <= 2
  );

  const totalSpent = isNewCustomer
    ? 0
    : liveInvoices.length > 0
    ? liveInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0)
    : 24850;

  const escrowDeposit = isNewCustomer
    ? 0
    : liveBookings.length > 0
    ? liveBookings.reduce((acc, b) => acc + Number(b.securityDeposit || 0), 0)
    : 9000;

  const maxSpend = Math.max(...SPENDING_CHART_DATA.map((d) => d.amount));

  return (
    <div className="dashboard-overview-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-badge">
            <ShieldCheck size={16} />
            <span>KYC Verified &bull; Rentora Prime Access</span>
          </div>
          <h1 className="welcome-title">Welcome back, {firstName}! 👋</h1>
          <p className="welcome-subtitle">
            Manage your rentals, bookings, upcoming returns, and invoices all from one central dashboard.
          </p>
          <div className="welcome-actions">
            <Link to="/products" className="welcome-btn-primary">
              <Compass size={18} />
              <span>Explore Products</span>
            </Link>
            <Link to="/customer/rentals" className="welcome-btn-secondary">
              <Package size={18} />
              <span>View All Rentals</span>
            </Link>
          </div>
        </div>
        <div className="welcome-graphic">
          <div className="escrow-pill">
            <span className="escrow-label">Security Deposit in Escrow</span>
            <span className="escrow-val">₹{escrowDeposit.toLocaleString('en-IN')}</span>
            <span className="escrow-sub">100% Protected by Rentora SafePay</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Rentals</span>
            <div className="metric-icon-box bg-coral-light">
              <Package size={22} className="text-primary-red" />
            </div>
          </div>
          <div className="metric-value">{activeRentals.length}</div>
          <div className="metric-footer">
            <span className="metric-footer-text text-emerald-600 font-medium">{activeRentals.length} items in custody</span>
            <Link to="/customer/rentals" className="metric-link">Manage &rarr;</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Upcoming Returns</span>
            <div className="metric-icon-box bg-amber-light">
              <CalendarClock size={22} className="text-amber-600" />
            </div>
          </div>
          <div className="metric-value">{upcomingReturns.length}</div>
          <div className="metric-footer">
            <span className="metric-footer-text text-amber-600 font-medium">Due in &le; 48 hours</span>
            <Link to="/customer/pickup-returns" className="metric-link">Schedules &rarr;</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Bookings</span>
            <div className="metric-icon-box bg-blue-light">
              <CalendarCheck size={22} className="text-navy" />
            </div>
          </div>
          <div className="metric-value">{displayBookings.length}</div>
          <div className="metric-footer">
            <span className="metric-footer-text text-slate-500">100% On-time returns</span>
            <Link to="/customer/bookings" className="metric-link">History &rarr;</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Rental Spending</span>
            <div className="metric-icon-box bg-aqua-light">
              <Wallet size={22} className="text-secondary-blue" />
            </div>
          </div>
          <div className="metric-value">₹{totalSpent.toLocaleString('en-IN')}</div>
          <div className="metric-footer">
            <span className="metric-footer-text text-emerald-600 font-medium">Verified Ledger</span>
            <Link to="/customer/payments" className="metric-link">Ledger &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Rentals & Returns Due */}
      <div className="dashboard-sections-grid">
        {/* Left Column: Currently Rented */}
        <div className="dashboard-main-col">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">Currently Rented</h2>
                <p className="section-card-sub">Active rental gear under your subscription and custody</p>
              </div>
              <Link to="/customer/rentals" className="section-link">
                <span>View All ({activeRentals.length})</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="active-rentals-list">
              {activeRentals.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-[#1D3557]">No active rentals currently</p>
                  <p className="text-xs text-slate-500 mt-0.5">Explore our marketplace catalog to rent cameras, drones, laptops and more.</p>
                  <Link to="/products" className="inline-block mt-3 px-4 py-2 bg-[#E63946] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#D62839]">
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                activeRentals.map((rental) => (
                  <div key={rental.id} className="active-rental-item">
                    <img src={rental.image} alt={rental.title} className="active-rental-thumb" />
                    <div className="active-rental-details">
                      <div className="rental-top-row">
                        <span className="rental-order-id">{rental.orderId}</span>
                        <RentalStatusBadge status={rental.rentalStatus} />
                      </div>
                      <h3 className="active-rental-name">{rental.title}</h3>
                      <div className="active-rental-vendor">
                        <span>Vendor: <strong>{rental.vendor.name}</strong> ({rental.vendor.city})</span>
                      </div>

                      <div className="rental-dates-strip">
                        <div className="rental-date-item">
                          <span className="date-lbl">Start:</span>
                          <span className="date-val">{rental.startDate}</span>
                        </div>
                        <div className="date-arrow">&rarr;</div>
                        <div className="rental-date-item">
                          <span className="date-lbl">Return:</span>
                          <span className="date-val">{rental.endDate}</span>
                        </div>
                        <div className="rental-amount-pill">
                          ₹{rental.rentalAmount.toLocaleString('en-IN')} / {rental.durationDays}d
                        </div>
                      </div>
                    </div>

                    <div className="active-rental-actions">
                      <button
                        onClick={() => setSelectedDoc({ type: 'invoice', id: rental.orderId, data: rental.rawBooking })}
                        className="btn-doc-link"
                      >
                        <FileText size={15} />
                        <span>Invoice</span>
                      </button>
                      <Link
                        to="/customer/rentals"
                        className="btn-details-link"
                      >
                        <Eye size={15} />
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings Activity */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">Recent Bookings</h2>
                <p className="section-card-sub">Latest transactions and rental reservations</p>
              </div>
              <Link to="/customer/bookings" className="section-link">
                <span>All Bookings ({displayBookings.length})</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="table-responsive">
              {displayBookings.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CalendarCheck size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-[#1D3557]">No bookings recorded yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your confirmed bookings will appear here in real time.</p>
                </div>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order Ref</th>
                      <th>Product & Vendor</th>
                      <th>Rental Dates</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBookings.slice(0, 4).map((b) => (
                      <tr key={b.id}>
                        <td className="font-mono font-semibold text-slate-700">{b.orderId}</td>
                        <td>
                          <div className="tbl-product-cell">
                            <span className="tbl-product-name">{b.title}</span>
                            <span className="tbl-vendor-name">{b.vendor.name}</span>
                          </div>
                        </td>
                        <td className="text-sm text-slate-600">{b.startDate} - {b.endDate}</td>
                        <td className="font-semibold text-navy">₹{b.totalPaid.toLocaleString('en-IN')}</td>
                        <td>
                          <RentalStatusBadge status={b.rentalStatus} size="small" />
                        </td>
                        <td>
                          <Link to="/customer/bookings" className="tbl-action-btn">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Returns & Spending Analytics */}
        <div className="dashboard-side-col">
          {/* Upcoming Returns Alert Box */}
          <div className="section-card urgent-returns-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title flex items-center gap-2">
                  <CalendarClock size={20} className="text-amber-600" />
                  <span>Upcoming Returns</span>
                </h2>
                <p className="section-card-sub">Gear scheduled for pickup/drop-off soon</p>
              </div>
            </div>

            <div className="returns-due-list">
              {upcomingReturns.map((item) => (
                <div key={item.id} className="return-due-card">
                  <div className="return-due-badge">
                    <Clock size={14} />
                    <span>{item.daysRemaining === 1 ? 'Due Tomorrow' : `Due in ${item.daysRemaining} Days`}</span>
                  </div>
                  <h4 className="return-due-title">{item.title}</h4>
                  <div className="return-due-meta">
                    <div>
                      <span className="meta-lbl">Return Date:</span>
                      <span className="meta-val font-semibold">{item.endDate} ({item.returnTime})</span>
                    </div>
                    <div>
                      <span className="meta-lbl">Vendor:</span>
                      <span className="meta-val">{item.vendor.name}</span>
                    </div>
                  </div>
                  <div className="return-due-actions">
                    <Link to="/customer/pickup-returns" className="btn-schedule-return">
                      <Truck size={15} />
                      <span>View Return Instructions</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Analytics */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title flex items-center gap-2">
                  <TrendingUp size={20} className="text-secondary-blue" />
                  <span>Spending Analytics</span>
                </h2>
                <p className="section-card-sub">Monthly rental spend trajectory</p>
              </div>
            </div>

            <div className="spending-summary-stats">
              <div className="spend-stat">
                <span className="spend-stat-lbl">This Month (Sep)</span>
                <span className="spend-stat-val text-primary-red">{CUSTOMER_METRICS.thisMonthSpending}</span>
              </div>
              <div className="spend-divider" />
              <div className="spend-stat">
                <span className="spend-stat-lbl">Last Month (Aug)</span>
                <span className="spend-stat-val text-navy">{CUSTOMER_METRICS.lastMonthSpending}</span>
              </div>
            </div>

            {/* Custom Bar Graph */}
            <div className="spending-bar-chart">
              {SPENDING_CHART_DATA.map((item) => {
                const heightPct = Math.round((item.amount / maxSpend) * 100);
                const isCurrent = item.month === 'Sep';
                return (
                  <div key={item.month} className="chart-bar-group">
                    <div className="chart-bar-tooltip">₹{item.amount.toLocaleString('en-IN')}</div>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar-fill ${isCurrent ? 'bar-current' : ''}`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`chart-month-lbl ${isCurrent ? 'font-bold text-navy' : ''}`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SafePay Guarantee Card */}
          <div className="safepay-card">
            <div className="safepay-icon">
              <ShieldCheck size={28} className="text-primary-red" />
            </div>
            <div className="safepay-content">
              <h4>Rentora SafePay Protection</h4>
              <p>Your security deposits remain locked in RBI-compliant escrow until item return & inspection confirmation.</p>
              <Link to="/customer/contracts" className="safepay-link">
                <span>View Rental Contracts</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You Section */}
      <div className="recommended-section">
        <div className="section-card-header">
          <div>
            <div className="badge-pill-inline">
              <Sparkles size={14} className="text-amber-500" />
              <span>Recommended Gear</span>
            </div>
            <h2 className="section-card-title mt-1">Recommended for Your Next Project</h2>
            <p className="section-card-sub">Handpicked pro gear tailored for your creative workflow</p>
          </div>
          <Link to="/products" className="section-link">
            <span>Browse All Marketplace</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="recommended-grid">
          {FEATURED_PRODUCTS.slice(0, 3).map((product) => {
            const prodImg = product.images?.[0] || product.image || '';
            const prodTitle = product.title || product.name || 'Rental Gear';
            const vendorName = typeof product.vendor === 'object' ? product.vendor.name : (product.vendor || 'Rentora Partner');
            const vendorCity = typeof product.vendor === 'object' ? product.vendor.city : (product.location || 'Gujarat');

            return (
              <div key={product.id} className="recommended-card">
                <div className="rec-img-wrap">
                  <img src={prodImg} alt={prodTitle} className="rec-img" />
                  <span className="rec-badge">{product.category}</span>
                </div>
                <div className="rec-content">
                  <h4 className="rec-title">{prodTitle}</h4>
                  <div className="rec-vendor">By {vendorName} &bull; {vendorCity}</div>
                  <div className="rec-bottom">
                    <div className="rec-price">
                      <span className="rec-rate">₹{product.pricePerDay}</span>
                      <span className="rec-unit">/ day</span>
                    </div>
                    <Link to={`/products/${product.id}`} className="rec-cta">
                      Rent Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Universal Document Modal */}
      {selectedDoc && (
        <DocumentModal
          type={selectedDoc.type}
          docId={selectedDoc.id}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
