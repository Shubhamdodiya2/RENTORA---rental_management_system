import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  Store, 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Laptop, 
  Car, 
  PartyPopper, 
  Flame, 
  Layers, 
  PhoneCall,
  User,
  ShoppingBag,
  LogOut
} from 'lucide-react';
import Logo from '../Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cities = [
    { name: 'Ahmedabad', hub: 'Main Hub • 850+ Items' },
    { name: 'Surat', hub: 'Diamond City • 420+ Items' },
    { name: 'Vadodara', hub: 'Cultural Hub • 310+ Items' },
    { name: 'Rajkot', hub: 'Saurashtra Hub • 260+ Items' },
    { name: 'Gandhinagar', hub: 'Capital Hub • 190+ Items' },
  ];

  const quickCategories = [
    { name: 'Cameras & Cinema', slug: 'cameras', icon: Camera, count: '420+ items', textCol: 'text-[#E63946]' },
    { name: 'Gaming & Laptops', slug: 'electronics', icon: Laptop, count: '350+ items', textCol: 'text-[#457B9D]' },
    { name: 'SUVs & Superbikes', slug: 'vehicles', icon: Car, count: '280+ items', textCol: 'text-[#1D3557]' },
    { name: 'Party Sound & DJ', slug: 'event-party', icon: PartyPopper, count: '190+ items', textCol: 'text-[#E63946]' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="navbar-top-bar py-1.5 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-[#E63946] text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
              <Sparkles size={10} /> ZERO DEPOSIT
            </span>
            <span className="hidden md:inline text-[#A8DADC]">
              Instant KYC approval with ₹0 security deposit on verified rentals in Gujarat!
            </span>
            <span className="md:hidden text-[#A8DADC]">
              Verified rentals with ₹0 security deposit!
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* City Selector */}
            <div className="relative">
              <button 
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <MapPin size={12} className="text-[#E63946]" />
                <span>{selectedCity}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-[#1D3557] rounded-2xl shadow-2xl border border-[#A8DADC]/40 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Gujarat Service Hubs
                  </div>
                  {cities.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedCity(c.name);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#F1FAEE] transition-colors flex flex-col ${
                        selectedCity === c.name ? 'bg-[#F1FAEE] font-bold text-[#E63946]' : 'text-[#1D3557]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{c.name}</span>
                        {selectedCity === c.name && <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />}
                      </div>
                      <span className="text-[10px] text-[#457B9D] font-normal">{c.hub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a 
              href="tel:+919876543210" 
              className="hidden lg:flex items-center gap-1 text-[#A8DADC] hover:text-white transition-colors"
            >
              <PhoneCall size={11} className="text-[#E63946]" />
              <span>24x7 Help: +91 98765-RENT</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Full-Width Navbar */}
      <header className={`navbar-header ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-[#A8DADC]/50 py-1.5' 
          : 'bg-white/90 backdrop-blur-md border-b border-[#A8DADC]/40 py-2'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Logo size="md" />
              </Link>
            </div>

            {/* Navigation Capsule */}
            <nav className="hidden lg:flex items-center navbar-nav-capsule">
              <Link 
                to="/" 
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#1D3557] hover:text-[#E63946] hover:bg-white transition-all"
              >
                Home
              </Link>

              {/* Category Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setCategoryMenuOpen(true)}
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                <button 
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    categoryMenuOpen ? 'bg-white text-[#E63946] shadow-sm' : 'text-[#1D3557] hover:text-[#E63946]'
                  }`}
                >
                  <Layers size={13} className="text-[#457B9D]" />
                  <span>Categories</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoryMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#A8DADC]/50 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1D3557]">
                        Popular Categories
                      </span>
                      <Link 
                        to="/products" 
                        onClick={() => setCategoryMenuOpen(false)}
                        className="text-[10px] font-bold text-[#E63946] hover:underline"
                      >
                        View All (8)
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {quickCategories.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={idx}
                            to={`/products?category=${item.slug}`}
                            onClick={() => setCategoryMenuOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F1FAEE] transition-all group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg bg-[#A8DADC]/30 flex items-center justify-center ${item.textCol} group-hover:scale-110 transition-transform`}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#1D3557] group-hover:text-[#E63946] transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-[#457B9D]">{item.count}</div>
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-[#E63946] group-hover:translate-x-1 transition-all" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/products" 
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1D3557] hover:text-[#E63946] hover:bg-white transition-all flex items-center gap-1"
              >
                <span>Explore</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#E63946] text-white text-[9px] font-extrabold animate-pulse">
                  HOT
                </span>
              </Link>

              <button 
                onClick={handleHowItWorksClick}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1D3557] hover:text-[#E63946] hover:bg-white transition-all cursor-pointer"
              >
                How It Works
              </button>
            </nav>

            {/* Search Trigger Button */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/30 border border-[#A8DADC]/50 text-xs text-[#457B9D] transition-all shadow-sm group w-48 lg:w-56"
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-[#E63946] group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-[#1D3557]/80">Search rentals...</span>
                </div>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-[#1D3557] rounded border border-gray-200">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              <Link
                to="/vendor/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#1D3557] navbar-vendor-btn"
              >
                <Store size={14} className="text-[#E63946]" />
                <span>Vendor Portal</span>
              </Link>

              <Link 
                to="/products"
                aria-label="Wishlist"
                className="relative p-2.5 text-[#1D3557] hover:text-[#E63946] rounded-xl hover:bg-[#F1FAEE] transition-colors"
              >
                <Heart size={18} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  2
                </span>
              </Link>

              {/* User Authentication Status */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs font-bold text-[#1D3557] hover:bg-white transition-colors"
                  >
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="hidden sm:inline truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={12} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#A8DADC]/40 p-2 z-50 animate-in fade-in">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="font-bold text-xs text-[#1D3557]">{user.name}</div>
                        <div className="text-[10px] text-[#457B9D] capitalize">{user.role} Account</div>
                      </div>
                      <Link 
                        to="/customer/dashboard" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#1D3557] hover:bg-[#F1FAEE] rounded-xl flex items-center gap-2 block"
                      >
                        <ShoppingBag size={14} className="text-[#457B9D]" />
                        <span>Customer Dashboard</span>
                      </Link>
                      <Link 
                        to="/vendor/dashboard" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#457B9D] hover:bg-[#F1FAEE] rounded-xl flex items-center gap-2 block"
                      >
                        <Store size={14} className="text-[#457B9D]" />
                        <span>Vendor Dashboard</span>
                      </Link>
                      <Link 
                        to="/admin/dashboard" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#E63946] hover:bg-rose-50 rounded-xl flex items-center gap-2 block"
                      >
                        <Sparkles size={14} className="text-[#E63946]" />
                        <span>Super Admin Panel</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#E63946] hover:bg-rose-50 rounded-xl flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link 
                    to="/login"
                    className="hidden md:inline-block px-3 py-2 text-xs font-bold text-[#1D3557] hover:text-[#E63946] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    className="px-4 py-2 rounded-xl text-xs font-bold navbar-cta-btn active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#1D3557] hover:bg-[#F1FAEE] transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

            </div>

          </div>
        </div>

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1D3557]">
                  <Search size={16} className="text-[#E63946]" />
                  <span>Search Rental Catalog in {selectedCity}</span>
                </div>
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Type camera name, PS5, Thar, speaker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 bg-[#F1FAEE] rounded-2xl text-sm font-semibold text-[#1D3557] border border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#E63946]/50"
                />
              </form>

              <div className="space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  Trending Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Sony FX3 Cinema', 'PlayStation 5 Pro', 'Mahindra Thar 4x4', 'DJI Inspire Drone', 'JBL PartyBox 1000W', 'Herman Miller Chair'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSearchOpen(false);
                        navigate('/products');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/40 text-xs font-semibold text-[#1D3557] border border-[#A8DADC]/40 flex items-center gap-1.5 transition-colors"
                    >
                      <Flame size={12} className="text-[#E63946]" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#A8DADC]/50 p-5 shadow-2xl space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rentals..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F1FAEE] rounded-xl text-sm text-[#1D3557] border border-[#A8DADC] focus:outline-none"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#457B9D]" />
            </div>

            <div className="grid grid-cols-1 gap-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-bold text-sm text-[#1D3557] hover:bg-[#F1FAEE]"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-bold text-sm text-[#1D3557] hover:bg-[#F1FAEE]"
              >
                Explore Products
              </Link>
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleHowItWorksClick(e);
                }}
                className="px-3 py-2 rounded-xl font-bold text-sm text-[#1D3557] hover:bg-[#F1FAEE] text-left cursor-pointer"
              >
                How Rentora Works
              </button>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl font-bold text-sm text-[#E63946] bg-[#E63946]/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Store size={16} />
                  <span>List Your Products (Vendor)</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-[#E63946] font-bold text-xs"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <>
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#457B9D] text-[#1D3557] font-bold text-xs text-center"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#E63946] text-white font-bold text-xs text-center shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

          </div>
        )}
      </header>
    </>
  );
}
