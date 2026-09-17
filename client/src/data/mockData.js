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
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
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
  },
  {
    id: 'dji-inspire-3-drone',
    title: 'DJI Inspire 3 Drone with Zenmuse X9-8K Air Cinema Kit',
    category: 'Cameras & Photography',
    categorySlug: 'cameras',
    vendor: {
      id: 'vendor-2',
      name: 'SkyHigh Aerial Solutions',
      city: 'Gandhinagar',
      rating: 4.88,
      reviewsCount: 96,
      verified: true,
      badge: 'Pro Host',
      phone: '+91 97240 56789',
      address: 'Infocity Area, Gandhinagar',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      totalRentals: '920+',
      responseRate: '98%'
    },
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 599,
    pricePerDay: 3499,
    pricePerWeek: 16999,
    pricePerMonth: 48999,
    pricePerYear: 450000,
    deposit: 5000,
    availableNow: true,
    instantBooking: false,
    rating: 4.9,
    reviews: 42,
    condition: 'Excellent / Calibrated',
    shortDescription: 'Full-frame 8K cinema drone with dual-operator control, centimeter-level RTK positioning, and dual-native ISO for professional aerial cinematography.',
    fullDescription: 'DJI Inspire 3 represents the pinnacle of aerial cinematography with its 8K RAW video recording, dual-native ISO, and omnidirectional obstacle sensing. Includes dual DJI RC Plus controllers allowing separate pilot and camera operator control.',
    features: ['8K 75fps ProRes RAW & CinemaDNG', 'Full-Frame Zenmuse X9-8K Air Gimbal', 'Dual Pilot Remote Controls (Master/Slave)', 'Centimeter-Level RTK Antenna Positioning'],
    specifications: [
      { label: 'Camera Sensor', value: '35mm Full-Frame CMOS' },
      { label: 'Max Flight Time', value: 'Approx 28 minutes per battery pair' },
      { label: 'Transmission', value: 'DJI O3 Pro (Up to 15km range)' },
      { label: 'Max Speed', value: '94 km/h (58 mph)' }
    ],
    includedItems: [
      'Inspire 3 Aircraft Body',
      'Zenmuse X9-8K Air Gimbal Camera + DL 24mm F2.8 Lens',
      '2x DJI RC Plus Dual Controllers',
      '6x TB51 Intelligent Flight Batteries + Charging Hub',
      '1TB DJI PROSSD + USB-C High-Speed Reader',
      'Heavy Duty Wheeled Hard Case'
    ],
    terms: 'Renter must possess DGCA drone pilot certificate or book with our verified certified pilot operator. Insurance covers electronic and flyaway protections.'
  },
  {
    id: 'playstation-5-pro-bundle',
    title: 'PlayStation 5 Pro Console + 2 DualSense + 5 Top Titles',
    category: 'Electronics & Gaming',
    categorySlug: 'electronics',
    vendor: {
      id: 'vendor-3',
      name: 'GameZone Arena Store',
      city: 'Surat',
      rating: 4.9,
      reviewsCount: 310,
      verified: true,
      badge: 'Super Vendor',
      phone: '+91 99090 33445',
      address: 'Ghod Dod Road, Surat',
      logo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      totalRentals: '3,800+',
      responseRate: '100%'
    },
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 99,
    pricePerDay: 499,
    pricePerWeek: 2299,
    pricePerMonth: 6499,
    pricePerYear: 60000,
    deposit: 1500,
    availableNow: true,
    instantBooking: true,
    rating: 4.88,
    reviews: 154,
    condition: 'Mint / Sanitized',
    shortDescription: 'Latest PS5 Pro gaming console with 2TB high-speed SSD, PlayStation Spectral Super Resolution (PSSR), 2 wireless controllers, and 5 pre-installed AAA games.',
    fullDescription: 'Experience bleeding-edge console gaming with PS5 Pro featuring enhanced ray-tracing, AI-driven 4K upscaling at steady 60-120 FPS, and ultra-fast loading. Comes bundled with Marvel Spider-Man 2, EA Sports FC 24, God of War Ragnarok, GTA V, and Mortal Kombat 1.',
    features: ['2TB Ultra-Fast NVMe SSD', 'PSSR 4K 60-120FPS AI Upscaling', '2x DualSense Wireless Haptic Controllers', '5 Blockbuster Games Included'],
    specifications: [
      { label: 'Storage', value: '2TB Custom High-Speed NVMe SSD' },
      { label: 'GPU Power', value: 'Advanced RDNA architecture (16.7 TFLOPs)' },
      { label: 'Audio', value: 'Tempest 3D AudioTech' },
      { label: 'Ports', value: 'HDMI 2.1, USB-C 3.2 Gen 2, Gigabit LAN' }
    ],
    includedItems: [
      'PlayStation 5 Pro Console',
      '2x DualSense Wireless Controllers + Charging Dock',
      'Ultra High Speed HDMI 2.1 Cable (4K 120Hz)',
      'AC Power Cord & USB-C Cables',
      'Padded Travel Carry Bag'
    ],
    terms: 'Device is sealed with tamper-proof security tags. Console reset upon return to protect renter personal data.'
  },
  {
    id: 'mahindra-thar-4x4-expedition',
    title: 'Mahindra Thar 4x4 Hardtop Expedition Ready Self-Drive',
    category: 'Vehicles & Superbikes',
    categorySlug: 'vehicles',
    vendor: {
      id: 'vendor-4',
      name: 'RoveWheels Self-Drive',
      city: 'Ahmedabad',
      rating: 4.92,
      reviewsCount: 180,
      verified: true,
      badge: 'Top Rated',
      phone: '+91 98980 77889',
      address: 'Near Airport Road & SG Highway, Ahmedabad',
      logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      totalRentals: '2,100+',
      responseRate: '99%'
    },
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 350,
    pricePerDay: 2899,
    pricePerWeek: 15499,
    pricePerMonth: 44999,
    pricePerYear: 450000,
    deposit: 5000,
    availableNow: true,
    instantBooking: true,
    rating: 4.92,
    reviews: 97,
    condition: 'Flawless / Full Service',
    shortDescription: 'Tough 4WD all-terrain SUV with automatic transmission, convertible hardtop, off-road all-terrain tyres, roof carrier rack, and unlimited kilometers option.',
    fullDescription: 'Conquer the Rann of Kutch, Gir, or desert landscapes with the rugged Mahindra Thar 4x4 Automatic. Features high ground clearance (226mm), mechanical locking differential, Apple CarPlay touchscreen infotainment, and comprehensive commercial self-drive insurance.',
    features: ['2.2L mHawk Diesel Turbo Engine', '6-Speed Torque Converter Automatic', 'Manual Shift-on-the-fly 4WD with Low Range', 'Roof Carrier Rack & Aux LED Lightbar'],
    specifications: [
      { label: 'Transmission', value: 'Automatic (6-Speed)' },
      { label: 'Fuel Type', value: 'Diesel (Avg. 13-15 km/l)' },
      { label: 'Seating Capacity', value: '4 Passengers (Front + Rear)' },
      { label: 'Drivetrain', value: '4x4 High / Low Differential' }
    ],
    includedItems: [
      'Mahindra Thar 4x4 Vehicle with Valid Fastag',
      'All Gujarat & All India Commercial Permit & Road Tax Paid',
      'Emergency Tool Kit & Tyre Inflator',
      'Heavy Duty Tow Rope & D-Shackles',
      'First Aid Kit'
    ],
    terms: 'Driver must have valid Driving License (minimum 1-year driving experience). Fuel delivered tank-to-tank. 24/7 Roadside Assistance included.'
  },
  {
    id: 'macbook-pro-16-m3-max',
    title: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
    category: 'Electronics & Gaming',
    categorySlug: 'electronics',
    vendor: {
      id: 'vendor-5',
      name: 'TechLease Enterprise',
      city: 'Vadodara',
      rating: 4.97,
      reviewsCount: 89,
      verified: true,
      badge: 'Super Vendor',
      phone: '+91 97120 44556',
      address: 'Alkapuri, Vadodara',
      logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      totalRentals: '1,100+',
      responseRate: '99%'
    },
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 180,
    pricePerDay: 1499,
    pricePerWeek: 6999,
    pricePerMonth: 18999,
    pricePerYear: 190000,
    deposit: 4000,
    availableNow: true,
    instantBooking: true,
    rating: 4.97,
    reviews: 63,
    condition: 'Brand New Condition',
    shortDescription: 'Workstation powerhouse laptop with M3 Max 14-core CPU, 30-core GPU, 36GB Unified Memory, and Liquid Retina XDR 120Hz ProMotion display.',
    fullDescription: 'Engineered for VFX artists, video editors, machine learning engineers, and software architects. Powers through complex 8K ProRes timelines in DaVinci Resolve and After Effects with 22 hours of battery endurance.',
    features: ['Apple M3 Max 14-Core CPU / 30-Core GPU', '36GB Unified RAM & 1TB NVMe SSD', '16.2" Liquid Retina XDR 1600 nits Screen', 'Up to 22 Hours Battery Life'],
    specifications: [
      { label: 'Display', value: '16.2" Liquid Retina XDR (3456 x 2234)' },
      { label: 'Memory', value: '36GB Unified High-Bandwidth Memory' },
      { label: 'Storage', value: '1TB Ultra-Fast SSD' },
      { label: 'Ports', value: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3' }
    ],
    includedItems: [
      'Apple MacBook Pro 16" Space Black',
      '140W USB-C Fast Power Adapter + MagSafe Cable',
      'Incase Protective Laptop Sleeve',
      'Multi-port USB-C Hub'
    ],
    terms: 'Pre-loaded with clean macOS Sonoma. You can install your own software. Device wiped completely on check-in.'
  },
  {
    id: 'jbl-partybox-1000w-sound',
    title: 'JBL PartyBox 1000W High Power Bluetooth Party Speaker',
    category: 'Event & Sound Gear',
    categorySlug: 'event-party',
    vendor: {
      id: 'vendor-6',
      name: 'BeatVibe Audio Gear',
      city: 'Rajkot',
      rating: 4.89,
      reviewsCount: 140,
      verified: true,
      badge: 'Pro Host',
      phone: '+91 98240 88990',
      address: 'Yagnik Road, Rajkot',
      logo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      totalRentals: '1,800+',
      responseRate: '98%'
    },
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 150,
    pricePerDay: 1199,
    pricePerWeek: 5499,
    pricePerMonth: 14999,
    pricePerYear: 140000,
    deposit: 2000,
    availableNow: true,
    instantBooking: true,
    rating: 4.89,
    reviews: 112,
    condition: 'Excellent / Tested',
    shortDescription: 'Massive 1100W output party loudspeaker with full panel light show effects, DJ LaunchPad, and 2 UHF wireless microphones for house parties and weddings.',
    fullDescription: 'The ultimate party monster loudspeaker delivering mind-blowing JBL Signature Sound. Connect via Bluetooth, USB, or 3.5mm AUX. Built-in DJ pad allows you to play drums, keyboard, and loops on the fly.',
    features: ['1100 Watts Peak RMS Output', 'Full Panel Dynamic LED Light Show', '2x UHF Wireless Microphones Included', 'DJ Launchpad & Instrument/Mic Inputs'],
    specifications: [
      { label: 'Output Power', value: '1100W Max' },
      { label: 'Frequency Response', value: '30Hz - 20kHz' },
      { label: 'Dimensions', value: '39.7 x 39 x 105 cm (Wheeled)' },
      { label: 'Weight', value: '34.7 kg' }
    ],
    includedItems: [
      'JBL PartyBox 1000 Speaker Unit',
      '2x Shure/JBL UHF Wireless Microphones + Batteries',
      'Air Gesture LED Control Wristband',
      'Heavy Duty AC Power Cord & Aux Cable',
      'Rolling Concealed Wheels for Easy Movement'
    ],
    terms: 'Strictly handle with care. Indoor and dry outdoor patio use only.'
  },
  {
    id: 'herman-miller-aeron-workstation',
    title: 'Herman Miller Aeron Ergonomic Chair + Electric Standing Desk',
    category: 'Furniture & Workspaces',
    categorySlug: 'furniture',
    vendor: {
      id: 'vendor-7',
      name: 'WorkSpace Flex Solutions',
      city: 'Ahmedabad',
      rating: 4.85,
      reviewsCount: 52,
      verified: true,
      badge: 'Verified',
      phone: '+91 99790 11223',
      address: 'Prahladnagar, Ahmedabad',
      logo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      totalRentals: '680+',
      responseRate: '97%'
    },
    images: [
      'https://images.unsplash.com/photo-1580481077197-09d3da13f38d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 40,
    pricePerDay: 350,
    pricePerWeek: 1600,
    pricePerMonth: 4200,
    pricePerYear: 40000,
    deposit: 2000,
    availableNow: true,
    instantBooking: false,
    rating: 4.85,
    reviews: 38,
    condition: 'Pristine / Sanitized',
    shortDescription: 'World-renowned ergonomic seating paired with a dual-motor height-adjustable motorized desk (140x70cm) for home office and productivity.',
    fullDescription: 'Say goodbye to back pain with the Herman Miller Aeron Chair (Size B) featuring Pellicle 8Z breathable suspension and PostureFit SL sacral support, accompanied by a motorized electric sit-stand desk.',
    features: ['PostureFit SL Lumbar Spine Support', 'Pellicle 8Z Breathable Mesh (Size B)', 'Dual Motor 70-120cm Electric Lift Desk', 'Free Delivery & Doorstep Assembly'],
    specifications: [
      { label: 'Weight Capacity', value: 'Up to 159 kg' },
      { label: 'Desk Dimension', value: '140 cm x 70 cm Solid Oak Top' },
      { label: 'Desk Memory', value: '4 Height Preset Buttons' }
    ],
    includedItems: [
      'Herman Miller Aeron Ergonomic Chair',
      'Motorized Dual Motor Standing Desk',
      'Cable Management Tray & Power Spike Strip',
      'Anti-Fatigue Floor Mat'
    ],
    terms: 'Free delivery and professional technician setup within Ahmedabad & Gandhinagar municipal limits.'
  },
  {
    id: 'alpine-camping-tent-adventure-kit',
    title: '4-Person Waterproof Alpine Camping Tent + Outdoor Gear Set',
    category: 'Outdoor & Camping',
    categorySlug: 'sports-outdoor',
    vendor: {
      id: 'vendor-8',
      name: 'NomadTrail Adventure Club',
      city: 'Ahmedabad',
      rating: 4.93,
      reviewsCount: 76,
      verified: true,
      badge: 'Top Rated',
      phone: '+91 99240 66778',
      address: 'Vastrapur, Ahmedabad',
      logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      totalRentals: '1,320+',
      responseRate: '100%'
    },
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80'
    ],
    pricePerHour: 60,
    pricePerDay: 599,
    pricePerWeek: 2699,
    pricePerMonth: 6999,
    pricePerYear: 60000,
    deposit: 1000,
    availableNow: true,
    instantBooking: true,
    rating: 4.93,
    reviews: 54,
    condition: 'Inspected & Clean',
    shortDescription: 'Heavy-duty 4-season geodesic camping tent with 4 sleeping bags, portable cooking stove, LED lantern, and trekking backpack.',
    fullDescription: 'Everything you need for an unforgettable weekend under the stars in Polo Forest, Saputara, or Mount Abu. Waterproof 5000mm hydrostatic head material ensures you stay dry in heavy showers.',
    features: ['5000mm Hydrostatic Waterproof Rating', '4x Down Temperature-Rated Sleeping Bags', 'Mini Gas Stove & Aluminum Cookware Set', 'Solar LED Lanterns & Powerbank Included'],
    specifications: [
      { label: 'Capacity', value: '4 Adults comfortably' },
      { label: 'Set Up Time', value: 'Approx 5-7 minutes' },
      { label: 'Total Kit Weight', value: '8.5 kg' }
    ],
    includedItems: [
      'Quechua/Coleman 4-Person Dome Tent with Rainfly',
      '4x Sleeping Bags with Inflatable Pillows',
      'Butane Gas Camping Stove + 2 Gas Cans',
      'Campfire Cookware Pot & Pan Set',
      '2x Rechargable LED Lanterns'
    ],
    terms: 'Return gear dried and cleared of soil. Stove canisters to be handled according to safety guidelines.'
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
