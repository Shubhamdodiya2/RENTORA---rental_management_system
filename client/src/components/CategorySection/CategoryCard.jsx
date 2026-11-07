import React from 'react';
import { 
  Camera, 
  Laptop, 
  Car, 
  Armchair, 
  PartyPopper, 
  Wrench, 
  Tent, 
  Sparkles,
  ArrowUpRight 
} from 'lucide-react';
import './CategorySection.css';

const iconMap = {
  Camera,
  Laptop,
  Car,
  Armchair,
  PartyPopper,
  Wrench,
  Tent,
  Sparkles
};

export default function CategoryCard({ category, onSelectCategory, isSelected }) {
  const IconComponent = iconMap[category.iconName] || Sparkles;

  return (
    <div 
      onClick={() => onSelectCategory && onSelectCategory(category.slug)}
      className={`category-card group ${
        isSelected ? 'category-card-active' : 'category-card-inactive'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
          isSelected 
            ? 'bg-[#E63946] text-white shadow-md' 
            : 'bg-[#A8DADC]/30 text-[#1D3557] group-hover:bg-[#E63946] group-hover:text-white'
        }`}>
          <IconComponent size={24} />
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
            isSelected 
              ? 'bg-white/20 text-[#A8DADC]' 
              : 'bg-[#F1FAEE] text-[#457B9D] group-hover:bg-[#A8DADC]/30'
          }`}>
            {category.count}
          </span>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
            isSelected ? 'text-[#E63946]' : 'text-gray-400 group-hover:text-[#E63946]'
          }`}>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>


      <div>
        <h3 className={`text-base font-bold font-['Sora'] tracking-tight mb-1 transition-colors ${
          isSelected ? 'text-white' : 'text-[#1D3557]'
        }`}>
          {category.name}
        </h3>
        <p className={`text-xs line-clamp-1 transition-colors ${
          isSelected ? 'text-[#A8DADC]' : 'text-[#457B9D]'
        }`}>
          {category.description}
        </p>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
        isSelected ? 'bg-[#E63946]' : 'bg-transparent'
      }`} />
    </div>
  );
}
