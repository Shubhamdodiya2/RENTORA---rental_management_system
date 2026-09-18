import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURED_PRODUCTS } from '../../data/mockData';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import './FeaturedProducts.css';

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

export default function FeaturedProducts({ selectedCategory, onSelectCategory }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.get('/products?limit=100')
      .then((res) => {
        if (!isMounted) return;
        const results = res.data?.data?.results || res.data?.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        if (Array.isArray(results)) {
          const liveMapped = results.map(formatApiProduct);
          // Strictly deduplicate by ID and unique title
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
        console.warn('[FeaturedProducts] Backend fetch notice:', err.message);
        if (isMounted) setAllProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filters = [
    { id: 'all', label: 'All Rentals' },
    { id: 'cameras', label: 'Cameras & Lenses' },
    { id: 'electronics', label: 'Electronics & PS5' },
    { id: 'vehicles', label: 'Vehicles & SUVs' },
    { id: 'furniture', label: 'Furniture & Workspaces' },
    { id: 'event-party', label: 'Event & Sound' },
    { id: 'sports-outdoor', label: 'Outdoor & Camping' },
  ];

  const filteredProducts = allProducts.filter(p => {
    const currentCategory = selectedCategory && selectedCategory !== 'all' ? selectedCategory : activeFilter;
    if (currentCategory === 'all') return true;
    return p.categorySlug === currentCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.pricePerDay - b.pricePerDay;
    if (sortBy === 'price-high') return b.pricePerDay - a.pricePerDay;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  // Display top 4 featured / most rented products on standard homepage overview
  const displayProducts = (activeFilter === 'all' && (!selectedCategory || selectedCategory === 'all'))
    ? sortedProducts.slice(0, 4)
    : sortedProducts;

  return (
    <section id="featured" className="py-16 bg-[#F1FAEE] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 text-[#E63946] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Verified Local Inventory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
              Featured Rentals
            </h2>
            <p className="text-sm sm:text-base text-[#457B9D] max-w-xl">
              Handpicked premium items with 100% genuine equipment verification, sanitized condition & insurance cover.
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <SlidersHorizontal size={15} className="text-[#457B9D]" />
            <span className="text-xs font-bold text-[#1D3557]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort rentals"
              className="bg-white border border-[#A8DADC] text-xs font-semibold text-[#1D3557] rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated (4.9+)</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                if (onSelectCategory) onSelectCategory(tab.id);
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                (selectedCategory === tab.id || (activeFilter === tab.id && (!selectedCategory || selectedCategory === 'all')))
                  ? 'filter-tab-active'
                  : 'filter-tab-inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRentClick={(item) => setSelectedProduct(item)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#A8DADC]/40 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#1D3557] font-['Sora']">No items found in this category</h3>
            <p className="text-xs text-[#457B9D] max-w-sm mx-auto">
              Try selecting another category or clear your filters to view our full collection of 2,400+ rental items.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                if (onSelectCategory) onSelectCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-bold shadow-md"
            >
              View All Rentals
            </button>
          </div>
        )}

        {/* Explore All CTA */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-[#1D3557] text-[#1D3557] hover:text-white font-bold text-sm border-2 border-[#1D3557] transition-all shadow-md group cursor-pointer"
          >
            <span>Explore All 2,400+ Products</span>
            <ArrowRight size={16} className="text-[#E63946] group-hover:text-white transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>

      {/* Quick Booking Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={selectedProduct.images[0]} alt={selectedProduct.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#A8DADC]/40 text-[#1D3557]">
                  {selectedProduct.category}
                </span>
                <h4 className="text-sm font-bold text-[#1D3557] line-clamp-1">{selectedProduct.title}</h4>
                <div className="text-xs text-[#E63946] font-bold">₹{selectedProduct.pricePerDay} / day</div>
              </div>
            </div>

            <div className="bg-[#F1FAEE] p-4 rounded-2xl space-y-2 text-xs text-[#1D3557]">
              <div className="flex justify-between font-medium">
                <span>Vendor:</span>
                <span className="font-bold">{selectedProduct.vendor.name} ({selectedProduct.vendor.city})</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Refundable Deposit:</span>
                <span className="font-bold text-emerald-700">₹{selectedProduct.deposit} (100% Refundable)</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Doorstep Delivery:</span>
                <span className="font-bold text-emerald-700">Available in 2 Hours</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1D3557] block">Select Rental Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="p-2.5 rounded-xl border border-gray-200 text-xs text-[#1D3557] font-semibold" defaultValue="2026-09-17" />
                <input type="date" className="p-2.5 rounded-xl border border-gray-200 text-xs text-[#1D3557] font-semibold" defaultValue="2026-09-19" />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1D3557]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Booking reserved for ${selectedProduct.title}! Checkout flow will open.`);
                  setSelectedProduct(null);
                }}
                className="flex-1 py-3 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold btn-primary-glow flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Reserve</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
