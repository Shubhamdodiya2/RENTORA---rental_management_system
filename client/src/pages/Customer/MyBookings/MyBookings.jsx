import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Receipt,
  Star,
  Sparkles,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../../services/api';
import { CUSTOMER_RENTALS } from '../../../data/customerMockData';
import { FEATURED_PRODUCTS } from '../../../data/mockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import { useAuth } from '../../../context/AuthContext';
import './MyBookings.css';

export default function MyBookings() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Review Modal State
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

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
            productId: b.items?.[0]?.productId || b.items?.[0]?.product?.id,
            title: b.items && b.items[0] && b.items[0].product ? b.items[0].product.name : 'Rental Equipment',
            category: b.items?.[0]?.product?.category?.name || 'Rental Equipment',
            image: b.items && b.items[0] && b.items[0].product ? (b.items[0].product.primaryImage || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80') : 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
            vendor: {
              id: b.vendorId,
              name: b.vendor ? b.vendor.businessName : 'Rentora Partner',
              city: b.vendor ? b.vendor.city : 'Ahmedabad'
            },
            startDate: b.startDate,
            endDate: b.endDate,
            durationDays: b.totalRentalDays || 2,
            pickupTime: '10:00 AM',
            returnTime: '06:00 PM',
            totalBilled: Number(b.totalPayable || b.totalAmount || 0),
            totalPaid: Number(b.totalPayable || b.totalAmount || 0),
            securityDeposit: Number(b.securityDeposit || b.depositAmount || 0),
            paymentStatus: b.paymentStatus || 'Paid',
            rentalStatus: b.status === 'BOOKING_CONFIRMED' ? 'Active' : (b.status || 'Active'),
            status: b.status === 'BOOKING_CONFIRMED' ? 'Active' : (b.status || 'Active'),
            rawBooking: b
          }));
          setBookings(mapped);
          setHasLoaded(true);
        })
        .catch(() => {
          setBookings([]);
          setHasLoaded(true);
        });
    } else {
      setBookings([]);
      setHasLoaded(true);
    }
  }, [user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTarget || !reviewTarget.productId) {
      setReviewError('Product information missing for this booking');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 3) {
      setReviewError('Please enter at least a few words describing your experience');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      await api.post(`/reviews/products/${reviewTarget.productId}`, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        bookingId: reviewTarget.id
      });
      setReviewSuccess('Review published successfully! Thank you for rating.');
      setTimeout(() => {
        setReviewTarget(null);
        setReviewSuccess('');
        setReviewTitle('');
        setReviewComment('');
      }, 1500);
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayList = hasLoaded ? bookings : CUSTOMER_RENTALS;

  const filteredBookings = displayList.filter((b) => {
    if (statusFilter !== 'All' && b.rentalStatus !== statusFilter && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.orderId.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        (b.vendor?.name && b.vendor.name.toLowerCase().includes(q))
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
                          onClick={() => {
                            setReviewTarget(booking);
                            setReviewRating(5);
                            setReviewTitle('');
                            setReviewComment('');
                            setReviewError('');
                            setReviewSuccess('');
                          }}
                          className="action-icon-btn text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Rate & Review Gear"
                        >
                          <Star size={15} fill="currentColor" />
                        </button>
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

      {/* Rate & Review Modal */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1D3557] text-base font-['Sora']">Rate & Review Rental</h4>
                  <p className="text-[11px] text-[#457B9D]">{reviewTarget.title} • Order #{reviewTarget.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h5 className="font-bold text-base">Review Published!</h5>
                <p className="text-xs">{reviewSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Star Selector */}
                <div className="text-center space-y-1 py-2 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40">
                  <label className="text-xs font-bold text-[#1D3557] block">
                    Your Overall Rating *
                  </label>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={30}
                          fill={(reviewHoverRating || reviewRating) >= star ? 'currentColor' : 'none'}
                          className={(reviewHoverRating || reviewRating) >= star ? 'text-amber-400' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-[#E63946] pt-1">
                    {reviewRating === 5 && 'Outstanding & Flawless ★★★★★'}
                    {reviewRating === 4 && 'Very Good Equipment ★★★★☆'}
                    {reviewRating === 3 && 'Average Experience ★★★☆☆'}
                    {reviewRating === 2 && 'Below Expectations ★★☆☆☆'}
                    {reviewRating === 1 && 'Unsatisfactory ★☆☆☆☆'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Review Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Pristine condition, worked seamlessly!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Your Detailed Review *
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    placeholder="How was the equipment condition, sound/performance, battery, and handover?"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewTarget(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 rounded-xl bg-[#E63946] text-white text-xs font-bold hover:bg-[#D62839] transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
