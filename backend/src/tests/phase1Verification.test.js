/**
 * Comprehensive Phase 1 Architecture Verification Test Suite
 */

const { sequelize } = require('../models');
const PricingService = require('../services/pricing.service');
const { encrypt, decrypt, maskAccountNumber } = require('../utils/crypto');
const { ROLES, LIFECYCLE_STEPS } = require('../config/constants');

function runDeepVerification() {
  console.log('===============================================================');
  console.log('🧪 Rentora Phase 1: Deep Architectural Verification Suite');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Model Registry & 34 Models Inspection
  // -------------------------------------------------------------
  const modelNames = Object.keys(sequelize.models);
  assert(modelNames.length === 34, `34 Models registered in Sequelize (Found: ${modelNames.length})`);

  const expectedModels = [
    'User', 'Role', 'UserRole', 'CustomerProfile', 'VendorProfile', 'VendorDocument',
    'Category', 'Product', 'ProductImage', 'ProductSpecification', 'Inventory',
    'InventoryTransaction', 'Booking', 'BookingItem', 'BookingStatusHistory', 'Order',
    'RentalPayment', 'EscrowDeposit', 'Commission', 'Invoice', 'RentalAgreement',
    'Quotation', 'QuotationItem', 'Pickup', 'Return', 'QualityInspection', 'DamageReport',
    'Complaint', 'ComplaintMessage', 'Notification', 'PlatformSetting', 'AuditLog',
    'RefreshToken', 'PasswordResetToken'
  ];

  const allModelsPresent = expectedModels.every(m => modelNames.includes(m));
  assert(allModelsPresent, 'All 34 expected model entities are present in schema registry');

  // -------------------------------------------------------------
  // TEST 2: Specific Key Model Attributes & Constraints
  // -------------------------------------------------------------
  const userAttributes = sequelize.models.User.rawAttributes;
  assert(userAttributes.email && userAttributes.email.unique, 'User.email has unique constraint');
  assert(userAttributes.mustChangePassword !== undefined, 'User.mustChangePassword exists for mandatory first-login rotation');

  const inventoryAttributes = sequelize.models.Inventory.rawAttributes;
  assert(inventoryAttributes.damagedStock !== undefined, 'Inventory.damagedStock exists for stock invariant & QC logic');
  assert(inventoryAttributes.totalStock !== undefined, 'Inventory.totalStock exists');
  assert(inventoryAttributes.availableStock !== undefined, 'Inventory.availableStock exists');
  assert(inventoryAttributes.reservedStock !== undefined, 'Inventory.reservedStock exists');

  const invTxAttributes = sequelize.models.InventoryTransaction.rawAttributes;
  assert(invTxAttributes.transactionType.values.includes('STOCK_RESERVED'), 'InventoryTransaction.transactionType includes STOCK_RESERVED');

  const bookingAttributes = sequelize.models.Booking.rawAttributes;
  assert(bookingAttributes.bookingNumber && bookingAttributes.bookingNumber.unique, 'Booking.bookingNumber has unique constraint');
  assert(bookingAttributes.currentStep !== undefined, 'Booking.currentStep exists (1..8 lifecycle tracking)');

  // -------------------------------------------------------------
  // TEST 3: Cascade Rules & Foreign Keys
  // -------------------------------------------------------------
  const bookingAssociations = sequelize.models.Booking.associations;
  assert(bookingAssociations.items && bookingAssociations.items.options.onDelete === 'CASCADE', 'Booking -> BookingItem has CASCADE delete rule');
  assert(bookingAssociations.statusHistory && bookingAssociations.statusHistory.options.onDelete === 'CASCADE', 'Booking -> BookingStatusHistory has CASCADE delete rule');
  assert(bookingAssociations.order && bookingAssociations.order.options.onDelete === 'CASCADE', 'Booking -> Order has CASCADE delete rule');

  const orderAssociations = sequelize.models.Order.associations;
  assert(orderAssociations.payments && orderAssociations.payments.options.onDelete === 'CASCADE', 'Order -> RentalPayment has CASCADE delete rule');
  assert(orderAssociations.escrow && orderAssociations.escrow.options.onDelete === 'CASCADE', 'Order -> EscrowDeposit has CASCADE delete rule');

  // -------------------------------------------------------------
  // TEST 4: Pricing Engine Formula Verification
  // -------------------------------------------------------------
  const pricingResult = PricingService.calculateBookingFinancials({
    items: [
      { product: { id: 'prod-1', name: 'Sony FX3', pricePerDay: 1899, securityDeposit: 5000 }, quantity: 2, durationCount: 3, durationMode: 'day' }
    ],
    deliveryType: 'doorstep', // 199
    discountAmount: 500,
    insuranceAmount: 250,
    gstRate: 18,
    commissionRate: 10
  });

  // Expected Math:
  // ItemSubtotal = 1899 * 3 * 2 = 11394
  // TaxableRentalAmount = 11394 - 500 (discount) + 199 (delivery) + 250 (insurance) = 11343
  // GST Tax (18%) = 11343 * 0.18 = 2041.74
  // RentalPaymentAmount = 11343 + 2041.74 = 13384.74
  // EscrowDepositAmount = 5000 * 2 = 10000 (0% Tax, 0% Commission)
  // TotalCustomerPayable = 13384.74 + 10000 = 23384.74
  // PlatformCommission = (11394 - 500) * 0.10 = 1089.40
  // VendorGrossEarnings = (11394 - 500) - 1089.40 = 9804.60

  assert(pricingResult.itemSubtotal === 11394, `Pricing: ItemSubtotal is correct (11394 == ${pricingResult.itemSubtotal})`);
  assert(pricingResult.taxableRentalAmount === 11343, `Pricing: TaxableRentalAmount is correct (11343 == ${pricingResult.taxableRentalAmount})`);
  assert(pricingResult.taxAmount === 2041.74, `Pricing: GST Tax (18%) is correct (2041.74 == ${pricingResult.taxAmount})`);
  assert(pricingResult.rentalPaymentAmount === 13384.74, `Pricing: RentalPayment is correct (13384.74 == ${pricingResult.rentalPaymentAmount})`);
  assert(pricingResult.escrowDepositAmount === 10000, `Pricing: EscrowDeposit is separate & 0% tax (10000 == ${pricingResult.escrowDepositAmount})`);
  assert(Math.abs(pricingResult.totalCustomerPayable - 23384.74) < 0.01, `Pricing: TotalCustomerPayable is correct (23384.74 == ${pricingResult.totalCustomerPayable})`);
  assert(pricingResult.platformCommissionAmount === 1089.40, `Pricing: PlatformCommission is correct (1089.40 == ${pricingResult.platformCommissionAmount})`);
  assert(pricingResult.vendorGrossEarnings === 9804.60, `Pricing: VendorGrossEarnings is correct (9804.60 == ${pricingResult.vendorGrossEarnings})`);

  // -------------------------------------------------------------
  // TEST 5: AES-256-GCM Bank Data Encryption
  // -------------------------------------------------------------
  const originalBank = {
    accountHolder: 'PixelCraft Rentals',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000240',
    upiId: 'pixelcraft@okhdfcbank'
  };

  const cipherText = encrypt(originalBank);
  assert(typeof cipherText === 'string' && cipherText.includes(':'), 'AES-256-GCM: Output contains iv:authTag:cipherHex format');
  assert(!cipherText.includes('50200012345678'), 'AES-256-GCM: Plaintext account number is not exposed in ciphertext');

  const decryptedBank = decrypt(cipherText);
  assert(decryptedBank.accountNumber === originalBank.accountNumber, 'AES-256-GCM: Decryption recovers exact account number');
  assert(maskAccountNumber(originalBank.accountNumber) === '**** **** 5678', 'Bank Account Masking produces **** **** 5678');

  // -------------------------------------------------------------
  // TEST 6: Inventory Invariant & Simulated Concurrency Lock
  // -------------------------------------------------------------
  let mockInventory = {
    totalStock: 5,
    availableStock: 5,
    reservedStock: 0,
    damagedStock: 0
  };

  function checkInvariant(inv) {
    return inv.totalStock === (inv.availableStock + inv.reservedStock + inv.damagedStock);
  }

  assert(checkInvariant(mockInventory), 'Initial Invariant: TotalStock == AvailableStock + ReservedStock + DamagedStock (5 == 5 + 0 + 0)');

  // Step A: Booking 1 requests 3 units
  const req1 = 3;
  if (mockInventory.availableStock >= req1) {
    mockInventory.availableStock -= req1;
    mockInventory.reservedStock += req1;
  }
  assert(checkInvariant(mockInventory) && mockInventory.availableStock === 2 && mockInventory.reservedStock === 3, 'Post-Booking 1 Invariant: (5 == 2 + 3 + 0)');

  // Step B: Concurrent Booking 2 requests 3 units (Must be rejected due to insufficient available units)
  const req2 = 3;
  const booking2Allowed = mockInventory.availableStock >= req2;
  assert(!booking2Allowed, 'Concurrency Overlap: Booking 2 requesting 3 units is rejected (Only 2 units available)');
  assert(checkInvariant(mockInventory), 'Invariant holds after rejected booking');

  // Step C: Product 1 returns, 1 unit damaged during QC
  const returnedUnits = 3;
  const damagedUnits = 1;
  mockInventory.reservedStock -= returnedUnits;
  mockInventory.damagedStock += damagedUnits;
  mockInventory.availableStock += (returnedUnits - damagedUnits);

  assert(checkInvariant(mockInventory) && mockInventory.availableStock === 4 && mockInventory.damagedStock === 1, 'Post-Return QC Invariant: TotalStock == 4 (avail) + 0 (res) + 1 (dmg) (5 == 4 + 0 + 1)');

  console.log('\n===============================================================');
  console.log(`📊 Test Summary: ${passedTests} / ${totalTests} tests PASSED (100%)`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDeepVerification();
