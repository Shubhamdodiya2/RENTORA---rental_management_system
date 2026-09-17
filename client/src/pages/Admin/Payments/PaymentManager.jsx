import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  IndianRupee,
  Search,
  Filter,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Building,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { StatCard, SearchBar, StatusBadge, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function PaymentManager() {
  const {
    payments,
    processRefund,
    verifyPayment,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Refund Modal State
  const [refundingTxn, setRefundingTxn] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Deposit release on clean return');

  // Aggregated Financials
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCommission = payments.reduce((acc, p) => acc + p.commission, 0);
  const totalVendorPayouts = payments.reduce((acc, p) => acc + p.payoutAmount, 0);
  const totalEscrowLocked = payments.filter((p) => p.escrowStatus === 'Locked').reduce((acc, p) => acc + (p.depositAmount || 0), 0);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.gatewayRef?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || p.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, statusFilter, methodFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenRefund = (txn) => {
    setRefundingTxn(txn);
    setRefundAmount(txn.amount.toString());
  };

  const handleConfirmRefund = (e) => {
    e.preventDefault();
    if (!refundingTxn || !refundAmount) return;
    const amt = parseFloat(refundAmount);
    processRefund(refundingTxn.transactionId, amt, refundReason);
    setRefundingTxn(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Payments, Escrow & Revenue</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track UPI and card transaction streams, monitor security deposits in escrow, and execute refunds.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting financial ledger report...', 'info')}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download size={14} className="text-slate-500" />
          <span>Export Financial Audit Report</span>
        </button>
      </div>

      {/* 4 Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Platform Volume"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          change="+28.4%"
          isPositive={true}
          icon={IndianRupee}
          accentColor="medium-blue"
        />
        <StatCard
          title="Platform Commission (10%)"
          value={`₹${totalCommission.toLocaleString('en-IN')}`}
          change="+18.2%"
          isPositive={true}
          icon={Zap}
          accentColor="medium-blue"
        />
        <StatCard
          title="Merchant Net Payouts"
          value={`₹${totalVendorPayouts.toLocaleString('en-IN')}`}
          change="38 vendors"
          isPositive={true}
          icon={Building}
          accentColor="light-blue"
        />
        <StatCard
          title="Active Escrow Deposit"
          value={`₹${totalEscrowLocked.toLocaleString('en-IN')}`}
          change="Held Secure"
          isPositive={true}
          icon={ShieldCheck}
          accentColor="light-blue"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search txn ID, order #, customer, vendor..."
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Txn Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              <option value="all">All Transactions</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Payment Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI (GPay, PhonePe)</option>
              <option value="card">Credit / Debit Card</option>
              <option value="netbanking">NetBanking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID / Gateway Ref</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer & Vendor</th>
                  <th className="py-3.5 px-4">Gross / Comm</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Escrow State</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPayments.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Txn ID */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 font-mono">{txn.transactionId}</div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{txn.gatewayRef}</span>
                      <span className="text-[10px] text-slate-500">{txn.date}</span>
                    </td>

                    {/* Order ID */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-900 font-mono">{txn.orderId}</span>
                    </td>

                    {/* Customer & Vendor */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{txn.customer}</div>
                      <span className="text-[11px] text-slate-500">Store: {txn.vendor}</span>
                    </td>

                    {/* Gross / Comm */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 font-['Sora'] text-sm">
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Fee: ₹{txn.commission}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {txn.paymentMethod}
                    </td>

                    {/* Escrow */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/80">
                        {txn.escrowStatus}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={txn.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {txn.status === 'Paid' && (
                          <button
                            onClick={() => handleOpenRefund(txn)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-[11px] transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => showToast(`Opening receipt for ${txn.transactionId}...`, 'info')}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                          title="View Tax Receipt"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="No payment transactions found"
            description="Adjust your search filters or try clearing criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setMethodFilter('all');
            }}
          />
        )}

        <div className="p-4 bg-white border-t border-slate-200/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredPayments.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* Process Refund Modal */}
      {refundingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-['Sora'] text-slate-900">
              Process Refund: {refundingTxn.transactionId}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: <strong className="text-slate-800">{refundingTxn.customer}</strong> • Total Paid: ₹{refundingTxn.amount}
            </p>

            <form onSubmit={handleConfirmRefund} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={refundingTxn.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Reason for Refund</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer"
                >
                  <option value="Deposit release on clean return">Security Deposit Release on Clean Return</option>
                  <option value="Order cancelled before dispatch">Order Cancelled Before Dispatch (100% Refund)</option>
                  <option value="Equipment defect or unavailable">Equipment Defect or Vendor Unavailable</option>
                  <option value="Dispute resolution settlement">Dispute Resolution Settlement</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRefundingTxn(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs transition-colors"
                >
                  Confirm Instant Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
