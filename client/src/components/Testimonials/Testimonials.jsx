import React from 'react';
import { TESTIMONIALS } from '../../data/mockData';
import { Star, Quote, CheckCircle2, HeartHandshake } from 'lucide-react';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#F1FAEE] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A8DADC]/30 text-[#1D3557] text-xs font-bold uppercase tracking-wider">
            <HeartHandshake size={14} className="text-[#E63946]" />
            <span>Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
            Loved by 50,000+ Creators & Renters
          </h2>
          <p className="text-sm sm:text-base text-[#457B9D]">
            Hear how filmmakers, event planners, and travelers save money and build great projects using Rentora.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="testimonial-card group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={24} className="text-[#A8DADC] group-hover:text-[#E63946] transition-colors" />
                </div>

                <p className="text-sm text-[#1D3557] leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-3.5">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#A8DADC]"
                />
                <div>
                  <div className="text-sm font-bold text-[#1D3557] flex items-center gap-1">
                    <span>{t.name}</span>
                    <CheckCircle2 size={14} className="text-emerald-500 inline" />
                  </div>
                  <div className="text-xs text-[#457B9D]">{t.role} • {t.city}</div>
                  <div className="text-[10px] text-[#E63946] font-semibold mt-0.5">
                    Rented: {t.rentedItem}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
