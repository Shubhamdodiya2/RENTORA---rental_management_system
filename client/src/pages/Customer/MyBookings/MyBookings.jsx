import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarCheck,
  RotateCcw,
  Eye,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { CUSTOMER_RENTALS } from '../../../data/customerMockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './MyBookings.css';

export default function MyBookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);

  const filteredBookings = CUSTOMER_RENTALS.filter((b) => {
    if (statusFilter !== 'All' && b.rentalStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.orderId.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.vendor.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="my-bookings-page">
      {/* Header */}
      <div className="bookings-header-row">
        <div>
          <h1 className="page-main-heading">Booking History</h1>
          <p className="page-sub-heading">
            View all confirmed rental reservations, past orders, and instant re-booking.
          </p>
        </div>
        <Link to="/products" className="btn-explore-link">
          + Make New Booking
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bookings-filters-bar">
        <div className="search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, gear, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bookings-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="search-clear-btn">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="status-filter-group">
          {['All', 'Active', 'Return Scheduled', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`status-pill-btn ${statusFilter === st ? 'pill-active' : ''}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bookings-table-container">
        {filteredBookings.length === 0 ? (
          <div className="bookings-empty-state">
            <CalendarCheck size={48} className="text-slate-300 mb-3" />
            <h3>No Bookings Found</h3>
            <p>No booking records matched your search or status criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="btn-reset-filters"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="bookings-full-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Rental Item</th>
                  <th>Vendor & City</th>
                  <th>Rental Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="booking-table-row">
                    <td>
                      <span className="font-mono font-bold text-navy text-sm">
                        {booking.orderId}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {booking.durationDays} Days Rental
                      </div>
                    </td>
                    <td>
                      <div className="table-gear-cell">
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="table-gear-img"
                        />
                        <div className="table-gear-meta">
                          <span className="table-gear-title">{booking.title}</span>
                          <span className="table-gear-cat">{booking.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-vendor-cell">
                        <span className="font-semibold text-navy text-sm">
                          {booking.vendor.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {booking.vendor.city}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-dates-cell">
                        <span className="text-xs font-semibold text-navy">
                          {booking.startDate} &rarr; {booking.endDate}
                        </span>
                        <span className="text-xs text-slate-500">
                          {booking.pickupTime}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-amount-cell">
                        <span className="font-bold text-navy text-sm">
                          ₹{booking.totalPaid.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-emerald-600 font-medium">
                          (₹{booking.securityDeposit} Escrow)
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 items-start">
                        <RentalStatusBadge status={booking.rentalStatus} size="small" />
                        <RentalStatusBadge status={booking.paymentStatus} size="small" />
                      </div>
                    </td>
                    <td>
                      <div className="table-actions-group">
                        <button
                          onClick={() => setSelectedDoc({ type: 'invoice', id: booking.orderId })}
                          className="action-icon-btn"
                          title="View Invoice"
                        >
                          <Receipt size={15} />
                        </button>
                        <Link
                          to="/products"
                          className="action-rebook-btn"
                          title="Rent this item again"
                        >
                          <RotateCcw size={13} />
                          <span>Rebook</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
