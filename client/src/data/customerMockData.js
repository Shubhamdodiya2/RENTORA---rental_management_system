export const CUSTOMER_PROFILE = {
  id: 'cust-9814',
  name: 'Alex Patel',
  firstName: 'Alex',
  email: 'alex.patel@creativestudio.in',
  phone: '+91 98250 44882',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Patel&background=1D3557&color=ffffff&bold=true',
  city: 'Ahmedabad',
  state: 'Gujarat',
  address: '402, Shivalik Highstreet, Keshavbaug, Bodakdev, Ahmedabad - 380015',
  kycStatus: 'Verified',
  kycBadge: 'Rentora Prime Member (Zero-Deposit Eligible)',
  joinedDate: 'January 2025',
  totalRentalsCompleted: 18,
  activeRentalsCount: 3,
  upcomingReturnsCount: 2,
  totalSpending: 24850,
  escrowDepositHeld: 9000
};

export const CUSTOMER_METRICS = {
  activeRentals: 3,
  upcomingReturns: 2,
  totalBookings: 18,
  totalSpending: '₹24,850',
  activeDepositInEscrow: '₹9,000',
  thisMonthSpending: '₹6,497',
  lastMonthSpending: '₹9,850'
};

export const CUSTOMER_RENTALS = [
  {
    id: 'rent-001',
    orderId: 'REN-2026-9814',
    title: 'Sony Alpha FX3 Cinema Camera + 24-70mm GM II Lens',
    category: 'Cameras & Photography',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    vendor: {
      id: 'vendor-1',
      name: 'PixelCraft Rentals',
      city: 'Ahmedabad',
      phone: '+91 98250 12345',
      address: 'Near SG Highway, Bodakdev, Ahmedabad'
    },
    startDate: '16 Sep 2026',
    endDate: '19 Sep 2026',
    durationDays: 3,
    pickupTime: '10:00 AM',
    returnTime: '06:00 PM',
    handoverType: 'Express Doorstep Delivery',
    rentalAmount: 5697,
    securityDeposit: 3000,
    deliveryFee: 199,
    discount: 500,
    totalPaid: 8396,
    paymentStatus: 'Paid',
    rentalStatus: 'Active',
    daysRemaining: 3,
    currentStep: 5, // 1..8
    inspectionNote: 'Sanitized & calibrated before dispatch. Sealed in Pelican hard case.'
  },
  {
    id: 'rent-002',
    orderId: 'REN-2026-7412',
    title: 'PlayStation 5 Pro Console + 2 Controllers + 5 Games',
    category: 'Electronics & Gaming',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    vendor: {
      id: 'vendor-3',
      name: 'GameZone Arena Store',
      city: 'Surat',
      phone: '+91 99090 33445',
      address: 'Ghod Dod Road, Surat'
    },
    startDate: '15 Sep 2026',
    endDate: '18 Sep 2026',
    durationDays: 3,
    pickupTime: '02:00 PM',
    returnTime: '04:00 PM',
    handoverType: 'Doorstep Courier',
    rentalAmount: 1497,
    securityDeposit: 1500,
    deliveryFee: 0,
    discount: 0,
    totalPaid: 2997,
    paymentStatus: 'Paid',
    rentalStatus: 'Return Scheduled',
    daysRemaining: 1, // Due Tomorrow
    currentStep: 6,
    inspectionNote: 'Console serial tag intact. 2x DualSense + HDMI 2.1 cable included.'
  },
  {
    id: 'rent-003',
    orderId: 'REN-2026-5521',
    title: 'Mahindra Thar 4x4 Hardtop Expedition Ready SUV',
    category: 'Vehicles & Superbikes',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    vendor: {
      id: 'vendor-4',
      name: 'RoveWheels Self-Drive',
      city: 'Ahmedabad',
      phone: '+91 98980 77889',
      address: 'Near Airport Road, Ahmedabad'
    },
    startDate: '12 Sep 2026',
    endDate: '17 Sep 2026',
    durationDays: 5,
    pickupTime: '08:00 AM',
    returnTime: '08:00 PM',
    handoverType: 'Hub Pickup & Drop',
    rentalAmount: 14495,
    securityDeposit: 5000,
    deliveryFee: 0,
    discount: 1000,
    totalPaid: 18495,
    paymentStatus: 'Paid',
    rentalStatus: 'Active',
    daysRemaining: 1,
    currentStep: 5,
    inspectionNote: 'Fuel full-to-full. Odometer reading 24,120 km. Roadside coverage active.'
  },
  {
    id: 'rent-004',
    orderId: 'REN-2026-3829',
    title: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
    category: 'Electronics & Gaming',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    vendor: {
      id: 'vendor-5',
      name: 'TechLease Enterprise',
      city: 'Vadodara',
      phone: '+91 97120 44556',
      address: 'Alkapuri, Vadodara'
    },
    startDate: '01 Sep 2026',
    endDate: '08 Sep 2026',
    durationDays: 7,
    pickupTime: '11:00 AM',
    returnTime: '06:00 PM',
    handoverType: 'Doorstep Courier',
    rentalAmount: 6999,
    securityDeposit: 4000,
    deliveryFee: 0,
    discount: 500,
    totalPaid: 10499,
    paymentStatus: 'Paid',
    rentalStatus: 'Completed',
    daysRemaining: 0,
    currentStep: 8,
    inspectionNote: 'Item returned in flawless condition. ₹4,000 security deposit refunded on 08 Sep.'
  },
  {
    id: 'rent-005',
    orderId: 'REN-2026-2109',
    title: 'JBL PartyBox 1000W High Power Bluetooth Speaker System',
    category: 'Event & Sound Gear',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    vendor: {
      id: 'vendor-6',
      name: 'BeatVibe Audio Gear',
      city: 'Rajkot',
      phone: '+91 98240 88990',
      address: 'Yagnik Road, Rajkot'
    },
    startDate: '22 Aug 2026',
    endDate: '24 Aug 2026',
    durationDays: 2,
    pickupTime: '04:00 PM',
    returnTime: '11:00 AM',
    handoverType: 'Store Pickup',
    rentalAmount: 2398,
    securityDeposit: 2000,
    deliveryFee: 0,
    discount: 0,
    totalPaid: 4398,
    paymentStatus: 'Paid',
    rentalStatus: 'Completed',
    daysRemaining: 0,
    currentStep: 8,
    inspectionNote: 'Clean return. Both wireless mics tested and intact.'
  }
];

export const CUSTOMER_QUOTATIONS = [
  {
    id: 'quot-101',
    quotationNumber: 'QUO-2026-4421',
    vendor: 'SkyHigh Aerial Solutions (Gandhinagar)',
    product: 'DJI Inspire 3 Drone with Zenmuse X9-8K Air Cinema Kit (7-Day Shoot)',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
    dates: '24 Sep 2026 - 01 Oct 2026',
    duration: '7 Days (Weekly Rate)',
    subtotal: 16999,
    deposit: 5000,
    discount: 1500,
    totalAmount: 20499,
    status: 'Pending Acceptance',
    validUntil: '20 Sep 2026',
    notes: 'Includes certified DGCA pilot co-operator assistance discount.'
  },
  {
    id: 'quot-102',
    quotationNumber: 'QUO-2026-3890',
    vendor: 'WorkSpace Flex Solutions (Ahmedabad)',
    product: 'Herman Miller Aeron Chair + Dual-Motor Standing Desk (1-Month Setup)',
    image: 'https://images.unsplash.com/photo-1580481077197-09d3da13f38d?auto=format&fit=crop&w=400&q=80',
    dates: '01 Oct 2026 - 01 Nov 2026',
    duration: '1 Month (Corporate Tier)',
    subtotal: 4200,
    deposit: 2000,
    discount: 400,
    totalAmount: 5800,
    status: 'Accepted',
    validUntil: '25 Sep 2026',
    notes: 'Includes free home delivery, assembly and ergonomic calibration.'
  }
];

export const CUSTOMER_CONTRACTS = [
  {
    id: 'cntr-01',
    contractNumber: 'CTR-RENTORA-2026-9814',
    orderId: 'REN-2026-9814',
    vendorName: 'PixelCraft Rentals',
    productName: 'Sony Alpha FX3 Cinema Camera Kit',
    startDate: '16 Sep 2026',
    endDate: '19 Sep 2026',
    status: 'Signed (Active)',
    signDate: '16 Sep 2026, 09:15 AM',
    depositEscrowStatus: 'Held in Rentora Escrow (₹3,000)',
    damageCoverage: '₹50,000 Standard Transit & Electronic Protection'
  },
  {
    id: 'cntr-02',
    contractNumber: 'CTR-RENTORA-2026-7412',
    orderId: 'REN-2026-7412',
    vendorName: 'GameZone Arena Store',
    productName: 'PlayStation 5 Pro Bundle',
    startDate: '15 Sep 2026',
    endDate: '18 Sep 2026',
    status: 'Signed (Active)',
    signDate: '15 Sep 2026, 01:30 PM',
    depositEscrowStatus: 'Held in Rentora Escrow (₹1,500)',
    damageCoverage: '₹25,000 Hardware Protection'
  },
  {
    id: 'cntr-03',
    contractNumber: 'CTR-RENTORA-2026-5521',
    orderId: 'REN-2026-5521',
    vendorName: 'RoveWheels Self-Drive',
    productName: 'Mahindra Thar 4x4 Hardtop Expedition SUV',
    startDate: '12 Sep 2026',
    endDate: '17 Sep 2026',
    status: 'Signed (Active)',
    signDate: '12 Sep 2026, 07:45 AM',
    depositEscrowStatus: 'Held in Rentora Escrow (₹5,000)',
    damageCoverage: 'Commercial Comprehensive Self-Drive Insurance Included'
  }
];

export const CUSTOMER_INVOICES = [
  {
    id: 'inv-01',
    invoiceNumber: 'INV-2026-9814',
    orderId: 'REN-2026-9814',
    vendor: 'PixelCraft Rentals (Ahmedabad)',
    invoiceDate: '16 Sep 2026',
    dueDate: '16 Sep 2026',
    product: 'Sony Alpha FX3 Cinema Camera + 24-70mm GM II Lens',
    duration: '3 Days (16 Sep - 19 Sep 2026)',
    subtotal: 5697,
    deposit: 3000,
    delivery: 199,
    discount: 500,
    tax: 0,
    total: 8396,
    paymentMethod: 'UPI (GPay - *4488)',
    status: 'Paid'
  },
  {
    id: 'inv-02',
    invoiceNumber: 'INV-2026-7412',
    orderId: 'REN-2026-7412',
    vendor: 'GameZone Arena Store (Surat)',
    invoiceDate: '15 Sep 2026',
    dueDate: '15 Sep 2026',
    product: 'PlayStation 5 Pro Console Bundle (2 Controllers + 5 Games)',
    duration: '3 Days (15 Sep - 18 Sep 2026)',
    subtotal: 1497,
    deposit: 1500,
    delivery: 0,
    discount: 0,
    tax: 0,
    total: 2997,
    paymentMethod: 'HDFC Credit Card (*9012)',
    status: 'Paid'
  },
  {
    id: 'inv-03',
    invoiceNumber: 'INV-2026-5521',
    orderId: 'REN-2026-5521',
    vendor: 'RoveWheels Self-Drive (Ahmedabad)',
    invoiceDate: '12 Sep 2026',
    dueDate: '12 Sep 2026',
    product: 'Mahindra Thar 4x4 Hardtop Expedition SUV',
    duration: '5 Days (12 Sep - 17 Sep 2026)',
    subtotal: 14495,
    deposit: 5000,
    delivery: 0,
    discount: 1000,
    tax: 0,
    total: 18495,
    paymentMethod: 'UPI (PhonePe - *4488)',
    status: 'Paid'
  },
  {
    id: 'inv-04',
    invoiceNumber: 'INV-2026-3829',
    orderId: 'REN-2026-3829',
    vendor: 'TechLease Enterprise (Vadodara)',
    invoiceDate: '01 Sep 2026',
    dueDate: '01 Sep 2026',
    product: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
    duration: '7 Days (01 Sep - 08 Sep 2026)',
    subtotal: 6999,
    deposit: 4000,
    delivery: 0,
    discount: 500,
    tax: 0,
    total: 10499,
    paymentMethod: 'NetBanking (ICICI Bank)',
    status: 'Paid'
  }
];

export const CUSTOMER_PAYMENTS = [
  {
    id: 'pay-01',
    txnId: 'TXN-RENT-892182',
    orderId: 'REN-2026-9814',
    date: '16 Sep 2026, 09:12 AM',
    product: 'Sony Alpha FX3 Cinema Camera Kit',
    amount: 8396,
    type: 'Full Upfront Payment',
    method: 'UPI (GPay)',
    status: 'Success'
  },
  {
    id: 'pay-02',
    txnId: 'TXN-RENT-762910',
    orderId: 'REN-2026-7412',
    date: '15 Sep 2026, 01:25 PM',
    product: 'PlayStation 5 Pro Console Bundle',
    amount: 2997,
    type: 'Full Upfront Payment',
    method: 'Credit Card',
    status: 'Success'
  },
  {
    id: 'pay-03',
    txnId: 'TXN-REFUND-441092',
    orderId: 'REN-2026-3829',
    date: '08 Sep 2026, 07:15 PM',
    product: 'MacBook Pro 16" M3 Max (Security Deposit Release)',
    amount: 4000,
    type: 'Security Deposit Refund',
    method: 'Direct Bank Transfer',
    status: 'Success'
  },
  {
    id: 'pay-04',
    txnId: 'TXN-RENT-512809',
    orderId: 'REN-2026-5521',
    date: '12 Sep 2026, 07:40 AM',
    product: 'Mahindra Thar 4x4 Expedition',
    amount: 18495,
    type: 'Full Upfront Payment',
    method: 'UPI (PhonePe)',
    status: 'Success'
  }
];

export const CUSTOMER_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'return_reminder',
    title: 'Upcoming Return Due Tomorrow',
    message: 'PlayStation 5 Pro is due for doorstep return pickup tomorrow by 04:00 PM.',
    time: '2 hours ago',
    read: false,
    orderId: 'REN-2026-7412'
  },
  {
    id: 'notif-2',
    type: 'booking_confirmed',
    title: 'Booking Confirmed: Sony FX3 Cinema Kit',
    message: 'Your 3-day rental order REN-2026-9814 has been confirmed by PixelCraft Rentals.',
    time: '5 hours ago',
    read: false,
    orderId: 'REN-2026-9814'
  },
  {
    id: 'notif-3',
    type: 'quotation_received',
    title: 'Custom Quotation Ready',
    message: 'SkyHigh Aerial Solutions sent quotation QUO-2026-4421 for DJI Inspire 3 Cinema Kit.',
    time: '1 day ago',
    read: true,
    orderId: 'QUO-2026-4421'
  },
  {
    id: 'notif-4',
    type: 'refund_processed',
    title: 'Deposit Refunded: ₹4,000 Released',
    message: 'Security deposit for MacBook Pro 16" was transferred back to your bank account.',
    time: '8 days ago',
    read: true,
    orderId: 'REN-2026-3829'
  }
];

export const SPENDING_CHART_DATA = [
  { month: 'Apr', amount: 4200 },
  { month: 'May', amount: 8900 },
  { month: 'Jun', amount: 12400 },
  { month: 'Jul', amount: 15600 },
  { month: 'Aug', amount: 18350 },
  { month: 'Sep', amount: 24850 }
];
