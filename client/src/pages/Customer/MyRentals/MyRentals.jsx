import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  Calendar,
  Truck,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CUSTOMER_RENTALS } from '../../../data/customerMockData';
import { FEATURED_PRODUCTS } from '../../../data/mockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import RentalTimeline from '../../../components/CustomerLayout/RentalTimeline';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import { useAuth } from '../../../context/AuthContext';
import './MyRentals.css';

const TABS = ['All', 'Active', 'Return Scheduled', 'Completed', 'Cancelled'];

export default function MyRentals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedRental, setSelectedRental] = useState(null);
  const [docModal, setDocModal] = useState(null); // { type, id }
  const [rentals, setRentals] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');

    if (token) {
      fetch('/api/v1/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((resData) => {
          let list = [];
          if (resData.success) {
            list = resData.data?.results || resData.data?.rows || (Array.isArray(resData.data) ? resData.data : []);
          }

          const mapped = list.map((b) => ({
            id: b.id,
            orderId: b.bookingNumber || b.id?.slice(0, 8).toUpperCase(),
            title: b.items && b.items[0] && b.items[0].product ? b.items[0].product.name : 'Rental Equipment',
            category: b.items?.[0]?.product?.category?.name || 'Rental Equipment',
            image: b.items && b.items[0] && b.items[0].product ? (b.items[0].product.primaryImage || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80') : 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
            vendor: {
              id: b.vendorId,
              name: b.vendor ? b.vendor.businessName : 'Rentora Partner',
              city: b.vendor ? b.vendor.city : 'Ahmedabad',
              phone: b.vendor ? b.vendor.businessPhone : '+91 98250 12345',
              address: b.vendor ? b.vendor.businessAddress : 'Ahmedabad'
            },
            startDate: b.startDate,
            endDate: b.endDate,
            durationDays: b.totalRentalDays || 2,
            pickupTime: '10:00 AM',
            returnTime: '06:00 PM',
            handoverType: b.deliveryType === 'doorstep' ? 'Express Doorstep Delivery' : 'Store Self-Pickup',
            rentalAmount: Number(b.rentalSubtotal || b.rentalAmount || 0),
            securityDeposit: Number(b.securityDeposit || b.depositAmount || 0),
            deliveryFee: Number(b.deliveryFee || 0),
            discount: Number(b.discountAmount || 0),
            totalPaid: Number(b.totalPayable || b.totalAmount || 0),
            paymentStatus: b.paymentStatus || 'Paid',
            rentalStatus: b.status === 'BOOKING_CONFIRMED' ? 'Active' : (b.status || 'Active'),
            daysRemaining: 2,
            currentStep: 1,
            inspectionNote: 'Sanitized & calibrated before dispatch. Sealed in Pelican hard case.',
            rawBooking: b
          }));
          setRentals(mapped);
          setHasLoaded(true);
        })
        .catch(() => {
          setRentals([]);
          setHasLoaded(true);
        });
    } else {
      setRentals([]);
      setHasLoaded(true);
    }
  }, [user]);

  const displayList = hasLoaded ? rentals : CUSTOMER_RENTALS;

  // Extract unique vendors for filter dropdown
  const vendors = ['All', ...new Set(displayList.map((r) => r.vendor?.name).filter(Boolean))];

  // Filtering
  const filteredRentals = displayList.filter((r) => {
    // Tab filter
    if (activeTab !== 'All') {
      if (activeTab === 'Active' && r.rentalStatus !== 'Active' && r.rentalStatus !== 'BOOKING_CONFIRMED') return false;
      if (activeTab === 'Return Scheduled' && r.rentalStatus !== 'Return Scheduled') return false;
      if (activeTab === 'Completed' && r.rentalStatus !== 'Completed') return false;
      if (activeTab === 'Cancelled' && r.rentalStatus !== 'Cancelled') return false;
    }

    // Vendor filter
    if (selectedVendor !== 'All' && r.vendor?.name !== selectedVendor) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchOrder = r.orderId.toLowerCase().includes(q);
      const matchVendor = r.vendor?.name ? r.vendor.name.toLowerCase().includes(q) : false;
      return matchTitle || matchOrder || matchVendor;
    }

    return true;
  });

  return (
    <div className="my-rentals-page">
      {/* Header with Title & Stats */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">My Rentals</h1>
          <p className="page-sub-heading">
            Track active equipment custody, pickup milestones, and return timelines.
          </p>
        </div>
        <div className="rentals-stat-capsule">
          <div className="stat-capsule-item">
            <span className="stat-num">{displayList.length}</span>
            <span className="stat-lbl">Total Rentals</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-capsule-item">
            <span className="stat-num text-primary-red">
              {displayList.filter((r) => r.rentalStatus === 'Active' || r.rentalStatus === 'BOOKING_CONFIRMED' || r.rentalStatus === 'Return Scheduled').length}
            </span>
            <span className="stat-lbl">Active Now</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rentals-controls-bar">
        {/* Tabs */}
        <div className="rentals-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Vendor Filter */}
        <div className="search-filter-wrap">
          <div className="search-input-box">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search gear, order ID, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-select-box">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="vendor-select"
            >
              {vendors.map((v) => (
                <option key={v} value={v}>
                  {v === 'All' ? 'All Vendors' : v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      <div className="rentals-list-grid">
        {filteredRentals.length === 0 ? (
          <div className="empty-state-box">
            <Package size={48} className="text-slate-300 mb-3" />
            <h3 className="empty-title">No Rentals Found</h3>
            <p className="empty-sub">No rental records matched your search filters.</p>
            <button
              onClick={() => {
                setActiveTab('All');
                setSearchQuery('');
                setSelectedVendor('All');
              }}
              className="btn-reset-filters"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredRentals.map((rental) => (
            <div key={rental.id} className="rental-card-row">
              <div className="rental-card-img-wrap">
                <img src={rental.image} alt={rental.title} className="rental-card-img" />
                <span className="rental-category-badge">{rental.category}</span>
              </div>

              <div className="rental-card-info">
                <div className="rental-card-top">
                  <div className="rental-id-capsule">
                    <span className="font-mono">{rental.orderId}</span>
                  </div>
                  <RentalStatusBadge status={rental.rentalStatus} />
                  <RentalStatusBadge status={rental.paymentStatus} />
                </div>

                <h3 className="rental-card-title">{rental.title}</h3>

                <div className="rental-vendor-info">
                  <span className="text-slate-500">Provided by:</span>
                  <span className="font-semibold text-navy ml-1">{rental.vendor.name}</span>
                  <span className="text-slate-400 mx-1.5">&bull;</span>
                  <span className="text-slate-500">{rental.vendor.city}</span>
                </div>

                <div className="rental-metrics-row">
                  <div className="rental-meta-pill">
                    <Calendar size={14} className="text-primary-red" />
                    <span>{rental.startDate} &rarr; {rental.endDate} ({rental.durationDays} Days)</span>
                  </div>
                  <div className="rental-meta-pill">
                    <Truck size={14} className="text-secondary-blue" />
                    <span>{rental.handoverType}</span>
                  </div>
                </div>
              </div>

              <div className="rental-card-financials">
                <div className="financial-row">
                  <span className="fin-lbl">Rental Fee:</span>
                  <span className="fin-val font-semibold">₹{rental.rentalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="financial-row">
                  <span className="fin-lbl">Escrow Deposit:</span>
                  <span className="fin-val text-emerald-600 font-semibold">₹{rental.securityDeposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="financial-row total-paid-row">
                  <span className="fin-lbl">Total Paid:</span>
                  <span className="fin-val text-navy font-bold">₹{rental.totalPaid.toLocaleString('en-IN')}</span>
                </div>

                <div className="rental-cta-group">
                  <button
                    onClick={() => setSelectedRental(rental)}
                    className="btn-view-timeline"
                  >
                    Manage & Timeline
                  </button>
                  <div className="quick-docs-btns">
                    <button
                      onClick={() => setDocModal({ type: 'invoice', id: rental.orderId })}
                      className="btn-quick-doc"
                      title="View Invoice"
                    >
                      <FileText size={14} />
                      <span>Invoice</span>
                    </button>
                    <button
                      onClick={() => setDocModal({ type: 'contract', id: rental.orderId })}
                      className="btn-quick-doc"
                      title="View Contract"
                    >
                      <ShieldCheck size={14} />
                      <span>Contract</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Rental Drawer / Modal */}
      {selectedRental && (
        <div className="rental-drawer-backdrop" onClick={() => setSelectedRental(null)}>
          <div className="rental-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="drawer-order-id">{selectedRental.orderId}</div>
                <h2 className="drawer-title">{selectedRental.title}</h2>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="drawer-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Product & Status Bar */}
              <div className="drawer-product-bar">
                <img
                  src={selectedRental.image}
                  alt={selectedRental.title}
                  className="drawer-img"
                />
                <div className="drawer-prod-info">
                  <div className="flex items-center gap-2 mb-1">
                    <RentalStatusBadge status={selectedRental.rentalStatus} />
                    <RentalStatusBadge status={selectedRental.paymentStatus} />
                  </div>
                  <p className="drawer-vendor-line">
                    Vendor: <strong>{selectedRental.vendor.name}</strong>
                  </p>
                  <p className="drawer-contact-line">
                    <Phone size={13} className="inline mr-1 text-slate-400" />
                    {selectedRental.vendor.phone} &bull; {selectedRental.vendor.address}
                  </p>
                </div>
              </div>

              {/* 8-Step Rental Timeline */}
              <div className="drawer-section">
                <RentalTimeline currentStep={selectedRental.currentStep} />
              </div>

              {/* Inspection & Kit Notes */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Inspection & Handover Notes</h4>
                <div className="inspection-box">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="inspection-text">{selectedRental.inspectionNote}</p>
                </div>
              </div>

              {/* Handover & Return Details */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Logistics & Schedule</h4>
                <div className="logistics-grid">
                  <div className="logistics-card">
                    <span className="logistics-tag">Pickup & Handover</span>
                    <div className="logistics-time">{selectedRental.startDate}, {selectedRental.pickupTime}</div>
                    <div className="logistics-mode">{selectedRental.handoverType}</div>
                  </div>
                  <div className="logistics-card">
                    <span className="logistics-tag">Return & Inspection</span>
                    <div className="logistics-time">{selectedRental.endDate}, {selectedRental.returnTime}</div>
                    <div className="logistics-mode">Return Verification by Vendor</div>
                  </div>
                </div>
              </div>

              {/* Document Downloads */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Legal & Billing Documents</h4>
                <div className="docs-download-grid">
                  <button
                    onClick={() => setDocModal({ type: 'invoice', id: selectedRental.orderId })}
                    className="doc-tile-btn"
                  >
                    <FileText size={18} className="text-primary-red" />
                    <div className="doc-tile-text">
                      <span className="doc-tile-name">Tax Invoice</span>
                      <span className="doc-tile-sub">INV-{selectedRental.orderId.replace('REN-', '')}</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 ml-auto" />
                  </button>

                  <button
                    onClick={() => setDocModal({ type: 'contract', id: selectedRental.orderId })}
                    className="doc-tile-btn"
                  >
                    <ShieldCheck size={18} className="text-secondary-blue" />
                    <div className="doc-tile-text">
                      <span className="doc-tile-name">Rental Agreement</span>
                      <span className="doc-tile-sub">Signed & Escrow Protected</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Payment & Escrow Summary</h4>
                <div className="breakdown-table">
                  <div className="bd-row">
                    <span>Base Rental ({selectedRental.durationDays} Days)</span>
                    <span>₹{selectedRental.rentalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bd-row">
                    <span>Refundable Security Deposit (in Escrow)</span>
                    <span className="text-emerald-600 font-semibold">₹{selectedRental.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedRental.deliveryFee > 0 && (
                    <div className="bd-row">
                      <span>Delivery & Setup</span>
                      <span>₹{selectedRental.deliveryFee}</span>
                    </div>
                  )}
                  {selectedRental.discount > 0 && (
                    <div className="bd-row text-emerald-600">
                      <span>Promo Discount Applied</span>
                      <span>-₹{selectedRental.discount}</span>
                    </div>
                  )}
                  <div className="bd-row bd-total">
                    <span>Total Amount Paid</span>
                    <span>₹{selectedRental.totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                onClick={() => setSelectedRental(null)}
                className="btn-drawer-close"
              >
                Close Drawer
              </button>
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
