import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/mockData';
import { 
  Search, 
  CalendarCheck2, 
  ShieldCheck, 
  RotateCcw, 
  HelpCircle,
  FileCheck2,
  Lock,
  Headphones
} from 'lucide-react';
import './HowItWorks.css';

const iconComponents = {
  Search,
  CalendarCheck2,
  ShieldCheck,
  RotateCcw
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A8DADC]/30 text-[#1D3557] text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={14} className="text-[#E63946]" />
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
            How Rentora Works
          </h2>
          <p className="text-sm sm:text-base text-[#457B9D]">
            Renting what you need is as easy as ordering food. Zero cumbersome paperwork, maximum transparency.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {HOW_IT_WORKS_STEPS.map((item, index) => {
            const IconComp = iconComponents[item.iconName] || Search;
            return (
              <div 
                key={item.step}
                className="how-it-works-step-card group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#1D3557] flex items-center justify-center shadow-md group-hover:bg-[#E63946] group-hover:text-white transition-all duration-300">
                    <IconComp size={26} />
                  </div>
                  <span className="text-3xl font-extrabold font-['Sora'] text-[#A8DADC] group-hover:text-[#E63946] transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#1D3557] font-['Sora']">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#457B9D] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#A8DADC]/30 flex items-center gap-1 text-[11px] font-bold text-[#1D3557]">
                  <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                  <span>Step {index + 1} of 4</span>
                </div>
              </div>
            );
          })}

        </div>

        {/* Guarantee Banner */}
        <div className="mt-16 how-it-works-banner">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#A8DADC] flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-sm font-bold">100% Genuine Items</div>
                <div className="text-xs text-[#A8DADC]">Inspected & Sanitized</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#A8DADC] flex-shrink-0">
                <FileCheck2 size={24} />
              </div>
              <div>
                <div className="text-sm font-bold">Digital Rental Contract</div>
                <div className="text-xs text-[#A8DADC]">Instant E-Agreement</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#A8DADC] flex-shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <div className="text-sm font-bold">Safe Escrow Security</div>
                <div className="text-xs text-[#A8DADC]">Deposit Released in 2h</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#A8DADC] flex-shrink-0">
                <Headphones size={24} />
              </div>
              <div>
                <div className="text-sm font-bold">24/7 Rental Concierge</div>
                <div className="text-xs text-[#A8DADC]">Always here to help</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
