import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorQuotations.css';

export default function VendorQuotations() {
  const { quotations, addQuotation, updateQuotationStatus, products, customers } = useVendor();

  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form State for new quotation
  const [formData, setFormData] = useState({
    customerName: 'SkyLine Media Productions',
    contactPerson: 'Karan Sharma',
    email: 'karan@skylinemedia.com',
    phone: '+91 98251 99220',
    selectedProductId: products[0]?.id || '',
    durationDays: 7,
    unitPrice: products[0]?.pricePerDay || 1899,
    discount: 1000,
    deposit: 5000,
    notes: 'Includes on-set technical standby and spare battery set.',
    validUntil: '25 Sep 2026'
  });

  const filteredQuotes = quotations.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.quotationNumber.toLowerCase().includes(query) ||
      q.customer.name.toLowerCase().includes(query) ||
      q.product.toLowerCase().includes(query)
    );
  });

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    const prod = products.find((p) => p.id === prodId);
    setFormData((prev) => ({
      ...prev,
      selectedProductId: prodId,
      unitPrice: prod ? prod.pricePerDay : 1000,
      deposit: prod ? prod.securityDeposit : 3000
    }));
  };

  const handleCreateQuotation = (e, isDraft = false) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === formData.selectedProductId) || products[0];

    const subtotal = Number(formData.unitPrice) * Number(formData.durationDays);
    const totalAmount = subtotal - Number(formData.discount) + Number(formData.deposit);

    const newQuo = {
      customer: {
        name: formData.customerName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone
      },
      product: `${prod.name} (${formData.durationDays}-Day Package)`,
      quantity: 1,
      unitPrice: Number(formData.unitPrice),
      durationDays: Number(formData.durationDays),
      subtotal,
      discount: Number(formData.discount),
      tax: 0,
      securityDeposit: Number(formData.deposit),
      totalAmount,
      validUntil: formData.validUntil,
      notes: formData.notes,
      status: isDraft ? 'Draft' : 'Sent'
    };

    addQuotation(newQuo);
    setCreateModalOpen(false);
  };

  return (
    <div className="vendor-quotations-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Commercial Quotations & Estimates</h1>
          <p className="page-sub-heading">
            Issue custom commercial rental quotes, multi-week project packages, and production estimates.
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="btn-v-primary">
          <Plus size={16} />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search quote number, client, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Quotations Grid */}
      <div className="v-quotes-grid">
        {filteredQuotes.map((q) => (
          <div key={q.id} className="v-quote-card">
            <div className="v-quote-card-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-navy">{q.quotationNumber}</span>
                <div className="text-[11px] text-slate-400">Created: {q.createdDate}</div>
              </div>
              <span
                className={`v-status-badge ${
                  q.status === 'Accepted'
                    ? 'status-active'
                    : q.status === 'Sent'
                    ? 'status-confirmed'
                    : 'status-completed'
                }`}
              >
                {q.status}
              </span>
            </div>

            <div className="v-quote-card-body">
              <h3 className="font-bold text-navy text-sm mb-1">{q.product}</h3>

              <div className="text-xs text-slate-600 space-y-1 my-2">
                <div className="flex items-center gap-1.5">
                  <Building size={13} className="text-slate-400" />
                  <span><strong>{q.customer.name}</strong> ({q.customer.contactPerson})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary-red" />
                  <span>Valid until: <strong>{q.validUntil}</strong></span>
                </div>
              </div>

              {q.notes && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 mt-2">
                  {q.notes}
                </div>
              )}

              <div className="v-quote-price-strip mt-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal: ₹{q.subtotal.toLocaleString('en-IN')}</span>
                  <span>Deposit: ₹{q.securityDeposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-baseline mt-1 pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-navy">Total Value:</span>
                  <span className="text-base font-extrabold text-primary-red">₹{q.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="v-quote-card-footer">
              <button
                onClick={() => setSelectedDoc({ type: 'quotation', id: q.quotationNumber })}
                className="btn-v-secondary text-xs flex-1 justify-center"
              >
                <Eye size={13} />
                <span>View Full Document</span>
              </button>
              {q.status === 'Draft' && (
                <button
                  onClick={() => updateQuotationStatus(q.id, 'Sent')}
                  className="btn-v-primary text-xs flex-1 justify-center"
                >
                  <Send size={13} />
                  <span>Send to Client</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Quotation Modal */}
      {createModalOpen && (
        <div className="v-modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="v-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <h3 className="font-bold text-navy text-base">Generate Custom Rental Quotation</h3>
              <button onClick={() => setCreateModalOpen(false)} className="v-modal-close">✕</button>
            </div>

            <form onSubmit={(e) => handleCreateQuotation(e, false)} className="v-modal-body">
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
                  onChange={handleProductChange}
                  className="v-form-select"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Base: ₹{p.pricePerDay}/day)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
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
                <div className="v-form-field">
                  <label className="v-form-lbl">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="v-form-input"
                  />
                </div>
              </div>

              <div className="v-form-field mt-3">
                <label className="v-form-lbl">Special Instructions / Crew Assistance Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="v-form-textarea"
                />
              </div>

              {/* Calculated Total Live Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between mt-3">
                <div>
                  <span className="text-xs text-slate-500">Estimated Total Quote Value:</span>
                  <div className="text-lg font-extrabold text-navy">
                    ₹{(formData.unitPrice * formData.durationDays - formData.discount + Number(formData.deposit)).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Subtotal: ₹{(formData.unitPrice * formData.durationDays).toLocaleString('en-IN')}</span>
                  <br />
                  <span>Deposit: ₹{Number(formData.deposit).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="v-modal-footer p-0 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={(e) => handleCreateQuotation(e, true)}
                  className="btn-v-secondary"
                >
                  Save as Draft
                </button>
                <button type="submit" className="btn-v-primary">
                  <Send size={15} />
                  <span>Send Quotation to Client</span>
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
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
