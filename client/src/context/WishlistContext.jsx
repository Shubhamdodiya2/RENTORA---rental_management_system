import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user ? `rentora_wishlist_${user.id}` : 'rentora_wishlist_guest';

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('rentora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to local storage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
      // Also keep fallback general key in sync
      localStorage.setItem('rentora_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('[WishlistContext] Storage sync error:', e);
    }
  }, [wishlist, storageKey]);

  // When user logs in or switches, load their specific wishlist
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else {
        const legacy = localStorage.getItem('rentora_wishlist');
        if (legacy) {
          setWishlist(JSON.parse(legacy));
        }
      }
    } catch {
      // ignore parse error
    }
  }, [storageKey]);

  /**
   * Check if a product is in the wishlist
   */
  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  /**
   * Toggle product in wishlist
   */
  const toggleWishlist = useCallback((product) => {
    if (!product || !product.id) return false;

    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        const primaryImg = product.images?.[0] || product.primaryImage || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
        const formattedItem = {
          id: product.id,
          title: product.title || product.name || 'Rental Gear',
          name: product.name || product.title || 'Rental Gear',
          slug: product.slug || product.id,
          category: product.category?.name || product.category || 'Equipment',
          categorySlug: product.category?.slug || product.categorySlug || 'equipment',
          pricePerDay: Number(product.pricePerDay || 0),
          pricePerHour: Number(product.pricePerHour || Math.round((product.pricePerDay || 0) / 8)),
          pricePerWeek: Number(product.pricePerWeek || (product.pricePerDay || 0) * 5),
          pricePerMonth: Number(product.pricePerMonth || (product.pricePerDay || 0) * 18),
          deposit: Number(product.deposit || product.securityDeposit || 0),
          securityDeposit: Number(product.securityDeposit || product.deposit || 0),
          images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [primaryImg],
          vendor: {
            id: product.vendor?.id || 'vnd-1',
            name: product.vendor?.businessName || product.vendor?.name || 'Rentora Partner Store',
            businessName: product.vendor?.businessName || product.vendor?.name || 'Rentora Partner Store',
            city: product.vendor?.city || 'Ahmedabad'
          }
        };
        return [formattedItem, ...prev];
      }
    });

    return !isInWishlist(product.id);
  }, [isInWishlist]);

  /**
   * Remove specific product from wishlist
   */
  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  /**
   * Clear entire wishlist
   */
  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const openWishlist = useCallback(() => setIsDrawerOpen(true), []);
  const closeWishlist = useCallback(() => setIsDrawerOpen(false), []);
  const toggleWishlistDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isDrawerOpen,
        openWishlist,
        closeWishlist,
        toggleWishlistDrawer
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
