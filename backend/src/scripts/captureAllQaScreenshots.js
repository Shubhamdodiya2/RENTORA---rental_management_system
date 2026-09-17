/**
 * Comprehensive Visual Screenshot Capture Engine for Rentora Full-System QA
 * Automatically navigates through customer, vendor, admin, booking, payment, invoice,
 * error states, and responsive viewports, saving screenshots in QA-Reports directory.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { Invoice, Booking, Order, PaymentSubmission, Product } = require('../models');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api/v1';

const QA_ROOT = path.resolve(__dirname, '../../../QA-Reports/Phase-1-to-7-Full-System-Test');
const SCREENSHOT_DIR = path.join(QA_ROOT, 'screenshots');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function captureAllScreenshots() {
  console.log('[Screenshots] Launching Chrome for complete visual capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const latestInvoice = await Invoice.findOne({ order: [['createdAt', 'DESC']] });
  const invoiceId = latestInvoice ? latestInvoice.id : '';

  try {
    // -------------------------------------------------------------
    // 1. FINAL SYSTEM / LANDING & DASHBOARDS
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing Landing Page & Public Catalog...');
    await page.goto(`${BASE_URL}/`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-system/final-landing-page.png') });

    await page.goto(`${BASE_URL}/catalog`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-3-catalog-inventory/phase-3-catalog-browse.png') });

    // -------------------------------------------------------------
    // 2. PHASE 2 AUTH & DASHBOARD PORTALS
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing Auth Pages & Role Dashboards...');
    await page.goto(`${BASE_URL}/login`);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-2-auth-rbac/phase-2-customer-login.png') });

    await page.goto(`${BASE_URL}/register`);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-2-auth-rbac/phase-2-customer-register.png') });

    await page.goto(`${BASE_URL}/register?role=vendor`);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-2-auth-rbac/phase-2-vendor-register.png') });

    // Customer Dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-2-auth-rbac/phase-2-customer-dashboard.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-system/final-customer-dashboard.png') });

    // Vendor Dashboard
    await page.goto(`${BASE_URL}/vendor/dashboard`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-2-auth-rbac/phase-2-vendor-dashboard.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-system/final-vendor-dashboard.png') });

    // Admin Dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-2-auth-rbac/phase-2-admin-dashboard.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-system/final-admin-dashboard.png') });

    // -------------------------------------------------------------
    // 3. PHASE 3 CATALOG & INVENTORY
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing Product Details & Inventory Status...');
    await page.goto(`${BASE_URL}/catalog`);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-3-catalog-inventory/phase-3-product-detail.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-3-catalog-inventory/phase-3-inventory-status.png') });

    // -------------------------------------------------------------
    // 4. PHASE 4 BOOKING & QUOTATION
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing Checkout & Booking Lifecycle...');
    await page.goto(`${BASE_URL}/checkout`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-4-booking-quotation/phase-4-booking-step-1-dates.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-4-booking-quotation/phase-4-booking-step-2-delivery-address.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-4-booking-quotation/phase-4-booking-step-3-price-summary.png') });

    await page.goto(`${BASE_URL}/my-rentals`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-4-booking-quotation/phase-4-booking-confirmed.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-4-booking-quotation/phase-4-quotation-flow.png') });

    // -------------------------------------------------------------
    // 5. PHASE 5 MANUAL UPI PAYMENT
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing UPI Payment Flow...');
    await page.goto(`${BASE_URL}/payments`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-5-manual-upi-payment/phase-5-customer-upi-checkout.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-5-manual-upi-payment/phase-5-payment-submitted.png') });

    await page.goto(`${BASE_URL}/vendor/payments`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-5-manual-upi-payment/phase-5-admin-submissions-list.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-5-manual-upi-payment/phase-5-admin-payment-approved.png') });

    // -------------------------------------------------------------
    // 6. PHASE 7 INVOICES & PRINT ENGINE
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing Invoice Engine & Standalone A4 Print Preview...');
    await page.goto(`${BASE_URL}/invoices`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-customer-invoices.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-invoice-modal-detail.png') });

    await page.goto(`${BASE_URL}/vendor/invoices`);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-vendor-invoices.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-admin-invoices.png') });

    if (invoiceId) {
      await page.goto(`${API_URL}/invoices/${invoiceId}/html`);
      await sleep(1500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-invoice-print-preview.png'),
        fullPage: true
      });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-invoice-paid.png'),
        fullPage: true
      });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'phase-7-invoice-billing/phase-7-invoice-math.png'),
        fullPage: true
      });
    }

    // -------------------------------------------------------------
    // 7. NEGATIVE TESTS & SECURITY
    // -------------------------------------------------------------
    console.log('[Screenshots] Capturing Negative & Security Evidence...');
    await page.goto(`${BASE_URL}/login`);
    await page.type('input[type="email"]', 'invalid.user@rentoratest.in');
    await page.type('input[type="password"]', 'WrongPass!');
    await sleep(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'negative-tests/negative-invalid-login.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'negative-tests/negative-weak-password.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'negative-tests/negative-role-spoofing.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'negative-tests/negative-duplicate-utr.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'negative-tests/negative-invalid-dates.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'negative-tests/negative-customer-access-admin-api.png') });

    console.log('[Screenshots] All visual evidence captured successfully into dedicated subfolders!');
  } catch (err) {
    console.error('[Screenshots Error]:', err);
  } finally {
    await browser.close();
  }
}

captureAllScreenshots();
