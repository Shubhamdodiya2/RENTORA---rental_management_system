import React, { useState } from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import CategorySection from '../../components/CategorySection/CategorySection';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Testimonials from '../../components/Testimonials/Testimonials';
import VendorCTA from '../../components/VendorCTA/VendorCTA';
import './Home.css';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSelectCategory = (categorySlug) => {
    setSelectedCategory(categorySlug);
    const featuredEl = document.getElementById('featured');
    if (featuredEl) {
      featuredEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="home-page-container">
      {/* 1. Hero Section with Search Bar & Stats */}
      <HeroSection />

      {/* 2. Category Catalog Grid */}
      <CategorySection 
        selectedCategory={selectedCategory} 
        onSelectCategory={handleSelectCategory} 
      />

      {/* 3. Featured Rentals Showcase */}
      <FeaturedProducts 
        selectedCategory={selectedCategory} 
        onSelectCategory={handleSelectCategory} 
      />

      {/* 4. How Rentora Works - 4 Steps */}
      <HowItWorks />

      {/* 5. Customer Stories & Social Proof */}
      <Testimonials />

      {/* 6. Vendor Onboarding CTA */}
      <VendorCTA />
    </main>
  );
}
