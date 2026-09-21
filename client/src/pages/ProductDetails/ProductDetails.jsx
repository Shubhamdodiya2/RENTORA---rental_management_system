import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  Clock, 
  Heart, 
  Check, 
  ArrowRight, 
  Share2, 
  Store, 
  Phone, 
  Truck, 
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ProductImageGallery from '../../components/ProductImageGallery/ProductImageGallery';
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';
import ProductReviews from '../../components/ProductReviews/ProductReviews';
import './ProductDetails.css';

function formatApiProduct(p) {
  let primaryImg = p.primaryImage || (p.images && p.images[0]?.imageUrl) || (Array.isArray(p.images) && typeof p.images[0] === 'string' ? p.images[0] : null);
  if (!primaryImg || typeof primaryImg !== 'string' || primaryImg.includes('unsplash.com/photos/')) {
    primaryImg = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
  }

  const imgList = (p.images && p.images.length > 0)
    ? p.images.map(i => {
        const u = typeof i === 'string' ? i : i?.imageUrl;
        if (!u || typeof u !== 'string' || u.includes('unsplash.com/photos/')) {
          return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
        }
        return u;
      }).filter(Boolean)
    : [primaryImg];

  // Parse specifications into { label, value } array
  let specsArray = [];
  if (Array.isArray(p.specifications) && p.specifications.length > 0) {
    specsArray = p.specifications.map((s) => ({
      label: s.specKey || s.label || s.key || 'Specification',
      value: s.specValue || s.value || '-'
    }));
  } else if (typeof p.specifications === 'object' && p.specifications !== null) {
    specsArray = Object.entries(p.specifications).map(([k, v]) => ({
      label: k,
      value: String(v)
    }));
  }

  if (specsArray.length === 0) {
    specsArray = [
      { label: 'Manufacturer / Brand', value: p.brand || 'Rentora Verified' },
      { label: 'Rental Category', value: p.category?.name || 'Equipment' },
      { label: 'Condition State', value: 'Sanitized & 100% Tested' },
      { label: 'Damage Protection', value: 'Comprehensive Insurance Covered' }
    ];
  }

  return {
    id: p.id,
    slug: p.slug || p.id,
    title: p.name || p.title,
    category: p.category?.name || p.category || 'Equipment',
    categorySlug: p.category?.slug || p.categorySlug || p.categoryId || 'cameras',
    pricePerDay: Number(p.pricePerDay || 0),
    pricePerHour: Number(p.pricePerHour || Math.round((p.pricePerDay || 0) / 8) || 99),
    pricePerWeek: Number(p.pricePerWeek || (p.pricePerDay || 0) * 5 || 4500),
    pricePerMonth: Number(p.pricePerMonth || (p.pricePerDay || 0) * 18 || 15000),
    deposit: Number(p.securityDeposit || p.deposit || 0),
    rating: p.rating ? Number(p.rating) : 5.0,
    reviews: p.reviewsCount || p.reviews || 0,
    instantBooking: true,
    images: imgList.length > 0 ? imgList : [primaryImg],
    vendor: {
      id: p.vendor?.id || p.vendorId || 'vnd-1',
      userId: p.vendor?.userId || p.vendor?.user_id,
      name: p.vendor?.businessName || p.vendor?.name || 'Rentora Verified Store',
      city: p.vendor?.city || 'Ahmedabad',
      phone: p.vendor?.businessPhone || '+91 98250 12345',
      address: p.vendor?.businessAddress || 'Ahmedabad Hub',
      logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80',
      badge: 'Verified Super Vendor',
      responseRate: '98%',
      rating: 4.9
    },
    condition: 'Sanitized & Tested',
    features: Array.isArray(p.tags) && p.tags.length > 0
      ? p.tags
      : ['Verified Stock', 'Same-Day Handover', 'Damage Covered', 'Escrow Protected'],
    fullDescription: p.description || 'Professional rental equipment tested and prepared for seamless deployment.',
    description: p.description || 'Professional rental equipment tested and prepared for seamless deployment.',
    specifications: specsArray,
    includedItems: Array.isArray(p.tags) && p.tags.length > 0
      ? p.tags
      : ['Main Unit & Accessories', 'Protective Carry Bag', 'Certified Power/Charging Cable'],
    terms: 'Valid Government ID required at handover. Security deposit refunded to original payment method within 2 hours of return.'
  };
}

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { updateBookingDraft } = useBooking();
  const { user, vendorProfile } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch primary product details
    api.get(`/products/${productId}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.data) {
          setProduct(formatApiProduct(res.data.data));
        } else {
          setError('Product listing not found.');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Product listing not found or is currently unavailable.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Fetch live catalog for dynamic similar products
    api.get('/products')
      .then((res) => {
        if (!isMounted) return;
        const rawList = res.data?.data?.products || res.data?.data?.results || (Array.isArray(res.data?.data) ? res.data.data : []);
        if (Array.isArray(rawList)) {
          setAllProducts(rawList.map(formatApiProduct));
        }
      })
      .catch((err) => console.warn('[ProductDetails] Similar products fetch:', err.message));

    return () => { isMounted = false; };
  }, [productId]);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const [durationMode, setDurationMode] = useState('day'); // 'hour' | 'day' | 'week' | 'month'
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('2026-09-18');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [durationDays, setDurationDays] = useState(2);
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'included' | 'terms'

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 size={40} className="animate-spin text-[#E63946]" />
        <h3 className="text-lg font-bold text-[#1D3557] font-['Sora']">Loading Equipment Details...</h3>
        <p className="text-xs text-[#457B9D]">Fetching verified pricing, specifications, and live calendar availability.</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto my-16 px-4 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#E63946] flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-['Sora']">
          Product Listing Not Available
        </h2>
        <p className="text-sm text-[#457B9D] max-w-md mx-auto">
          The rental equipment you are looking for is either inactive, pending vendor review, or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-xs shadow-lg transition-all"
          >
            <span>Explore All 2,400+ Rentals</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  // Pricing calculation
  const getRate = () => {
    switch (durationMode) {
      case 'hour': return product.pricePerHour || Math.round((product.pricePerDay || 0) / 8);
      case 'week': return product.pricePerWeek || ((product.pricePerDay || 0) * 5);
      case 'month': return product.pricePerMonth || ((product.pricePerDay || 0) * 18);
      case 'day':
      default: return product.pricePerDay;
    }
  };

  const currentRate = getRate();
  const durationMultiplier = durationMode === 'day' ? durationDays : durationMode === 'hour' ? 4 : 1;
  const rentalSubtotal = currentRate * durationMultiplier * quantity;
  const depositTotal = (product.deposit || 0) * quantity;
  const estimatedTotal = rentalSubtotal + depositTotal;

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (!endDate || endDate < val) {
      setEndDate(val);
      setDurationDays(1);
    } else {
      const count = Math.max(1, Math.round((new Date(`${endDate}T00:00:00`) - new Date(`${val}T00:00:00`)) / (1000 * 60 * 60 * 24)) + 1);
      setDurationDays(count);
    }
  };

  const handleEndDateChange = (val) => {
    const finalEnd = val < startDate ? startDate : val;
    setEndDate(finalEnd);
    const count = Math.max(1, Math.round((new Date(`${finalEnd}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / (1000 * 60 * 60 * 24)) + 1);
    setDurationDays(count);
  };

  const handleDatesFromCalendar = ({ start, end, count }) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
    if (count) setDurationDays(count);
  };

  const isOwnerVendor = Boolean(
    (user && product?.vendor?.userId && user.id === product.vendor.userId) ||
    (vendorProfile && product?.vendor?.id && vendorProfile.id === product.vendor.id)
  );

  const handleRentNow = () => {
    if (isOwnerVendor) {
      alert("You are the vendor for this product. Vendors cannot rent their own listings. Please use a customer account to rent products.");
      return;
    }
    updateBookingDraft({
      product,
      durationMode,
      startDate,
      endDate: endDate || startDate,
      durationCount: durationMultiplier,
      quantity
    });
    navigate('/booking');
  };

  // Dynamic Related products from real catalog
  const sameCategoryProducts = allProducts.filter(
    (p) => p.id !== product?.id && (p.categorySlug === product?.categorySlug || p.category === product?.category)
  );
  // Show up to 3 real products in same category (or other real listings if category has only 1)
  const relatedProducts = sameCategoryProducts.length > 0
    ? sameCategoryProducts.slice(0, 3)
    : allProducts.filter((p) => p.id !== product?.id).slice(0, 3);

  return (
    <div className="product-details-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: 'Explore Products', link: '/products' },
          { label: product.category, link: `/products?category=${product.categorySlug}` },
          { label: product.title, link: null }
        ]} />

        {/* Main Grid: Left Media & Content + Right Sticky Booking Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Left Column (Images, Info, Specs, Availability) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Image Gallery Component */}
            <ProductImageGallery images={product.images} title={product.title} />

            {/* Product Title & Vendor Quick Badge */}
            <div className="space-y-3 bg-white p-6 rounded-3xl border border-[#A8DADC]/40 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#1D3557] text-[#F1FAEE] text-xs font-bold">
                  {product.category}
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Product link copied to clipboard!");
                    }}
                    className="p-2 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/40 text-[#1D3557] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                      isWishlisted ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-[#F1FAEE] text-[#1D3557] border-[#A8DADC]/40'
                    }`}
                  >
                    <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Vendor & Rating Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1D3557]/10 border border-[#A8DADC] flex items-center justify-center text-[#1D3557] flex-shrink-0">
                    <Store size={15} className="text-[#1D3557]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1D3557] flex items-center gap-1">
                      {product.vendor.name}
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    </span>
                    <span className="text-gray-500 flex items-center gap-0.5">
                      <MapPin size={11} className="text-[#E63946]" /> {product.vendor.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-yellow-50 text-amber-900 px-2.5 py-1 rounded-xl font-bold border border-yellow-200">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{product.rating}</span>
                    <span className="text-gray-500 font-normal">({product.reviews} reviews)</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                    {product.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Overview, Specs, Terms, Vendor) */}
            <div className="bg-white rounded-3xl border border-[#A8DADC]/40 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 overflow-x-auto scrollbar-none">
                {[
                  { id: 'overview', label: 'Overview & Features' },
                  { id: 'specs', label: 'Technical Specs' },
                  { id: 'included', label: 'Included in Kit' },
                  { id: 'terms', label: 'Rental Policy' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#1D3557] text-white shadow-sm'
                        : 'text-[#457B9D] hover:bg-[#F1FAEE] hover:text-[#1D3557]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs sm:text-sm text-[#1D3557] leading-relaxed">
                  <p>{product.fullDescription}</p>
                  
                  <div className="pt-2">
                    <h4 className="font-bold text-sm font-['Sora'] text-[#1D3557] mb-3">Key Highlights:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 bg-[#F1FAEE] p-2.5 rounded-xl border border-[#A8DADC]/30 text-xs">
                          <Check size={14} className="text-[#E63946] flex-shrink-0 mt-0.5" />
                          <span className="font-semibold text-[#1D3557]">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Specs */}
              {activeTab === 'specs' && (
                <div className="divide-y divide-gray-100">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="spec-table-row flex justify-between py-2 text-xs">
                      <span className="font-semibold text-[#457B9D]">{spec.label}</span>
                      <span className="font-bold text-[#1D3557] text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Included Items */}
              {activeTab === 'included' && (
                <div className="space-y-2">
                  <p className="text-xs text-[#457B9D] mb-3">
                    Every product is sealed with tamper-proof security tags and packed in specialized protective hard cases:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.includedItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-[#F1FAEE] rounded-xl border border-[#A8DADC]/30 text-xs font-semibold text-[#1D3557]">
                        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Terms & KYC */}
              {activeTab === 'terms' && (
                <div className="space-y-3 text-xs text-[#1D3557]">
                  <div className="p-3 bg-[#A8DADC]/20 rounded-xl border border-[#A8DADC]/40 flex items-start gap-2">
                    <ShieldCheck size={18} className="text-[#E63946] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm font-bold text-[#1D3557]">Security & Deposit Terms</strong>
                      <span>{product.terms}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 pl-4 list-disc text-[#457B9D]">
                    <li>Cancellation is 100% free if done 24 hours prior to rental start time.</li>
                    <li>Security deposits are securely held in escrow and released within 2 hours of equipment return.</li>
                    <li>Accidental damage coverage up to ₹50,000 included under standard KYC terms.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Interactive Availability Calendar */}
            <div className="bg-white rounded-3xl border border-[#A8DADC]/40 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#1D3557] font-['Sora'] flex items-center gap-2">
                  <Calendar size={18} className="text-[#E63946]" />
                  <span>Availability Calendar</span>
                </h3>
                <p className="text-xs text-[#457B9D]">
                  Click on the dates to select your desired rental duration. Booked slots are blocked automatically.
                </p>
              </div>

              <AvailabilityCalendar
                productId={product.id}
                selectedStart={startDate}
                selectedEnd={endDate}
                quantity={quantity}
                onDatesChange={handleDatesFromCalendar}
              />
            </div>

            {/* Vendor Profile Storefront Box */}
            <div className="bg-white rounded-3xl border border-[#A8DADC]/40 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D3557]/10 to-[#457B9D]/15 border-2 border-[#A8DADC] flex items-center justify-center text-[#1D3557] flex-shrink-0 shadow-sm">
                  <Store size={28} className="text-[#1D3557]" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E63946]/10 text-[#E63946] text-[10px] font-bold uppercase">
                    <Sparkles size={10} /> {product.vendor.badge}
                  </div>
                  <h4 className="text-base font-bold text-[#1D3557] font-['Sora']">{product.vendor.name}</h4>
                  <div className="text-xs text-[#457B9D] flex items-center gap-2">
                    <span>{product.vendor.address}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">{product.vendor.responseRate} Response</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${product.vendor.phone}`}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#457B9D] text-[#1D3557] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F1FAEE]"
                >
                  <Phone size={14} className="text-[#E63946]" />
                  <span>Call Store</span>
                </a>
                <button
                  onClick={() => alert(`Opening storefront for ${product.vendor.name}`)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1D3557] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#457B9D]"
                >
                  <Store size={14} />
                  <span>View Store</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking & Cost Summary Panel */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            
            <div className="booking-sticky-card space-y-6">
              
              {/* Duration Tier Pill Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider block">
                  Select Rental Duration Rate
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'hour', label: 'Hourly', rate: product.pricePerHour || 299 },
                    { id: 'day', label: 'Daily', rate: product.pricePerDay },
                    { id: 'week', label: 'Weekly', rate: product.pricePerWeek },
                    { id: 'month', label: 'Monthly', rate: product.pricePerMonth },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setDurationMode(tier.id)}
                      className={`pricing-pill-btn ${
                        durationMode === tier.id ? 'pricing-pill-active' : 'pricing-pill-inactive'
                      }`}
                    >
                      <div className="text-[11px] uppercase tracking-wider">{tier.label}</div>
                      <div className="text-xs font-extrabold mt-0.5">₹{tier.rate.toLocaleString('en-IN')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection Box */}
              <div className="space-y-3 bg-[#F1FAEE] p-4 rounded-2xl border border-[#A8DADC]/40">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                      Rental Start
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold text-[#1D3557] focus:outline-none focus:ring-1 focus:ring-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#457B9D] uppercase text-[10px] mb-1">
                      Rental End
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold text-[#1D3557] focus:outline-none focus:ring-1 focus:ring-[#E63946]"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                  <span className="font-bold text-[#1D3557]">Units Quantity:</span>
                  <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-xl border border-[#A8DADC]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="font-bold text-base text-[#E63946] hover:opacity-75"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-[#1D3557]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="font-bold text-base text-[#E63946] hover:opacity-75"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Cost Calculation Summary */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-[#1D3557]">
                <div className="flex justify-between font-medium">
                  <span className="text-[#457B9D]">
                    Rental ({durationMultiplier} {durationMode}s × {quantity} unit):
                  </span>
                  <span className="font-bold">₹{rentalSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between font-medium">
                  <span className="text-[#457B9D] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Refundable Security Deposit:
                  </span>
                  <span className="font-bold text-emerald-700">₹{depositTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Zero-Deposit KYC Discount:</span>
                  <span className="font-bold">Available on Checkout</span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#457B9D]">
                      Estimated Total Payable
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      Includes ₹{depositTotal.toLocaleString('en-IN')} refundable deposit
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-[#1D3557] font-['Sora']">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {isOwnerVendor ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                        <span>Vendor Listing Owner Notice</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                        You are the owner of this equipment. Vendors cannot rent their own listings. Only customer accounts can place rental orders.
                      </p>
                    </div>

                    <button
                      disabled
                      className="w-full py-4 rounded-2xl bg-slate-200 text-slate-500 font-extrabold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock size={15} />
                      <span>Vendors Cannot Rent Own Listing</span>
                    </button>

                    <Link
                      to="/vendor/products"
                      className="w-full py-3 rounded-2xl bg-[#1D3557] hover:bg-[#457B9D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md text-center"
                    >
                      <Store size={14} />
                      <span>Manage Listing in Vendor Hub</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleRentNow}
                    className="w-full py-4 rounded-2xl bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <span>Rent Now • Reserve Instantly</span>
                    <ArrowRight size={16} />
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2 text-[10px] text-center text-[#457B9D] pt-2">
                  <div className="p-2 bg-[#F1FAEE] rounded-xl font-medium">
                    ⚡ Instant Booking
                  </div>
                  <div className="p-2 bg-[#F1FAEE] rounded-xl font-medium">
                    🛡️ 100% Insured
                  </div>
                  <div className="p-2 bg-[#F1FAEE] rounded-xl font-medium">
                    🔄 Easy Returns
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Customer Reviews & Feedback Section */}
        {product.id && (
          <ProductReviews
            productId={product.id}
            onReviewAdded={async () => {
              try {
                const res = await api.get(`/products/${productId}`);
                if (res.data?.success && res.data.data) {
                  setProduct(formatApiProduct(res.data.data));
                }
              } catch (err) {
                console.warn(err);
              }
            }}
          />
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#A8DADC]/40 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-[#1D3557] font-['Sora']">
                  Similar Rentals in {product.category}
                </h3>
                <p className="text-xs text-[#457B9D]">
                  Customers who viewed this item also rented these verified setups.
                </p>
              </div>

              <Link to={`/products?category=${product.categorySlug}`} className="text-xs font-bold text-[#E63946] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/products/${rel.id}`)}
                  className="bg-white rounded-3xl p-4 border border-[#A8DADC]/40 card-shadow card-shadow-hover cursor-pointer space-y-3"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative">
                    <img
                      src={rel.images[0]}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1D3557]/80 text-white text-[10px] font-bold">
                      ₹{rel.pricePerDay} / day
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1D3557] line-clamp-1">{rel.title}</h4>
                  <div className="text-xs text-[#457B9D] flex items-center justify-between">
                    <span>{rel.vendor?.name || 'Rentora Vendor'}</span>
                    <span className="font-bold text-[#E63946] flex items-center gap-0.5">
                      <Star size={12} fill="currentColor" /> {rel.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
