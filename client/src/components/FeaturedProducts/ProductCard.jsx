import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Calendar,
  ArrowRight,
  Store
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useWishlist } from '../../context/WishlistContext';
import './FeaturedProducts.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { updateBookingDraft } = useBooking();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const [priceMode, setPriceMode] = useState('day');

  const currentPrice = priceMode === 'day' 
    ? product.pricePerDay 
    : priceMode === 'week' 
      ? product.pricePerWeek 
      : product.pricePerMonth;

  const currentUnit = priceMode === 'day' ? '/ day' : priceMode === 'week' ? '/ wk' : '/ mo';

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleRentClick = (e) => {
    e.stopPropagation();
    updateBookingDraft({
      product,
      durationMode: priceMode,
      durationCount: priceMode === 'day' ? 2 : 1
    });
    navigate('/booking');
  };

  return (
    <div 
      onClick={handleCardClick}
      className="product-card group cursor-pointer"
    >
      {/* Product Image */}
      <div className="product-img-box">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="product-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded-full bg-[#1D3557]/80 backdrop-blur-md text-[#F1FAEE] text-[11px] font-bold shadow-sm">
            {product.category}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            aria-label="Save to Wishlist"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorite 
                ? 'bg-[#E63946] text-white shadow-md scale-110' 
                : 'bg-white/80 backdrop-blur-md text-[#1D3557] hover:bg-white hover:text-[#E63946]'
            }`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-10">
          {product.instantBooking ? (
            <span className="px-2 py-0.5 rounded-md bg-[#E63946] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
              <Zap size={10} fill="currentColor" /> Instant Booking
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-[#457B9D] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
              <Calendar size={10} /> Verified Stock
            </span>
          )}

          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-yellow-300">
            <Star size={12} fill="currentColor" />
            <span>{product.rating}</span>
            <span className="text-gray-300 font-normal">({product.reviews})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          <div className="flex items-center justify-between text-xs text-[#457B9D] mb-1.5">
            <span className="font-semibold text-[#1D3557] flex items-center gap-1.5 truncate max-w-[170px]">
              <Store size={13} className="text-[#457B9D] flex-shrink-0" />
              {product.vendor.name}
            </span>
            <span className="flex items-center gap-0.5 text-gray-500 text-[11px]">
              <MapPin size={11} className="text-[#E63946]" />
              {product.vendor.city}
            </span>
          </div>

          <h3 className="text-base font-bold font-['Sora'] text-[#1D3557] group-hover:text-[#E63946] transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {product.features.slice(0, 2).map((feat, i) => (
            <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-[#F1FAEE] text-[#457B9D] rounded-md border border-[#A8DADC]/40">
              {feat}
            </span>
          ))}
        </div>

        {/* Duration Switcher */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-[#F1FAEE] p-1 rounded-xl flex items-center justify-between text-[11px] font-semibold text-[#457B9D]"
        >
          <button
            onClick={() => setPriceMode('day')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              priceMode === 'day' ? 'bg-white text-[#1D3557] shadow-sm font-bold' : 'hover:text-[#1D3557]'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setPriceMode('week')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              priceMode === 'week' ? 'bg-white text-[#1D3557] shadow-sm font-bold' : 'hover:text-[#1D3557]'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPriceMode('month')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              priceMode === 'month' ? 'bg-white text-[#1D3557] shadow-sm font-bold' : 'hover:text-[#1D3557]'
            }`}
          >
            Month
          </button>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Rental Rate
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#1D3557] font-['Sora']">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#457B9D] font-medium">
                {currentUnit}
              </span>
            </div>
            <div className="text-[10px] text-[#457B9D] flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-600" />
              <span>Dep: ₹{product.deposit}</span>
            </div>
          </div>

          <button
            onClick={handleRentClick}
            className="px-4 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
          >
            <span>Rent Now</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}
