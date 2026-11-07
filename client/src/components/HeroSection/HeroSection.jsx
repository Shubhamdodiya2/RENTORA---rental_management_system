import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';
import { TRUST_STATS } from '../../data/mockData';
import './HeroSection.css';

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState('');
  const [location, setLocation] = useState('Ahmedabad, Gujarat');
  const [duration, setDuration] = useState('Daily Rental');

  const popularSearches = ['Sony FX3', 'PS5 Pro', 'DJI Drone', 'Thar 4x4', 'JBL PartyBox', 'MacBook Pro'];

  return (
    <section id="home" className="hero-section pt-6 pb-16 lg:pt-10 lg:pb-24">
      {/* Background Decorative Gradient Orbs with subtle breathing animation */}
      <div className="hero-glow-blob-1" />
      <div className="hero-glow-blob-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column with smooth staggered entry */}
          <div className="lg:col-span-7 space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A8DADC]/40 border border-[#A8DADC] text-[#1D3557] text-xs font-semibold shadow-xs"
            >
              <Sparkles size={14} className="text-[#E63946] animate-pulse" />
              <span>India's Most Trusted Multi-Vendor Rental Marketplace</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1D3557] tracking-tight leading-[1.15] font-['Sora']"
            >
              Everything You Need. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#D62839] to-[#457B9D]">
                Ready to Rent.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
              className="text-base sm:text-lg text-[#457B9D] leading-relaxed max-w-2xl font-normal"
            >
              Discover and rent high-end cameras, gaming consoles, luxury vehicles, party sound systems, tools, and designer attire from <span className="font-semibold text-[#1D3557]">1,200+ verified local rental businesses</span>.
            </motion.p>

            {/* Search Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
              className="hero-search-card p-3 sm:p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                
                <div className="px-3 py-2">
                  <label className="block text-[11px] font-bold text-[#457B9D] uppercase tracking-wider mb-1">
                    What to rent?
                  </label>
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-[#E63946] flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Cinema Camera, PS5, SUV"
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-[#1D3557] placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="px-3 py-2">
                  <label className="block text-[11px] font-bold text-[#457B9D] uppercase tracking-wider mb-1">
                    City / Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#457B9D] flex-shrink-0" />
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-[#1D3557] focus:outline-none bg-transparent cursor-pointer"
                    >
                      <option value="Ahmedabad, Gujarat">Ahmedabad, Gujarat</option>
                      <option value="Surat, Gujarat">Surat, Gujarat</option>
                      <option value="Vadodara, Gujarat">Vadodara, Gujarat</option>
                      <option value="Rajkot, Gujarat">Rajkot, Gujarat</option>
                      <option value="Gandhinagar, Gujarat">Gandhinagar, Gujarat</option>
                    </select>
                  </div>
                </div>

                <div className="px-3 py-2">
                  <label className="block text-[11px] font-bold text-[#457B9D] uppercase tracking-wider mb-1">
                    Rental Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#457B9D] flex-shrink-0" />
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-[#1D3557] focus:outline-none bg-transparent cursor-pointer"
                    >
                      <option value="Hourly Rental">Hourly (Short Project)</option>
                      <option value="Daily Rental">Daily (1 - 6 Days)</option>
                      <option value="Weekly Rental">Weekly (Best Value)</option>
                      <option value="Monthly Rental">Monthly (Corporate/Flex)</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-[#457B9D]">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck size={14} className="text-[#E63946]" /> ₹0 Security Deposit on KYC
                  </span>
                  <span className="hidden md:flex items-center gap-1 font-medium">
                    <Zap size={14} className="text-[#457B9D]" /> Instant Confirmation
                  </span>
                </div>

                <button 
                  onClick={() => {
                    if (searchItem.trim()) {
                      navigate(`/products?search=${encodeURIComponent(searchItem.trim())}`);
                    } else {
                      navigate('/products');
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#D62839] active:scale-95 text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Explore Rentals</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>

            {/* Popular Searches with interactive pill hover */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.38, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#457B9D]"
            >
              <span className="font-semibold flex items-center gap-1 text-[#1D3557]">
                <TrendingUp size={13} className="text-[#E63946]" /> Popular:
              </span>
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    navigate(`/products?search=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#A8DADC]/40 hover:-translate-y-0.5 active:scale-95 border border-[#A8DADC]/60 text-[#1D3557] font-medium transition-all shadow-xs cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </motion.div>

            {/* Trust Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.46, ease: "easeOut" }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#A8DADC]/30"
            >
              {TRUST_STATS.map((stat, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-extrabold text-[#1D3557] font-['Sora']">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#457B9D] font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Right Column: Hero Visual Showcase with smooth floating badges */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="hero-card-image-box group cursor-pointer" onClick={() => navigate('/products')}>
                <div className="relative h-80 sm:h-96 w-full">
                  <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"
                    alt="Rentora Cinema Equipment Rental"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557] via-[#1D3557]/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1D3557] text-xs font-bold shadow-md">
                      📸 Cinema & Photo
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#E63946] text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <Zap size={12} fill="currentColor" /> Instant Booking
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#A8DADC]">
                      <span>PixelCraft Studios</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-yellow-300 font-bold">
                        <Star size={12} fill="currentColor" /> 4.95 (124 reviews)
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-['Sora'] text-white">
                      Sony FX3 Cinema Kit + Master G-Master Lens
                    </h3>
                    <div className="flex items-center justify-between pt-1 border-t border-white/20">
                      <div>
                        <span className="text-2xl font-extrabold text-[#F1FAEE]">₹1,899</span>
                        <span className="text-xs text-[#A8DADC]"> / day</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-white text-[#1D3557] font-bold text-xs group-hover:bg-[#F1FAEE] transition-colors shadow-sm">
                        Reserve Now
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Smooth Floating Reassurance Badge 1 */}
              <div className="hero-float-badge-1 absolute -top-6 -left-6 bg-white p-3 rounded-2xl shadow-xl border border-[#A8DADC]/50 flex items-center gap-3 hidden sm:flex cursor-default z-20">
                <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1D3557]">100% Insured Gear</div>
                  <div className="text-[10px] text-[#457B9D]">Damage protection included</div>
                </div>
              </div>

              {/* Smooth Floating Reassurance Badge 2 */}
              <div className="hero-float-badge-2 absolute -bottom-6 -right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-[#A8DADC]/50 flex items-center gap-3 hidden sm:flex cursor-default z-20">
                <div className="w-10 h-10 rounded-xl bg-[#A8DADC]/30 flex items-center justify-center text-[#1D3557]">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1D3557]">2-Hour Express Delivery</div>
                  <div className="text-[10px] text-[#457B9D]">Doorstep drop & pickup</div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

