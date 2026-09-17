import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-container">
      <Link to="/" className="breadcrumb-link flex items-center gap-1">
        <Home size={13} className="text-[#457B9D]" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="text-[#A8DADC]" />
            {isLast || !item.link ? (
              <span className="breadcrumb-current truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link to={item.link} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
