import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Truck, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  ArrowLeft,
  Info,
  Sparkles,
  UserCheck
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutStepper from '../../components/CheckoutStepper/CheckoutStepper';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import './Booking.css';

export default function Booking() {
  const navigate = useNavigate();
  const { bookingDraft, updateBookingDraft, calculateTotal } = useBooking();
  const { isAuthenticated, user, vendorProfile } = useAuth();

  const product = bookingDraft.product;

  const isOwnerVendor = Boolean(
    (user && product?.vendor?.userId && user.id === product.vendor.userId) ||
    (vendorProfile && product?.vendor?.id && vendorProfile.id === product.vendor.id)
  );

  const [deliveryType, setDeliveryType] = useState(bookingDraft.deliveryType || 'doorstep');
  const [pickupTime, setPickupTime] = useState(bookingDraft.pickupTime || '10:00 AM');
  const [returnTime, setReturnTime] = useState(bookingDraft.returnTime || '06:00 PM');
  const [startDate, setStartDate] = useState(bookingDraft.startDate || '2026-09-18');
  const [endDate, setEndDate] = useState(bookingDraft.endDate || '2026-09-20');
  const [quantity, setQuantity] = useState(bookingDraft.quantity || 1);

  const { subtotal, deposit, deliveryFee, total } = calculateTotal();

  if (!product) {
    return (
      <div className="booking-page-container">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-[#A8DADC]/40 space-y-4">
          <h3 className="text-lg font-bold text-[#1D3557]">No product selected for rental</h3>
          <p className="text-xs text-[#457B9D]">Please explore our product catalog and click "Rent Now".</p>
          <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-bold">
            Explore Rentals
          </Link>
        </div>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    if (isOwnerVendor) {
      alert("You are the vendor for this equipment. Vendors cannot rent their own listings.");
      return;
    }

    updateBookingDraft({
      deliveryType,
      pickupTime,
      returnTime,
      startDate,
      endDate,
      quantity
    });

    if (!isAuthenticated) {
      // Prompt login or redirect with return intent
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="booking-page-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Explore Products', link: '/products' },
          { label: product.title, link: `/products/${product.id}` },
          { label: 'Rental Details', link: null }
        ]} />

        {/* Stepper (Step 1 Active) */}
        <CheckoutStepper currentStep={1} />

        {/* Main 2-Column Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Info & Rental Logistics */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Selected Product Card */}
            <div className="booking-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#1D3557]/10 flex-shrink-0 border border-[#A8DADC]/40">
                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D3557] text-[#F1FAEE]">
                    {product.category}
                  </span>
                  <span className="text-xs text-[#457B9D] flex items-center gap-1 font-semibold">
                    <Store size={12} className="text-[#E63946]" /> {product.vendor.name}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-[#1D3557] font-['Sora'] line-clamp-1">
                  {product.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-[#1D3557] pt-1">
                  <span className="font-extrabold text-sm text-[#E63946]">
                    ₹{product.pricePerDay.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#457B9D]">/ day</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck size={13} /> ₹{product.deposit} Deposit
                  </span>
                </div>
              </div>

              <Link
                to={`/products/${product.id}`}
                className="text-xs font-bold text-[#457B9D] hover:text-[#E63946] flex-shrink-0"
              >
                Change Item
              </Link>
            </div>

            {/* Rental Dates & Time Schedule */}
            <div className="booking-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora'] pb-2 border-b border-gray-100">
                <Calendar size={16} className="text-[#E63946]" />
                <span>Rental Dates & Timing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-bold text-[#1D3557]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    End Date (Return)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-bold text-[#1D3557]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Preferred Delivery / Pickup Time
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                  >
                    <option value="09:00 AM">09:00 AM - Morning Slot</option>
                    <option value="10:00 AM">10:00 AM - Morning Slot</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                    <option value="06:00 PM">06:00 PM - Evening Slot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Preferred Return Pickup Time
                  </label>
                  <select
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557]"
                  >
                    <option value="06:00 PM">06:00 PM - Evening Slot</option>
                    <option value="08:00 PM">08:00 PM - Night Slot</option>
                    <option value="11:00 AM">11:00 AM - Morning Return</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery vs Storefront Pickup Selection */}
            <div className="booking-card space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora'] pb-2 border-b border-gray-100">
                <Truck size={16} className="text-[#E63946]" />
                <span>Handover Preference</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryType('doorstep')}
                  className={`payment-option-card ${deliveryType === 'doorstep' ? 'payment-option-selected' : 'payment-option-unselected'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center flex-shrink-0">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1D3557]">Express Doorstep Delivery</div>
                    <div className="text-[11px] text-[#457B9D] mt-0.5">Delivered safely in sealed hard case (+₹199)</div>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryType('store_pickup')}
                  className={`payment-option-card ${deliveryType === 'store_pickup' ? 'payment-option-selected' : 'payment-option-unselected'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1D3557]/10 text-[#1D3557] flex items-center justify-center flex-shrink-0">
                    <Store size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1D3557]">Self Pickup from Store</div>
                    <div className="text-[11px] text-[#457B9D] mt-0.5">{product.vendor.name} ({product.vendor.city}) (Free)</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing Breakdown & Checkout Trigger */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            
            <div className="booking-card space-y-5">
              <div className="text-base font-bold text-[#1D3557] font-['Sora'] pb-3 border-b border-gray-100">
                Rental Price Breakdown
              </div>

              <div className="space-y-3 text-xs text-[#1D3557]">
                <div className="flex justify-between">
                  <span className="text-[#457B9D]">
                    Base Rental ({bookingDraft.durationCount || 2} Days × {quantity} Unit):
                  </span>
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
                  <span className="text-[#457B9D]">Delivery & Packaging:</span>
                  <span className="font-bold">{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                </div>

                <div className="p-3 bg-[#A8DADC]/20 rounded-xl text-[11px] text-[#457B9D] flex items-center gap-2">
                  <Sparkles size={14} className="text-[#E63946]" />
                  <span>Deposit is refunded in full within 2 hours of item check-in.</span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#457B9D] block">
                      Estimated Total
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Payable on final checkout
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#1D3557] font-['Sora']">
                    ₹{total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                {isOwnerVendor ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-[11px] text-amber-800 font-medium leading-relaxed">
                      ⚠️ You are the owner of this equipment. Vendors cannot rent their own listings.
                    </div>
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Cannot Checkout Own Listing</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <span>Proceed to Review & Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                )}

                {!isAuthenticated && (
                  <p className="text-[11px] text-center text-[#457B9D]">
                    You will be prompted to sign in or create an account before checkout.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
