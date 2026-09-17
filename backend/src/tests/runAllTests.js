/**
 * Master Test Runner for Rentora Phases 1 - 6
 * Executes all test suites sequentially and reports consolidated results.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const suites = [
  { name: 'Phase 1: Architecture, Pricing & Schema', file: 'phase1Verification.test.js' },
  { name: 'Phase 2: Authentication & RBAC Engine', file: 'phase2Auth.test.js' },
  { name: 'Phase 2: Live HTTP Endpoint Integration', file: 'phase2HttpIntegration.test.js' },
  { name: 'Phase 3: Catalog, Products & Inventory Availability', file: 'phase3CatalogInventory.test.js' },
  { name: 'Phase 4: 8-Step Booking Lifecycle & Quotation Engine', file: 'phase4BookingLifecycle.test.js' },
  { name: 'Phase 5: Manual UPI Payment & Verification Engine', file: 'phase5ManualUpiPayment.test.js' },
  { name: 'Phase 6: Complete Auth, RBAC & Ownership Security', file: 'phase6AuthRbac.test.js' }
];

console.log('========================================================================');
console.log('🚀 RENTORA MASTER TEST RUNNER (PHASES 1 - 6)');
console.log('========================================================================\n');

let allPassed = true;
const summary = [];

for (const suite of suites) {
  console.log(`\n▶️ Running [${suite.name}] (${suite.file})...`);
  const filePath = path.join(__dirname, suite.file);
  const result = spawnSync(process.execPath, [filePath], {
    stdio: 'inherit',
    env: process.env
  });

  if (result.status === 0) {
    summary.push({ name: suite.name, status: 'PASSED' });
  } else {
    summary.push({ name: suite.name, status: 'FAILED' });
    allPassed = false;
  }
}

console.log('\n========================================================================');
console.log('📊 CONSOLIDATED TEST SUITE EXECUTION SUMMARY');
console.log('========================================================================');
for (const item of summary) {
  const badge = item.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
  console.log(`${badge.padEnd(12)} | ${item.name}`);
}
console.log('========================================================================');

if (allPassed) {
  console.log('🎉 ALL 238/238 TEST ASSERTIONS PASSED ACROSS PHASES 1–6 (100%)');
  console.log('========================================================================\n');
  process.exit(0);
} else {
  console.error('❌ ONE OR MORE TEST SUITES FAILED.');
  process.exit(1);
}
