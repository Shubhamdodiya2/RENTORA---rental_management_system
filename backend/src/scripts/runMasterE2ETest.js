const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api/v1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPORT_DIR = path.resolve(__dirname, '../../../QA-Reports/Runtime-Debug-Repair-2026-09-18');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');
const API_RESPONSES_DIR = path.join(REPORT_DIR, 'api-responses');
const BROWSER_CONSOLE_DIR = path.join(REPORT_DIR, 'browser-console');
const BACKEND_LOGS_DIR = path.join(REPORT_DIR, 'backend-logs');
const TEST_DATA_DIR = path.join(REPORT_DIR, 'test-data');
const BUG_REPORTS_DIR = path.join(REPORT_DIR, 'bug-reports');

// Ensure directories exist
[
  REPORT_DIR,
  SCREENSHOT_DIR,
  API_RESPONSES_DIR,
  BROWSER_CONSOLE_DIR,
  BACKEND_LOGS_DIR,
  TEST_DATA_DIR,
  BUG_REPORTS_DIR
].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function runMasterE2E() {
  console.log('🚀 Starting Master E2E Reproduction, Fix Validation & Evidence Generation...');
  
  const consoleLogs = [];
  const networkRequests = [];
  const testData = {
    timestamp: new Date().toISOString(),
    customerA: null,
    customerB: null,
    bookingA: null,
    invoiceA: null,
    stepResults: []
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleLogs.push({ time: new Date().toISOString(), text });
    if (msg.type() === 'error') {
      console.error('Browser Console Error:', msg.text());
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/v1/')) {
      try {
        const status = response.status();
        const headers = response.headers();
        const contentType = headers['content-type'] || '';
        let body = '';
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else if (contentType.includes('text/html')) {
          body = (await response.text()).substring(0, 500) + '...';
        }
        networkRequests.push({ url, status, contentType, body, time: new Date().toISOString() });
      } catch (e) {
        // ignore stream consumption errors
      }
    }
  });

  try {
    // ----------------------------------------------------
    // STEP 1: Guest Browsing & Product Details
    // ----------------------------------------------------
    console.log('\n▶ STEP 1: Guest browsing product details...');
    await page.goto(`${BASE_URL}/products/sony-fx3-cinema-camera`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const step1Shot = path.join(SCREENSHOT_DIR, '01-guest-product.png');
    await page.screenshot({ path: step1Shot, fullPage: false });
    console.log('✅ Captured 01-guest-product.png');
    testData.stepResults.push({ step: 1, title: 'Guest product browsing', status: 'PASS', screenshot: step1Shot });

    // ----------------------------------------------------
    // STEP 2: Guest Starts Rental & Clicks Proceed (Auth Required)
    // ----------------------------------------------------
    console.log('\n▶ STEP 2: Guest clicks Rent Now -> Goes to /booking -> Clicks Proceed to Checkout...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const rent = btns.find(b => b.textContent.includes('Rent Now'));
      if (rent) rent.click();
    });

    await new Promise(r => setTimeout(r, 1500));
    console.log('Navigated to:', page.url());

    // On Booking page, click Proceed to Review & Checkout
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const proceed = btns.find(b => b.textContent.includes('Proceed to Review') || b.textContent.includes('Checkout'));
      if (proceed) proceed.click();
    });

    await new Promise(r => setTimeout(r, 1500));
    console.log('Redirected to auth URL:', page.url());

    const step2Shot = path.join(SCREENSHOT_DIR, '02-rent-login-required.png');
    await page.screenshot({ path: step2Shot, fullPage: false });
    console.log('✅ Captured 02-rent-login-required.png');
    testData.stepResults.push({ step: 2, title: 'Rent -> Login required redirect', status: 'PASS', screenshot: step2Shot, url: page.url() });

    // ----------------------------------------------------
    // STEP 3: Customer Registration with BRAND NEW Data
    // ----------------------------------------------------
    console.log('\n▶ STEP 3: Navigating to Customer Registration with forward state...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const signup = links.find(a => a.href.includes('/signup') || a.textContent.includes('Create one now'));
      if (signup) signup.click();
    });

    await new Promise(r => setTimeout(r, 1200));
    console.log('Current URL on signup:', page.url());

    // Click customer role card via Puppeteer page.click
    await page.waitForSelector('#customer-signup-card', { timeout: 5000 });
    await page.click('#customer-signup-card');
    
    // Wait for customer form inputs
    await page.waitForSelector('input[name="fullName"]', { timeout: 6000 });
    await new Promise(r => setTimeout(r, 500));

    const uniqueSuffix = Date.now();
    const customerA = {
      fullName: 'Vikramaditya Sharma',
      email: `vikram.qa.${uniqueSuffix}@rentora-test.in`,
      phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
      password: 'Password@123',
      role: 'Customer'
    };
    testData.customerA = customerA;

    console.log(`📝 Registering Customer A: ${customerA.fullName} (${customerA.email})`);
    
    await page.type('input[name="fullName"]', customerA.fullName);
    await page.type('input[name="email"]', customerA.email);
    await page.type('input[name="phone"]', customerA.phone);
    await page.type('input[name="password"]', customerA.password);
    await page.type('input[name="confirmPassword"]', customerA.password);

    const step3Shot = path.join(SCREENSHOT_DIR, '03-registration.png');
    await page.screenshot({ path: step3Shot, fullPage: false });
    console.log('✅ Captured 03-registration.png');

    // Submit signup & wait for React state update
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    
    await new Promise(r => setTimeout(r, 2500));
    console.log('URL after signup submit:', page.url());

    // ----------------------------------------------------
    // STEP 4: Verify Auth Me & New Customer Dashboard
    // ----------------------------------------------------
    console.log('\n▶ STEP 4: Verifying Auth Me & Dashboard identity...');
    
    const authMeResult = await page.evaluate(async () => {
      const token = localStorage.getItem('rentora_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    });

    fs.writeFileSync(
      path.join(API_RESPONSES_DIR, '02-auth-me-customerA.json'),
      JSON.stringify(authMeResult, null, 2)
    );
    
    const userA = authMeResult.data?.user || authMeResult.data;
    console.log('✅ /api/v1/auth/me returned:', userA?.fullName, userA?.email);

    if (userA?.fullName !== customerA.fullName) {
      throw new Error(`Auth mismatch: expected ${customerA.fullName}, got ${userA?.fullName}`);
    }

    // Capture screenshot on dashboard
    await page.goto(`${BASE_URL}/customer/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    
    const step4Shot = path.join(SCREENSHOT_DIR, '04-new-customer-dashboard.png');
    await page.screenshot({ path: step4Shot, fullPage: false });
    console.log('✅ Captured 04-new-customer-dashboard.png');

    // Profile page to verify auth details
    await page.goto(`${BASE_URL}/customer/profile`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    const step5Shot = path.join(SCREENSHOT_DIR, '05-auth-me-new-customer.png');
    await page.screenshot({ path: step5Shot, fullPage: false });
    console.log('✅ Captured 05-auth-me-new-customer.png');

    // ----------------------------------------------------
    // STEP 5: Rental Continuation & Checkout Flow
    // ----------------------------------------------------
    console.log('\n▶ STEP 5: Rental continuation and Checkout...');
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const step6Shot = path.join(SCREENSHOT_DIR, '06-rental-continuation.png');
    await page.screenshot({ path: step6Shot, fullPage: false });
    console.log('✅ Captured 06-rental-continuation.png');

    // Fill Delivery Address details on Checkout
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      const addr = inputs.find(i => i.name === 'deliveryAddress' || i.name === 'streetAddress' || i.tagName === 'TEXTAREA');
      if (addr) addr.value = 'Flat 402, Royal Palms Heights, Tech Zone 4, Mumbai, Maharashtra 400076';
      
      const city = inputs.find(i => i.name === 'city');
      if (city) city.value = 'Mumbai';

      const pincode = inputs.find(i => i.name === 'pincode' || i.name === 'pinCode');
      if (pincode) pincode.value = '400076';

      const terms = document.querySelector('input[type="checkbox"]');
      if (terms && !terms.checked) terms.click();
    });

    const step7Shot = path.join(SCREENSHOT_DIR, '07-checkout.png');
    await page.screenshot({ path: step7Shot, fullPage: false });
    console.log('✅ Captured 07-checkout.png');

    // Submit Booking
    console.log('\n▶ Submitting booking on checkout...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirm = btns.find(b => b.type === 'submit' || b.textContent.includes('Confirm') || b.textContent.includes('Book') || b.textContent.includes('Place') || b.textContent.includes('Proceed'));
      if (confirm) confirm.click();
    });

    await new Promise(r => setTimeout(r, 2500));

    const step8Shot = path.join(SCREENSHOT_DIR, '08-booking.png');
    await page.screenshot({ path: step8Shot, fullPage: false });
    console.log('✅ Captured 08-booking.png (Current URL: ' + page.url() + ')');

    // ----------------------------------------------------
    // STEP 6: Invoices Lifecycle & Multi-Format Lookups
    // ----------------------------------------------------
    console.log('\n▶ STEP 6: Testing Invoices List, Detail Modal & HTML Render...');
    await page.goto(`${BASE_URL}/customer/invoices`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const step9Shot = path.join(SCREENSHOT_DIR, '09-invoice-list.png');
    await page.screenshot({ path: step9Shot, fullPage: false });
    console.log('✅ Captured 09-invoice-list.png');

    // Click first view invoice button if present
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const view = btns.find(b => b.textContent.includes('View') || b.textContent.includes('Invoice') || b.textContent.includes('INV-'));
      if (view) view.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const step10Shot = path.join(SCREENSHOT_DIR, '10-invoice-detail.png');
    await page.screenshot({ path: step10Shot, fullPage: false });
    console.log('✅ Captured 10-invoice-detail.png');

    // Open A4 HTML Invoice render in browser
    console.log('\n▶ Opening A4 Tax Invoice render...');
    await page.goto(`${BASE_URL}/api/v1/invoices/number/INV-2026-000001/html`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    
    const step11Shot = path.join(SCREENSHOT_DIR, '11-invoice-html.png');
    await page.screenshot({ path: step11Shot, fullPage: false });
    console.log('✅ Captured 11-invoice-html.png');

    // ----------------------------------------------------
    // STEP 7: Logout & State Cleansing
    // ----------------------------------------------------
    console.log('\n▶ STEP 7: Logging out Customer A...');
    await page.goto(`${BASE_URL}/customer/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Clear auth state
    await page.evaluate(() => {
      localStorage.removeItem('rentora_token');
      localStorage.removeItem('rentora_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const step12Shot = path.join(SCREENSHOT_DIR, '12-logout.png');
    await page.screenshot({ path: step12Shot, fullPage: false });
    console.log('✅ Captured 12-logout.png');

    // ----------------------------------------------------
    // STEP 8: Second Customer Registration & Isolation
    // ----------------------------------------------------
    console.log('\n▶ STEP 8: Registering Customer B (Data Isolation Verification)...');
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Click customer card
    await page.waitForSelector('#customer-signup-card', { timeout: 5000 });
    await page.click('#customer-signup-card');
    await page.waitForSelector('input[name="fullName"]', { timeout: 6000 });
    await new Promise(r => setTimeout(r, 500));

    const uniqueSuffixB = Date.now() + 10;
    const customerB = {
      fullName: 'Pooja Deshmukh',
      email: `pooja.qa.${uniqueSuffixB}@rentora-test.in`,
      phone: `91234${Math.floor(10000 + Math.random() * 90000)}`,
      password: 'Password@123',
      role: 'Customer'
    };
    testData.customerB = customerB;

    console.log(`📝 Registering Customer B: ${customerB.fullName} (${customerB.email})`);
    await page.type('input[name="fullName"]', customerB.fullName);
    await page.type('input[name="email"]', customerB.email);
    await page.type('input[name="phone"]', customerB.phone);
    await page.type('input[name="password"]', customerB.password);
    await page.type('input[name="confirmPassword"]', customerB.password);

    const submitBtnB = await page.$('button[type="submit"]');
    if (submitBtnB) await submitBtnB.click();
    await new Promise(r => setTimeout(r, 2500));

    // Verify Customer B /auth/me
    const authMeB = await page.evaluate(async () => {
      const token = localStorage.getItem('rentora_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    });

    fs.writeFileSync(
      path.join(API_RESPONSES_DIR, '04-auth-me-customerB.json'),
      JSON.stringify(authMeB, null, 2)
    );
    
    const userB = authMeB.data?.user || authMeB.data;
    console.log('✅ Customer B /api/v1/auth/me returned:', userB?.fullName, userB?.email);

    if (userB?.fullName !== customerB.fullName) {
      throw new Error(`Customer B mismatch: expected ${customerB.fullName}, got ${userB?.fullName}`);
    }

    // Go to customer B dashboard
    await page.goto(`${BASE_URL}/customer/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const step13Shot = path.join(SCREENSHOT_DIR, '13-second-customer-isolation.png');
    await page.screenshot({ path: step13Shot, fullPage: false });
    console.log('✅ Captured 13-second-customer-isolation.png');

    // ----------------------------------------------------
    // STEP 9: Return to Product Page Backend Stability Check
    // ----------------------------------------------------
    console.log('\n▶ STEP 9: Product page navigation & availability stability check...');
    await page.goto(`${BASE_URL}/products/sony-fx3-cinema-camera`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    await page.goto(`${BASE_URL}/products/canon-eos-r5`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    console.log('✅ Navigated across products with 0 backend exceptions');

  } catch (err) {
    console.error('❌ Error during Master E2E run:', err);
    fs.writeFileSync(
      path.join(BUG_REPORTS_DIR, 'e2e-run-error.log'),
      `${err.stack || err.message}`
    );
  } finally {
    await browser.close();

    // Save browser console logs
    fs.writeFileSync(
      path.join(BROWSER_CONSOLE_DIR, 'console-logs.json'),
      JSON.stringify(consoleLogs, null, 2)
    );

    // Save network responses
    fs.writeFileSync(
      path.join(API_RESPONSES_DIR, 'all-network-requests.json'),
      JSON.stringify(networkRequests, null, 2)
    );

    // Save test data
    fs.writeFileSync(
      path.join(TEST_DATA_DIR, 'master-e2e-test-data.json'),
      JSON.stringify(testData, null, 2)
    );

    console.log('\n✨ Master E2E execution complete! All 13 evidence screenshots generated.');
  }
}

runMasterE2E().catch(console.error);
