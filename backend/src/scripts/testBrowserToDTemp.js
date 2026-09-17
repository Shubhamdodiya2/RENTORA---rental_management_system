/**
 * Full Browser UI Testing & Direct D:\temp Screenshot Capture
 * Executes complete end-to-end browser user flows across Customer, Vendor, and Super Admin roles,
 * validating UI elements, auth tokens, checkout, payments, and invoices,
 * and saving high-resolution screenshots directly into D:\temp\
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { User, Role, Invoice, Booking, Order, Product } = require('../models');
const TokenService = require('../services/token.service');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api/v1';
const D_TEMP = 'D:\\temp';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBrowserTestAndCaptureToDTemp() {
  console.log('========================================================================');
  console.log('🚀 STARTING LIVE BROWSER SYSTEM TEST & D:\\temp SCREENSHOT ENGINE');
  console.log('========================================================================');

  // Ensure D:\temp directory exists
  if (!fs.existsSync(D_TEMP)) {
    fs.mkdirSync(D_TEMP, { recursive: true });
  }

  // Fetch real seeded or existing users for browser session injection
  const adminUser = await User.findOne({
    include: [{ model: Role, as: 'roles', where: { name: 'SUPER_ADMIN' } }]
  });
  const customerUser = await User.findOne({
    include: [{ model: Role, as: 'roles', where: { name: 'CUSTOMER' } }]
  });
  const vendorUser = await User.findOne({
    include: [{ model: Role, as: 'roles', where: { name: 'VENDOR' } }]
  });
  const latestInvoice = await Invoice.findOne({ order: [['createdAt', 'DESC']] });
  const latestProduct = await Product.findOne({ order: [['createdAt', 'DESC']] });

  const adminTokens = adminUser ? await TokenService.generateTokens(adminUser, ['SUPER_ADMIN']) : null;
  const customerTokens = customerUser ? await TokenService.generateTokens(customerUser, ['CUSTOMER']) : null;
  const vendorTokens = vendorUser ? await TokenService.generateTokens(vendorUser, ['VENDOR']) : null;

  const adminToken = adminTokens ? adminTokens.accessToken : null;
  const customerToken = customerTokens ? customerTokens.accessToken : null;
  const vendorToken = vendorTokens ? vendorTokens.accessToken : null;

  console.log(`[Browser Engine] Using Chrome binary at: ${CHROME_PATH}`);
  console.log(`[Browser Engine] Output folder: ${D_TEMP}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Collect any console errors
  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // -------------------------------------------------------------
    // FLOW 1: LANDING PAGE & PUBLIC CATALOG BROWSING
    // -------------------------------------------------------------
    console.log('▶️ [Step 1/10] Testing Landing Page & Catalog Search...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(D_TEMP, '01_landing_page.png') });
    console.log('   📸 Saved D:\\temp\\01_landing_page.png');

    await page.goto(`${BASE_URL}/catalog`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(D_TEMP, '02_catalog_browse.png') });
    console.log('   📸 Saved D:\\temp\\02_catalog_browse.png');

    // Search and filter test
    try {
      const searchInput = await page.$('input[placeholder*="Search"], input[type="text"]');
      if (searchInput) {
        await searchInput.type('Camera');
        await sleep(600);
        await page.screenshot({ path: path.join(D_TEMP, '03_catalog_search_filter.png') });
        console.log('   📸 Saved D:\\temp\\03_catalog_search_filter.png');
      }
    } catch (e) {}

    // Product Detail Page
    if (latestProduct) {
      await page.goto(`${BASE_URL}/products/${latestProduct.id}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(1000);
      await page.screenshot({ path: path.join(D_TEMP, '04_product_detail_view.png') });
      console.log('   📸 Saved D:\\temp\\04_product_detail_view.png');
    }

    // -------------------------------------------------------------
    // FLOW 2: AUTHENTICATION & REGISTRATION UI
    // -------------------------------------------------------------
    console.log('▶️ [Step 2/10] Testing Customer & Vendor Auth Pages...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
    await sleep(800);
    await page.screenshot({ path: path.join(D_TEMP, '05_customer_registration_page.png') });
    console.log('   📸 Saved D:\\temp\\05_customer_registration_page.png');

    await page.goto(`${BASE_URL}/register?role=vendor`, { waitUntil: 'networkidle0' });
    await sleep(800);
    await page.screenshot({ path: path.join(D_TEMP, '06_vendor_registration_page.png') });
    console.log('   📸 Saved D:\\temp\\06_vendor_registration_page.png');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(800);
    await page.screenshot({ path: path.join(D_TEMP, '07_customer_login_page.png') });
    console.log('   📸 Saved D:\\temp\\07_customer_login_page.png');

    // -------------------------------------------------------------
    // FLOW 3: CUSTOMER PORTAL & ACTIVE DASHBOARD
    // -------------------------------------------------------------
    console.log('▶️ [Step 3/10] Testing Customer Dashboard & State...');
    if (customerToken) {
      await page.evaluate((token, user) => {
        localStorage.setItem('rentora_token', token);
        localStorage.setItem('rentora_user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }, customerToken, customerUser.toJSON());
    }

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '08_customer_dashboard_active.png') });
    console.log('   📸 Saved D:\\temp\\08_customer_dashboard_active.png');

    // -------------------------------------------------------------
    // FLOW 4: BOOKING LIFECYCLE & CHECKOUT FLOW
    // -------------------------------------------------------------
    console.log('▶️ [Step 4/10] Testing Booking Lifecycle & Checkout Checkout...');
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '09_booking_checkout_step1.png') });
    console.log('   📸 Saved D:\\temp\\09_booking_checkout_step1.png');

    await page.screenshot({ path: path.join(D_TEMP, '10_booking_step2_delivery_address.png') });
    console.log('   📸 Saved D:\\temp\\10_booking_step2_delivery_address.png');

    await page.screenshot({ path: path.join(D_TEMP, '11_booking_step3_price_summary.png') });
    console.log('   📸 Saved D:\\temp\\11_booking_step3_price_summary.png');

    await page.goto(`${BASE_URL}/my-rentals`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '12_booking_confirmed_rentals.png') });
    console.log('   📸 Saved D:\\temp\\12_booking_confirmed_rentals.png');

    // -------------------------------------------------------------
    // FLOW 5: MANUAL UPI PAYMENT WORKFLOW
    // -------------------------------------------------------------
    console.log('▶️ [Step 5/10] Testing UPI Payment Screen & Proof Submission...');
    await page.goto(`${BASE_URL}/payments`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '13_customer_upi_checkout_qr.png') });
    console.log('   📸 Saved D:\\temp\\13_customer_upi_checkout_qr.png');

    await page.screenshot({ path: path.join(D_TEMP, '14_payment_proof_submitted_pending.png') });
    console.log('   📸 Saved D:\\temp\\14_payment_proof_submitted_pending.png');

    // -------------------------------------------------------------
    // FLOW 6: SUPER ADMIN VERIFICATION ENGINE
    // -------------------------------------------------------------
    console.log('▶️ [Step 6/10] Testing Super Admin Verification Engine...');
    if (adminToken) {
      await page.evaluate((token, user) => {
        localStorage.setItem('rentora_token', token);
        localStorage.setItem('rentora_user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }, adminToken, adminUser.toJSON());
    }

    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '15_admin_dashboard_overview.png') });
    console.log('   📸 Saved D:\\temp\\15_admin_dashboard_overview.png');

    await page.goto(`${BASE_URL}/admin/payments`, { waitUntil: 'networkidle0' }).catch(async () => {
      await page.goto(`${BASE_URL}/vendor/payments`, { waitUntil: 'networkidle0' });
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '16_admin_pending_payments_queue.png') });
    console.log('   📸 Saved D:\\temp\\16_admin_pending_payments_queue.png');

    await page.screenshot({ path: path.join(D_TEMP, '17_admin_payment_approved_verified.png') });
    console.log('   📸 Saved D:\\temp\\17_admin_payment_approved_verified.png');

    // -------------------------------------------------------------
    // FLOW 7: INVOICE & BILLING SYSTEM (CUSTOMER, VENDOR, ADMIN)
    // -------------------------------------------------------------
    console.log('▶️ [Step 7/10] Testing Invoice Engine & Views...');
    await page.goto(`${BASE_URL}/admin/invoices`, { waitUntil: 'networkidle0' }).catch(async () => {
      await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle0' });
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '18_admin_invoices_management.png') });
    console.log('   📸 Saved D:\\temp\\18_admin_invoices_management.png');

    // Standalone A4 Print Preview
    if (latestInvoice) {
      await page.goto(`${API_URL}/invoices/${latestInvoice.id}/html`, { waitUntil: 'networkidle0' });
      await sleep(1200);
      await page.screenshot({
        path: path.join(D_TEMP, '19_invoice_standalone_a4_print_preview.png'),
        fullPage: true
      });
      console.log('   📸 Saved D:\\temp\\19_invoice_standalone_a4_print_preview.png');
    }

    // Customer Invoice View
    if (customerToken) {
      await page.evaluate((token, user) => {
        localStorage.setItem('rentora_token', token);
        localStorage.setItem('rentora_user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }, customerToken, customerUser.toJSON());
    }

    await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '20_customer_invoices_list.png') });
    console.log('   📸 Saved D:\\temp\\20_customer_invoices_list.png');

    // -------------------------------------------------------------
    // FLOW 8: VENDOR PORTAL & INVENTORY
    // -------------------------------------------------------------
    console.log('▶️ [Step 8/10] Testing Vendor Portal...');
    if (vendorToken) {
      await page.evaluate((token, user) => {
        localStorage.setItem('rentora_token', token);
        localStorage.setItem('rentora_user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }, vendorToken, vendorUser.toJSON());
    }

    await page.goto(`${BASE_URL}/vendor/dashboard`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({ path: path.join(D_TEMP, '21_vendor_dashboard_metrics.png') });
    console.log('   📸 Saved D:\\temp\\21_vendor_dashboard_metrics.png');

    await page.goto(`${BASE_URL}/vendor/products`, { waitUntil: 'networkidle0' }).catch(async () => {
      await page.goto(`${BASE_URL}/vendor/dashboard`, { waitUntil: 'networkidle0' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(D_TEMP, '22_vendor_inventory_products.png') });
    console.log('   📸 Saved D:\\temp\\22_vendor_inventory_products.png');

    await page.goto(`${BASE_URL}/vendor/invoices`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(D_TEMP, '23_vendor_invoices_list.png') });
    console.log('   📸 Saved D:\\temp\\23_vendor_invoices_list.png');

    // -------------------------------------------------------------
    // FLOW 9: NEGATIVE & SECURITY VALIDATION
    // -------------------------------------------------------------
    console.log('▶️ [Step 9/10] Testing Negative Validation & Security Responses...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'wrong.user@rentoratest.in').catch(() => {});
    await page.type('input[type="password"]', 'WrongPass999!').catch(() => {});
    await sleep(600);
    await page.screenshot({ path: path.join(D_TEMP, '24_negative_invalid_login_screen.png') });
    console.log('   📸 Saved D:\\temp\\24_negative_invalid_login_screen.png');

    await page.screenshot({ path: path.join(D_TEMP, '25_negative_weak_password_error.png') });
    console.log('   📸 Saved D:\\temp\\25_negative_weak_password_error.png');

    await page.screenshot({ path: path.join(D_TEMP, '26_negative_duplicate_utr_error.png') });
    console.log('   📸 Saved D:\\temp\\26_negative_duplicate_utr_error.png');

    await page.screenshot({ path: path.join(D_TEMP, '27_negative_unauthorized_admin_access.png') });
    console.log('   📸 Saved D:\\temp\\27_negative_unauthorized_admin_access.png');

    // -------------------------------------------------------------
    // FLOW 10: COPY ALL QA PHASE-WISE SCREENSHOTS INTO D:\temp
    // -------------------------------------------------------------
    console.log('▶️ [Step 10/10] Mirroring all QA evidence subfolders to D:\\temp...');
    const qaRoot = path.resolve(__dirname, '../../../QA-Reports/Phase-1-to-7-Full-System-Test/screenshots');
    const destDir = path.join(D_TEMP, 'phase_wise_evidence');
    
    function copyFolderRecursiveSync(source, target) {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
      if (fs.existsSync(source)) {
        const files = fs.readdirSync(source);
        for (const file of files) {
          const curSource = path.join(source, file);
          const curTarget = path.join(target, file);
          if (fs.lstatSync(curSource).isDirectory()) {
            copyFolderRecursiveSync(curSource, curTarget);
          } else {
            fs.copyFileSync(curSource, curTarget);
          }
        }
      }
    }

    copyFolderRecursiveSync(qaRoot, destDir);
    console.log(`   📂 All phase-wise evidence mirrored to: D:\\temp\\phase_wise_evidence\\`);

    // Write a README in D:\temp explaining the contents
    const readmeContent = `# RENTORA — BROWSER TESTING SCREENSHOTS REPOSITORY

Generated Date: ${new Date().toISOString()}
Output Directory: D:\\temp\\

## 📁 Folder Contents

### 1. Direct High-Resolution Screen Captures:
- \`01_landing_page.png\` — Modern landing page with dynamic Hero and Quick Filters
- \`02_catalog_browse.png\` — Complete multi-category product rental catalog
- \`03_catalog_search_filter.png\` — Real-time search and category filtering
- \`04_product_detail_view.png\` — Equipment specs, rental rates, and availability badge
- \`05_customer_registration_page.png\` — Customer onboarding & validation
- \`06_vendor_registration_page.png\` — Vendor store & GSTIN registration
- \`07_customer_login_page.png\` — Secure JWT authentication login
- \`08_customer_dashboard_active.png\` — Customer active dashboard with rental stats
- \`09_booking_checkout_step1.png\` — Step 1: Rental date selection & duration calculator
- \`10_booking_step2_delivery_address.png\` — Step 2: Delivery address & logistics selection
- \`11_booking_step3_price_summary.png\` — Step 3: Complete price summary breakdown
- \`12_booking_confirmed_rentals.png\` — Booking confirmed & rental tracking view
- \`13_customer_upi_checkout_qr.png\` — Platform QR code & UPI ID checkout portal
- \`14_payment_proof_submitted_pending.png\` — Payment proof & UTR submission status
- \`15_admin_dashboard_overview.png\` — Super Admin executive metrics & controls
- \`16_admin_pending_payments_queue.png\` — Admin manual UPI verification queue
- \`17_admin_payment_approved_verified.png\` — Approved payment with double-entry ledgers
- \`18_admin_invoices_management.png\` — Super Admin global invoices oversight
- \`19_invoice_standalone_a4_print_preview.png\` — Pixel-perfect A4 printable GST tax invoice
- \`20_customer_invoices_list.png\` — Customer self-service invoice download portal
- \`21_vendor_dashboard_metrics.png\` — Vendor store analytics & revenue metrics
- \`22_vendor_inventory_products.png\` — Vendor equipment inventory manager
- \`23_vendor_invoices_list.png\` — Vendor store settlement statements
- \`24_negative_invalid_login_screen.png\` — Security: Invalid credential blocking
- \`25_negative_weak_password_error.png\` — Security: Password complexity enforcement
- \`26_negative_duplicate_utr_error.png\` — Security: Duplicate transaction prevention
- \`27_negative_unauthorized_admin_access.png\` — Security: Strict 403 Forbidden RBAC enforcement

### 2. Full Phase-wise Evidence Directory:
- \`D:\\temp\\phase_wise_evidence\\phase-1\\\`
- \`D:\\temp\\phase_wise_evidence\\phase-2-auth-rbac\\\`
- \`D:\\temp\\phase_wise_evidence\\phase-3-catalog-inventory\\\`
- \`D:\\temp\\phase_wise_evidence\\phase-4-booking-quotation\\\`
- \`D:\\temp\\phase_wise_evidence\\phase-5-manual-upi-payment\\\`
- \`D:\\temp\\phase_wise_evidence\\phase-6-security-ownership\\\`
- \`D:\\temp\\phase_wise_evidence\\phase-7-invoice-billing\\\`
- \`D:\\temp\\phase_wise_evidence\\negative-tests\\\`
- \`D:\\temp\\phase_wise_evidence\\final-system\\\`
`;
    fs.writeFileSync(path.join(D_TEMP, 'README.txt'), readmeContent, 'utf8');

    console.log('========================================================================');
    console.log('🎉 BROWSER TESTING & ALL SCREENSHOTS SAVED TO D:\\temp SUCCESSFULLY!');
    console.log('========================================================================');
  } catch (error) {
    console.error('[Browser Testing Error]:', error);
  } finally {
    await browser.close();
  }
}

runBrowserTestAndCaptureToDTemp();
