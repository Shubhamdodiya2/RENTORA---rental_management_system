import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Sparkles, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  X, 
  Heart, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Store
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { FEATURED_PRODUCTS, CATEGORIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';
import './Explore.css';

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

  return {
    id: p.id,
    title: p.name || p.title,
    category: p.category?.name || p.category || 'Equipment',
    categorySlug: p.category?.slug || p.categorySlug || p.categoryId || 'cameras',
    pricePerDay: Number(p.pricePerDay || 0),
    pricePerHour: Number(p.pricePerHour || Math.round((p.pricePerDay || 0) / 8)),
    pricePerWeek: Number(p.pricePerWeek || (p.pricePerDay || 0) * 5),
    pricePerMonth: Number(p.pricePerMonth || (p.pricePerDay || 0) * 18),
    deposit: Number(p.securityDeposit || p.deposit || 0),
    rating: p.rating ? Number(p.rating) : 5.0,
    reviews: p.reviewsCount || p.reviews || 0,
    instantBooking: true,
    images: imgList.length > 0 ? imgList : [primaryImg],
    vendor: {
      id: p.vendor?.id || 'vnd-1',
      name: p.vendor?.businessName || p.vendor?.name || 'Rentora Verified Store',
      city: p.vendor?.city || 'Ahmedabad',
      rating: 4.9
    },
    features: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Verified Stock', 'Same-Day Handover', 'Damage Covered']
  };
}

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateBookingDraft } = useBooking();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Catalog State
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDuration, setSelectedDuration] = useState('day'); // 'hour' | 'day' | 'week' | 'month'
  const [maxPrice, setMaxPrice] = useState(50000);
  const [instantOnly, setInstantOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    // Fetch live products
    api.get('/products?limit=100')
      .then((res) => {
        if (!isMounted) return;
        const results = res.data?.data?.results || res.data?.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        if (Array.isArray(results)) {
          const liveMapped = results.map(formatApiProduct);
          const uniqueMap = new Map();
          for (const item of liveMapped) {
            const key = item.id || item.title;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          }
          setAllProducts(Array.from(uniqueMap.values()));
        }
      })
      .catch((err) => {
        console.warn('[Explore] Backend products notice:', err.message);
        if (isMounted) setAllProducts([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // Fetch live categories
    api.get('/categories')
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const liveCats = res.data.data.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug || c.id,
            count: c.productCount ? `${c.productCount} items` : 'Available'
          }));
          setCategoriesList(liveCats);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Quick Rent Modal state
  const [quickRentProduct, setQuickRentProduct] = useState(null);

  const handleQuickRent = (product, e) => {
    e.stopPropagation();
    updateBookingDraft({
      product,
      durationMode: selectedDuration,
      durationCount: selectedDuration === 'hour' ? 4 : selectedDuration === 'day' ? 2 : 1
    });
    navigate('/booking');
  };

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesVendor = item.vendor.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesVendor) return false;
      }

      // Category
      if (selectedCategory !== 'all' && item.categorySlug !== selectedCategory) {
        return false;
      }

      // City
      if (selectedCity !== 'all' && item.vendor.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Instant Booking
      if (instantOnly && !item.instantBooking) {
        return false;
      }

      // Min Rating
      if (minRating > 0 && item.rating < minRating) {
        return false;
      }

      // Price Filter
      const price = selectedDuration === 'hour' ? item.pricePerHour : item.pricePerDay;
      if (price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-high') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // Default popular
    });
  }, [allProducts, searchQuery, selectedCategory, selectedDuration, maxPrice, instantOnly, selectedCity, minRating, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDuration('day');
    setMaxPrice(50000);
    setInstantOnly(false);
    setSelectedCity('all');
    setMinRating(0);
    setSortBy('popular');
  };

  const cities = ['All Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'];

  return (
    <div className="explore-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[{ label: 'Explore Products', link: '/products' }]} />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8DADC]/30 text-[#1D3557] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-[#E63946]" />
              <span>Multi-Vendor Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
              Explore Rental Products
            </h1>
            <p className="text-sm text-[#457B9D] mt-1 max-w-2xl">
              Browse thousands of verified products from top rental stores across Gujarat. Compare rates, check real-time availability, and rent with zero deposit.
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#A8DADC] text-xs font-bold text-[#1D3557] flex items-center justify-center gap-2 shadow-sm"
            >
              <SlidersHorizontal size={15} className="text-[#E63946]" />
              <span>Filter Products ({filteredProducts.length})</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Filter Sidebar + Right Products Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <div className="explore-filter-card space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1D3557] font-['Sora']">
                  <SlidersHorizontal size={16} className="text-[#E63946]" />
                  <span>Filter Catalog</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#E63946] hover:underline font-bold flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider block">
                  Category
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#1D3557] text-white font-bold'
                        : 'text-[#457B9D] hover:bg-[#F1FAEE]'
                    }`}
                  >
                    <span>All Categories</span>
                    <span>{allProducts.length}</span>
                  </button>

                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-[#1D3557] text-white font-bold'
                          : 'text-[#457B9D] hover:bg-[#F1FAEE]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-75">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rental Duration Filter */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider block">
                  Rental Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#F1FAEE] p-1 rounded-xl">
                  {[
                    { id: 'hour', label: 'Hourly' },
                    { id: 'day', label: 'Daily' },
                    { id: 'week', label: 'Weekly' },
                    { id: 'month', label: 'Monthly' },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                        selectedDuration === dur.id
                          ? 'bg-[#E63946] text-white shadow-sm'
                          : 'text-[#457B9D] hover:text-[#1D3557]'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#1D3557] uppercase tracking-wider">Max Price</span>
                  <span className="font-bold text-[#E63946]">₹{maxPrice.toLocaleString('en-IN')} / day</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="50000"
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#E63946] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#457B9D] font-semibold">
                  <span>₹200</span>
                  <span>₹25,000</span>
                  <span>₹50,000+</span>
                </div>
              </div>

              {/* City / Location */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#1D3557] uppercase tracking-wider block">
                  Location / Hub
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Gujarat Cities</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                </select>
              </div>

              {/* Availability & KYC */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={instantOnly}
                    onChange={(e) => setInstantOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E63946] accent-[#E63946] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#1D3557] flex items-center gap-1">
                    <Zap size={13} className="text-[#E63946]" fill="currentColor" /> Instant Booking Only
                  </span>
                </label>

                <div className="p-3 rounded-xl bg-[#A8DADC]/20 border border-[#A8DADC]/40 text-[11px] text-[#1D3557] flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>All products include standard damage waiver & verified KYC check.</span>
                </div>
              </div>

            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Bar: Search Bar & Sort Dropdown */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search cameras, consoles, Thar, speakers, etc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="explore-search-input"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#457B9D]" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Active Results Count & Sort */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <span className="text-xs text-[#457B9D] font-bold">
                  Showing <strong className="text-[#1D3557]">{filteredProducts.length}</strong> items
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#1D3557]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort by"
                    className="px-3 py-1.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-semibold text-[#1D3557] focus:outline-none cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated (4.9+)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const price = selectedDuration === 'hour' 
                    ? product.pricePerHour 
                    : selectedDuration === 'week' 
                      ? product.pricePerWeek 
                      : selectedDuration === 'month' 
                        ? product.pricePerMonth 
                        : product.pricePerDay;

                  const unit = selectedDuration === 'hour' 
                    ? '/ hr' 
                    : selectedDuration === 'week' 
                      ? '/ wk' 
                      : selectedDuration === 'month' 
                        ? '/ mo' 
                        : '/ day';

                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#A8DADC]/40 card-shadow card-shadow-hover flex flex-col justify-between cursor-pointer transition-all duration-300"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1D3557]/5">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
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
                            aria-label="Wishlist"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isInWishlist(product.id)
                                ? 'bg-[#E63946] text-white scale-110 shadow-md'
                                : 'bg-white/80 backdrop-blur-md text-[#1D3557] hover:bg-white hover:text-[#E63946]'
                            }`}
                          >
                            <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Bottom Badges */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-10">
                          {product.instantBooking ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#E63946] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                              <Zap size={10} fill="currentColor" /> Instant Booking
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-[#457B9D] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                              Verified Stock
                            </span>
                          )}

                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-yellow-300">
                            <Star size={12} fill="currentColor" />
                            <span>{product.rating}</span>
                            <span className="text-gray-300 font-normal">({product.reviews})</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
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

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {product.features.slice(0, 2).map((f, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-[#F1FAEE] text-[#457B9D] rounded-md border border-[#A8DADC]/40">
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* Pricing & CTA */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                              Rental Rate
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-extrabold text-[#1D3557] font-['Sora']">
                                ₹{price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-[#457B9D] font-medium">
                                {unit}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#457B9D] flex items-center gap-1">
                              <ShieldCheck size={11} className="text-emerald-600" />
                              <span>Dep: ₹{product.deposit}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleQuickRent(product, e)}
                              className="px-3.5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                            >
                              <span>Rent Now</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty / No Results State */
              <div className="bg-white rounded-3xl p-12 text-center border border-[#A8DADC]/40 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center mx-auto">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1D3557] font-['Sora']">
                  No matching rental products found
                </h3>
                <p className="text-xs text-[#457B9D] max-w-md mx-auto">
                  Try clearing your search query, increasing your price range, or selecting "All Gujarat Cities".
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-bold shadow-md hover:bg-[#D62839] transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Load More Pagination Placeholder */}
            {filteredProducts.length > 0 && (
              <div className="pt-8 text-center">
                <button 
                  onClick={() => alert("All 2,400+ available rental inventory items are fully loaded.")}
                  className="px-8 py-3 rounded-full bg-white hover:bg-[#1D3557] text-[#1D3557] hover:text-white font-bold text-xs border-2 border-[#1D3557] transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <span>Load More Listings</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-base text-[#1D3557] font-['Sora']">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg bg-gray-100 font-bold text-xs">
                <X size={18} />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#1D3557] uppercase">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F1FAEE] text-xs font-semibold"
              >
                <option value="all">All Categories</option>
                {categoriesList.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#1D3557] uppercase">Duration</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['hour', 'day', 'week', 'month'].map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize ${
                      selectedDuration === d ? 'bg-[#E63946] text-white' : 'bg-[#F1FAEE] text-[#1D3557]'
                    }`}
                  >
                    {d}ly
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Max Price</span>
                <span className="text-[#E63946]">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="200"
                max="50000"
                step="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#E63946]"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <button onClick={resetFilters} className="flex-1 py-3 rounded-xl border text-xs font-bold">
                Reset
              </button>
              <button onClick={() => setMobileFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#E63946] text-white text-xs font-bold">
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
