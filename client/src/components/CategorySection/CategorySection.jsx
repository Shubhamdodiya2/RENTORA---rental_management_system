import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockData';
import CategoryCard from './CategoryCard';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import './CategorySection.css';

export default function CategorySection({ selectedCategory, onSelectCategory }) {
  return (
    <section id="categories" className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8DADC]/30 text-[#1D3557] text-xs font-bold uppercase tracking-wider">
              <LayoutGrid size={14} className="text-[#E63946]" />
              <span>Rental Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
              Explore by Category
            </h2>
            <p className="text-sm sm:text-base text-[#457B9D] max-w-xl">
              From heavy production cinema cameras to luxury weekend road trips, rent top-tier equipment without the burden of full ownership.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !selectedCategory || selectedCategory === 'all'
                  ? 'bg-[#1D3557] text-white shadow-md'
                  : 'bg-[#F1FAEE] text-[#457B9D] hover:bg-[#A8DADC]/40'
              }`}
            >
              All Categories
            </button>
            <Link 
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:text-[#D62839] group transition-colors"
            >
              <span>Browse All Items</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.slug}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
