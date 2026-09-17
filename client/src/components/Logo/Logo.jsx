import React from 'react';
import rentoraLogo from '../../assets/rentoramainLOGO.png';
import './Logo.css';

export default function Logo({ size = 'md', className = '', variant = 'default' }) {
  const heightMap = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-16 md:h-20',
    lg: 'h-20 sm:h-24',
    xl: 'h-28 sm:h-32'
  };

  const currentHeight = heightMap[size] || heightMap.md;

  if (variant === 'dark-footer') {
    return (
      <div className={`rentora-logo-container group ${className}`}>
        <div className="rentora-logo-footer-card">
          <img
            src={rentoraLogo}
            alt="Rentora Logo"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`rentora-logo-container group ${className}`}>
      <img
        src={rentoraLogo}
        alt="Rentora Logo"
        className={`rentora-logo-img ${currentHeight} drop-shadow-sm`}
      />
    </div>
  );
}
