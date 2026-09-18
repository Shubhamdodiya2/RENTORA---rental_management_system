import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  X, 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  Store, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useBooking } from '../../context/BookingContext';
import './WishlistDrawer.css';

export default function WishlistDrawer() {
  const navigate = useNavigate();
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist, isDrawerOpen, closeWishlist } = useWishlist();
  const { updateBookingDraft } = useBooking();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeWishlist();
    };
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeWishlist]);

  if (!isDrawerOpen) return null;

  const handleRentNow = (item) => {
    updateBookingDraft({
      product: item,
      durationMode: 'day',
      durationCount: 2,
      startDate: '2026-09-21',
      endDate: '2026-09-23',
      quantity: 1
    });
    closeWishlist();
    navigate('/booking');
  };

  const handleViewDetails = (item) => {
    closeWishlist();
    navigate(`/products/${item.id || item.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={closeWishlist}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#F1FAEE] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
              <Heart size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1D3557] font-['Sora'] flex items-center gap-2">
                <span>Saved Favorites</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E63946] text-white text-[11px] font-bold">
                  {wishlistCount}
                </span>
              </h3>
              <p className="text-[11px] text-[#457B9D]">Instant rental gear shortlisted by you</p>
            </div>
          </div>

          <button
            onClick={closeWishlist}
            aria-label="Close saved favorites"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#1D3557] flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {wishlist.length > 0 ? (
            wishlist.map((item) => {
              const primaryImg = item.images?.[0] || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80';
              return (
                <div
                  key={item.id}
                  className="bg-[#F8FAFC] hover:bg-[#F1FAEE] border border-gray-100 hover:border-[#A8DADC] rounded-2xl p-3 transition-all flex gap-3 group relative"
                >
                  {/* Thumbnail */}
                  <div 
                    onClick={() => handleViewDetails(item)}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-200 cursor-pointer"
                  >
                    <img
                      src={primaryImg}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#457B9D] border border-gray-100 inline-block truncate max-w-[150px]">
                          {item.category}
                        </span>

                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          aria-label="Remove from saved"
                          title="Remove item"
                          className="text-gray-400 hover:text-[#E63946] p-1 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h4 
                        onClick={() => handleViewDetails(item)}
                        className="font-bold text-xs text-[#1D3557] truncate mt-1 cursor-pointer hover:text-[#E63946] transition-colors"
                      >
                        {item.title || item.name}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[10px] text-[#457B9D] mt-0.5 truncate">
                        <Store size={10} className="text-[#E63946] flex-shrink-0" />
                        <span className="truncate">{item.vendor?.businessName || item.vendor?.name || 'Verified Store'}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 mt-1">
                      <div>
                        <span className="text-xs font-extrabold text-[#1D3557]">₹{item.pricePerDay}</span>
                        <span className="text-[10px] text-[#457B9D]"> / day</span>
                      </div>

                      <button
                        onClick={() => handleRentNow(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-[11px] font-bold shadow-sm flex items-center gap-1 transition"
                      >
                        <span>Rent Now</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shadow-inner">
                <Heart size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#1D3557] font-['Sora']">Your Wishlist is Empty</h4>
                <p className="text-xs text-[#457B9D] max-w-xs">
                  Tap the heart icon on any camera, furniture, or sound equipment to save it for quick booking.
                </p>
              </div>
              <button
                onClick={() => {
                  closeWishlist();
                  navigate('/products');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white text-xs font-bold shadow-md transition"
              >
                Browse Rental Equipment
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-[#F8FAFC] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#457B9D]">Shortlisted Items:</span>
              <span className="font-bold text-[#1D3557]">{wishlistCount} gear units</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={clearWishlist}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 hover:text-[#E63946] hover:border-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>

              <button
                onClick={() => {
                  closeWishlist();
                  navigate('/products');
                }}
                className="py-2.5 px-3 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShoppingBag size={13} />
                <span>Explore More</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
