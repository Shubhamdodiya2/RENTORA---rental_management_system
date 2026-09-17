import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { CUSTOMER_QUOTATIONS } from '../../../data/customerMockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Quotations.css';

export default function Quotations() {
  const [quotations, setQuotations] = useState(CUSTOMER_QUOTATIONS);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const handleAccept = (quotId) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotId ? { ...q, status: 'Accepted' } : q))
    );
    setActionNotice({
      type: 'success',
      msg: 'Quotation accepted! You can now proceed to rental booking & contract execution.'
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDecline = (quotId) => {
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

      {/* Quotations List */}
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
