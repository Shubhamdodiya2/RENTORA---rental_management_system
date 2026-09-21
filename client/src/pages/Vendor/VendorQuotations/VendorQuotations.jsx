import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Building,
  User,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  Tag,
  Check,
  X,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import api from '../../../services/api';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorQuotations.css';

export default function VendorQuotations() {
  const { products, showToast } = useVendor();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Modal State for Reviewing & Responding to Customer Request
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [customRate, setCustomRate] = useState(0);
  const [vendorOfferNotes, setVendorOfferNotes] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState('');

  // Modal State for Manual New Quotation Generation
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: 'SkyLine Media Productions',
    contactPerson: 'Karan Sharma',
    email: 'karan@skylinemedia.com',
    phone: '+91 98251 99220',
    selectedProductId: '',
    durationDays: 3,
    unitPrice: 1000,
    discount: 0,
    deposit: 1500,
    notes: 'Includes on-set technical standby and spare battery set.',
    validUntil: ''
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotations');
      const list =
        res.data?.data?.quotations ||
        res.data?.data?.rows ||
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
            img =
              'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
          }

          let eventFormatted = q.eventDate || 'Scheduled Event';
          if (q.durationDays) {
            const start = new Date(q.eventDate || Date.now());
            const end = new Date(start.getTime() + (q.durationDays - 1) * 86400000);
            eventFormatted = `${q.eventDate} → ${end.toISOString().split('T')[0]}`;
          }

          return {
            id: q.id,
            quotationNumber: q.quotationNumber || `QUO-${q.id.slice(0, 8).toUpperCase()}`,
            product: prod ? prod.name : 'Custom Equipment Rental',
            productId: prod ? prod.id : firstItem?.productId,
            image: img,
            quantity: firstItem?.quantity || 1,
            unitRate: Number(firstItem?.customRate || firstItem?.unitRate || prod?.pricePerDay || 0),
            durationDays: Number(q.durationDays || 1),
            eventDates: eventFormatted,
            eventDate: q.eventDate,
            customer: {
              name: q.customer?.fullName || 'Valued Customer',
              email: q.customer?.email || 'N/A',
              phone: q.customer?.phone || 'N/A'
            },
            status: q.status, // 'Submitted', 'Quote_Sent', 'Accepted', 'Rejected', 'Expired'
            subtotal: Number(q.subtotal || 0),
            taxAmount: Number(q.taxAmount || 0),
            depositAmount: Number(q.depositAmount || 0),
            discountAmount: Number(q.discountAmount || 0),
            totalAmount: Number(q.totalAmount || 0),
            customerNotes: q.notes || null,
            vendorNotes: q.vendorNotes || null,
            validUntil: q.validUntil
              ? new Date(q.validUntil).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : '7 Days',
            createdAt: q.createdAt
              ? new Date(q.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Recent',
            raw: q
          };
        });
        setQuotations(mapped);
      }
    } catch (err) {
      console.warn('[VendorQuotations] Fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Set default product if available
  useEffect(() => {
    if (products.length > 0 && !formData.selectedProductId) {
      setFormData((prev) => ({
        ...prev,
        selectedProductId: products[0].id,
        unitPrice: products[0].pricePerDay || 1000
      }));
    }
  }, [products]);

  // Open Respond Modal
  const openReviewModal = (quote) => {
    setSelectedQuote(quote);
    setCustomRate(quote.unitRate || 500);
    setVendorOfferNotes(quote.vendorNotes || 'Special event bundle discount applied. Includes complimentary setup assistance.');
    setResponseError('');
    setReviewModalOpen(true);
  };

  // Submit Quote Offer to Customer
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedQuote) return;

    if (Number(customRate) <= 0) {
      setResponseError('Please enter a valid daily rate greater than 0');
      return;
    }

    setIsSubmittingResponse(true);
    setResponseError('');

    try {
      await api.patch(`/quotations/${selectedQuote.id}/respond`, {
        items: [
          {
            productId: selectedQuote.productId,
            customRate: Number(customRate)
          }
        ],
        vendorNotes: vendorOfferNotes.trim()
      });

      if (showToast) showToast('Quote offer sent to customer successfully! Customer can now review & accept.', 'success');
      setReviewModalOpen(false);
      await fetchQuotations();
    } catch (err) {
      setResponseError(err.response?.data?.message || err.message || 'Failed to submit quote offer');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Decline Customer Quote Request
  const handleDeclineRequest = async (quoteId) => {
    if (!window.confirm('Are you sure you want to decline this quote request?')) return;
    try {
      await api.patch(`/quotations/${quoteId}/reject`);
      if (showToast) showToast('Quotation request declined', 'info');
      await fetchQuotations();
      setReviewModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request');
    }
  };

  // Tabs filtering
  const submittedCount = quotations.filter((q) => q.status === 'Submitted').length;
  const quoteSentCount = quotations.filter((q) => q.status === 'Quote_Sent').length;
  const acceptedCount = quotations.filter((q) => q.status === 'Accepted').length;

  const filteredQuotes = quotations.filter((q) => {
    // Tab filter
    if (activeTab === 'New Requests' && q.status !== 'Submitted') return false;
    if (activeTab === 'Offers Sent' && q.status !== 'Quote_Sent') return false;
    if (activeTab === 'Accepted' && q.status !== 'Accepted') return false;
    if (activeTab === 'Declined' && q.status !== 'Rejected' && q.status !== 'Expired') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.quotationNumber.toLowerCase().includes(query) ||
      q.customer.name.toLowerCase().includes(query) ||
      q.customer.phone.toLowerCase().includes(query) ||
      q.product.toLowerCase().includes(query)
    );
  });

  // Calculate live preview in modal
  const modalSubtotal = Number(customRate || 0) * Number(selectedQuote?.quantity || 1) * Number(selectedQuote?.durationDays || 1);
  const modalTax = Math.round(modalSubtotal * 0.18);
  const modalTotal = modalSubtotal + modalTax;

  return (
    <div className="vendor-quotations-page">
      {/* Page Header */}
      <div className="page-header-row flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-main-heading">Commercial Quotations & Estimates</h1>
          <p className="page-sub-heading">
            Review incoming customer inquiries, send custom bundle rates, and convert quote requests into confirmed rental bookings.
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="btn-v-primary">
          <Plus size={16} />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Filter Toolbar & Status Tabs */}
      <div className="v-filter-toolbar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'All', label: 'All Quotations', count: quotations.length },
            { id: 'New Requests', label: 'New Inquiries', count: submittedCount, alert: submittedCount > 0 },
            { id: 'Offers Sent', label: 'Offers Sent', count: quoteSentCount },
            { id: 'Accepted', label: 'Accepted & Booked', count: acceptedCount },
            { id: 'Declined', label: 'Declined / Closed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1D3557] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id
                      ? tab.alert
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-white/20 text-white'
                      : tab.alert
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="v-search-box max-w-xs w-full">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search quote ref, client, gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Quotations List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/60 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#E63946] mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading incoming quotations & requests...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-3 my-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#1D3557] font-['Sora']">
            No Quotations Found in this Filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When customers request custom estimates or commercial rental packages for your equipment, they will appear right here for your review and custom pricing.
          </p>
          <div className="pt-2">
            <button onClick={() => setActiveTab('All')} className="btn-v-secondary text-xs">
              View All Quotations
            </button>
          </div>
        </div>
      ) : (
        <div className="v-quotes-grid">
          {filteredQuotes.map((q) => {
            const isSubmitted = q.status === 'Submitted';
            const isOfferSent = q.status === 'Quote_Sent';
            const isAccepted = q.status === 'Accepted';
            const isDeclined = q.status === 'Rejected' || q.status === 'Expired';

            return (
              <div
                key={q.id}
                className={`v-quote-card ${isSubmitted ? 'border-amber-400 ring-2 ring-amber-400/20' : ''}`}
              >
                {/* Header */}
                <div className="v-quote-card-hdr flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{q.quotationNumber}</span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} />
                      <span>Valid until {q.validUntil}</span>
                    </div>
                  </div>

                  {isSubmitted && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      <Sparkles size={11} />
                      <span>New Request • Action Required</span>
                    </span>
                  )}
                  {isOfferSent && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                      <Clock size={11} />
                      <span>Offer Sent • Pending Customer</span>
                    </span>
                  )}
                  {isAccepted && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 size={11} />
                      <span>Accepted & Booked</span>
                    </span>
                  )}
                  {isDeclined && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                      <XCircle size={11} />
                      <span>Declined</span>
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="v-quote-card-body space-y-3">
                  {/* Gear Row */}
                  <div className="flex items-center gap-3">
                    <img
                      src={q.image}
                      alt={q.product}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-navy text-sm leading-snug">{q.product}</h3>
                      <div className="text-xs text-[#E63946] font-semibold flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        <span>{q.eventDates} ({q.durationDays} Days) • Qty: {q.quantity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-700 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-slate-900">
                      <User size={13} className="text-[#1D3557]" />
                      <span>{q.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                      {q.customer.phone && (
                        <a href={`tel:${q.customer.phone}`} className="flex items-center gap-1 hover:text-[#E63946]">
                          <Phone size={11} /> {q.customer.phone}
                        </a>
                      )}
                      {q.customer.email && (
                        <a href={`mailto:${q.customer.email}`} className="flex items-center gap-1 hover:text-[#E63946]">
                          <Mail size={11} /> {q.customer.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Customer's Request Note */}
                  {q.customerNotes && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                      <span className="font-bold text-amber-950">Customer Note:</span> "{q.customerNotes}"
                    </div>
                  )}

                  {/* Vendor's Offer Note if already sent */}
                  {q.vendorNotes && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900">
                      <span className="font-bold text-blue-950">Your Offer Note:</span> "{q.vendorNotes}"
                    </div>
                  )}

                  {/* Pricing Breakdown Strip */}
                  <div className="v-quote-price-strip mt-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Quoted Subtotal ({q.quantity} × {q.durationDays} days):</span>
                      <span>₹{q.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {q.taxAmount > 0 && (
                      <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                        <span>GST (18%):</span>
                        <span>₹{q.taxAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline mt-1.5 pt-1.5 border-t border-slate-200">
                      <span className="text-xs font-bold text-navy">Total Quoted Value:</span>
                      <span className="text-base font-extrabold text-[#E63946]">
                        ₹{q.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="v-quote-card-footer flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDoc({ type: 'quotation', id: q.quotationNumber, fullData: q })}
                    className="btn-v-secondary text-xs flex-1 justify-center"
                  >
                    <Eye size={13} />
                    <span>View Slip</span>
                  </button>

                  {/* If new request, Vendor can Review & Send Custom Rate */}
                  {isSubmitted && (
                    <button
                      onClick={() => openReviewModal(q)}
                      className="btn-v-primary text-xs flex-1 justify-center bg-amber-500 hover:bg-amber-600 border-amber-500"
                    >
                      <Sparkles size={13} />
                      <span>Review & Send Offer</span>
                    </button>
                  )}

                  {/* If offer already sent */}
                  {isOfferSent && (
                    <button
                      onClick={() => openReviewModal(q)}
                      className="btn-v-secondary text-xs flex-1 justify-center text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
                    >
                      <Tag size={13} />
                      <span>Update Offer Rate</span>
                    </button>
                  )}

                  {/* If accepted by customer */}
                  {isAccepted && (
                    <Link
                      to="/vendor/orders"
                      className="btn-v-primary text-xs flex-1 justify-center bg-emerald-600 hover:bg-emerald-700"
                    >
                      <ShoppingBag size={13} />
                      <span>View in Orders</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Respond Modal (Vendor sends custom rates & offer notes) */}
      {reviewModalOpen && selectedQuote && (
        <div className="v-modal-backdrop" onClick={() => setReviewModalOpen(false)}>
          <div className="v-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base">Review & Send Quotation Offer</h3>
                  <div className="text-[11px] text-slate-500">
                    Ref: {selectedQuote.quotationNumber} • Client: {selectedQuote.customer.name}
                  </div>
                </div>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="v-modal-close text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitResponse} className="v-modal-body space-y-4 pt-3">
              {responseError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{responseError}</span>
                </div>
              )}

              {/* Equipment Summary Banner */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img
                  src={selectedQuote.image}
                  alt={selectedQuote.product}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-navy text-sm truncate">{selectedQuote.product}</h4>
                  <div className="text-xs text-[#457B9D] mt-0.5">
                    Dates: <strong className="text-slate-800">{selectedQuote.eventDates}</strong> ({selectedQuote.durationDays} Days)
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Quantity: <strong className="text-slate-800">{selectedQuote.quantity} Unit(s)</strong>
                  </div>
                </div>
              </div>

              {/* Customer Note if any */}
              {selectedQuote.customerNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <span className="font-bold text-amber-950">Customer Requirement Note:</span> "{selectedQuote.customerNotes}"
                </div>
              )}

              {/* Pricing Controls */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Your Custom Quoted Daily Rate (₹ / Day) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold text-base text-slate-900 focus:outline-none focus:border-[#E63946]"
                    placeholder="Enter customized rate per day"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block">
                  You can offer a negotiated discounted price per day for this bulk/event booking.
                </span>
              </div>

              {/* Offer Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Special Offer Note / Complimentary Inclusions
                </label>
                <textarea
                  rows={2}
                  value={vendorOfferNotes}
                  onChange={(e) => setVendorOfferNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#E63946]"
                  placeholder="e.g. Special weekend rate with extra batteries and aux splitters included."
                />
              </div>

              {/* Calculated Summary Preview */}
              <div className="p-3.5 bg-gradient-to-br from-slate-50 to-[#F1FAEE] border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal ({selectedQuote.quantity} units × {selectedQuote.durationDays} days @ ₹{customRate}/day):</span>
                  <span className="font-bold text-slate-800">₹{modalSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-bold text-slate-800">₹{modalTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-navy">Total Offer Amount to Customer:</span>
                  <span className="text-lg font-extrabold text-[#E63946]">₹{modalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDeclineRequest(selectedQuote.id)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <X size={14} />
                  <span>Decline Request</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="btn-v-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResponse}
                    className="btn-v-primary text-xs flex items-center gap-1.5"
                  >
                    {isSubmittingResponse ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Send Offer to Customer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual New Quotation Generation Modal (For Walk-in / Offline Clients) */}
      {createModalOpen && (
        <div className="v-modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="v-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <h3 className="font-bold text-navy text-base">Generate Custom Rental Quotation</h3>
              <button onClick={() => setCreateModalOpen(false)} className="v-modal-close">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Custom quote generation saved for manual distribution.');
                setCreateModalOpen(false);
              }}
              className="v-modal-body"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="v-form-field">
                  <label className="v-form-lbl">Client / Production Studio *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    className="v-form-input"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    className="v-form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="v-form-field">
                  <label className="v-form-lbl">Client Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="v-form-input"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Client Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="v-form-input"
                  />
                </div>
              </div>

              <div className="v-form-field mt-3">
                <label className="v-form-lbl">Select Primary Equipment Kit *</label>
                <select
                  value={formData.selectedProductId}
                  onChange={(e) => {
                    const prodId = e.target.value;
                    const prod = products.find((p) => p.id === prodId);
                    setFormData((prev) => ({
                      ...prev,
                      selectedProductId: prodId,
                      unitPrice: prod ? prod.pricePerDay : 1000
                    }));
                  }}
                  className="v-form-select"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base: ₹{p.pricePerDay}/day)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="v-form-field">
                  <label className="v-form-lbl">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="v-form-input font-bold"
                  />
                </div>
                <div className="v-form-field">
                  <label className="v-form-lbl">Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="v-form-input font-bold"
                  />
                </div>
              </div>

              <div className="v-form-field mt-3">
                <label className="v-form-lbl">Special Instructions / Inclusions</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="v-form-textarea"
                />
              </div>

              <div className="v-modal-footer p-0 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-v-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-v-primary">
                  <Send size={15} />
                  <span>Generate Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Document Modal */}
      {selectedDoc && (
        <DocumentModal
          type={selectedDoc.type}
          docId={selectedDoc.id}
          documentData={selectedDoc.fullData}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
