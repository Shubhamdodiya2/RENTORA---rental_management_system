import React, { useState } from 'react';
import { 
  Store, 
  ArrowRight, 
  CheckCircle2,
  Coins,
  BadgeCheck
} from 'lucide-react';
import './VendorCTA.css';

export default function VendorCTA() {
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Cameras & Video');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storeName) return;
    setSubmitted(true);
    setTimeout(() => {
      alert(`Welcome ${storeName}! Your vendor onboarding request has been submitted to the Rentora onboarding team.`);
      setStoreName('');
      setSubmitted(false);
    }, 1200);
  };

  return (
    <section id="vendor-cta" className="vendor-cta-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A8DADC]/20 border border-[#A8DADC]/30 text-[#A8DADC] text-xs font-bold uppercase tracking-wider">
              <Store size={14} className="text-[#E63946]" />
              <span>For Rental Stores & Equipment Owners</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Sora'] tracking-tight leading-tight">
              Turn Your Idle Equipment into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A69] via-[#E63946] to-[#A8DADC]">
                Steady Monthly Revenue.
              </span>
            </h2>

            <p className="text-base text-[#A8DADC] max-w-xl leading-relaxed">
              Join 1,200+ camera rental shops, event vendors, vehicle owners, and tool suppliers who list their inventory on Rentora to reach thousands of verified customers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Automated KYC & Security</div>
                  <div className="text-xs text-[#A8DADC]">Full customer identity verification</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Daily & Weekly Payouts</div>
                  <div className="text-xs text-[#A8DADC]">Direct bank deposits with zero lag</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Smart Inventory Calendar</div>
                  <div className="text-xs text-[#A8DADC]">Manage bookings, orders & returns</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">0% Platform Fee for 30 Days</div>
                  <div className="text-xs text-[#A8DADC]">Keep 100% of your initial earnings</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            <div className="vendor-card">
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold font-['Sora'] text-[#1D3557]">List on Rentora</h3>
                  <p className="text-xs text-[#457B9D]">Start getting bookings in under 24 hours</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
                  <BadgeCheck size={24} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Rental Business / Shop Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Cinema Gear, Surat"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs text-[#1D3557] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E63946]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D3557] uppercase tracking-wider mb-1">
                    Primary Inventory Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F1FAEE] border border-[#A8DADC] text-xs text-[#1D3557] font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Cameras & Video">Cameras, Drones & Video Gear</option>
                    <option value="Electronics & Consoles">Laptops, Monitors & Gaming Consoles</option>
                    <option value="Vehicles & 4x4">Vehicles, SUVs & Superbikes</option>
                    <option value="Event, Audio & DJ">DJ Sound, Lighting & Stage Gear</option>
                    <option value="Tools & Machinery">Construction & Power Tools</option>
                    <option value="Designer Outfits">Wedding Costumes & Designer Attire</option>
                  </select>
                </div>

                <div className="p-3 bg-[#A8DADC]/20 rounded-xl border border-[#A8DADC]/40 text-[11px] text-[#457B9D] flex items-center gap-2">
                  <Coins size={16} className="text-[#E63946] flex-shrink-0" />
                  <span>Estimated average vendor earnings: <strong className="text-[#1D3557]">₹45,000 - ₹1,80,000 / mo</strong></span>
                </div>

                <button
                  type="submit"
                  disabled={submitted}
                  className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm btn-primary-glow flex items-center justify-center gap-2 transition-all"
                >
                  <span>{submitted ? 'Submitting Application...' : 'Register as Vendor'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
