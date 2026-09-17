import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutStepper from '../../components/CheckoutStepper/CheckoutStepper';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import './Booking.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingDraft, updateBookingDraft, calculateTotal, setConfirmedBooking } = useBooking();
  const { user, isAuthenticated } = useAuth();

  const product = bookingDraft.product;

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || 'Aarav Patel');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'aarav.creator@rentora.in');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98250 12345');
  const [deliveryAddress, setDeliveryAddress] = useState(bookingDraft.deliveryAddress || '304, Shivalik Highstreet, Keshavbaug, Ahmedabad, Gujarat - 380015');
  const [rentalNotes, setRentalNotes] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('full'); // 'full' | 'deposit_only' | 'pay_on_delivery'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { subtotal, deposit, deliveryFee, total } = calculateTotal();
  const finalTotal = Math.max(0, total - appliedDiscount);

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

  const handleConfirmOrder = () => {
    if (!acceptTerms) {
      alert("Please accept the rental agreement & damage policy to proceed.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const orderNumber = 'REN-' + Math.floor(100000 + Math.random() * 900000);
      const confirmedData = {
        orderNumber,
        product,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress: bookingDraft.deliveryType === 'doorstep' ? deliveryAddress : product.vendor.address,
        deliveryType: bookingDraft.deliveryType,
        startDate: bookingDraft.startDate,
        endDate: bookingDraft.endDate,
        durationDays: bookingDraft.durationCount,
        quantity: bookingDraft.quantity,
        subtotal,
        deposit,
        deliveryFee,
        discount: appliedDiscount,
        totalPayable: finalTotal,
        paymentPlan,
        paymentMethod,
        bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setConfirmedBooking(confirmedData);
      setIsProcessing(false);
      navigate('/booking/success');
    }, 1500);
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
          
          {/* Left Section: Customer Info, Address & KYC */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Details */}
            <div className="booking-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora']">
                  <ShieldCheck size={16} className="text-[#E63946]" />
                  <span>1. Customer & KYC Verification</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 size={12} /> KYC Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-[#1D3557] uppercase text-[10px] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1D3557] uppercase text-[10px] mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#1D3557] uppercase text-[10px] mb-1">
                    Email Address (For Digital Rental Agreement)
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                  />
                </div>
              </div>
            </div>

            {/* Delivery or Storefront Address */}
            <div className="booking-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora'] pb-2 border-b border-gray-100">
                <MapPin size={16} className="text-[#E63946]" />
                <span>2. {bookingDraft.deliveryType === 'doorstep' ? 'Doorstep Delivery Address' : 'Store Pickup Location'}</span>
              </div>

              {bookingDraft.deliveryType === 'doorstep' ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#1D3557] uppercase text-[10px] mb-1">
                      Complete Street Address in Gujarat
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Flat/House No, Building, Area, Landmark, City & Pincode"
                      className="w-full p-2.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <Truck size={14} className="flex-shrink-0" />
                    <span>Courier will contact on {customerPhone} 30 mins prior to delivery slot.</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F1FAEE] p-4 rounded-2xl border border-[#A8DADC]/40 space-y-2 text-xs text-[#1D3557]">
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <Store size={15} className="text-[#E63946]" />
                    <span>{product.vendor.name} Hub</span>
                  </div>
                  <p className="text-[#457B9D]">{product.vendor.address}</p>
                  <p className="font-semibold text-emerald-700">Ready for pickup on {bookingDraft.startDate} at {bookingDraft.pickupTime}</p>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <label className="block font-bold text-[#1D3557] uppercase text-[10px] mb-1">
                  Special Instructions or Kit Customization (Optional)
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
            <div className="booking-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora'] pb-2 border-b border-gray-100">
                <CreditCard size={16} className="text-[#E63946]" />
                <span>3. Select Payment Plan</span>
              </div>

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
                      Pay rent + refundable deposit online now via UPI/Cards. Instant automated confirmation.
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
                      <h4 className="text-xs font-bold text-[#1D3557]">Pay Deposit Only Now (Reserve Slot)</h4>
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
                      Inspect equipment at delivery, test accessories, then pay full amount via UPI QR code.
                    </p>
                  </div>
                </div>

              </div>

              {/* Online Payment Method Tabs if paying online */}
              {paymentPlan !== 'pay_on_delivery' && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    {['upi', 'card', 'netbanking'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 rounded-xl border uppercase tracking-wider text-[10px] transition-all ${
                          paymentMethod === m ? 'bg-[#1D3557] text-white border-[#1D3557]' : 'bg-[#F1FAEE] text-[#457B9D]'
                        }`}
                      >
                        {m === 'upi' ? 'UPI (GPay / PhonePe)' : m === 'card' ? 'Debit/Credit Card' : 'Net Banking'}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="bg-[#F1FAEE] p-3 rounded-2xl border border-[#A8DADC]/40 space-y-2 text-xs">
                      <label className="block font-bold text-[#1D3557] text-[10px] uppercase">
                        Enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full p-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold text-[#1D3557]"
                      />
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
                <span className="text-xs font-semibold text-[#E63946]">{bookingDraft.durationCount} Days</span>
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
                      Total Payable
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {paymentPlan === 'deposit_only' ? 'Pay deposit now' : paymentPlan === 'pay_on_delivery' ? 'Pay on doorstep delivery' : 'Includes 100% refundable deposit'}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#1D3557] font-['Sora']">
                    ₹{(paymentPlan === 'deposit_only' ? deposit : paymentPlan === 'pay_on_delivery' ? finalTotal : finalTotal).toLocaleString('en-IN')}
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
                    <span>Pay & Confirm Rental Order</span>
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
