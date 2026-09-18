import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  FileText,
  CreditCard,
  MessageSquareWarning,
  UserCheck,
  UserX,
  Plus,
  CheckCircle2,
  Download,
  ExternalLink
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ConfirmationModal } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    customers,
    orders,
    payments,
    complaints,
    updateCustomerStatus,
    addCustomerAdminNote,
    openDocumentModal,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'payments' | 'complaints' | 'kyc' | 'notes'
  const [newNote, setNewNote] = useState('');

  // Find target customer
  const customer = customers.find((c) => c.id === id) || customers[0];

  // Related data
  const customerOrders = orders.filter((o) => o.customer?.id === customer.id || o.customer?.name === customer.name);
  const customerPayments = payments.filter((p) => p.customer === customer.name);
  const customerComplaints = complaints.filter((c) => c.raisedBy.includes(customer.name));

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCustomerAdminNote(customer.id, newNote);
    setNewNote('');
  };

  const handleToggleStatus = (newStatus) => {
    requestConfirmation({
      title: `Set Account Status to ${newStatus}?`,
      message: `Change account status for ${customer.name} to "${newStatus}"?`,
      confirmText: `Set ${newStatus}`,
      confirmColor: newStatus === 'Active' ? 'blue' : 'red',
      onConfirm: () => updateCustomerStatus(customer.id, newStatus)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to All Customers</span>
        </Link>

        <div className="flex items-center gap-2">
          {customer.accountStatus === 'Active' ? (
            <button
              onClick={() => handleToggleStatus('Suspended')}
              className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
            >
              Suspend Account
            </button>
          ) : (
            <button
              onClick={() => handleToggleStatus('Active')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Activate Account
            </button>
          )}

          <button
            onClick={() => handleToggleStatus('Blocked')}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
          >
            Block User
          </button>
        </div>
      </div>

      {/* Customer Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold font-['Sora'] text-slate-900">{customer.name}</h1>
                <StatusBadge status={customer.accountStatus} />
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} /> {customer.kycStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 font-medium"><Mail size={12} /> {customer.email}</span>
                <span className="flex items-center gap-1 font-medium"><Phone size={12} /> {customer.phone}</span>
                <span className="flex items-center gap-1 font-medium"><MapPin size={12} /> {customer.location}</span>
                <span className="flex items-center gap-1 font-medium"><Calendar size={12} /> Joined {customer.registrationDate}</span>
              </div>
            </div>
          </div>

          {/* Trust Score Metric */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5 self-start md:self-auto">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-extrabold font-['Sora'] text-base">
              {customer.trustScore}%
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Renter Trust Score</div>
              <div className="text-[11px] text-slate-400">Based on return punctuality & QC</div>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Spend (LTV)</span>
            <div className="text-lg font-extrabold text-slate-900 font-['Sora'] mt-0.5">
              ₹{(Number(customer.totalSpending ?? customer.totalSpent ?? 0)).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completed Rentals</span>
            <div className="text-lg font-extrabold text-slate-900 font-['Sora'] mt-0.5">
              {customer.totalRentals || customer.totalOrders || 0} Orders
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active Rentals</span>
            <div className="text-lg font-extrabold text-emerald-700 font-['Sora'] mt-0.5">
              {customerOrders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Delivered').length} Active
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Open Disputes</span>
            <div className="text-lg font-extrabold text-rose-600 font-['Sora'] mt-0.5">
              {customerOrders.filter((o) => o.orderStatus === 'Disputed').length} Disputes
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Rental Orders ({customerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Payment & Escrow ({customerPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'complaints'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Support Tickets ({customerComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'kyc'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          KYC Documents
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Admin Dossier Notes
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Rental Booking History</h3>
          {customerOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/60">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Equipment Rented</th>
                    <th className="py-3 px-4">Rental Dates</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Deposit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{ord.product?.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{ord.startDate} - {ord.endDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">₹{ord.depositAmount} ({ord.escrowStatus})</td>
                      <td className="py-3.5 px-4"><StatusBadge status={ord.orderStatus} /></td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/orders/${ord.id}`}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold transition-colors"
                        >
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No order records found for this customer.</p>
          )}
        </div>
      )}

      {/* Tab 2: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Payment & Escrow Transactions</h3>
          {customerPayments.length > 0 ? (
            <div className="space-y-2.5">
              {customerPayments.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{p.transactionId}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Order: {p.orderId} • Method: {p.paymentMethod} • Date: {p.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-['Sora']">₹{p.amount.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Escrow: {p.escrowStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No payment transactions on file.</p>
          )}
        </div>
      )}

      {/* Tab 3: Complaints */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Support Complaints & Tickets</h3>
          {customerComplaints.length > 0 ? (
            <div className="space-y-2.5">
              {customerComplaints.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{c.ticketNumber}: {c.subject}</span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{c.messages[0]?.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No active complaints raised by this customer.</p>
          )}
        </div>
      )}

      {/* Tab 4: KYC Documents */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Identity & KYC Verification Records</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-900">Aadhaar Card (UIDAI)</span>
                <StatusBadge status="Verified" />
              </div>
              <p className="text-xs text-slate-500">Front & Back side verified with OTP match.</p>
              <button
                onClick={() => openDocumentModal({ name: 'Aadhaar Card (UIDAI)', date: customer.registrationDate, status: 'Verified' })}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-xs"
              >
                <FileText size={14} className="text-slate-500" />
                <span>Inspect Document</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-900">PAN Card (Income Tax)</span>
                <StatusBadge status="Verified" />
              </div>
              <p className="text-xs text-slate-500">Name on PAN matches Aadhaar identity record.</p>
              <button
                onClick={() => openDocumentModal({ name: 'PAN Card (Income Tax)', date: customer.registrationDate, status: 'Verified' })}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-xs"
              >
                <FileText size={14} className="text-slate-500" />
                <span>Inspect Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Admin Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Internal Admin Dossier Notes</h3>
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {customer.notes || 'No internal notes on this customer profile.'}
          </div>

          <form onSubmit={handleAddNote} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase text-[10px]">Append New Internal Note</label>
            <textarea
              rows={3}
              required
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add observation on customer behavior, rental dispute history, or special approval..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Add Note
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
