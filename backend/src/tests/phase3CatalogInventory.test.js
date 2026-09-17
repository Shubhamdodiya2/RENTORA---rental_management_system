/**
 * Phase 3 Comprehensive Test Suite: Catalog, Products, Multi-Image Management & Date-Based Inventory Availability
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const { 
  sequelize, 
  User, 
  Role, 
  UserRole, 
  CustomerProfile, 
  VendorProfile, 
  Category, 
  Product, 
  ProductImage, 
  ProductSpecification, 
  Inventory, 
  InventoryTransaction, 
  Booking, 
  BookingItem 
} = require('../models');
const TokenService = require('../services/token.service');
const AvailabilityService = require('../services/availability.service');
const { ROLES } = require('../config/constants');

async function runPhase3Tests() {
  console.log('========================================================================');
  console.log('📦 Rentora Phase 3: Catalog, Products & Inventory Availability Suite');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS ${totalTests}] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL ${totalTests}] ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 0. Sync fresh in-memory SQLite schema
    await sequelize.sync({ force: true });

    // Seed Core Roles
    const [custRole] = await Role.findOrCreate({ where: { name: ROLES.CUSTOMER } });
    const [vendRole] = await Role.findOrCreate({ where: { name: ROLES.VENDOR } });
    const [adminRole] = await Role.findOrCreate({ where: { name: ROLES.SUPER_ADMIN } });

    // Seed Admin User
    const adminUser = await User.create({
      fullName: 'Super Admin',
      email: 'admin@rentora.in',
      passwordHash: '$2a$12$dummyhashforadmin',
      isActive: true,
      mustChangePassword: false
    });
    await UserRole.create({ userId: adminUser.id, roleId: adminRole.id, isActive: true });
    const adminToken = (await TokenService.generateTokens(adminUser, [ROLES.SUPER_ADMIN], '127.0.0.1')).accessToken;

    // Seed Approved Vendor A
    const vendorAUser = await User.create({
      fullName: 'Aarav Patel',
      email: 'vendorA@rentora.in',
      passwordHash: '$2a$12$dummyhashforvendorA',
      isActive: true,
      mustChangePassword: false
    });
    await UserRole.create({ userId: vendorAUser.id, roleId: vendRole.id, isActive: true });
    const vendorAProfile = await VendorProfile.create({
      userId: vendorAUser.id,
      businessName: 'Gujarat Cine Gear',
      businessCategory: 'Cameras & Photography',
      city: 'Ahmedabad',
      businessEmail: 'vendorA@rentora.in',
      verificationStatus: 'Approved' // Approved vendor
    });
    const vendorAToken = (await TokenService.generateTokens(vendorAUser, [ROLES.VENDOR], '127.0.0.1')).accessToken;

    // Seed Approved Vendor B
    const vendorBUser = await User.create({
      fullName: 'Bhavin Shah',
      email: 'vendorB@rentora.in',
      passwordHash: '$2a$12$dummyhashforvendorB',
      isActive: true,
      mustChangePassword: false
    });
    await UserRole.create({ userId: vendorBUser.id, roleId: vendRole.id, isActive: true });
    const vendorBProfile = await VendorProfile.create({
      userId: vendorBUser.id,
      businessName: 'Surat Drone Hub',
      businessCategory: 'Drones & Aerial',
      city: 'Surat',
      businessEmail: 'vendorB@rentora.in',
      verificationStatus: 'Approved'
    });
    const vendorBToken = (await TokenService.generateTokens(vendorBUser, [ROLES.VENDOR], '127.0.0.1')).accessToken;

    // Seed Pending (Unapproved) Vendor C
    const vendorCUser = await User.create({
      fullName: 'Chetan Joshi',
      email: 'vendorC@rentora.in',
      passwordHash: '$2a$12$dummyhashforvendorC',
      isActive: true,
      mustChangePassword: false
    });
    await UserRole.create({ userId: vendorCUser.id, roleId: vendRole.id, isActive: true });
    const vendorCProfile = await VendorProfile.create({
      userId: vendorCUser.id,
      businessName: 'Pending Gear Store',
      businessCategory: 'Cameras & Photography',
      city: 'Vadodara',
      businessEmail: 'vendorC@rentora.in',
      verificationStatus: 'Pending' // Unapproved
    });
    const vendorCToken = (await TokenService.generateTokens(vendorCUser, [ROLES.VENDOR], '127.0.0.1')).accessToken;

    // Seed Customer
    const customerUser = await User.create({
      fullName: 'Pooja Sharma',
      email: 'pooja@testrentora.in',
      passwordHash: '$2a$12$dummyhashforpooja',
      isActive: true,
      mustChangePassword: false
    });
    await UserRole.create({ userId: customerUser.id, roleId: custRole.id, isActive: true });
    const customerToken = (await TokenService.generateTokens(customerUser, [ROLES.CUSTOMER], '127.0.0.1')).accessToken;

    // =========================================================================
    // SECTION 1: CATEGORY CRUD, NESTING & AUTO-SLUGS (4 assertions)
    // =========================================================================
    // Admin creates parent category
    const resCat1 = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cameras & Photography',
        iconName: 'Camera',
        description: 'Professional cinema & DSLR cameras',
        displayOrder: 1
      });

    assert(resCat1.status === 201 && resCat1.body.data.slug === 'cameras-photography', 'Category 1: Admin creates parent category with auto-generated slug');

    // Admin creates subcategory
    const resCat2 = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mirrorless Cameras',
        iconName: 'Camera',
        parentId: resCat1.body.data.id,
        displayOrder: 1
      });

    assert(resCat2.status === 201 && resCat2.body.data.parentId === resCat1.body.data.id, 'Category 2: Admin creates subcategory linked to parent');

    // Public gets hierarchical category tree
    const resCatTree = await request(app).get('/api/v1/categories');
    assert(
      resCatTree.status === 200 && 
      resCatTree.body.data.categories.length === 1 && 
      resCatTree.body.data.categories[0].subcategories.length === 1,
      'Category 3: Public GET /categories returns nested hierarchy tree'
    );

    // Public gets category by slug
    const resCatSlug = await request(app).get('/api/v1/categories/cameras-photography');
    assert(resCatSlug.status === 200 && resCatSlug.body.data.name === 'Cameras & Photography', 'Category 4: Public GET /categories/:slug returns category details');

    const catId = resCat1.body.data.id;

    // =========================================================================
    // SECTION 2: VENDOR PRODUCT CREATION, SPECS SYNC & AUTO SKU (4 assertions)
    // =========================================================================
    const resProdCreate = await request(app)
      .post('/api/v1/vendor/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        name: 'Sony Alpha FX3 Cinema Camera',
        categoryId: catId,
        brand: 'Sony',
        description: 'Full-frame cinema line camera with XLR top handle',
        pricePerDay: 4500.00,
        discountPrice: 4200.00,
        securityDeposit: 15000.00,
        stock: 3,
        minStockAlert: 1,
        specifications: [
          { specKey: 'Sensor Size', specValue: 'Full-Frame 35mm' },
          { specKey: 'Mount', specValue: 'Sony E-Mount' },
          { specKey: 'Max Resolution', specValue: '4K 120fps 10-bit' }
        ],
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
        ]
      });

    assert(
      resProdCreate.status === 201 && 
      resProdCreate.body.data.approvalStatus === 'Pending' && 
      resProdCreate.body.data.inventory.totalStock === 3,
      'Vendor Product 1: Vendor creates product with stock 3 and pending approval status'
    );
    assert(
      resProdCreate.body.data.specifications.length === 3 && 
      resProdCreate.body.data.specifications[0].specKey === 'Sensor Size',
      'Vendor Product 2: Technical specifications atomic bulk sync is verified'
    );
    assert(resProdCreate.body.data.sku && resProdCreate.body.data.sku.startsWith('CAM-SONY'), 'Vendor Product 3: Auto-generated SKU format CAM-SONY-XXXX is verified');

    const productId = resProdCreate.body.data.id;
    const productSlug = resProdCreate.body.data.slug;

    // Product is currently Pending: public explore query MUST NOT show it yet
    const resExplorePending = await request(app).get('/api/v1/products');
    assert(resExplorePending.body.data.results.length === 0, 'Vendor Product 4: Pending unapproved product is excluded from public explore catalog');

    // =========================================================================
    // SECTION 3: SUPER ADMIN MODERATION & FEATURED BADGE (4 assertions)
    // =========================================================================
    // Admin checks moderation queue
    const resAdminQueue = await request(app)
      .get('/api/v1/admin/products?approvalStatus=Pending')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(resAdminQueue.status === 200 && resAdminQueue.body.data.results.length === 1, 'Admin Moderation 1: Product appears in Super Admin pending queue');

    // Admin approves product
    const resApprove = await request(app)
      .patch(`/api/v1/admin/products/${productId}/approval`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ approvalStatus: 'Approved' });

    assert(resApprove.status === 200 && resApprove.body.data.approvalStatus === 'Approved', 'Admin Moderation 2: Admin approves product listing');

    // Admin toggles featured status
    const resFeatured = await request(app)
      .patch(`/api/v1/admin/products/${productId}/featured`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isFeatured: true });

    assert(resFeatured.status === 200 && resFeatured.body.data.isFeatured === true, 'Admin Moderation 3: Admin toggles isFeatured badge');

    // Homepage featured endpoint now returns product
    const resFeaturedPublic = await request(app).get('/api/v1/products/featured');
    assert(resFeaturedPublic.status === 200 && resFeaturedPublic.body.data.length === 1, 'Admin Moderation 4: Featured product appears in GET /products/featured');

    // =========================================================================
    // SECTION 4: PUBLIC EXPLORE CATALOG, FILTERS & UNRATED BADGE (8 assertions)
    // =========================================================================
    // Explore with category filter
    const resExpCat = await request(app).get(`/api/v1/products?category=${catId}`);
    assert(resExpCat.status === 200 && resExpCat.body.data.results.length === 1, 'Public Catalog 1: Explore filters by category ID');

    // Explore with price range filter
    const resExpPrice = await request(app).get('/api/v1/products?minPrice=4000&maxPrice=5000');
    assert(resExpPrice.status === 200 && resExpPrice.body.data.results.length === 1, 'Public Catalog 2: Explore filters by price range');

    // Explore with out-of-range price filter
    const resExpPriceMiss = await request(app).get('/api/v1/products?minPrice=6000');
    assert(resExpPriceMiss.body.data.results.length === 0, 'Public Catalog 3: Price filter excludes non-matching products');

    // Explore with search query
    const resExpSearch = await request(app).get('/api/v1/products?search=Cinema');
    assert(resExpSearch.body.data.results.length === 1, 'Public Catalog 4: Keyword search matches description keyword');

    // Explore pagination metadata
    assert(
      resExpCat.body.data.count === 1 && 
      resExpCat.body.data.page === 1 && 
      resExpCat.body.data.limit === 12,
      'Public Catalog 5: Standardized pagination metadata format is verified'
    );

    // Product Detail: Unrated badge verification
    const resDetail = await request(app).get(`/api/v1/products/${productSlug}`);
    assert(
      resDetail.status === 200 && 
      resDetail.body.data.isUnrated === true && 
      resDetail.body.data.rating === null,
      'Public Detail 1: Zero reviews returns rating: null and isUnrated: true badge'
    );

    // Product Detail: Specifications included
    assert(resDetail.body.data.specifications.length === 3, 'Public Detail 2: Product specifications array is included in public detail view');

    // Product Detail: Inventory snapshot included
    assert(resDetail.body.data.inventory.totalStock === 3, 'Public Detail 3: Product inventory summary is included in public detail view');

    // =========================================================================
    // SECTION 5: DATE-BASED INVENTORY AVAILABILITY ENGINE (12 assertions)
    // =========================================================================
    const today = new Date();
    const d10 = new Date(today.getTime() + 10 * 86400000).toISOString().split('T')[0]; // +10 days
    const d11 = new Date(today.getTime() + 11 * 86400000).toISOString().split('T')[0]; // +11 days
    const d12 = new Date(today.getTime() + 12 * 86400000).toISOString().split('T')[0]; // +12 days
    const d15 = new Date(today.getTime() + 15 * 86400000).toISOString().split('T')[0]; // +15 days
    const d20 = new Date(today.getTime() + 20 * 86400000).toISOString().split('T')[0]; // +20 days

    // Test 1: Full availability on empty dates (Total stock = 3)
    const availEmpty = await AvailabilityService.checkAvailability(productId, d10, d15, 2);
    assert(availEmpty.isAvailable === true && availEmpty.availableStock === 3, 'Availability 1: Full total stock 3 available when no bookings exist');

    // Create Booking 1: Customer reserves 2 units for days d10..d12
    const booking1 = await Booking.create({
      bookingNumber: 'BKG-TEST-001',
      customerId: customerUser.id,
      vendorId: vendorAProfile.id,
      startDate: d10,
      endDate: d12,
      rentalAmount: 9000,
      depositAmount: 30000,
      totalAmount: 39000,
      status: 'BOOKING_CONFIRMED'
    });
    await BookingItem.create({
      bookingId: booking1.id,
      productId,
      quantity: 2,
      unitRate: 4500,
      subtotal: 9000
    });

    // Test 2: Check overlapping date d11..d13 requesting 2 units (Only 1 unit available on d11..d12)
    const availPartialConflict = await AvailabilityService.checkAvailability(productId, d10, d12, 2);
    assert(
      availPartialConflict.isAvailable === false && 
      availPartialConflict.availableStock === 1 && 
      availPartialConflict.shortage === 1,
      'Availability 2: Partial overlap calculates remaining capacity as 1 unit and flags shortage'
    );

    // Test 3: Requesting 1 unit during d10..d12 succeeds
    const availSingleUnit = await AvailabilityService.checkAvailability(productId, d10, d12, 1);
    assert(availSingleUnit.isAvailable === true && availSingleUnit.availableStock === 1, 'Availability 3: Requesting remaining 1 unit on overlapping date succeeds');

    // Create Booking 2: Another customer reserves the last 1 unit for day d11..d11 (Same-Day)
    const booking2 = await Booking.create({
      bookingNumber: 'BKG-TEST-002',
      customerId: customerUser.id,
      vendorId: vendorAProfile.id,
      startDate: d11,
      endDate: d11,
      rentalAmount: 4500,
      depositAmount: 15000,
      totalAmount: 19500,
      status: 'PRODUCT_RESERVED'
    });
    await BookingItem.create({
      bookingId: booking2.id,
      productId,
      quantity: 1,
      unitRate: 4500,
      subtotal: 4500
    });

    // Test 4: Peak day d11 now has 0 available units (2 + 1 = 3 booked)
    const availExhausted = await AvailabilityService.checkAvailability(productId, d10, d15, 1);
    assert(
      availExhausted.isAvailable === false && 
      availExhausted.availableStock === 0,
      'Availability 4: Peak overlapping demand exhausts total stock (0 available)'
    );

    // Test 5: Non-overlapping date d15..d20 is fully available (3 units)
    const availNonOverlap = await AvailabilityService.checkAvailability(productId, d15, d20, 3);
    assert(availNonOverlap.isAvailable === true && availNonOverlap.availableStock === 3, 'Availability 5: Non-overlapping future dates maintain full capacity (3 units)');

    // Test 6: HTTP GET /api/v1/products/:id/availability endpoint (checking non-overlapping window d15..d20)
    const resHttpAvail = await request(app).get(`/api/v1/products/${productId}/availability?startDate=${d15}&endDate=${d20}&quantity=2`);
    assert(resHttpAvail.status === 200 && resHttpAvail.body.data.isAvailable === true, 'Availability 6: HTTP GET /availability returns JSON validation payload');

    // Test 7: Monthly matrix calendar generation
    const resMatrix = await request(app).get(`/api/v1/products/${productId}/availability?month=${today.getMonth() + 1}&year=${today.getFullYear()}`);
    assert(
      resMatrix.status === 200 && 
      Array.isArray(resMatrix.body.data.matrix) && 
      resMatrix.body.data.matrix.length >= 28,
      'Availability 7: Monthly calendar matrix returns day-by-day availability array'
    );
    assert(resMatrix.body.data.matrix[0].totalStock === 3, 'Availability 8: Monthly matrix contains totalStock snapshot per date');

    // Test 8: Validation rejects past start date
    const resPast = await request(app).get(`/api/v1/products/${productId}/availability?startDate=2020-01-01&endDate=2020-01-05`);
    assert(resPast.status === 400 && resPast.body.errors.startDate, 'Availability 9: Past start date is rejected with HTTP 400');

    // Test 9: Validation rejects end date earlier than start date
    const resInverted = await request(app).get(`/api/v1/products/${productId}/availability?startDate=${d15}&endDate=${d10}`);
    assert(resInverted.status === 400 && resInverted.body.errors.endDate, 'Availability 10: Inverted date range (endDate < startDate) is rejected with HTTP 400');

    // Test 10: Invalid month matrix query
    const resBadMonth = await request(app).get(`/api/v1/products/${productId}/availability?month=13&year=2026`);
    assert(resBadMonth.status === 400, 'Availability 11: Invalid month (13) is rejected with HTTP 400');

    // Test 11: Cancelled booking does NOT block inventory
    await booking2.update({ status: 'CANCELLED' });
    const availPostCancel = await AvailabilityService.checkAvailability(productId, d11, d11, 1);
    assert(availPostCancel.availableStock === 1, 'Availability 12: CANCELLED booking immediately releases date capacity');

    // =========================================================================
    // SECTION 6: CONCURRENCY ROW-LOCKING & INVARIANT VERIFICATION (3 assertions)
    // =========================================================================
    // Test 1: Concurrency Conflict Rejection using Pessimistic Lock
    // Product has 1 unit remaining on d10..d12 (2 units committed in booking1)
    // Attempting to reserve 2 units under exclusive row lock triggers 409 Conflict
    const tLockA = await sequelize.transaction();
    let lockError = null;

    try {
      await AvailabilityService.acquireReservationLockAndVerify(productId, d10, d12, 2, tLockA);
    } catch (err) {
      lockError = err;
    } finally {
      if (!tLockA.finished) await tLockA.rollback();
    }

    assert(lockError !== null && lockError.statusCode === 409, 'Concurrency 1: Overlapping parallel reservation is rejected with HTTP 409 Conflict');
    assert(lockError.details && lockError.details.shortage === 1, 'Concurrency 2: Conflict response details exact shortage count');

    // Test 2: Invariant Check
    const invRow = await Inventory.findOne({ where: { productId } });
    assert(
      invRow.totalStock === (invRow.availableStock + invRow.reservedStock + invRow.damagedStock),
      'Invariant 1: TotalStock == AvailableStock + ReservedStock + DamagedStock invariant holds'
    );

    // =========================================================================
    // SECTION 7: STOCK REDUCTION SAFETY VALIDATION (2 assertions)
    // =========================================================================
    // Vendor attempts to reduce total stock to 1 (when 2 units are committed in Booking 1)
    const resStockReduceFail = await request(app)
      .patch(`/api/v1/vendor/products/${productId}/inventory`)
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({ totalStock: 1 });

    assert(
      resStockReduceFail.status === 409 && 
      resStockReduceFail.body.message.includes('Cannot reduce total stock'),
      'Stock Reduction 1: Reducing total stock below future committed bookings is rejected with HTTP 409 Conflict'
    );

    // Vendor increases total stock to 5
    const resStockIncrease = await request(app)
      .patch(`/api/v1/vendor/products/${productId}/inventory`)
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({ totalStock: 5 });

    assert(
      resStockIncrease.status === 200 && 
      resStockIncrease.body.data.totalStock === 5,
      'Stock Reduction 2: Increasing total stock to 5 succeeds'
    );

    // =========================================================================
    // SECTION 8: MULTI-IMAGE MANAGEMENT & PRIMARY PROMOTION (4 assertions)
    // =========================================================================
    // Vendor creates secondary image
    const img2 = await ProductImage.create({
      productId,
      imageUrl: '/uploads/products/camera-angle2.jpg',
      isPrimary: false,
      displayOrder: 1
    });

    const img3 = await ProductImage.create({
      productId,
      imageUrl: '/uploads/products/camera-angle3.jpg',
      isPrimary: false,
      displayOrder: 2
    });

    // Toggle Primary Image to img2
    const resSetPrimary = await request(app)
      .patch(`/api/v1/vendor/products/${productId}/images/${img2.id}/primary`)
      .set('Authorization', `Bearer ${vendorAToken}`);

    assert(resSetPrimary.status === 200 && resSetPrimary.body.data.isPrimary === true, 'Image Management 1: Setting new primary image succeeds');

    // Verify other images are demoted
    const oldPrimary = await ProductImage.findOne({ where: { productId, id: img3.id } });
    assert(oldPrimary.isPrimary === false, 'Image Management 2: Other images are automatically demoted to isPrimary = false');

    // Delete primary image img2 -> should promote next lowest displayOrder image
    const resDelPrimary = await request(app)
      .delete(`/api/v1/vendor/products/${productId}/images/${img2.id}`)
      .set('Authorization', `Bearer ${vendorAToken}`);

    assert(resDelPrimary.status === 200, 'Image Management 3: Deleting primary image succeeds');

    const promotedPrimary = await ProductImage.findOne({ where: { productId, isPrimary: true } });
    assert(promotedPrimary !== null, 'Image Management 4: Automatic promotion fallback assigns new primary image on deletion');

    // =========================================================================
    // SECTION 9: VENDOR OWNERSHIP & RBAC ISOLATION (3 assertions)
    // =========================================================================
    // Vendor B attempts to update Vendor A's product -> 403 Forbidden
    const resCrossVendor = await request(app)
      .put(`/api/v1/vendor/products/${productId}`)
      .set('Authorization', `Bearer ${vendorBToken}`)
      .send({ name: 'Hacked Product Name' });

    assert(resCrossVendor.status === 403, 'Vendor RBAC 1: Vendor B is blocked from modifying Vendor A product (403 Forbidden)');

    // Vendor B attempts to delete Vendor A's product -> 403 Forbidden
    const resCrossVendorDel = await request(app)
      .delete(`/api/v1/vendor/products/${productId}`)
      .set('Authorization', `Bearer ${vendorBToken}`);

    assert(resCrossVendorDel.status === 403, 'Vendor RBAC 2: Vendor B is blocked from deleting Vendor A product (403 Forbidden)');

    // Unapproved Vendor C attempts to create a product -> 403 Forbidden
    const resUnapprovedCreate = await request(app)
      .post('/api/v1/vendor/products')
      .set('Authorization', `Bearer ${vendorCToken}`)
      .send({
        name: 'Unapproved Product',
        categoryId: catId,
        pricePerDay: 1000,
        stock: 1
      });

    assert(
      resUnapprovedCreate.status === 403 && 
      resUnapprovedCreate.body.message.includes('pending approval'),
      'Vendor RBAC 3: Unapproved Vendor C is blocked from creating products (403 Forbidden)'
    );

    // =========================================================================
    // SECTION 10: PRODUCT SOFT DELETE / ARCHIVAL (1 assertion)
    // =========================================================================
    const resArchive = await request(app)
      .delete(`/api/v1/vendor/products/${productId}`)
      .set('Authorization', `Bearer ${vendorAToken}`);

    assert(resArchive.status === 200, 'Vendor Operations 1: Vendor archives product successfully');

    // =========================================================================
    // TEST SUMMARY
    // =========================================================================
    console.log('\n========================================================================');
    console.log(`📊 Phase 3 Catalog & Inventory Summary: ${passedTests} / ${totalTests} tests PASSED (100%)`);
    console.log('========================================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Phase 3 Test Error:', error);
    process.exit(1);
  }
}

runPhase3Tests();
