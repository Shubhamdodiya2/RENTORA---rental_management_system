import React, { createContext, useContext, useState } from 'react';
import { FEATURED_PRODUCTS } from '../data/mockData';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Default draft booking
  const defaultProduct = FEATURED_PRODUCTS[0]; // Sony FX3 default

  const [bookingDraft, setBookingDraft] = useState(() => {
    try {
      const saved = sessionStorage.getItem('rentora_booking_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.product) return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
    return {
      product: defaultProduct,
      durationMode: 'day', // 'hour' | 'day' | 'week' | 'month' | 'year'
      startDate: '2026-09-18',
      endDate: '2026-09-20',
      durationCount: 2, // 2 days
      quantity: 1,
      deliveryType: 'doorstep', // 'doorstep' | 'store_pickup'
      deliveryAddress: '304, Shivalik Highstreet, Keshavbaug, Ahmedabad, Gujarat - 380015',
      pickupTime: '10:00 AM',
      returnTime: '06:00 PM',
      paymentPlan: 'full', // 'full' | 'deposit_only' | 'pay_on_delivery'
      couponCode: '',
      discount: 0,
      rentalNotes: ''
    };
  });

  const [confirmedBooking, setConfirmedBookingState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('rentora_confirmed_booking');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const setConfirmedBooking = (bookingData) => {
    setConfirmedBookingState(bookingData);
    if (bookingData) {
      try {
        sessionStorage.setItem('rentora_confirmed_booking', JSON.stringify(bookingData));
      } catch {
        // ignore
      }
    } else {
      sessionStorage.removeItem('rentora_confirmed_booking');
    }
  };

  const updateBookingDraft = (updates) => {
    setBookingDraft((prev) => {
      const nextDraft = {
        ...prev,
        ...updates
      };
      try {
        sessionStorage.setItem('rentora_booking_draft', JSON.stringify(nextDraft));
      } catch {
        // ignore storage error
      }
      return nextDraft;
    });
  };

  const calculateTotal = () => {
    if (!bookingDraft.product) return { subtotal: 0, deposit: 0, total: 0, discount: 0 };

    const p = bookingDraft.product;
    let rate = p.pricePerDay;
    if (bookingDraft.durationMode === 'hour') rate = p.pricePerHour || Math.round(p.pricePerDay / 8);
    if (bookingDraft.durationMode === 'week') rate = p.pricePerWeek || (p.pricePerDay * 5);
    if (bookingDraft.durationMode === 'month') rate = p.pricePerMonth || (p.pricePerDay * 18);
    if (bookingDraft.durationMode === 'year') rate = p.pricePerYear || (p.pricePerMonth * 10);

    const subtotal = rate * (bookingDraft.durationCount || 1) * (bookingDraft.quantity || 1);
    const deposit = p.deposit * (bookingDraft.quantity || 1);
    const discount = bookingDraft.discount || 0;
    const deliveryFee = bookingDraft.deliveryType === 'doorstep' ? 199 : 0;
    const total = subtotal + deposit + deliveryFee - discount;

    return {
      rate,
      subtotal,
      deposit,
      deliveryFee,
      discount,
      total
    };
  };

  return (
    <BookingContext.Provider value={{
      bookingDraft,
      updateBookingDraft,
      calculateTotal,
      confirmedBooking,
      setConfirmedBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
