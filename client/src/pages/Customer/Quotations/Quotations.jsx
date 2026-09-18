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
  FileQuestion
} from 'lucide-react';
import api from '../../../services/api';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Quotations.css';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/quotations')
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data?.rows || res.data?.data?.results || (Array.isArray(res.data?.data) ? res.data.data : []);
        if (Array.isArray(list)) {
          const mapped = list.map((q) => ({
            id: q.id,
            quotationNumber: q.quotationNumber || `QUO-${q.id.slice(0, 8).toUpperCase()}`,
            product: q.items && q.items[0]?.product ? q.items[0].product.name : (q.purpose || 'Custom Rental Request'),
            vendor: q.vendor ? q.vendor.businessName : 'Rentora Verified Partner',
            image: (q.items && q.items[0]?.product?.images && q.items[0].product.images[0]?.imageUrl) || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
            dates: `${q.startDate} → ${q.endDate}`,
            duration: `${q.totalDays || 1} Days`,
            validUntil: new Date(q.expiresAt || Date.now() + 7 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: q.status === 'PENDING' ? 'Pending Acceptance' : q.status === 'ACCEPTED' ? 'Accepted' : q.status === 'REJECTED' ? 'Declined' : q.status,
            subtotal: Number(q.totalAmount || q.subtotal || 0),
            deposit: Number(q.securityDeposit || 0),
            discount: Number(q.discountAmount || 0),
            totalAmount: Number(q.totalAmount || 0),
            notes: q.notes || q.vendorNotes || null
          }));
          setQuotations(mapped);
        }
      })
      .catch((err) => {
        console.warn('[Quotations] Fetch notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleAccept = async (quotId) => {
    try {
      await api.patch(`/quotations/${quotId}/accept`).catch(() => null);
    } catch (e) {}
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotId ? { ...q, status: 'Accepted' } : q))
    );
    setActionNotice({
      type: 'success',
      msg: 'Quotation accepted! You can now proceed to rental booking & contract execution.'
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDecline = async (quotId) => {
    try {
      await api.patch(`/quotations/${quotId}/reject`).catch(() => null);
    } catch (e) {}
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotId ? { ...q, status: 'Declined' } : q))
    );
    setActionNotice({
      type: 'info',
      msg: 'Quotation declined. The vendor has been notified.'
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="quotations-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Quotations & Inquiries</h1>
          <p className="page-sub-heading">
            Review custom commercial rental estimates, vendor negotiated rates, and project quotes.
          </p>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`action-notice-box ${actionNotice.type === 'success' ? 'notice-success' : 'notice-info'}`}>
          <Sparkles size={18} />
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Quotations List / Empty State */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileQuestion size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy font-['Sora']">
            No Quotations or Custom Inquiries
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You don't have any pending custom rental estimates or vendor quotes at the moment. Browse the marketplace catalog to request custom rates on gear.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-red text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all"
          >
            <Sparkles size={14} />
            <span>Explore Rentals Catalog</span>
          </Link>
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
                      <span>{quot.vendor}</span>
                    </div>
                    <div className="quot-dates">
                      <Calendar size={14} className="text-primary-red" />
                      <span>{quot.dates} ({quot.duration})</span>
                    </div>
                  </div>
                </div>

                {quot.notes && (
                  <div className="quot-notes-box">
                    <span className="font-semibold text-navy">Special Vendor Note:</span> {quot.notes}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="quot-pricing-box">
                  <div className="quot-price-row">
                    <span>Custom Rental Rate</span>
                    <span>₹{quot.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="quot-price-row">
                    <span>Security Escrow Deposit</span>
                    <span className="text-emerald-600 font-semibold">₹{quot.deposit.toLocaleString('en-IN')}</span>
                  </div>
                  {quot.discount > 0 && (
                    <div className="quot-price-row text-emerald-600">
                      <span>Vendor Negotiation Discount</span>
                      <span>-₹{quot.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="quot-price-row quot-total-row">
                    <span>Estimated Total</span>
                    <span className="text-primary-red font-extrabold text-lg">
                      ₹{quot.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="quotation-card-footer">
                <button
                  onClick={() => setSelectedDoc({ type: 'quotation', id: quot.quotationNumber })}
                  className="btn-view-doc"
                >
                  <Eye size={15} />
                  <span>View Full Document</span>
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

                {quot.status === 'Accepted' && (
                  <Link to="/booking" className="btn-proceed-pay">
                    <CreditCard size={15} />
                    <span>Proceed to Payment</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
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
