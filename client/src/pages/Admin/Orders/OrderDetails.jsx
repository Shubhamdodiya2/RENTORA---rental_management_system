import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Store,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  IndianRupee,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { StatusBadge, ConfirmationModal } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    orders,
    updateOrderStatus,
    resolveOrderDispute,
    addOrderAdminNote,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [newNote, setNewNote] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputeAction, setDisputeAction] = useState('Refunded'); // 'Refunded' | 'Deducted' | 'Custom'

  const order = orders.find((o) => o.id === id || o.orderNumber === id) || orders[0];

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addOrderAdminNote(order.id, newNote);
    setNewNote('');
  };

  const handleResolveDispute = (e) => {
    e.preventDefault();
    if (!disputeNotes.trim()) return;

    requestConfirmation({
      title: `Resolve Dispute for ${order.orderNumber}?`,
      message: `Execute escrow action: [${disputeAction}] with note: "${disputeNotes}"?`,
      confirmText: 'Execute Resolution',
      confirmColor: 'blue',
      onConfirm: () => {
        resolveOrderDispute(order.id, {
          depositAction: disputeAction,
          notes: disputeNotes
        });
        setDisputeNotes('');
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Back Navigation & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast(`Generating GST-compliant Invoice for ${order.orderNumber}...`, 'info')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={14} className="text-slate-500" />
            <span>Download Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Order Header Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rental Booking</span>
              <StatusBadge status={order.orderStatus} />
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/80">
                Payment: {order.paymentStatus}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold font-['Sora'] text-slate-900">{order.orderNumber}</h1>
            <p className="text-xs text-slate-500 mt-1">Booked on {order.orderDate} • Delivery Type: {order.deliveryType}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-right">
            <span className="text-[11px] font-medium text-slate-500 uppercase block">Total Booking Paid</span>
            <div className="text-2xl font-extrabold text-slate-900 font-['Sora']">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Deposit Escrow: ₹{order.depositAmount} ({order.escrowStatus})
            </div>
          </div>
        </div>

        {/* 5-Step Timeline Tracker */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rental Lifecycle Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {order.timeline?.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  step.done
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={15} className={step.done ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="font-semibold text-xs">{step.step}</span>
                </div>
                <div className="text-[10px] font-medium pl-5 text-slate-500">{step.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Grid: Customer & Vendor Info + Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Parties & Gear */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer & Vendor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Box */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                <User size={14} className="text-blue-600" />
                <span>Renter (Customer)</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-['Sora']">{order.customer?.name}</h4>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  <div>Email: {order.customer?.email}</div>
                  <div>Phone: {order.customer?.phone}</div>
                  <div className="flex items-start gap-1 pt-1 text-slate-600">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/admin/customers/${order.customer?.id}`}
                className="inline-block text-xs font-semibold text-blue-600 hover:underline pt-1"
              >
                View Customer Profile →
              </Link>
            </div>

            {/* Vendor Box */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                <Store size={14} className="text-slate-700" />
                <span>Rental Merchant (Vendor)</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-['Sora']">{order.vendor?.name}</h4>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  <div>City Hub: {order.vendor?.city}</div>
                  <div>Contact: {order.vendor?.email}</div>
                  <div>Store Stock Check: Verified OK</div>
                </div>
              </div>
              <Link
                to={`/admin/vendors/${order.vendor?.id}`}
                className="inline-block text-xs font-semibold text-slate-900 hover:underline pt-1"
              >
                View Vendor Store →
              </Link>
            </div>

          </div>

          {/* Equipment Details Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Rented Equipment Item</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  {order.product?.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 font-['Sora']">{order.product?.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Duration: <strong className="text-slate-800">{order.startDate} to {order.endDate} ({order.durationDays} Days)</strong>
                </p>
              </div>
              <div className="text-right font-['Sora']">
                <div className="text-lg font-bold text-slate-900">₹{order.rentalAmount}</div>
                <div className="text-xs text-slate-500">Rate: ₹{order.product?.pricePerDay} / day</div>
              </div>
            </div>
          </div>

          {/* Dispute Mediation Box (Active when order is Disputed) */}
          {order.orderStatus === 'Disputed' && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600" />
                <h3 className="text-base font-bold font-['Sora'] text-rose-900">
                  Super Admin Dispute Arbitration Desk
                </h3>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                This order is flagged for equipment damage or delayed return. Escrow security deposit of <strong className="font-bold">₹{order.depositAmount}</strong> is currently on hold.
              </p>

              <form onSubmit={handleResolveDispute} className="space-y-3 pt-1 text-xs font-semibold text-slate-800">
                <div>
                  <label className="block mb-1 text-slate-700 uppercase tracking-wider text-[10px]">Arbitration Escrow Action</label>
                  <select
                    value={disputeAction}
                    onChange={(e) => setDisputeAction(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    <option value="Refunded">Full Escrow Refund to Customer (Damage Dismissed)</option>
                    <option value="Deducted & Transferred to Vendor">Deduct Damage Penalty & Transfer to Vendor</option>
                    <option value="Partial Split (50% Customer / 50% Vendor)">Partial 50-50 Split Resolution</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-700 uppercase tracking-wider text-[10px]">Super Admin Arbitrator Judgment Note</label>
                  <textarea
                    rows={2}
                    required
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    placeholder="Log legal/contract reason for this judgment..."
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-white font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all"
                >
                  Execute Dispute Judgment & Release Escrow
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right 5 Cols: Financial Statement & Admin Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Financial Breakdown</h3>
            
            <div className="space-y-2.5 text-xs text-slate-800 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Gear Rental Fee ({order.durationDays}d):</span>
                <span className="font-semibold text-slate-800">₹{order.rentalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Damage Insurance Protection:</span>
                <span className="font-semibold text-slate-800">₹{order.insuranceAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doorstep Delivery Logistics:</span>
                <span className="font-semibold text-slate-800">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Rentora Platform Commission (10%):</span>
                <span className="text-blue-600 font-bold">- ₹{order.platformCommission}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Vendor Net Disbursement:</span>
                <span>₹{order.vendorEarnings}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold pt-2 border-t border-slate-100 text-sm">
                <span>Total Customer Billed:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Refundable Security Escrow:</span>
                <span className="font-bold text-emerald-700">₹{order.depositAmount}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Status: {order.escrowStatus}</div>
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Order Dossier Notes</h3>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line font-medium">
              {order.notes || 'No internal notes recorded on this order.'}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private admin note..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Log Note
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
