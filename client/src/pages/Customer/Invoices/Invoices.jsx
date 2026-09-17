import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { CUSTOMER_INVOICES } from '../../../data/customerMockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Invoices.css';

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const filteredInvoices = CUSTOMER_INVOICES.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.orderId.toLowerCase().includes(q) ||
      inv.product.toLowerCase().includes(q) ||
      inv.vendor.toLowerCase().includes(q)
    );
  });

  const totalInvoiced = CUSTOMER_INVOICES.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="invoices-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Invoices & Billing</h1>
          <p className="page-sub-heading">
            Official GST-compliant tax invoices, billing receipts, and itemized fee breakdown.
          </p>
        </div>

        <div className="invoice-summary-capsule">
          <span className="inv-cap-lbl">Total Billed to Date:</span>
          <span className="inv-cap-val">₹{totalInvoiced.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="invoice-search-bar">
        <div className="search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, order, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="invoice-search-input"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="invoices-table-card">
        <div className="table-responsive">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order Ref</th>
                <th>Rental Item & Vendor</th>
                <th>Invoice Date</th>
                <th>Payment Mode</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="invoice-table-row">
                  <td>
                    <span className="font-mono font-bold text-navy text-sm">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      {inv.orderId}
                    </span>
                  </td>
                  <td>
                    <div className="inv-product-cell">
                      <span className="inv-prod-title">{inv.product}</span>
                      <span className="inv-vendor-sub">{inv.vendor}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-medium">
                      {inv.invoiceDate}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <div className="inv-amount-cell">
                      <span className="font-bold text-navy text-sm">
                        ₹{inv.total.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        (₹{inv.deposit} Deposit)
                      </span>
                    </div>
                  </td>
                  <td>
                    <RentalStatusBadge status={inv.status} size="small" />
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDoc({ type: 'invoice', id: inv.orderId })}
                        className="btn-inv-action"
                        title="View Official Tax Invoice"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => setSelectedDoc({ type: 'invoice', id: inv.orderId })}
                        className="btn-inv-download"
                        title="Download Tax PDF"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
