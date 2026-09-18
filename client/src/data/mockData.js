export const CATEGORIES = [
  {
    id: 'cameras',
    name: 'Cameras & Photography',
    slug: 'cameras',
    iconName: 'Camera',
    count: '420+ Items',
    description: 'Cinema Cams, DSLRs, Gimbals & Prime Lenses',
    popular: true,
    bgImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'electronics',
    name: 'Electronics & Gaming',
    slug: 'electronics',
    iconName: 'Laptop',
    count: '350+ Items',
    description: 'MacBooks, PS5 Pro, 4K Monitors & VR Kits',
    popular: true,
    bgImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'vehicles',
    name: 'Vehicles & Superbikes',
    slug: 'vehicles',
    iconName: 'Car',
    count: '280+ Items',
    description: 'Mahindra Thar 4x4, Luxury Sedans & Touring Bikes',
    popular: true,
    bgImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'furniture',
    name: 'Furniture & Workspaces',
    slug: 'furniture',
    iconName: 'Armchair',
    count: '510+ Items',
    description: 'Ergonomic Chairs, Standing Desks & Studio Sofas',
    popular: false,
    bgImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'event-party',
    name: 'Event & Sound Gear',
    slug: 'event-party',
    iconName: 'PartyPopper',
    count: '190+ Items',
    description: 'JBL 1000W PartyBox, Stage Lights & DJ Mixers',
    popular: false,
    bgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tools',
    name: 'Tools & Construction',
    slug: 'tools',
    iconName: 'Wrench',
    count: '230+ Items',
    description: 'Drills, Pressure Washers & Power Generators',
    popular: false,
    bgImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'sports-outdoor',
    name: 'Outdoor & Camping',
    slug: 'sports-outdoor',
    iconName: 'Tent',
    count: '310+ Items',
    description: 'Alpine Tents, Kayaks & Trekking Kits',
    popular: false,
    bgImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'fashion',
    name: 'Designer Attire & Costumes',
    slug: 'fashion',
    iconName: 'Sparkles',
    count: '160+ Items',
    description: 'Wedding Sherwanis, Bridal Lehengas & Tuxedos',
    popular: false,
    bgImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'
  }
];

export const FEATURED_PRODUCTS = [
  {
    id: 'sony-fx3-cinema-camera',
    title: 'Sony Alpha FX3 Cinema Camera + 24-70mm GM II Lens',
    category: 'Cameras & Photography',
    categorySlug: 'cameras',
    vendor: {
      id: 'vendor-1',
      name: 'PixelCraft Rentals',
      city: 'Ahmedabad',
      rating: 4.95,
      reviewsCount: 124,
      verified: true,
      badge: 'Super Vendor',
      phone: '+91 98250 12345',
      address: 'Near SG Highway, Bodakdev, Ahmedabad',
      logo: 'https://ui-avatars.com/api/?name=Rentora+Store&background=1D3557&color=ffffff&bold=true',
      totalRentals: '1,450+',
      responseRate: '99%'
    },
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 299,
    pricePerDay: 1899,
    pricePerWeek: 9499,
    pricePerMonth: 28999,
    pricePerYear: 280000,
    deposit: 3000,
    availableNow: true,
    instantBooking: true,
    rating: 4.95,
    reviews: 88,
    condition: 'Mint (Inspected 2 days ago)',
    shortDescription: 'Flagship full-frame cinema camera with 4K 120fps recording, dual base ISO 800/12800, active cooling fan, and XLR top audio handle for commercial film shoots.',
    fullDescription: 'The Sony FX3 Cinema Line full-frame camera combines the high sensitivity and wide dynamic range of a cine sensor with a compact handheld form factor. Ideal for high-end wedding cinematography, brand commercials, music videos, and indie films. Equipped with high-speed phase-detection AF, in-body image stabilization (Active Mode), and 16-bit RAW output.',
    features: ['4K 120FPS 10-Bit 4:2:2', 'Dual Base ISO (800 / 12800)', 'Dual XLR Audio Top Handle', 'S-Cinetone Color Science', 'Active Cooling Fan for Non-stop Recording'],
    specifications: [
      { label: 'Sensor', value: '12.1MP Full-Frame Exmor R BSI CMOS' },
      { label: 'Video Resolution', value: '4K UHD up to 120fps, FHD 240fps' },
      { label: 'Lens Mount', value: 'Sony E-Mount' },
      { label: 'Color Profiles', value: 'S-Cinetone, S-Log3, HLG' },
      { label: 'Media Slots', value: 'Dual CFexpress Type A / SD UHS-II' },
      { label: 'Weight', value: '715g (Body only with battery)' }
    ],
    includedItems: [
      'Sony FX3 Camera Body',
      'Sony FE 24-70mm f/2.8 GM II Lens',
      'Detachable XLR Top Audio Handle',
      '3x Sony NP-FZ100 Batteries + Dual Charger',
      '2x 160GB CFexpress Type A Cards + Card Reader',
      'Pelican Waterproof Hard Travel Case',
      'Peak Design Heavy Duty Strap'
    ],
    terms: 'Valid Govt Photo ID and address verification required. Zero deposit applicable for KYC verified Rentora Prime members. Return item in the provided pelican hard case.'
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Discover Products',
    description: 'Browse thousands of verified products across 20+ categories from top local vendors and stores.',
    iconName: 'Search',
    color: '#1D3557'
  },
  {
    step: '02',
    title: 'Choose Rental Dates',
    description: 'Select your preferred hourly, daily, weekly, or monthly rental duration with transparent pricing.',
    iconName: 'CalendarCheck2',
    color: '#457B9D'
  },
  {
    step: '03',
    title: 'Reserve & Pay Securely',
    description: 'Book instantly with zero-stress deposit options and instant digital rental agreement generation.',
    iconName: 'ShieldCheck',
    color: '#E63946'
  },
  {
    step: '04',
    title: 'Enjoy & Easy Return',
    description: 'Get doorstep delivery or pickup. After your rental period, enjoy hassle-free return and refund.',
    iconName: 'RotateCcw',
    color: '#A8DADC'
  }
];

export const TRUST_STATS = [
  { value: '50,000+', label: 'Successful Rentals' },
  { value: '1,200+', label: 'Verified Vendors' },
  { value: '99.4%', label: 'Positive Customer Rating' },
  { value: '₹0 Fee', label: 'On Cancellation (24h before)' }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Aarav Patel',
    role: 'Cinematographer & Filmmaker',
    city: 'Ahmedabad',
    avatar: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=1D3557&color=ffffff&bold=true',
    comment: 'Rentora made renting Sony Cinema equipment for my 3-day commercial shoot effortless. The gear was calibrated, delivered on time, and deposit was refunded in 2 hours!',
    rating: 5,
    rentedItem: 'Sony FX3 + Cine Prime Kit'
  },
  {
    id: 2,
    name: 'Pooja Shah',
    role: 'Event Designer',
    city: 'Surat',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    comment: 'Managing decor and sound equipment across multiple weddings used to be a logistics headache. Rentora connects us with top vendors with guaranteed availability.',
    rating: 5,
    rentedItem: 'JBL 1000W Sound & Ambient Lights'
  },
  {
    id: 3,
    name: 'Kunal Mehta',
    role: 'Tech Consultant & Traveler',
    city: 'Vadodara',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    comment: 'Rented a Thar 4x4 for our Rann of Kutch road trip. Zero paperwork friction, vehicle was in mint condition, and customer support was responsive 24/7.',
    rating: 5,
    rentedItem: 'Mahindra Thar 4x4 Expedition'
  }
];
