import React, { createContext, useContext, useState } from 'react';
import { FEATURED_PRODUCTS } from '../data/mockData';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Default draft booking
  const defaultProduct = FEATURED_PRODUCTS[0]; // Sony FX3 default

  const [bookingDraft, setBookingDraft] = useState({
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
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const updateBookingDraft = (updates) => {
    setBookingDraft((prev) => ({
      ...prev,
      ...updates
    }));
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
