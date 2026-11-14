import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import api from '../../../services/api';
import './Invoices.css';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('rentora_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get('/invoices/my')
      .then((res) => {
        const resData = res.data;
        if (resData.success && Array.isArray(resData.data)) {
          const mapped = resData.data.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            orderId: inv.booking ? inv.booking.bookingNumber : (inv.orderId || 'REF-' + inv.id.slice(0, 8).toUpperCase()),
            product: inv.itemsSnapshot && inv.itemsSnapshot[0] ? inv.itemsSnapshot[0].productName : 'Rental Equipment',
            vendor: inv.vendorSnapshot ? inv.vendorSnapshot.storeName : (inv.vendor ? inv.vendor.businessName : 'Rentora Store'),
            invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
            paymentMethod: inv.paymentMethod || 'UPI',
            total: Number(inv.totalAmount || 0),
            deposit: Number(inv.depositAmount || 0),
            status: inv.status === 'PAID' ? 'Confirmed' : (inv.status || 'Pending'),
            rawInvoice: inv
          }));
          setInvoices(mapped);
        } else {
          setInvoices([]);
        }
      })
      .catch((err) => {
        console.error('[Invoices] Fetch error:', err);
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
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

      {/* Invoices Table Card */}
      <div className="invoices-table-card">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 size={32} className="animate-spin text-[#E63946] mx-auto" />
            <p className="text-xs font-semibold">Loading official invoices from billing server...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E63946] flex items-center justify-center mx-auto shadow-sm">
              <Receipt size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy font-['Sora']">No Invoices Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {searchQuery
                  ? 'No invoices match your search query. Try clearing filters.'
                  : 'You do not have any billed rental invoices yet. Once you complete a rental booking, official tax invoices will be generated and available for download here.'}
              </p>
            </div>
            {!searchQuery && (
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold transition-all shadow-md mt-2"
              >
                <span>Explore Rental Products</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
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
                            const token = sessionStorage.getItem('rentora_token');
                            const invId = inv.rawInvoice?.id || inv.id;
                            if (invId) {
                              const tokenQuery = token ? `?token=${encodeURIComponent(token)}&print=true` : '?print=true';
                              const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
                              window.open(`${baseUrl}/invoices/${invId}/html${tokenQuery}`, '_blank');
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
