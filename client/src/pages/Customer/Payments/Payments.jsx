import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Lock,
  Sparkles
} from 'lucide-react';
import api from '../../../services/api';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/bookings/my')
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data?.results || res.data?.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        
        let allBookings = Array.isArray(list) ? [...list] : [];
        try {
          const sessionSaved = sessionStorage.getItem('rentora_last_confirmed_order');
          if (sessionSaved) {
            const parsed = JSON.parse(sessionSaved);
            if (parsed && parsed.bookingNumber && !allBookings.some(b => b.bookingNumber === parsed.bookingNumber)) {
              allBookings.unshift(parsed);
            }
          }
        } catch (e) {}

        const mapped = allBookings.map((b) => {
          const item = b.items && b.items[0] ? b.items[0] : {};
          const prodName = item.product ? item.product.name : (b.productName || 'Rental Gear Booking');
          const bNum = b.bookingNumber || (b.id ? b.id.slice(0, 8).toUpperCase() : 'ORD-2026');

          return {
            id: b.id || bNum,
            txnId: `TXN-${bNum.replace(/[^A-Za-z0-9]/g, '')}`,
            orderId: bNum,
            product: prodName,
            date: new Date(b.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            method: b.paymentMethod || 'UPI / NetBanking',
            type: 'Rental Fee + Escrow Deposit',
            amount: Number(b.totalAmount || b.totalPayable || 0),
            deposit: Number(b.depositAmount || b.securityDeposit || 0),
            status: b.paymentStatus || 'Verified & Settled'
          };
        });

        setPayments(mapped);
      })
      .catch((err) => {
        console.warn('[Payments] Fetch error:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.txnId.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.product.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  const totalSpending = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalEscrow = payments.reduce((sum, p) => sum + p.deposit, 0);

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
          <div className="pay-metric-val">₹{totalSpending.toLocaleString('en-IN')}</div>
          <div className="pay-metric-sub">Across {payments.length} total orders</div>
        </div>

        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">Active Deposit in Escrow</span>
            <Lock size={18} className="text-emerald-600" />
          </div>
          <div className="pay-metric-val text-emerald-600">₹{totalEscrow.toLocaleString('en-IN')}</div>
          <div className="pay-metric-sub">100% Refundable upon item return</div>
        </div>

        <div className="pay-metric-box">
          <div className="pay-metric-hdr">
            <span className="pay-metric-lbl">This Month Debits</span>
            <ArrowUpRight size={18} className="text-primary-red" />
          </div>
          <div className="pay-metric-val text-primary-red">₹{totalSpending.toLocaleString('en-IN')}</div>
          <div className="pay-metric-sub">Current active billing cycle</div>
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

      {/* Transaction Table / Empty State */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CreditCard size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy font-['Sora']">
            No Transactions Recorded Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your UPI payments, escrow deposits, and refund ledger receipts will appear here as soon as you complete a rental booking.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-red text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all"
          >
            <Sparkles size={14} />
            <span>Explore Products & Rent</span>
          </Link>
        </div>
      ) : (
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
      )}

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
