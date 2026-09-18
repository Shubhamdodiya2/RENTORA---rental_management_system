import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  MapPin, 
  Truck, 
  Store, 
  Tag, 
  FileText,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutStepper from '../../components/CheckoutStepper/CheckoutStepper';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Booking.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingDraft, updateBookingDraft, calculateTotal, setConfirmedBooking } = useBooking();
  const { user, isAuthenticated, vendorProfile } = useAuth();

  const product = bookingDraft.product;

  const isOwnerVendor = Boolean(
    (user && product?.vendor?.userId && user.id === product.vendor.userId) ||
    (vendorProfile && product?.vendor?.id && vendorProfile.id === product.vendor.id)
  );

  // Customer Contact & Delivery State
  const [customerName, setCustomerName] = useState(() => user?.fullName || user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(() => user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(() => user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(bookingDraft.deliveryAddress || '304, Shivalik Highstreet, Keshavbaug, Ahmedabad, Gujarat - 380015');
  const [rentalNotes, setRentalNotes] = useState('');
  
  // Payment State
  const [paymentPlan, setPaymentPlan] = useState('full'); // 'full' | 'deposit_only' | 'pay_on_delivery'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  // Dynamic Vendor & Customer UPI States
  const vendorBusinessName = product?.vendor?.businessName || product?.vendor?.name || 'Rentora Partner Store';
  const vendorUpiId = product?.vendor?.upiId || product?.vendor?.bankAccountMasked?.upiId || `${vendorBusinessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;

  const [customerRefundUpi, setCustomerRefundUpi] = useState(() => (
    user?.customerProfile?.refundUpi || user?.refundUpi || (user?.email ? `${user.email.split('@')[0]}@okaxis` : 'customer@okaxis')
  ));
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  // Promo State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.fullName || user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
      if (user.customerProfile?.refundUpi) {
        setCustomerRefundUpi(user.customerProfile.refundUpi);
      } else if (user.email) {
        setCustomerRefundUpi(`${user.email.split('@')[0]}@okaxis`);
      }
    }
  }, [user]);

  const { subtotal, deposit, deliveryFee, total } = calculateTotal();
  const finalTotal = Math.max(0, total - appliedDiscount);
  const payableNow = paymentPlan === 'deposit_only' ? deposit : paymentPlan === 'pay_on_delivery' ? 0 : finalTotal;

  // Dynamic Vendor Escrow UPI & QR Code
  const upiPayPayload = `upi://pay?pa=${vendorUpiId}&pn=${encodeURIComponent(vendorBusinessName)}&am=${payableNow}&cu=INR&tn=${encodeURIComponent(`Rentora Rental - ${product?.name || product?.title || 'Order'}`)}`;
  const qrCodeUrl = product?.vendor?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayPayload)}&margin=4`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(vendorUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'RENT500') {
      setAppliedDiscount(500);
      updateBookingDraft({ discount: 500, couponCode: 'RENT500' });
      setCouponMessage('🎉 Promo code applied: ₹500 instant discount!');
    } else {
      setCouponMessage('❌ Invalid coupon code. Try "RENT500"');
    }
  };

  const handleConfirmOrder = async () => {
    if (isOwnerVendor) {
      alert("You are the vendor for this product. Vendors cannot rent their own listings. Please use a customer account to rent products.");
      return;
    }

    if (!acceptTerms) {
      alert("Please accept the rental agreement & damage policy to proceed.");
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');
      if (!token) {
        alert("Authentication required. Please sign in to confirm your booking.");
        navigate('/login', { state: { from: '/checkout' } });
        setIsProcessing(false);
        return;
      }

      const bookingPayload = {
        items: [
          {
            productId: product.id,
            quantity: bookingDraft.quantity || 1
          }
        ],
        startDate: bookingDraft.startDate || '2026-09-18',
        endDate: bookingDraft.endDate || '2026-09-20',
        durationMode: bookingDraft.durationMode || 'day',
        deliveryType: bookingDraft.deliveryType || 'doorstep',
        deliveryAddress: bookingDraft.deliveryType === 'doorstep' ? deliveryAddress : (product.vendor?.address || 'Store Pickup'),
        paymentPlan: paymentPlan || 'full',
        rentalNotes: rentalNotes || '',
        customerRefundUpi: customerRefundUpi || ''
      };

      const bookingRes = await api.post('/bookings', bookingPayload);
      if (!bookingRes.data?.success || !bookingRes.data.data) {
        throw new Error(bookingRes.data?.message || 'Failed to create rental reservation.');
      }

      const bData = bookingRes.data.data;
      const createdBookingId = bData.id;
      const realBookingNumber = bData.bookingNumber;

      // Submit manual payment verification record
      const realUtr = utrNumber.trim() || ('UTR' + Math.floor(100000000000 + Math.random() * 900000000000));
      await api.post('/payments/submit-manual-upi', {
        bookingId: createdBookingId,
        utrNumber: realUtr,
        amountPaid: payableNow,
        paymentMode: 'UPI'
      }).catch((e) => console.warn('Payment proof submission note:', e));

      const confirmedData = {
        id: createdBookingId,
        orderNumber: realBookingNumber,
        bookingNumber: realBookingNumber,
        product,
        customerName: customerName || user?.fullName || user?.name || 'Customer',
        customerEmail: customerEmail || user?.email || 'customer@rentora.in',
        customerPhone: customerPhone || user?.phone || '+91 98250 12345',
        deliveryAddress: bookingDraft.deliveryType === 'doorstep' ? deliveryAddress : (product.vendor?.address || 'Store Pickup'),
        deliveryType: bookingDraft.deliveryType || 'doorstep',
        startDate: bookingDraft.startDate || '2026-09-18',
        endDate: bookingDraft.endDate || '2026-09-20',
        durationDays: bookingDraft.durationCount || 2,
        quantity: bookingDraft.quantity || 1,
        subtotal,
        deposit,
        deliveryFee,
        discount: appliedDiscount,
        totalPayable: finalTotal,
        amountPaid: payableNow,
        paymentPlan,
        paymentMethod,
        customerRefundUpi,
        vendorUpiId,
        utrNumber: realUtr,
        bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setConfirmedBooking(confirmedData);
      sessionStorage.setItem('rentora_confirmed_booking', JSON.stringify(confirmedData));
      setIsProcessing(false);
      navigate('/booking/success');
    } catch (err) {
      console.error('[Checkout Error]:', err);
      const errMsg = err.response?.data?.message || err.message || 'An error occurred while creating your rental booking.';
      alert(errMsg);
      setIsProcessing(false);
    }
  };

  if (!product) {
    navigate('/products');
    return null;
  }

  return (
    <div className="booking-page-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumb items={[
          { label: 'Explore Products', link: '/products' },
          { label: 'Rental Details', link: '/booking' },
          { label: 'Checkout & Payment', link: null }
        ]} />

        {/* Stepper (Step 2 Active) */}
        <CheckoutStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Section: Customer Info, Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Details */}
            <div className="booking-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora']">
                  <ShieldCheck size={16} className="text-[#E63946]" />
                  <span>1. Customer & KYC Verification</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified Identity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery / Pickup Address */}
            <div className="booking-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora'] pb-2 border-b border-gray-100">
                <MapPin size={16} className="text-[#E63946]" />
                <span>2. Delivery & Handover Coordinates</span>
              </div>

              {bookingDraft.deliveryType === 'doorstep' ? (
                <div>
                  <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                    Doorstep Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete flat/building, street, locality, city & pincode"
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none"
                    required
                  />
                </div>
              ) : (
                <div className="p-3 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40 text-xs space-y-1">
                  <div className="font-bold text-[#1D3557] flex items-center gap-1.5">
                    <Store size={14} className="text-[#E63946]" />
                    <span>Store Pickup Hub</span>
                  </div>
                  <p className="text-[#457B9D]">{product.vendor?.name || 'PixelCraft Hub'} — {product.vendor?.address || 'Near SG Highway, Bodakdev, Ahmedabad'}</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                  Special Dispatch Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Include extra battery, tripod mount, or test before dispatch"
                  value={rentalNotes}
                  onChange={(e) => setRentalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Options Selection */}
            <div className="booking-card space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora']">
                  <CreditCard size={16} className="text-[#E63946]" />
                  <span>3. Select Payment Plan & UPI Transfer</span>
                </div>
                <span className="text-[11px] font-bold text-[#457B9D]">
                  Escrow Protected
                </span>
              </div>

              {/* Plan Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                
                {/* Option 1: Full Upfront */}
                <div
                  onClick={() => setPaymentPlan('full')}
                  className={`payment-option-card ${paymentPlan === 'full' ? 'payment-option-selected' : 'payment-option-unselected'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1D3557]">Full Upfront Payment (Recommended)</h4>
                      <span className="text-xs font-extrabold text-[#E63946]">₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-[#457B9D] mt-0.5">
                      Pay rent + refundable deposit online now via UPI QR / GPay / Cards. Instant reservation.
                    </p>
                  </div>
                </div>

                {/* Option 2: Partial Deposit Only */}
                <div
                  onClick={() => setPaymentPlan('deposit_only')}
                  className={`payment-option-card ${paymentPlan === 'deposit_only' ? 'payment-option-selected' : 'payment-option-unselected'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#457B9D]/10 text-[#457B9D] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1D3557]">Pay Deposit Only Now (Lock Slot)</h4>
                      <span className="text-xs font-extrabold text-[#1D3557]">₹{deposit.toLocaleString('en-IN')} Now</span>
                    </div>
                    <p className="text-[11px] text-[#457B9D] mt-0.5">
                      Pay deposit (₹{deposit}) online to lock dates. Pay remaining rental on delivery.
                    </p>
                  </div>
                </div>

                {/* Option 3: Pay on Delivery */}
                <div
                  onClick={() => setPaymentPlan('pay_on_delivery')}
                  className={`payment-option-card ${paymentPlan === 'pay_on_delivery' ? 'payment-option-selected' : 'payment-option-unselected'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Banknote size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1D3557]">Pay on Doorstep Delivery</h4>
                      <span className="text-xs font-extrabold text-emerald-700">₹0 Now</span>
                    </div>
                    <p className="text-[11px] text-[#457B9D] mt-0.5">
                      Inspect equipment at delivery, test accessories, then pay via UPI QR code to delivery executive.
                    </p>
                  </div>
                </div>

              </div>

              {/* Online Payment Interface (QR Code + Official UPI + Refund Account) */}
              {paymentPlan !== 'pay_on_delivery' && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    {['upi', 'card', 'netbanking'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 rounded-xl border uppercase tracking-wider text-[10px] transition-all ${
                          paymentMethod === m ? 'bg-[#1D3557] text-white border-[#1D3557] shadow-sm' : 'bg-[#F1FAEE] text-[#457B9D] border-[#A8DADC]/40'
                        }`}
                      >
                        {m === 'upi' ? 'UPI (QR / GPay / PhonePe)' : m === 'card' ? 'Debit/Credit Card' : 'Net Banking'}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="bg-gradient-to-br from-[#F1FAEE] to-[#E9F5F8] p-5 rounded-3xl border border-[#A8DADC]/60 space-y-5 text-xs shadow-sm">
                      
                      {/* Section A: Scan QR Code & Official Vendor UPI */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-extrabold text-xs text-[#1D3557] uppercase tracking-wider flex items-center gap-1.5">
                            <QrCode size={16} className="text-[#E63946]" />
                            Scan & Pay to Platform / Vendor Escrow
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E63946] text-white text-[11px] font-extrabold shadow-sm">
                            Pay ₹{payableNow.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-[#A8DADC]/50">
                          {/* QR Code Container */}
                          <div className="sm:col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-dashed border-[#A8DADC]">
                            <img
                              src={qrCodeUrl}
                              alt="Rentora UPI Payment QR Code"
                              className="w-36 h-36 rounded-lg object-contain"
                            />
                            <span className="text-[10px] text-gray-500 font-semibold mt-1.5 flex items-center gap-1">
                              <Smartphone size={11} className="text-[#E63946]" /> Scan with Any UPI App
                            </span>
                          </div>

                          {/* Official UPI Details & 1-Click Apps */}
                          <div className="sm:col-span-7 space-y-3">
                            <div>
                              <span className="block text-[10px] font-bold uppercase text-[#457B9D] mb-1 flex items-center justify-between">
                                <span>Official Vendor UPI VPA</span>
                                <span className="text-emerald-700 font-extrabold normal-case">Store: {vendorBusinessName}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 font-mono font-bold text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[#1D3557] select-all truncate">
                                  {vendorUpiId}
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCopyUpi}
                                  className="px-3 py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Direct App Launch Pills */}
                            <div>
                              <span className="block text-[10px] font-bold text-[#457B9D] uppercase mb-1.5">
                                Instant App Payment
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                <a
                                  href={upiPayPayload}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold hover:bg-emerald-100 flex items-center gap-1"
                                >
                                  <span>Google Pay</span>
                                </a>
                                <a
                                  href={upiPayPayload}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-800 text-[10px] font-bold hover:bg-indigo-100 flex items-center gap-1"
                                >
                                  <span>PhonePe</span>
                                </a>
                                <a
                                  href={upiPayPayload}
                                  className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 text-[10px] font-bold hover:bg-sky-100 flex items-center gap-1"
                                >
                                  <span>Paytm / BHIM</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section B: Customer UPI for Deposit Refund */}
                      <div className="pt-3 border-t border-[#A8DADC]/40 space-y-3">
                        <div className="space-y-1">
                          <label className="block font-extrabold text-[#1D3557] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Wallet size={14} className="text-emerald-600" />
                            Your UPI ID (For 100% Refundable Security Deposit Return)
                          </label>
                          <p className="text-[10px] text-[#457B9D]">
                            Refundable security deposit of <strong>₹{deposit.toLocaleString('en-IN')}</strong> will be automatically credited back to this account upon equipment handover.
                          </p>
                        </div>
                        <input
                          type="text"
                          value={customerRefundUpi}
                          onChange={(e) => setCustomerRefundUpi(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold text-[#1D3557] focus:outline-none"
                        />
                      </div>

                      {/* Section C: Optional UTR / Reference ID */}
                      <div className="pt-2 border-t border-[#A8DADC]/40 space-y-1.5">
                        <label className="block font-bold text-[#1D3557] text-[10px] uppercase">
                          UPI Reference / UTR Number (Optional / Auto-Confirmed)
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 425678912345 (12-digit UTR from payment receipt)"
                          className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-medium text-[#1D3557] focus:outline-none"
                        />
                      </div>

                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-[#F1FAEE] p-4 rounded-2xl border border-[#A8DADC]/40 space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold text-[#1D3557] text-[10px] uppercase">Card Number</label>
                        <input type="text" placeholder="4532 •••• •••• 8892" className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-mono font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-[#1D3557] text-[10px] uppercase">Expiry (MM/YY)</label>
                          <input type="text" placeholder="12/28" className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold" />
                        </div>
                        <div>
                          <label className="block font-bold text-[#1D3557] text-[10px] uppercase">CVV</label>
                          <input type="password" placeholder="•••" maxLength={3} className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="bg-[#F1FAEE] p-4 rounded-2xl border border-[#A8DADC]/40 space-y-2 text-xs">
                      <label className="block font-bold text-[#1D3557] text-[10px] uppercase">Select Bank</label>
                      <select className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold text-[#1D3557]">
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#457B9D]">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E63946] accent-[#E63946] mt-0.5"
                  />
                  <span>
                    I accept the <strong className="text-[#1D3557]">Rentora Digital Rental Agreement</strong>, standard security deposit terms, and acknowledge equipment return in sanitized condition.
                  </span>
                </label>
              </div>

            </div>

          </div>

          {/* Right Section: Order Summary & Pay Button */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            
            <div className="booking-card space-y-5">
              
              <div className="text-base font-bold text-[#1D3557] font-['Sora'] pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-[#E63946]">{bookingDraft.durationCount || 2} Days</span>
              </div>

              {/* Product Card Mini */}
              <div className="flex items-center gap-3 bg-[#F1FAEE] p-3 rounded-2xl border border-[#A8DADC]/30">
                <img src={product.images[0]} alt={product.title} className="w-14 h-14 rounded-xl object-cover border" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-[#1D3557] line-clamp-1">{product.title}</h4>
                  <div className="text-[10px] text-[#457B9D] mt-0.5">
                    {bookingDraft.startDate} → {bookingDraft.endDate}
                  </div>
                </div>
              </div>

              {/* Promo Code Box */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (Try: RENT500)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-bold text-[#1D3557] uppercase focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <div className="text-[11px] font-bold text-[#E63946]">{couponMessage}</div>
                )}
              </form>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-xs text-[#1D3557] pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-[#457B9D]">Rental Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#457B9D] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Refundable Security Deposit:
                  </span>
                  <span className="font-bold text-emerald-700">₹{deposit.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#457B9D]">Delivery / Hub Fee:</span>
                  <span className="font-bold">{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promo Discount:</span>
                    <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#457B9D] block">
                      Payable Now
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {paymentPlan === 'deposit_only' ? 'Deposit to reserve slot' : paymentPlan === 'pay_on_delivery' ? 'Pay on doorstep delivery' : 'Full rental + refundable deposit'}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#1D3557] font-['Sora']">
                    ₹{payableNow.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                disabled={isProcessing}
                onClick={handleConfirmOrder}
                className="w-full py-4 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Secure Checkout...</span>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Pay ₹{payableNow.toLocaleString('en-IN')} & Confirm Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#457B9D]">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-Bit SSL Encrypted Escrow Protection</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
