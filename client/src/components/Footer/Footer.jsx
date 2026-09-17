import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { 
  Mail, 
  Send, 
  Phone, 
  MapPin, 
  Heart, 
  Sparkles
} from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      alert(`Thank you for subscribing! Your ₹500 rental voucher has been sent to ${email}`);
      setEmail('');
      setSubscribed(false);
    }, 1000);
  };

  return (
    <footer className="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Newsletter Banner */}
        <div className="footer-newsletter-card mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E63946] text-white text-[11px] font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Special Promo</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Sora'] text-white">
                Get ₹500 Off Your First Rental Order
              </h3>
              <p className="text-xs sm:text-sm text-[#A8DADC]">
                Subscribe for exclusive weekend discount codes, new gear arrivals, and special vendor offers across Gujarat.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-[#1D3557] rounded-xl text-xs font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={subscribed}
                  className="px-6 py-3 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl text-xs font-bold btn-primary-glow flex items-center justify-center gap-1.5 transition-all flex-shrink-0"
                >
                  <span>{subscribed ? 'Subscribing...' : 'Claim Voucher'}</span>
                  <Send size={14} />
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Multi-Column Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" variant="dark-footer" />
            <p className="text-xs sm:text-sm text-[#A8DADC] leading-relaxed max-w-sm">
              Rentora is India's premier multi-vendor rental ecosystem connecting creators, travelers, and businesses with verified local rental vendors. Rent what you need, when you need it.
            </p>

            <div className="space-y-2 text-xs text-[#A8DADC] pt-1">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#E63946]" />
                <span>Ahmedabad & Surat Hubs • Servicing All Gujarat</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#E63946]" />
                <span>+91 98765 RENTORA (24/7 Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#E63946]" />
                <span>support@rentora.in</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-icon">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="footer-social-icon">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-icon">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-social-icon">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold font-['Sora'] text-white uppercase tracking-wider">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#A8DADC]">
              <li><Link to="/products" className="hover:text-white transition-colors">Cameras & Cinema Lenses</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Drones & Aerial Gimbal Kits</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">PlayStation 5 & Laptops</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Mahindra Thar & SUVs</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Party DJ & Sound Systems</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Alpine Camping & Tents</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Wedding Sherwanis & Lehengas</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold font-['Sora'] text-white uppercase tracking-wider">
              For Renters
            </h4>
            <ul className="space-y-2 text-xs text-[#A8DADC]">
              <li><Link to="/products" className="hover:text-white transition-colors">Browse Catalog</Link></li>
              <li><Link to="/customer/dashboard" className="hover:text-white transition-colors">Customer Dashboard</Link></li>
              <li><Link to="/customer/rentals" className="hover:text-white transition-colors">My Active Rentals</Link></li>
              <li><Link to="/customer/bookings" className="hover:text-white transition-colors">Booking Approvals & KYC</Link></li>
              <li><Link to="/customer/contracts" className="hover:text-white transition-colors">Digital Rental Contracts</Link></li>
              <li><Link to="/customer/invoices" className="hover:text-white transition-colors">Download Invoices</Link></li>
              <li><Link to="/customer/settings" className="hover:text-white transition-colors">Customer Help & Settings</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold font-['Sora'] text-white uppercase tracking-wider">
              For Rental Vendors
            </h4>
            <ul className="space-y-2 text-xs text-[#A8DADC]">
              <li><Link to="/signup" className="text-[#E63946] font-bold hover:underline">List Your Store Inventory</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">Vendor Dashboard Login</Link></li>
              <li><Link to="/vendor/products" className="hover:text-white transition-colors">Inventory & Pricing Manager</Link></li>
              <li><Link to="/vendor/orders" className="hover:text-white transition-colors">Order Dispatch Pipeline</Link></li>
              <li><Link to="/vendor/pickups-returns" className="hover:text-white transition-colors">QC Checklists & Escrow</Link></li>
              <li><Link to="/vendor/payments" className="hover:text-white transition-colors">Merchant Payout Schedule</Link></li>
              <li><Link to="/vendor/settings" className="hover:text-white transition-colors">Vendor Guidelines & Settings</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A8DADC]">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Rentora Technologies. Built with</span>
            <Heart size={12} className="text-[#E63946] fill-[#E63946]" />
            <span>for smart creators.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/customer/contracts" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/customer/contracts" className="hover:text-white transition-colors">Terms of Rental Service</Link>
            <span>•</span>
            <Link to="/customer/payments" className="hover:text-white transition-colors">Security Escrow</Link>
            <span>•</span>
            <Link to="/admin/dashboard" className="text-[#E63946] hover:text-white font-semibold transition-colors">Super Admin Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
