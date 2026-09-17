const bcrypt = require('bcryptjs');
const { 
  sequelize, 
  Role, 
  User, 
  UserRole, 
  CustomerProfile, 
  VendorProfile, 
  Category, 
  Product, 
  Inventory,
  PlatformSetting
} = require('../models');
const env = require('../config/env');
const { ROLES } = require('../config/constants');

async function seedDatabase() {
  const t = await sequelize.transaction();

  try {
    console.log('[Seed] Starting database seeding with secure credentials...');

    // 1. Seed Roles
    console.log('[Seed] 1. Seeding Roles...');
    const [customerRole] = await Role.findOrCreate({ where: { name: ROLES.CUSTOMER }, transaction: t });
    const [vendorRole] = await Role.findOrCreate({ where: { name: ROLES.VENDOR }, transaction: t });
    const [adminRole] = await Role.findOrCreate({ where: { name: ROLES.SUPER_ADMIN }, transaction: t });

    // 2. Seed Super Admin User (Secure Password from ENV)
    console.log('[Seed] 2. Seeding Super Admin...');
    const adminPasswordHash = await bcrypt.hash(env.SEED_CONFIG.ADMIN_PASSWORD, 12);
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: env.SEED_CONFIG.ADMIN_EMAIL },
      defaults: {
        fullName: 'Super Admin',
        passwordHash: adminPasswordHash,
        phone: '+91 98765 00001',
        isActive: true,
        isVerified: true,
        mustChangePassword: false
      },
      transaction: t
    });

    if (adminCreated) {
      await UserRole.create({ userId: adminUser.id, roleId: adminRole.id }, { transaction: t });
      console.log(`✅ Super Admin created: ${env.SEED_CONFIG.ADMIN_EMAIL}`);
    }

    // 3. Seed Demo Customer User
    console.log('[Seed] 3. Seeding Demo Customer...');
    const customerPasswordHash = await bcrypt.hash(env.SEED_CONFIG.DEMO_CUSTOMER_PASSWORD, 12);
    const [customerUser, custCreated] = await User.findOrCreate({
      where: { email: 'aarav.creator@rentora.in' },
      defaults: {
        fullName: 'Aarav Patel',
        passwordHash: customerPasswordHash,
        phone: '+91 98251 12345',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        isActive: true,
        isVerified: true,
        mustChangePassword: false
      },
      transaction: t
    });

    if (custCreated) {
      await UserRole.create({ userId: customerUser.id, roleId: customerRole.id }, { transaction: t });
      await CustomerProfile.create({
        userId: customerUser.id,
        address: '402, Shivalik Highstreet, Bodakdev',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        kycStatus: 'Verified',
        kycBadge: 'Rentora Prime Member (Zero-Deposit Eligible)',
        trustScore: 98
      }, { transaction: t });
      console.log('✅ Demo Customer created: aarav.creator@rentora.in');
    }

    // 4. Seed Demo Vendor User
    console.log('[Seed] 4. Seeding Demo Vendor...');
    const vendorPasswordHash = await bcrypt.hash(env.SEED_CONFIG.DEMO_VENDOR_PASSWORD, 12);
    const [vendorUser, vendCreated] = await User.findOrCreate({
      where: { email: 'pixelcraft.owner@rentora.in' },
      defaults: {
        fullName: 'Hardik Shah',
        passwordHash: vendorPasswordHash,
        phone: '+91 98250 12345',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        isActive: true,
        isVerified: true,
        mustChangePassword: false
      },
      transaction: t
    });

    let vendorProfile;
    if (vendCreated) {
      await UserRole.create({ userId: vendorUser.id, roleId: vendorRole.id }, { transaction: t });
      vendorProfile = await VendorProfile.create({
        userId: vendorUser.id,
        businessName: 'PixelCraft Rentals',
        businessCategory: 'Cameras & Photography',
        gstNumber: '24AAACP9988Z1Z2',
        businessEmail: 'contact@pixelcraft.in',
        businessPhone: '+91 98250 12345',
        businessAddress: 'Near SG Highway, Bodakdev',
        city: 'Ahmedabad',
        state: 'Gujarat',
        workingHours: '09:00 AM - 08:00 PM',
        description: 'Gujarat premier cinema camera and prime lens rental house.',
        verificationStatus: 'Approved',
        commissionRate: 10.00,
        approvedBy: adminUser.id,
        approvedAt: new Date()
      }, { transaction: t });

      // Encrypt sample bank account data securely
      vendorProfile.setBankAccount({
        bankName: 'HDFC Bank',
        accountHolder: 'PixelCraft Rentals',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0000240',
        upiId: 'pixelcraft@okhdfcbank'
      });
      await vendorProfile.save({ transaction: t });
      console.log('✅ Demo Vendor created: pixelcraft.owner@rentora.in');
    } else {
      vendorProfile = await VendorProfile.findOne({ where: { userId: vendorUser.id }, transaction: t });
    }

    // 5. Seed 8 Categories
    console.log('[Seed] 5. Seeding Categories...');
    const categoriesData = [
      { id: 'cameras', name: 'Cameras & Photography', slug: 'cameras', iconName: 'Camera', description: 'Cinema Cams, DSLRs, Gimbals & Prime Lenses', bgImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', displayOrder: 1 },
      { id: 'electronics', name: 'Electronics & Gaming', slug: 'electronics', iconName: 'Laptop', description: 'MacBooks, PS5 Pro, 4K Monitors & VR Kits', bgImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', displayOrder: 2 },
      { id: 'vehicles', name: 'Vehicles & Superbikes', slug: 'vehicles', iconName: 'Car', description: 'Mahindra Thar 4x4, Luxury Sedans & Touring Bikes', bgImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', displayOrder: 3 },
      { id: 'furniture', name: 'Furniture & Workspaces', slug: 'furniture', iconName: 'Armchair', description: 'Ergonomic Chairs, Standing Desks & Studio Sofas', bgImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', displayOrder: 4 },
      { id: 'event-party', name: 'Event & Sound Gear', slug: 'event-party', iconName: 'PartyPopper', description: 'JBL 1000W PartyBox, Stage Lights & DJ Mixers', bgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', displayOrder: 5 },
      { id: 'tools', name: 'Tools & Construction', slug: 'tools', iconName: 'Wrench', description: 'Drills, Pressure Washers & Power Generators', bgImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80', displayOrder: 6 },
      { id: 'sports-outdoor', name: 'Outdoor & Camping', slug: 'sports-outdoor', iconName: 'Tent', description: 'Alpine Tents, Kayaks & Trekking Kits', bgImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80', displayOrder: 7 },
      { id: 'fashion', name: 'Designer Attire & Costumes', slug: 'fashion', iconName: 'Sparkles', description: 'Wedding Sherwanis, Bridal Lehengas & Tuxedos', bgImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', displayOrder: 8 }
    ];

    for (const cat of categoriesData) {
      await Category.findOrCreate({
        where: { id: cat.id },
        defaults: cat,
        transaction: t
      });
    }
    console.log('✅ 8 Categories seeded.');

    // 6. Seed Featured Sample Product
    if (vendorProfile) {
      console.log('[Seed] 6. Seeding Sample Product & Inventory...');
      const [product, prodCreated] = await Product.findOrCreate({
        where: { slug: 'sony-fx3-cinema-camera' },
        defaults: {
          vendorId: vendorProfile.id,
          categoryId: 'cameras',
          name: 'Sony Alpha FX3 Cinema Camera + 24-70mm GM II Lens',
          slug: 'sony-fx3-cinema-camera',
          sku: 'SNY-FX3-001',
          brand: 'Sony',
          description: 'Full-frame cinema line camera with 4K 120p, 10-bit 4:2:2 recording, active cooling, and standard G-Master zoom lens.',
          pricePerHour: 300.00,
          pricePerDay: 1899.00,
          pricePerWeek: 9495.00,
          pricePerMonth: 34182.00,
          pricePerYear: 341820.00,
          discountPrice: 1699.00,
          securityDeposit: 5000.00,
          dimensions: '129.7 x 77.8 x 84.5 mm',
          weight: '715g (Body only)',
          tags: ['Sony', 'Cinema', '4K 120fps', 'FX3', 'Full-Frame'],
          status: 'Active',
          approvalStatus: 'Approved',
          isFeatured: true,
          rating: 4.95,
          reviewsCount: 124
        },
        transaction: t
      });

      if (prodCreated) {
        await Inventory.create({
          productId: product.id,
          totalStock: 5,
          availableStock: 5,
          reservedStock: 0,
          damagedStock: 0,
          minStockAlert: 1
        }, { transaction: t });
        console.log('✅ Sony FX3 Product & Inventory seeded.');
      }
    }

    // 7. Seed Platform Settings
    console.log('[Seed] 7. Seeding Platform Settings...');
    const settings = [
      { settingGroup: 'general', settingKey: 'general_config', settingValue: { platformName: 'Rentora', currency: 'INR', timezone: 'Asia/Kolkata' } },
      { settingGroup: 'commission', settingKey: 'commission_rates', settingValue: { defaultRate: 10, cameraRate: 10, vehicleRate: 12, gamingRate: 8 } },
      { settingGroup: 'tax', settingKey: 'tax_gst_config', settingValue: { gstEnabled: true, defaultGSTRate: 18, platformGSTIN: '24AAACR1234F1Z9' } },
      { settingGroup: 'orderPolicy', settingKey: 'order_policies', settingValue: { minRentalDays: 1, maxRentalDays: 90, cancellationGraceHours: 6 } }
    ];

    for (const s of settings) {
      await PlatformSetting.findOrCreate({
        where: { settingKey: s.settingKey },
        defaults: s,
        transaction: t
      });
    }
    console.log('✅ Platform Settings seeded.');

    await t.commit();
    console.log('\n🎉 [Database Seeding Completed Successfully!]');
    process.exit(0);

  } catch (error) {
    await t.rollback();
    console.error('❌ [Database Seeding Failed]:', error);
    process.exit(1);
  }
}

seedDatabase();
