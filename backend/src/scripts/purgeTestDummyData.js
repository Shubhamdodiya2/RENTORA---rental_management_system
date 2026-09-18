const { sequelize, User, Role, CustomerProfile, VendorProfile, Product, Booking, BookingItem, PaymentSubmission, Complaint, ComplaintMessage, AuditLog, RefreshToken, UserRole } = require('../models');
const { Op } = require('sequelize');

async function purgeTestData() {
  console.log('🔄 Starting database cleanup of test script records...');

  try {
    // Find all test users
    const testUsers = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: '%@testrentora.in' } },
          { email: { [Op.like]: '%@rentora-test.in' } },
          { email: { [Op.like]: '%@auditrentora.in' } },
          { email: { [Op.like]: '%@rentoratest.in' } },
          { email: { [Op.like]: 'lockout.%' } },
          { email: { [Op.like]: 'cust.%' } },
          { email: { [Op.like]: 'vendor.%' } }
        ]
      }
    });

    const testUserIds = testUsers.map(u => u.id);
    console.log(`Found ${testUserIds.length} test script users to purge.`);

    if (testUserIds.length > 0) {
      console.log('Purging associated records for test user IDs with FK checks bypassed...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      
      const quotedUserIds = testUserIds.map(id => `'${id}'`).join(',');

      // Delete user dependent rows
      await sequelize.query(`DELETE FROM user_roles WHERE user_id IN (${quotedUserIds});`);
      await sequelize.query(`DELETE FROM customer_profiles WHERE user_id IN (${quotedUserIds});`);
      await sequelize.query(`DELETE FROM refresh_tokens WHERE user_id IN (${quotedUserIds});`);
      await sequelize.query(`DELETE FROM audit_logs WHERE admin_id IN (${quotedUserIds}) OR target_id IN (${quotedUserIds});`);
      
      // Delete test vendor profiles and their products/invoices/bookings
      const testVendors = await sequelize.query(`SELECT id FROM vendor_profiles WHERE user_id IN (${quotedUserIds});`, { type: sequelize.QueryTypes.SELECT });
      if (testVendors.length > 0) {
        const quotedVendorIds = testVendors.map(v => `'${v.id}'`).join(',');
        await sequelize.query(`DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE vendor_id IN (${quotedVendorIds}) OR customer_id IN (${quotedUserIds}));`);
        await sequelize.query(`DELETE FROM payment_submissions WHERE vendor_id IN (${quotedVendorIds}) OR customer_id IN (${quotedUserIds});`);
        await sequelize.query(`DELETE FROM invoices WHERE vendor_id IN (${quotedVendorIds}) OR customer_id IN (${quotedUserIds});`);
        await sequelize.query(`DELETE FROM bookings WHERE vendor_id IN (${quotedVendorIds}) OR customer_id IN (${quotedUserIds});`);
        await sequelize.query(`DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE vendor_id IN (${quotedVendorIds}));`);
        await sequelize.query(`DELETE FROM inventories WHERE product_id IN (SELECT id FROM products WHERE vendor_id IN (${quotedVendorIds}));`);
        await sequelize.query(`DELETE FROM products WHERE vendor_id IN (${quotedVendorIds});`);
        await sequelize.query(`DELETE FROM vendor_profiles WHERE id IN (${quotedVendorIds});`);
      }

      await sequelize.query(`DELETE FROM complaint_messages WHERE sender_id IN (${quotedUserIds}) OR complaint_id IN (SELECT id FROM complaints WHERE user_id IN (${quotedUserIds}));`);
      await sequelize.query(`DELETE FROM complaints WHERE user_id IN (${quotedUserIds});`);
      await sequelize.query(`DELETE FROM users WHERE id IN (${quotedUserIds});`);

      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('✅ Successfully purged all test accounts and orphaned records!');
    }

    // List remaining clean accounts
    const remainingUsers = await User.findAll({
      include: [
        { model: Role, as: 'roles' },
        { model: CustomerProfile, as: 'customerProfile' },
        { model: VendorProfile, as: 'vendorProfile' }
      ]
    });

    console.log(`\n🎉 REMAINING REAL USERS IN DATABASE (${remainingUsers.length} total):`);
    remainingUsers.forEach(u => {
      console.log(`- ${u.fullName} (${u.email}) [${u.roles.map(r => r.name).join(', ')}] ${u.vendorProfile ? `| Store: ${u.vendorProfile.businessName}` : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error purging test data:', error);
    process.exit(1);
  }
}

purgeTestData();
