import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
import './ProductImageGallery.css';

export default function ProductImageGallery({ images = [], title = 'Product Image' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : (prev + 1) % images.length));
  };

  if (!images || images.length === 0) {
    return (
      <div className="gallery-main-view flex items-center justify-center text-[#A8DADC]">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Box */}
      <div className="gallery-main-view group">
        <img
          src={images[currentIndex]}
          alt={`${title} - View ${currentIndex + 1}`}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1D3557] text-xs font-bold shadow-md flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verified Condition</span>
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="View Fullscreen"
        >
          <Maximize2 size={16} />
        </button>

        {/* Navigation Arrows (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1D3557] shadow-lg flex items-center justify-center transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1D3557] shadow-lg flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`gallery-thumb-btn ${currentIndex === idx ? 'active' : 'opacity-70 hover:opacity-100'}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreenOpen && (
        <div 
          onClick={() => setFullscreenOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <button 
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-6 right-6 text-white text-2xl font-bold w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            ✕
          </button>
          <img
            src={images[currentIndex]}
            alt={title}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
