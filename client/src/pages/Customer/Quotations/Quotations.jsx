import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Calendar,
  Clock,
  Check,
  X,
  CreditCard,
  Eye,
  Building,
  Sparkles,
  AlertCircle,
  FileQuestion,
  Plus,
  Send,
  Loader2,
  Package,
  ArrowRight,
  QrCode,
  Copy,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';
import api from '../../../services/api';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Quotations.css';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [durationDays, setDurationDays] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Pay Modal State
  const [payTarget, setPayTarget] = useState(null);
  const [payUtr, setPayUtr] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const fetchQuotations = async () => {
    try {
      const res = await api.get('/quotations');
      const list =
        res.data?.data?.quotations ||
        res.data?.data?.rows ||
        res.data?.data?.results ||
        (Array.isArray(res.data?.data) ? res.data.data : []);

      if (Array.isArray(list)) {
        const mapped = list.map((q) => {
          const firstItem = q.items && q.items[0];
          const prod = firstItem?.product;
          let img =
            prod?.primaryImage ||
            (prod?.images && prod.images[0]?.imageUrl) ||
            (Array.isArray(prod?.images) && typeof prod.images[0] === 'string'
              ? prod.images[0]
              : null);
          if (!img || typeof img !== 'string' || img.includes('unsplash.com/photos/')) {
            const lowerName = (prod?.name || '').toLowerCase();
            if (lowerName.includes('mic') || lowerName.includes('microphone') || lowerName.includes('wireless')) {
              img = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80';
            } else if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('furniture')) {
              img = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
            } else if (lowerName.includes('speaker') || lowerName.includes('boat')) {
              img = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
            } else {
              img = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';
            }
          }

          let eventFormatted = q.eventDate || 'Scheduled Event';
          if (q.durationDays) {
            const start = new Date(q.eventDate || Date.now());
            const end = new Date(start.getTime() + (q.durationDays - 1) * 86400000);
            eventFormatted = `${q.eventDate} → ${end.toISOString().split('T')[0]}`;
          }

          let statusLabel = 'In Review';
          if (q.status === 'Quote_Sent' || q.status === 'Sent') {
            statusLabel = 'Pending Acceptance';
          } else if (q.status === 'Accepted') {
            statusLabel = 'Accepted';
          } else if (q.status === 'Rejected') {
            statusLabel = 'Declined';
          } else if (q.status === 'Expired') {
            statusLabel = 'Expired';
          } else if (q.status === 'Submitted') {
            statusLabel = 'In Review';
          }

          return {
            id: q.id,
            quotationNumber: q.quotationNumber || `QUO-${q.id.slice(0, 8).toUpperCase()}`,
            product: prod ? prod.name : (q.notes ? 'Custom Equipment Rental' : 'Custom Rental Request'),
            vendor: q.vendor ? q.vendor.businessName : 'Rentora Partner',
            vendorCity: q.vendor?.city || 'Ahmedabad',
            image: img,
            dates: eventFormatted,
            duration: `${q.durationDays || 1} Days`,
            quantity: firstItem?.quantity || 1,
            unitRate: Number(firstItem?.customRate || firstItem?.unitRate || 0),
            validUntil: q.validUntil
              ? new Date(q.validUntil).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Valid for 7 days',
            status: statusLabel,
            rawStatus: q.status,
            subtotal: Number(q.subtotal || 0),
            taxAmount: Number(q.taxAmount || 0),
            deposit: Number(q.depositAmount || 0),
            discount: Number(q.discountAmount || 0),
            totalAmount: Number(q.totalAmount || 0),
            customerNotes: q.notes || null,
            vendorNotes: q.vendorNotes || null,
            vendorUpi: q.vendor?.upiId || (q.vendor?.businessName ? `${q.vendor.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'vendor@okaxis'),
            vendorQrCodeUrl: q.vendor?.qrCodeUrl || '',
            rawQuotation: q
          };
        });
        setQuotations(mapped);
      }
    } catch (err) {
      console.warn('[Quotations] Fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const res = await api.get('/products');
      const list =
        res.data?.data?.results ||
        res.data?.data?.rows ||
        (Array.isArray(res.data?.data) ? res.data.data : []);
      const activeOnly = list.filter(
        (p) => p.status === 'Active' && (!p.approvalStatus || p.approvalStatus === 'Approved')
      );
      setAvailableProducts(activeOnly);
      if (activeOnly.length > 0 && !selectedProductId) {
        setSelectedProductId(activeOnly[0].id);
      }
    } catch (e) {
      console.warn('[Catalog fetch error]', e);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchCatalogProducts();
  }, []);

  const handleAccept = async (quotId) => {
    try {
      const res = await api.patch(`/quotations/${quotId}/accept`);
      const bookingData = res.data?.data?.booking;
      const orderData = res.data?.data?.order;
      setQuotations((prev) =>
        prev.map((q) => (q.id === quotId ? {
          ...q,
          status: 'Accepted',
          rawStatus: 'Accepted',
          bookingId: bookingData?.id,
          orderNumber: orderData?.orderNumber
        } : q))
      );
      setActionNotice({
        type: 'success',
        msg: `Quotation accepted! Official rental order #${orderData?.orderNumber || 'ORD'} generated with your negotiated quote rates. You can now complete the payment directly below.`
      });
      setTimeout(() => setActionNotice(null), 6000);
      await fetchQuotations();
    } catch (e) {
      setActionNotice({
        type: 'error',
        msg: e.response?.data?.message || 'Failed to accept quotation. Please try again.'
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payTarget) return;

    setIsPaying(true);
    setPayError('');
    setPaySuccess('');

    try {
      let bId = payTarget.bookingId;
      if (!bId) {
        const myB = await api.get('/bookings/my');
        const list = myB.data?.data?.results || myB.data?.data?.rows || (Array.isArray(myB.data?.data) ? myB.data.data : []);
        const found = list.find((b) => {
          return b.rentalNotes && (b.rentalNotes.includes(payTarget.quotationNumber) || b.rentalNotes.includes(payTarget.id));
        });
        if (found) bId = found.id;
        else if (list.length > 0) bId = list[0].id;
      }

      if (!bId) {
        throw new Error('Associated booking record not found. Please visit My Bookings to complete payment.');
      }

      const res = await api.post('/payments/pay-booking', {
        bookingId: bId,
        paymentMethod: 'UPI',
        utrNumber: payUtr.trim() || `UTR${Date.now()}`,
        amountPaid: payTarget.totalAmount
      });

      if (res.data?.success) {
        setPaySuccess('Payment confirmed successfully! Your rental order is officially confirmed.');
        setTimeout(() => {
          setPayTarget(null);
          setPaySuccess('');
          setPayUtr('');
          fetchQuotations();
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPayError(err.response?.data?.message || err.message || 'Payment submission failed.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleDecline = async (quotId) => {
    try {
      await api.patch(`/quotations/${quotId}/reject`);
      setQuotations((prev) =>
        prev.map((q) => (q.id === quotId ? { ...q, status: 'Declined', rawStatus: 'Rejected' } : q))
      );
      setActionNotice({
        type: 'info',
        msg: 'Quotation offer declined. The vendor has been notified.'
      });
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      setActionNotice({
        type: 'error',
        msg: e.response?.data?.message || 'Failed to decline quotation.'
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setModalError('');

    const product = availableProducts.find((p) => p.id === selectedProductId);
    if (!product) {
      setModalError('Please select a product from the catalog');
      return;
    }

    const vendorId = product.vendorId || product.vendor?.id;
    if (!vendorId) {
      setModalError('Vendor profile missing for this product');
      return;
    }

    if (!eventDate) {
      setModalError('Please select a valid event date');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/quotations', {
        vendorId,
        items: [
          {
            productId: product.id,
            quantity: Number(quantity) || 1
          }
        ],
        eventDate,
        durationDays: Number(durationDays) || 1,
        customerNotes: customerNotes.trim()
      });

      setShowRequestModal(false);
      setCustomerNotes('');
      setActionNotice({
        type: 'success',
        msg: 'Custom quotation request submitted successfully! The vendor will review and send you a custom rate proposal.'
      });
      setTimeout(() => setActionNotice(null), 5000);
      await fetchQuotations();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit quotation request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = availableProducts.find((p) => p.id === selectedProductId);
  const unitRate = selectedProduct ? Number(selectedProduct.discountPrice || selectedProduct.pricePerDay || 0) : 0;
  const estimatedSubtotal = unitRate * (Number(quantity) || 1) * (Number(durationDays) || 1);
  const estimatedTax = Math.round(estimatedSubtotal * 0.18);
  const estimatedTotal = estimatedSubtotal + estimatedTax;

  return (
    <div className="quotations-page">
      {/* Page Header */}
      <div className="page-header-row flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-main-heading">Quotations & Inquiries</h1>
          <p className="page-sub-heading">
            Review custom commercial rental estimates, vendor negotiated rates, and project quotes.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-bold shadow hover:bg-[#D62839] transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Request Custom Quotation</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`action-notice-box ${actionNotice.type === 'success' ? 'notice-success' : actionNotice.type === 'error' ? 'notice-error' : 'notice-info'}`}>
          <Sparkles size={18} />
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Quotations List / Empty State */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/60 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#E63946] mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading your quotations & inquiries...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-4 my-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileQuestion size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy font-['Sora']">
            No Quotations or Custom Inquiries
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You don't have any pending custom rental estimates or vendor quotes at the moment. Request custom rates for projects, weddings, or corporate setups.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E63946] text-white text-xs font-bold shadow-md hover:bg-[#D62839] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Quotation Request</span>
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F1FAEE] text-[#1D3557] border border-[#E2E8F0] text-xs font-bold hover:bg-[#1D3557] hover:text-white transition-all"
            >
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="quotations-grid">
          {quotations.map((quot) => (
            <div key={quot.id} className="quotation-card">
              <div className="quotation-card-header">
                <div className="quot-ref-block">
                  <span className="quot-ref">{quot.quotationNumber}</span>
                  <span className="quot-valid-badge">
                    <Clock size={12} />
                    <span>Valid until {quot.validUntil}</span>
                  </span>
                </div>
                <RentalStatusBadge status={quot.status} />
              </div>

              <div className="quotation-card-body">
                <div className="quot-item-row">
                  <img src={quot.image} alt={quot.product} className="quot-img" />
                  <div className="quot-meta">
                    <h3 className="quot-title">{quot.product}</h3>
                    <div className="quot-vendor">
                      <Building size={14} className="text-slate-400" />
                      <span>{quot.vendor} &bull; {quot.vendorCity}</span>
                    </div>
                    <div className="quot-dates">
                      <Calendar size={14} className="text-[#E63946]" />
                      <span>{quot.dates} ({quot.duration}) &bull; Qty: {quot.quantity}</span>
                    </div>
                  </div>
                </div>

                {quot.customerNotes && (
                  <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-600">
                    <span className="font-bold text-slate-700">Your Request Note:</span> {quot.customerNotes}
                  </div>
                )}

                {quot.vendorNotes && (
                  <div className="quot-notes-box">
                    <span className="font-semibold text-navy">Special Vendor Offer Note:</span> {quot.vendorNotes}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="quot-pricing-box">
                  <div className="quot-price-row">
                    <span>Quoted Rental Subtotal</span>
                    <span>₹{quot.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {quot.taxAmount > 0 && (
                    <div className="quot-price-row">
                      <span>GST (18%)</span>
                      <span>₹{quot.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {quot.deposit > 0 && (
                    <div className="quot-price-row">
                      <span>Security Escrow Deposit</span>
                      <span className="text-emerald-600 font-semibold">₹{quot.deposit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {quot.discount > 0 && (
                    <div className="quot-price-row text-emerald-600">
                      <span>Vendor Negotiation Discount</span>
                      <span>-₹{quot.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="quot-price-row quot-total-row">
                    <span>Estimated Total</span>
                    <span className="text-[#E63946] font-extrabold text-lg">
                      ₹{quot.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="quotation-card-footer">
                <button
                  onClick={() => setSelectedDoc({ type: 'quotation', id: quot.id, fullData: quot })}
                  className="btn-view-doc"
                >
                  <Eye size={15} />
                  <span>View Details</span>
                </button>

                {quot.status === 'Pending Acceptance' && (
                  <div className="quot-actions-row">
                    <button
                      onClick={() => handleDecline(quot.id)}
                      className="btn-decline"
                    >
                      <X size={15} />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleAccept(quot.id)}
                      className="btn-accept"
                    >
                      <Check size={15} />
                      <span>Accept Quotation</span>
                    </button>
                  </div>
                )}

                {quot.status === 'In Review' && (
                  <div className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Clock size={13} />
                    <span>Vendor Review in Progress</span>
                  </div>
                )}

                {quot.status === 'Accepted' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setPayTarget(quot);
                        setPayUtr('');
                        setPayError('');
                        setPaySuccess('');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <CreditCard size={14} />
                      <span>Pay Now (₹{quot.totalAmount.toLocaleString('en-IN')})</span>
                    </button>
                    <Link to="/customer/bookings" className="btn-view-doc">
                      <span>My Bookings</span>
                    </Link>
                  </div>
                )}

                {quot.status === 'Declined' && (
                  <span className="text-xs text-rose-500 font-semibold bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                    Declined
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Custom Quotation Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E63946] flex items-center justify-center font-bold">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1D3557]">Request Custom Quotation</h3>
                  <p className="text-xs text-slate-500">Submit an inquiry to the vendor for customized rates or bulk booking</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuotation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Equipment / Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E63946] bg-slate-50"
                  required
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.vendor?.businessName || 'Verified Store'}) — ₹{p.discountPrice || p.pricePerDay}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E63946] bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E63946] bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E63946] bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Details / Requirements
                </label>
                <textarea
                  rows="3"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Describe your project, shooting schedule, or target discount budget for the vendor..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E63946] bg-slate-50 resize-none"
                />
              </div>

              {/* Live Cost Estimate Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Standard Catalog Rate</span>
                  <span>₹{unitRate} &times; {quantity} qty &times; {durationDays} days</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Estimated GST (18%)</span>
                  <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-[#1D3557]">
                  <span>Catalog Base Estimate</span>
                  <span className="text-[#E63946]">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-1">
                  * Vendor will review your inquiry and can adjust rates, provide bundle discounts, or include accessories.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-bold shadow hover:bg-[#D62839] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Request to Vendor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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
                  <h4 className="font-bold text-[#1D3557] text-base font-['Sora']">Complete Quoted Rental Payment</h4>
                  <p className="text-[11px] text-[#475569]">Ref: {payTarget.quotationNumber} • {payTarget.vendor}</p>
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
                    alt={payTarget.product}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-navy text-xs truncate">{payTarget.product}</h5>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      {payTarget.dates} ({payTarget.duration}) • Qty: {payTarget.quantity}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                      <Sparkles size={10} /> Special Quoted Rate Applied
                    </span>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="p-3.5 bg-gradient-to-br from-slate-50 to-[#F1FAEE] border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Quoted Subtotal:</span>
                    <span className="font-semibold text-slate-900">₹{payTarget.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {payTarget.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%):</span>
                      <span className="font-semibold text-slate-900">₹{payTarget.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {payTarget.deposit > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Refundable Escrow Deposit:</span>
                      <span className="font-semibold text-emerald-600">₹{payTarget.deposit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm">
                    <span className="font-bold text-navy">Total Quoted Amount:</span>
                    <span className="text-xl font-extrabold text-[#E63946]">₹{payTarget.totalAmount.toLocaleString('en-IN')}</span>
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
                      Verified Store
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl border border-dashed border-[#E2E8F0] shrink-0 text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${payTarget.vendorUpi}&pn=${encodeURIComponent(payTarget.vendor)}&am=${payTarget.totalAmount}&cu=INR&tn=${encodeURIComponent(`Rentora Quote ${payTarget.quotationNumber}`)}`)}&margin=4`}
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
                            {payTarget.vendorUpi}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(payTarget.vendorUpi);
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
                            href={`upi://pay?pa=${payTarget.vendorUpi}&pn=${encodeURIComponent(payTarget.vendor)}&am=${payTarget.totalAmount}&cu=INR`}
                            className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold hover:bg-emerald-100"
                          >
                            Google Pay
                          </a>
                          <a
                            href={`upi://pay?pa=${payTarget.vendorUpi}&pn=${encodeURIComponent(payTarget.vendor)}&am=${payTarget.totalAmount}&cu=INR`}
                            className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-800 text-[10px] font-bold hover:bg-indigo-100"
                          >
                            PhonePe
                          </a>
                          <a
                            href={`upi://pay?pa=${payTarget.vendorUpi}&pn=${encodeURIComponent(payTarget.vendor)}&am=${payTarget.totalAmount}&cu=INR`}
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
                        <span>Confirm & Complete Payment (₹{payTarget.totalAmount.toLocaleString('en-IN')})</span>
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
          data={selectedDoc.fullData}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
