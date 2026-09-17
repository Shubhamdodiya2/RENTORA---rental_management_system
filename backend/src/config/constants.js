// Master System Constants for Rentora

module.exports = {
  ROLES: {
    CUSTOMER: 'CUSTOMER',
    VENDOR: 'VENDOR',
    SUPER_ADMIN: 'SUPER_ADMIN'
  },

  LIFECYCLE_STEPS: {
    1: { num: 1, key: 'BOOKING_CONFIRMED', label: 'Booking Confirmed' },
    2: { num: 2, key: 'PRODUCT_RESERVED', label: 'Product Reserved' },
    3: { num: 3, key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    4: { num: 4, key: 'PRODUCT_HANDED_OVER', label: 'Product Handed Over' },
    5: { num: 5, key: 'RENTAL_ACTIVE', label: 'Rental Active' },
    6: { num: 6, key: 'RETURN_SCHEDULED', label: 'Return Scheduled' },
    7: { num: 7, key: 'PRODUCT_RETURNED', label: 'Product Returned' },
    8: { num: 8, key: 'DEPOSIT_RELEASED', label: 'Deposit Released' }
  },

  BOOKING_STATUSES: [
    'BOOKING_CONFIRMED',
    'PRODUCT_RESERVED',
    'PICKUP_SCHEDULED',
    'PRODUCT_HANDED_OVER',
    'RENTAL_ACTIVE',
    'RETURN_SCHEDULED',
    'PRODUCT_RETURNED',
    'DEPOSIT_RELEASED',
    'CANCELLED',
    'DISPUTED'
  ],

  ORDER_STATUSES: [
    'Pending',
    'Confirmed',
    'Processing',
    'Delivered',
    'Active',
    'Returned',
    'Completed',
    'Cancelled'
  ],

  PAYMENT_STATUSES: ['Pending', 'Initiated', 'Success', 'Failed', 'Refunded'],
  ESCROW_STATUSES: ['Held', 'Released', 'Partial_Deduction', 'Disputed'],
  PRODUCT_STATUSES: ['Active', 'Low Stock', 'Out of Stock', 'Draft'],
  APPROVAL_STATUSES: ['Pending', 'Approved', 'Rejected'],
  KYC_STATUSES: ['Pending', 'Verified', 'Rejected'],
  INVENTORY_TRANSACTIONS: [
    'STOCK_ADDED',
    'STOCK_REMOVED',
    'STOCK_RESERVED',
    'STOCK_RELEASED',
    'DAMAGED',
    'RETURNED',
    'ADJUSTED'
  ],
  DURATION_MODES: ['hour', 'day', 'week', 'month', 'year'],
  DELIVERY_TYPES: ['doorstep', 'store_pickup'],
  PAYMENT_PLANS: ['full', 'deposit_only', 'pay_on_delivery'],
  PAYMENT_SUBMISSION_STATUSES: ['Pending', 'Under_Review', 'Verified', 'Rejected'],
  PAYMENT_METHODS: ['UPI_MANUAL', 'BANK_TRANSFER', 'RAZORPAY']
};
