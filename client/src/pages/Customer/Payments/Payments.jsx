import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Search,
  Download,
  Eye,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Lock
} from 'lucide-react';
import { CUSTOMER_PAYMENTS, CUSTOMER_METRICS } from '../../../data/customerMockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Payments.css';

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const filteredPayments = CUSTOMER_PAYMENTS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.txnId.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.product.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Payment History & Escrow Ledger</h1>
          <p className="page-sub-heading">
            Audit transparent records of upfront rentals, security deposits, and automatic escrow releases.
          </p>
        </div>
      </div>

      {/* Escrow Ledger Highlights */}
      <div className="payments-metrics-grid">
        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">Total Spending</span>
            <CreditCard size={18} className="text-navy" />
          </div>
          <div className="pay-metric-val">{CUSTOMER_METRICS.totalSpending}</div>
          <div className="pay-metric-sub">Across 18 total rentals</div>
        </div>

        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">Active Deposit in Escrow</span>
            <Lock size={18} className="text-emerald-600" />
          </div>
          <div className="pay-metric-val text-emerald-600">{CUSTOMER_METRICS.activeDepositInEscrow}</div>
          <div className="pay-metric-sub">100% Refundable upon item return</div>
        </div>

        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">This Month Debits</span>
            <ArrowUpRight size={18} className="text-primary-red" />
          </div>
          <div className="pay-metric-val text-primary-red">{CUSTOMER_METRICS.thisMonthSpending}</div>
          <div className="pay-metric-sub">September 2026 transactions</div>
        </div>
      </div>

      {/* Transaction Filter */}
      <div className="payment-filter-bar">
        <div className="search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search transaction ID, order ref, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="payment-search-input"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="payments-table-card">
        <div className="table-responsive">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Linked Order</th>
                <th>Description / Gear</th>
                <th>Date & Time</th>
                <th>Payment Mode</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => {
                const isRefund = p.type.includes('Refund');
                return (
                  <tr key={p.id} className="payment-table-row">
                    <td>
                      <span className="font-mono font-bold text-navy text-xs">
                        {p.txnId}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500 font-semibold">
                        {p.orderId}
                      </span>
                    </td>
                    <td>
                      <span className="pay-desc-title">{p.product}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">{p.date}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-700 font-medium">{p.method}</span>
                    </td>
                    <td>
                      <span className={`pay-type-badge ${isRefund ? 'pay-refund' : 'pay-charge'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td>
                      <span className={`font-bold text-sm ${isRefund ? 'text-emerald-600' : 'text-navy'}`}>
                        {isRefund ? `+₹${p.amount.toLocaleString('en-IN')}` : `₹${p.amount.toLocaleString('en-IN')}`}
                      </span>
                    </td>
                    <td>
                      <span className="pay-status-pill">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedReceipt({ type: 'invoice', id: p.orderId })}
                        className="btn-pay-receipt"
                        title="View Digital Receipt"
                      >
                        <Receipt size={14} />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Universal Document / Receipt Modal */}
      {selectedReceipt && (
        <DocumentModal
          type={selectedReceipt.type}
          docId={selectedReceipt.id}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
