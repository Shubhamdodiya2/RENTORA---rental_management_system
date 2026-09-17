import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Check,
  Building,
  CreditCard
} from 'lucide-react';
import { VENDOR_INVOICES } from '../../../data/vendorMockData';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorInvoices.css';

export default function VendorInvoices() {
  const { invoices: contextInvoices, showToast } = useVendor();
  const [invoices, setInvoices] = useState(contextInvoices || VENDOR_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');
    if (token) {
      fetch('/api/v1/invoices/vendor', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            const mapped = resData.data.map((inv) => ({
              id: inv.id,
              invoiceNumber: inv.invoiceNumber,
              orderId: inv.booking ? inv.booking.bookingNumber : (inv.order ? inv.order.orderNumber : 'N/A'),
              customer: inv.customerSnapshot?.fullName || inv.customer?.fullName || 'Customer',
              issueDate: inv.invoiceDate,
              paymentMethod: inv.paymentMethod || 'UPI',
              amount: Number(inv.totalAmount || 0),
              deposit: Number(inv.depositAmount || 0),
              paymentStatus: inv.status === 'PAID' ? 'Paid' : 'Pending',
              rawInvoice: inv
            }));
            setInvoices(mapped);
          }
        })
        .catch(() => {
          // Keep mock invoices
        });
    }
  }, []);

  const totalInvoiced = invoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.orderId.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="vendor-invoices-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Invoices & Tax Billing</h1>
          <p className="page-sub-heading">
            Audit GST-compliant tax invoices, client billing records, and automated payment receipts.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting all tax invoices as ZIP bundle...', 'success')}
          className="btn-v-secondary"
        >
          <Download size={16} />
          <span>Export All Invoices</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="invoice-stats-grid">
        <div className="v-stat-card">
          <span className="v-stat-title">Total Invoiced</span>
          <div className="v-stat-val text-navy">₹{totalInvoiced.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-500">Across all rentals</span>
        </div>
        <div className="v-stat-card">
          <span className="v-stat-title">Paid & Settled</span>
          <div className="v-stat-val text-emerald-600">₹{totalInvoiced.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% On-time clearance</span>
        </div>
        <div className="v-stat-card">
          <span className="v-stat-title">Pending Clearance</span>
          <div className="v-stat-val text-amber-600">₹0</div>
          <span className="text-[11px] text-slate-400">0 Overdue records</span>
        </div>
        <div className="v-stat-card">
          <span className="v-stat-title">Security Deposits Held</span>
          <div className="v-stat-val text-secondary-blue">₹20,000</div>
          <span className="text-[11px] text-secondary-blue font-semibold">In SafePay Escrow</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, order, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Order Ref</th>
                <th>Customer & Studio</th>
                <th>Issue Date</th>
                <th>Payment Mode</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="v-table-row">
                  <td>
                    <span className="font-mono font-bold text-navy text-xs">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      {inv.orderId}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-navy block">{inv.customer}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600">{inv.issueDate}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-medium">{inv.paymentMethod}</span>
                  </td>
                  <td>
                    <span className="font-bold text-navy text-xs">₹{inv.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-600 block">(₹{inv.deposit} Escrow)</span>
                  </td>
                  <td>
                    <span className="v-status-badge status-active">{inv.paymentStatus}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDoc({ type: 'invoice', id: inv.id, data: inv.rawInvoice || inv })}
                        className="btn-v-action-view"
                        title="View Official Invoice"
                      >
                        <Eye size={13} />
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
                        className="btn-v-action-view"
                        title="Download Invoice PDF"
                      >
                        <Download size={13} />
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
