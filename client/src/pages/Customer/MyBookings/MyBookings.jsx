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
  AlertCircle,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Clock,
  Tag,
  ShieldCheck,
  Lock,
  Smartphone,
  X
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

  // Pay Modal State
  const [payTarget, setPayTarget] = useState(null);
  const [payUtr, setPayUtr] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Review Modal State
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadMyBookings = () => {
    const token = sessionStorage.getItem('rentora_token');
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

          const mapped = list.map((b) => {
            let isQuotation = false;
            try {
              const meta = JSON.parse(b.rentalNotes || '{}');
              if (meta.isQuotationOrder || meta.quotationId || (typeof b.rentalNotes === 'string' && b.rentalNotes.includes('Quotation #'))) {
                isQuotation = true;
              }
            } catch (e) {
              if (typeof b.rentalNotes === 'string' && b.rentalNotes.includes('Quotation #')) isQuotation = true;
            }

            // Normal marketplace checkouts collected payment during checkout, so they are Paid.
            // Quotations require vendor acceptance and customer payment via Pay Now.
            let normalizedPaymentStatus = 'Paid';
            if (isQuotation) {
              const rawPaymentStatus = b.order?.paymentStatus || b.paymentStatus;
              normalizedPaymentStatus = (rawPaymentStatus === 'Success' || rawPaymentStatus === 'Paid') ? 'Paid' : 'Pending';
            }

            const firstItem = b.items && b.items[0];
            const prod = firstItem?.product;
            let realImg = prod?.primaryImage;
            if (!realImg && prod?.images && prod.images.length > 0) {
              const pImg = prod.images.find((i) => i.isPrimary) || prod.images[0];
              realImg = typeof pImg === 'string' ? pImg : pImg?.imageUrl;
            }
            if (!realImg && (prod?.name || b.rentalNotes)) {
              const lowerName = (prod?.name || b.rentalNotes || '').toLowerCase();
              if (lowerName.includes('mic') || lowerName.includes('microphone') || lowerName.includes('wireless')) {
                realImg = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80';
              } else if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('furniture')) {
                realImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
              } else if (lowerName.includes('speaker') || lowerName.includes('boat')) {
                realImg = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
              } else if (lowerName.includes('camera') || lowerName.includes('lens')) {
                realImg = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';
              }
            }
            if (!realImg) {
              realImg = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';
            }

            return {
              id: b.id,
              orderId: b.order?.orderNumber || b.bookingNumber || b.id?.slice(0, 8).toUpperCase(),
              bookingNumber: b.bookingNumber,
              productId: prod?.id,
              title: prod?.name || 'Rental Equipment',
              category: prod?.category?.name || 'Rental Equipment',
              image: realImg,
              vendor: {
                id: b.vendorId,
                name: b.vendor ? b.vendor.businessName : 'Rentora Partner',
                city: b.vendor ? b.vendor.city : 'Ahmedabad',
                upiId: b.vendor?.upiId || (b.vendor?.businessName ? `${b.vendor.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'vendor@okaxis'),
                qrCodeUrl: b.vendor?.qrCodeUrl || ''
              },
              startDate: b.startDate,
              endDate: b.endDate,
              durationDays: b.totalRentalDays || b.durationCount || 2,
              pickupTime: '10:00 AM',
              returnTime: '06:00 PM',
              totalBilled: Number(b.order?.totalAmount || b.totalPayable || b.totalAmount || 0),
              totalPaid: normalizedPaymentStatus === 'Paid' ? Number(b.order?.totalAmount || b.totalPayable || b.totalAmount || 0) : 0,
              securityDeposit: Number(b.order?.depositAmount || b.securityDeposit || b.depositAmount || 0),
              rentalAmount: Number(b.rentalAmount || 0),
              taxAmount: Number(b.taxAmount || 0),
              paymentStatus: normalizedPaymentStatus,
              orderStatus: b.order?.orderStatus || (b.status === 'BOOKING_CONFIRMED' ? 'Confirmed' : b.status),
              rentalStatus: b.status === 'BOOKING_CONFIRMED' ? 'Active' : (b.status || 'Active'),
              status: b.status === 'BOOKING_CONFIRMED' ? 'Active' : (b.status || 'Active'),
              isQuotationOrder: isQuotation,
              rawBooking: b
            };
          });
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
  };

  useEffect(() => {
    loadMyBookings();
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

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payTarget) return;

    setIsPaying(true);
    setPayError('');
    setPaySuccess('');

    try {
      const payload = {
        bookingId: payTarget.id,
        paymentMethod: 'UPI',
        utrNumber: payUtr.trim() || `UTR${Date.now()}`,
        amountPaid: payTarget.totalBilled
      };

      const res = await api.post('/payments/pay-booking', payload);
      if (res.data?.success) {
        setPaySuccess('Payment confirmed successfully! Your rental booking is officially locked in.');
        setBookings((prev) =>
          prev.map((b) => (b.id === payTarget.id ? { ...b, paymentStatus: 'Paid', totalPaid: b.totalBilled } : b))
        );
        setTimeout(() => {
          setPayTarget(null);
          setPaySuccess('');
          setPayUtr('');
          loadMyBookings();
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPayError(err.response?.data?.message || err.message || 'Payment submission failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const rawList = hasLoaded ? bookings : CUSTOMER_RENTALS;
  const displayList = (rawList || []).map((b) => ({
    ...b,
    totalBilled: Number(b.totalBilled ?? b.totalPaid ?? b.rentalAmount ?? 0),
    securityDeposit: Number(b.securityDeposit ?? 0),
    vendor: {
      id: b.vendor?.id,
      name: b.vendor?.name || 'Rentora Partner',
      city: b.vendor?.city || 'Ahmedabad',
      upiId: b.vendor?.upiId || `${(b.vendor?.name || 'vendor').toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`,
      qrCodeUrl: b.vendor?.qrCodeUrl || ''
    }
  }));

  const filteredBookings = displayList.filter((b) => {
    if (!b) return false;
    if (statusFilter !== 'All' && b.rentalStatus !== statusFilter && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (b.orderId && b.orderId.toLowerCase().includes(q)) ||
        (b.title && b.title.toLowerCase().includes(q)) ||
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
                          {booking.vendor?.name || 'Rentora Partner'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {booking.vendor?.city || 'Ahmedabad'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-dates-cell">
                        <span className="text-xs font-semibold text-navy">
                          {booking.startDate || 'TBD'} &rarr; {booking.endDate || 'TBD'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {booking.pickupTime || '10:00 AM'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-amount-cell">
                        <span className="font-bold text-navy text-sm">
                          ₹{(booking.totalBilled || booking.totalPaid || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-emerald-600 font-medium block">
                          (₹{(booking.securityDeposit || 0).toLocaleString('en-IN')} Escrow)
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 items-start">
                        {booking.isQuotationOrder && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                            <Tag size={10} />
                            <span>Quotation</span>
                          </span>
                        )}
                        <RentalStatusBadge status={booking.rentalStatus} size="small" />
                        {booking.paymentStatus === 'Paid' ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Paid
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
                            <Clock size={11} /> Payment Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions-group">
                        {booking.isQuotationOrder && booking.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => {
                              setPayTarget(booking);
                              setPayUtr('');
                              setPayError('');
                              setPaySuccess('');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title="Complete Rental Payment"
                          >
                            <CreditCard size={13} />
                            <span>Pay Now</span>
                          </button>
                        )}
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
                  <p className="text-[11px] text-[#475569]">{reviewTarget.title} • Order #{reviewTarget.orderId}</p>
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
                <div className="text-center space-y-1 py-2 bg-[#F1FAEE] rounded-2xl border border-[#E2E8F0]/40">
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

      {/* Complete Rental Payment Modal */}
      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E63946] flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1D3557] text-base font-['Sora']">Complete Rental Payment</h4>
                  <p className="text-[11px] text-[#475569]">Order #{payTarget.orderId} • {payTarget.vendor.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPayTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paySuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 size={44} className="text-emerald-600 mx-auto" />
                <h5 className="font-bold text-lg">Payment Confirmed!</h5>
                <p className="text-xs max-w-xs mx-auto">{paySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="space-y-4">
                {payError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{payError}</span>
                  </div>
                )}

                {/* Equipment Summary */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <img
                    src={payTarget.image}
                    alt={payTarget.title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-navy text-xs truncate">{payTarget.title}</h5>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      {payTarget.startDate} &rarr; {payTarget.endDate} ({payTarget.durationDays} Days)
                    </p>
                    {payTarget.isQuotationOrder && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full mt-1">
                        <Tag size={10} /> Custom Negotiated Quote Price
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="p-3.5 bg-gradient-to-br from-slate-50 to-[#F1FAEE] border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Rental Subtotal:</span>
                    <span className="font-semibold text-slate-900">₹{Number(payTarget.rentalAmount || (payTarget.totalBilled - (payTarget.securityDeposit || 0)) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {(payTarget.securityDeposit || 0) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Refundable Escrow Deposit:</span>
                      <span className="font-semibold text-emerald-600">₹{Number(payTarget.securityDeposit || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm">
                    <span className="font-bold text-navy">Total Payable Now:</span>
                    <span className="text-xl font-extrabold text-[#E63946]">₹{Number(payTarget.totalBilled || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* QR Code & Official UPI */}
                <div className="p-4 bg-white border border-[#E2E8F0]/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1D3557] flex items-center gap-1.5">
                      <QrCode size={15} className="text-[#E63946]" />
                      <span>Scan & Pay to Vendor UPI</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Verified Vendor
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl border border-dashed border-[#E2E8F0] shrink-0 text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${payTarget.vendor.upiId}&pn=${encodeURIComponent(payTarget.vendor.name)}&am=${payTarget.totalBilled}&cu=INR&tn=${encodeURIComponent(`Rentora Rental ${payTarget.orderId}`)}`)}&margin=4`}
                        alt="Vendor UPI QR Code"
                        className="w-28 h-28 mx-auto rounded object-contain"
                      />
                      <span className="text-[9px] text-slate-400 font-semibold block mt-1">Scan with GPay / PhonePe / Paytm</span>
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vendor UPI ID</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 font-mono text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-navy font-bold select-all truncate">
                            {payTarget.vendor.upiId}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(payTarget.vendor.upiId);
                              setCopiedUpi(true);
                              setTimeout(() => setCopiedUpi(false), 2000);
                            }}
                            className="px-2.5 py-2 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {copiedUpi ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">1-Click UPI Launch</span>
                        <div className="flex flex-wrap gap-1">
                          <a
                            href={`upi://pay?pa=${payTarget.vendor.upiId}&pn=${encodeURIComponent(payTarget.vendor.name)}&am=${payTarget.totalBilled}&cu=INR`}
                            className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold hover:bg-emerald-100"
                          >
                            Google Pay
                          </a>
                          <a
                            href={`upi://pay?pa=${payTarget.vendor.upiId}&pn=${encodeURIComponent(payTarget.vendor.name)}&am=${payTarget.totalBilled}&cu=INR`}
                            className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-800 text-[10px] font-bold hover:bg-indigo-100"
                          >
                            PhonePe
                          </a>
                          <a
                            href={`upi://pay?pa=${payTarget.vendor.upiId}&pn=${encodeURIComponent(payTarget.vendor.name)}&am=${payTarget.totalBilled}&cu=INR`}
                            className="px-2 py-1 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 text-[10px] font-bold hover:bg-sky-100"
                          >
                            Paytm / BHIM
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UTR / Bank Reference Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Bank Reference / UTR Number (Optional / Auto-Confirmed)
                  </label>
                  <input
                    type="text"
                    value={payUtr}
                    onChange={(e) => setPayUtr(e.target.value)}
                    placeholder="e.g. 425678912345 (12-digit UTR from payment receipt)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPaying}
                    className="px-6 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Confirm & Complete Payment (₹{Number(payTarget.totalBilled || 0).toLocaleString('en-IN')})</span>
                      </>
                    )}
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
