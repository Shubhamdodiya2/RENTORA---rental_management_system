import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Download, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Printer,
  Home,
  Store,
  FileText
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutStepper from '../../components/CheckoutStepper/CheckoutStepper';
import DocumentModal from '../../components/CustomerLayout/DocumentModal';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayStr } from '../../utils/dateUtils';
import './Booking.css';

export default function BookingSuccess() {
  const navigate = useNavigate();
  const { confirmedBooking, bookingDraft } = useBooking();
  const { user } = useAuth();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const savedBooking = typeof window !== 'undefined' && sessionStorage.getItem('rentora_confirmed_booking')
    ? JSON.parse(sessionStorage.getItem('rentora_confirmed_booking'))
    : null;

  const booking = confirmedBooking || savedBooking || {
    orderNumber: 'REN-' + Math.floor(100000 + Math.random() * 900000),
    product: bookingDraft.product,
    customerName: user?.fullName || user?.name || 'Valued Customer',
    customerEmail: user?.email || 'customer@rentora.in',
    customerPhone: user?.phone || '+91 98250 12345',
    deliveryAddress: '304, Shivalik Highstreet, Keshavbaug, Ahmedabad, Gujarat - 380015',
    deliveryType: 'doorstep',
    startDate: getTodayStr(0),
    endDate: getTodayStr(2),
    durationDays: 2,
    quantity: 1,
    subtotal: 3798,
    deposit: 3000,
    deliveryFee: 199,
    discount: 500,
    totalPayable: 6497,
    paymentPlan: 'full',
    paymentMethod: 'upi',
    bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  return (
    <div className="booking-page-container">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumb items={[
          { label: 'Explore Products', link: '/products' },
          { label: 'Booking Confirmation', link: null }
        ]} />

        {/* Stepper (Step 3 Completed) */}
        <CheckoutStepper currentStep={3} />

        {/* Success Card */}
        <div className="booking-card space-y-8 text-center animate-in fade-in">
          
          {/* Success Checkmark & Headline */}
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
              <CheckCircle2 size={42} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Rental Reserved Successfully</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
              Booking Confirmed!
            </h1>

            <p className="text-xs sm:text-sm text-[#457B9D] max-w-md mx-auto">
              Your rental reservation has been recorded. A digital contract has been sent to <strong>{booking.customerEmail}</strong>.
            </p>

            <div className="inline-block px-4 py-1.5 bg-[#F1FAEE] rounded-xl border border-[#A8DADC] text-xs font-mono font-bold text-[#1D3557]">
              Order ID: <span className="text-[#E63946]">{booking.orderNumber}</span>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-[#F1FAEE] p-6 rounded-3xl border border-[#A8DADC]/40 text-left space-y-4">
            
            {/* Product Item Row */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <img
                src={booking.product?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'}
                alt={booking.product?.title || 'Equipment Item'}
                className="w-16 h-16 rounded-2xl object-cover border border-[#A8DADC]"
              />
              <div className="flex-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D3557] text-white">
                  {booking.product?.category || 'Equipment'}
                </span>
                <h3 className="font-bold text-sm text-[#1D3557] line-clamp-1 mt-0.5 font-['Sora']">
                  {booking.product?.title || 'Professional Gear'}
                </h3>
                <p className="text-xs text-[#457B9D]">
                  Vendor: <strong>{booking.product?.vendor?.name || 'Verified Vendor'}</strong> ({booking.product?.vendor?.city || 'Ahmedabad'})
                </p>
              </div>
            </div>

            {/* Schedule & Handover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#1D3557]">
              <div className="space-y-1">
                <span className="font-bold text-[#457B9D] uppercase text-[10px] block">
                  Rental Duration & Dates
                </span>
                <div className="font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#E63946]" />
                  <span>{booking.startDate} → {booking.endDate} ({booking.durationDays} Days)</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#457B9D] uppercase text-[10px] block">
                  {booking.deliveryType === 'doorstep' ? 'Delivery Address' : 'Pickup Location'}
                </span>
                <div className="font-medium flex items-center gap-1.5 truncate">
                  <MapPin size={14} className="text-[#E63946] flex-shrink-0" />
                  <span className="truncate">{booking.deliveryAddress}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#457B9D] uppercase">Rental Fee</span>
                <div className="font-bold text-[#1D3557]">₹{booking.subtotal.toLocaleString('en-IN')}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#457B9D] uppercase">Security Deposit</span>
                <div className="font-bold text-emerald-700">₹{booking.deposit.toLocaleString('en-IN')} (Refundable)</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#457B9D] uppercase">Payment Plan</span>
                <div className="font-bold text-[#1D3557] capitalize">{(booking.paymentPlan || 'full').replace('_', ' ')}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#457B9D] uppercase">Total Paid</span>
                <div className="text-base font-extrabold text-[#E63946]">₹{booking.totalPayable.toLocaleString('en-IN')}</div>
              </div>
            </div>

          </div>

          {/* Timeline: What Happens Next? */}
          <div className="text-left space-y-4">
            <h4 className="font-bold text-sm text-[#1D3557] font-['Sora']">
              What Happens Next?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#1D3557] text-white text-[11px] font-bold flex items-center justify-center">1</div>
                <div className="font-bold text-[#1D3557]">Store Prep</div>
                <div className="text-[10px] text-[#457B9D]">Vendor inspects & sanitizes kit in pelican case.</div>
              </div>

              <div className="p-3 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#1D3557] text-white text-[11px] font-bold flex items-center justify-center">2</div>
                <div className="font-bold text-[#1D3557]">Handover</div>
                <div className="text-[10px] text-[#457B9D]">Tamper-sealed delivery on {booking.startDate}.</div>
              </div>

              <div className="p-3 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#1D3557] text-white text-[11px] font-bold flex items-center justify-center">3</div>
                <div className="font-bold text-[#1D3557]">Shoot & Enjoy</div>
                <div className="text-[10px] text-[#457B9D]">Full 24/7 technical support included.</div>
              </div>

              <div className="p-3 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#E63946] text-white text-[11px] font-bold flex items-center justify-center">4</div>
                <div className="font-bold text-[#E63946]">Return & Refund</div>
                <div className="text-[10px] text-[#457B9D]">Easy pickup and deposit released in 2 hours.</div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#457B9D] text-[#1D3557] text-xs font-bold hover:bg-[#F1FAEE] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Printer size={15} />
              <span>Print Rental Receipt / Invoice</span>
            </button>

            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold btn-primary-glow flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore More Products</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>

      </div>

      {/* Official Tax Invoice & Rental Receipt Document Modal */}
      {showReceiptModal && (
        <DocumentModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          type="receipt"
          title="Official Rental Booking Receipt & Tax Invoice"
          docId={booking.orderNumber}
          data={booking}
        />
      )}
    </div>
  );
}

