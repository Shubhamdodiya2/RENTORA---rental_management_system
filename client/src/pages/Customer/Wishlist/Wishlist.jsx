import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Store, 
  MapPin, 
  Sparkles, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useWishlist } from '../../../context/WishlistContext';
import { useBooking } from '../../../context/BookingContext';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { updateBookingDraft } = useBooking();

  const handleRentNow = (item) => {
    updateBookingDraft({
      product: item,
      durationMode: 'day',
      durationCount: 2,
      startDate: '2026-09-21',
      endDate: '2026-09-23',
      quantity: 1
    });
    navigate('/booking');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 text-[#E63946] text-xs font-bold uppercase tracking-wider">
            <Heart size={13} fill="currentColor" />
            <span>Shortlisted Equipment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-['Sora']">
            My Liked Rentals & Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-[#457B9D]">
            Manage your saved rental equipment, compare daily rates, and reserve instantly.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearWishlist}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-red-300 text-gray-600 hover:text-[#E63946] text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear Wishlist</span>
            </button>

            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span>Explore More Gear</span>
            </Link>
          </div>
        )}
      </div>

      {/* Wishlist Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const primaryImg = item.images?.[0] || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#A8DADC]/40 hover:border-[#E63946] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Image Box */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={primaryImg}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-[#1D3557]/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                      {item.category}
                    </span>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-[#E63946] text-[#E63946] hover:text-white shadow-md flex items-center justify-center transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                    <span className="px-2 py-0.5 rounded-md bg-[#E63946] text-white text-[10px] font-bold flex items-center gap-1">
                      <Zap size={10} fill="currentColor" /> Instant Booking
                    </span>
                    <span className="text-[11px] font-medium text-gray-200">
                      Deposit: ₹{item.deposit || item.securityDeposit || 0}
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#457B9D]">
                      <Store size={12} className="text-[#E63946]" />
                      <span className="font-semibold truncate">{item.vendor?.businessName || item.vendor?.name || 'Verified Store'}</span>
                      <span>•</span>
                      <span>{item.vendor?.city || 'Gujarat'}</span>
                    </div>

                    <Link to={`/products/${item.id || item.slug}`} className="block">
                      <h3 className="font-bold text-sm text-[#1D3557] font-['Sora'] line-clamp-1 hover:text-[#E63946] transition-colors">
                        {item.title || item.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Price & Rent Button */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#457B9D]">Rental Rate</div>
                      <div className="text-base font-extrabold text-[#1D3557] font-['Sora']">
                        ₹{item.pricePerDay} <span className="text-xs text-[#457B9D] font-normal">/ day</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRentNow(item)}
                      className="px-4 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <span>Rent Now</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#A8DADC]/40 p-12 text-center max-w-md mx-auto space-y-5 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto shadow-inner">
            <Heart size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-[#1D3557] font-['Sora']">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-[#457B9D] leading-relaxed">
              Explore cameras, sound equipment, workspaces, and gaming consoles across Gujarat and click the heart icon on any card to shortlist it here.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-xs shadow-lg transition-all"
          >
            <ShoppingBag size={14} />
            <span>Start Exploring Equipment</span>
          </Link>
        </div>
      )}
    </div>
  );
}
