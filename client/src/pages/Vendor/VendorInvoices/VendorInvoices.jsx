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
  CreditCard,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './VendorInvoices.css';

export default function VendorInvoices() {
  const { invoices: contextInvoices, showToast } = useVendor();
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatInvoiceList = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((inv) => {
      const customerName = typeof inv.customer === 'string'
        ? inv.customer
        : (inv.customerSnapshot?.fullName || inv.customer?.fullName || inv.customer?.name || 'Customer');

      const orderRef = typeof inv.orderId === 'string'
        ? inv.orderId
        : (inv.booking?.bookingNumber || (inv.order ? inv.order.orderNumber : `REF-${String(inv.id || '').slice(0, 8).toUpperCase()}`));

      const invNum = String(inv.invoiceNumber || `INV-${String(inv.id || '').slice(0, 8).toUpperCase()}`);

      const issueDate = inv.invoiceDate
        ? (typeof inv.invoiceDate === 'string' && inv.invoiceDate.length > 12 ? new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : inv.invoiceDate)
        : (inv.issueDate || 'Today');

      return {
        id: inv.id || String(Math.random()),
        invoiceNumber: invNum,
        orderId: orderRef,
        customer: customerName,
        issueDate: issueDate,
        paymentMethod: inv.paymentMethod || 'UPI',
        amount: Number(inv.totalAmount || inv.amount || 0),
        deposit: Number(inv.depositAmount || inv.deposit || 0),
        paymentStatus: (inv.status === 'PAID' || inv.paymentStatus === 'Paid') ? 'Paid' : 'Pending',
        rawInvoice: inv
      };
    });
  };

  useEffect(() => {
    if (contextInvoices && contextInvoices.length > 0) {
      setInvoices(formatInvoiceList(contextInvoices));
      setLoading(false);
    }
  }, [contextInvoices]);

  useEffect(() => {
    const token = sessionStorage.getItem('rentora_token');
    if (token) {
      fetch('/api/v1/invoices/vendor', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data)) {
            setInvoices(formatInvoiceList(resData.data));
          }
        })
        .catch((err) => {
          console.warn('[VendorInvoices] API notice:', err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const totalInvoiced = invoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalDepositHeld = invoices.reduce((acc, curr) => acc + Number(curr.deposit || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const invNum = String(inv.invoiceNumber || '').toLowerCase();
    const ordId = String(inv.orderId || '').toLowerCase();
    const cust = String(inv.customer || '').toLowerCase();
    return invNum.includes(q) || ordId.includes(q) || cust.includes(q);
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
          <span className="text-[11px] text-slate-500">Across all customer orders</span>
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
          <div className="v-stat-val text-secondary-blue">₹{totalDepositHeld.toLocaleString('en-IN')}</div>
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
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#E63946] mx-auto" />
            <p className="text-xs font-semibold">Loading vendor invoices...</p>
          </div>
        ) : (
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
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Receipt size={36} className="text-slate-300" />
                        <span className="font-semibold text-slate-600">No official vendor invoices found</span>
                        <span className="text-xs text-slate-400">
                          {searchQuery ? 'Try clearing your search query' : 'When customers book your rental items, official GST invoices will appear here.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
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
                        {inv.deposit > 0 && (
                          <span className="text-[10px] text-emerald-600 block">(₹{inv.deposit.toLocaleString('en-IN')} Escrow)</span>
                        )}
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
                              const token = sessionStorage.getItem('rentora_token');
                              const invId = (inv.rawInvoice && inv.rawInvoice.id) ? inv.rawInvoice.id : inv.id;
                              const printUrl = `/api/v1/invoices/${invId}/html${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                              window.open(printUrl, '_blank');
                            }}
                            className="btn-v-action-view"
                            title="Download / Print Invoice HTML"
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
