import React, { useState, useEffect } from 'react';
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
  const [invoices, setInvoices] = useState(CUSTOMER_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');
    if (token) {
      setLoading(true);
      fetch('/api/v1/invoices/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            const mapped = resData.data.map((inv) => ({
              id: inv.id,
              invoiceNumber: inv.invoiceNumber,
              orderId: inv.booking ? inv.booking.bookingNumber : inv.orderId,
              product: inv.itemsSnapshot && inv.itemsSnapshot[0] ? inv.itemsSnapshot[0].productName : 'Rental Item',
              vendor: inv.vendorSnapshot ? inv.vendorSnapshot.storeName : (inv.vendor ? inv.vendor.businessName : 'Vendor'),
              invoiceDate: inv.invoiceDate,
              paymentMethod: inv.paymentMethod || 'UPI',
              total: Number(inv.totalAmount || 0),
              deposit: Number(inv.depositAmount || 0),
              status: inv.status === 'PAID' ? 'Confirmed' : 'Pending Verification',
              rawInvoice: inv
            }));
            setInvoices(mapped);
          }
        })
        .catch(() => {
          // Keep mock invoices
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.orderId && inv.orderId.toLowerCase().includes(q)) ||
      (inv.product && inv.product.toLowerCase().includes(q)) ||
      (inv.vendor && inv.vendor.toLowerCase().includes(q))
    );
  });

  const totalInvoiced = invoices.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

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
                        onClick={() => setSelectedDoc({ type: 'invoice', id: inv.id, data: inv.rawInvoice || inv })}
                        className="btn-inv-action"
                        title="View Official Tax Invoice"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          if (inv.rawInvoice && inv.rawInvoice.id) {
                            window.open(`/api/v1/invoices/${inv.rawInvoice.id}/html`, '_blank');
                          } else {
                            setSelectedDoc({ type: 'invoice', id: inv.id, data: inv.rawInvoice || inv });
                          }
                        }}
                        className="btn-inv-download"
                        title="Download / Print Tax Invoice"
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
          data={selectedDoc.data}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
