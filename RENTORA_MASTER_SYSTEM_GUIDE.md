# 🚀 Rentora — Master System Architecture & Project Guide

> **Important Reference File**: This document records the complete architecture, routing, design system, data contracts, and implementation history for **Rentora (Multi-Vendor Rental Marketplace System)**.

---

## 📌 1. Project Overview & Vision

**Rentora** is a comprehensive, production-grade, multi-vendor rental marketplace web platform connecting creative professionals, businesses, and individuals with rental equipment vendors (Cameras, Audio, Lighting, Drones, Lenses, Studio Gear, Vehicles, Tools, etc.).

### 🌟 Core Personas
1. **Public / Guest Users**: Discover, search, filter, compare rental products, and calculate rental pricing with deposits.
2. **Customers (Renters)**: Book gear, sign rental contracts, track 8-step rental lifecycles, manage security deposits & escrow, generate invoices, request quotations, and schedule pickup/return QC inspections.
3. **Vendors (Equipment Owners / Rental Businesses)**: Manage gear listings, track inventory & warehouse stock, adjust surge/weekend pricing, approve quotations, inspect returns with QC checklists, and manage payouts.
4. **Super Admin (Platform Command Center - Active)**: Central control panel managing customers, vendors, product approvals, categories, orders, escrow & payouts, pickups/returns QC, complaints arbitration, reports, broadcasts, admin roles & permission matrix, platform configuration, and live audit trails.

---

## 🎨 2. Design System & Brand Identity

### 🎨 Color Palette (Mandatory Brand Tokens)
| Color Role | Hex Code | Purpose / Application |
| :--- | :--- | :--- |
| **Primary Coral Red** | `#E63946` | Primary CTAs, active highlights, badges, key alerts, accent glow |
| **Light Soft White** | `#F1FAEE` | App background, card inner backgrounds, clean surface contrast |
| **Soft Aqua / Mint** | `#A8DADC` | Soft highlights, badge backgrounds, secondary accents, borders |
| **Steel Blue** | `#457B9D` | Secondary actions, tab borders, subtle highlights, active states |
| **Deep Navy** | `#1D3557` | Main headings, dark sidebars, topbar navigation, high-contrast text |

### 🔤 Typography
- **Headings**: `'Sora', sans-serif` — Modern, bold, geometric, premium marketplace aesthetic.
- **Body & Controls**: `'Inter', sans-serif` — High readability, clean interface labels, form inputs, tables.

### 🏷️ Logo & Assets
- **Logo File**: `src/assets/rentoramainLOGO.png` (Transparent PNG).
- **Component**: `src/components/Logo.jsx` (Supports sizes: `'sm'`, `'md'`, `'lg'`, `'xl'`, `'hero'`).
- **Navbar Layout**: Full-width header without constrained side margins, balanced branding on left and navigation/auth on right.

---

## 🛠️ 3. Technology Stack

### Current Frontend Stack
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS + Custom CSS Modules/Stylesheets per component folder
- **Icons**: Lucide React (`lucide-react`)
- **Animation**: Framer Motion (`framer-motion`)
- **Routing**: React Router DOM v6 (`react-router-dom`)
- **State Management**: React Context API (`AuthContext`, `BookingContext`, `VendorContext`, `AdminContext`)

### Planned Backend & Database Architecture
- **Backend Core**: Node.js + Express.js REST API
- **Database**: MySQL (Relational schema for Users, Vendors, Products, Orders, Escrow Deposits, Contracts, Invoices, QC Inspections, Admin Audits)
- **Microservices / AI**: Python (FastAPI / AI-based dynamic pricing, fraud prevention, recommendation engine)

---

## 🗺️ 4. Complete Route Map & Pages

```
Rentora App (/client)
│
├── 🌐 Public Marketplace (src/pages/...)
│   ├── /                           → Home.jsx (Hero, Categories, Featured Gear, Steps, Stats, Testimonials)
│   ├── /products                   → Explore/Explore.jsx (Grid/List, Filters, Dynamic Price Slider, Search)
│   ├── /products/:productId        → ProductDetails/ProductDetails.jsx (Gallery, Specs, Pricing Calculator, Reviews)
│   ├── /booking                    → Booking/Booking.jsx (Date picker, Delivery mode, Insurance, Deposit calculation)
│   ├── /checkout                   → Booking/Checkout.jsx (Payment gateway mock, Escrow summary, Billing)
│   ├── /booking/success            → Booking/BookingSuccess.jsx (Order receipt, 8-step timeline preview, Next steps)
│   ├── /login                      → Auth/Login.jsx (Customer vs Vendor vs Super Admin toggle, 1-Click Demo)
│   ├── /signup                     → Auth/Signup.jsx (Role selection, Business details for vendors)
│   └── /forgot-password            → Auth/ForgotPassword.jsx
│
├── 👤 Customer SaaS Portal (/customer/...) [CustomerLayout]
│   ├── /customer/dashboard         → DashboardOverview.jsx (KPIs, active rentals, 8-step tracker, quick actions)
│   ├── /customer/rentals           → MyRentals.jsx (Active, upcoming, past rentals, extension requests)
│   ├── /customer/bookings          → MyBookings.jsx (Pending approvals, deposit escrow status, cancellations)
│   ├── /customer/quotations        → Quotations.jsx (Custom quote requests, vendor counter-offers)
│   ├── /customer/contracts         → Contracts.jsx (Digital signed PDF agreements, security terms)
│   ├── /customer/invoices          → Invoices.jsx (GST-compliant downloadable invoices & receipts)
│   ├── /customer/payments          → Payments.jsx (Saved cards, escrow refund history, security deposits)
│   ├── /customer/pickup-returns    → PickupReturns.jsx (QR code verification, checklist, return scheduler)
│   ├── /customer/notifications     → Notifications.jsx (Rental reminders, payment alerts, return deadlines)
│   ├── /customer/profile           → Profile.jsx (KYC document verification, personal details)
│   └── /customer/settings          → Settings.jsx (Security, payment preferences, notification toggles)
│
├── 🏢 Vendor SaaS Portal (/vendor/...) [VendorLayout with VendorProvider]
│   ├── /vendor/dashboard           → VendorOverview.jsx (Revenue graphs, active rentals, alerts, fast actions)
│   ├── /vendor/products            → VendorProducts.jsx (Inventory grid/table, status toggle, bulk actions)
│   ├── /vendor/products/add        → AddEditProduct.jsx (Multi-step product listing creator)
│   ├── /vendor/products/:id/edit   → AddEditProduct.jsx (Product updater)
│   ├── /vendor/inventory           → VendorInventory.jsx (Stock units, serial nos, maintenance tracking)
│   ├── /vendor/pricing             → VendorPricing.jsx (Daily rates, weekend surge %, multi-day discounts)
│   ├── /vendor/orders              → VendorOrders.jsx (Status pipeline: New → Approved → Ready → Returned)
│   ├── /vendor/orders/:id          → VendorOrders.jsx (Detailed order inspector drawer)
│   ├── /vendor/quotations          → VendorQuotations.jsx (Custom B2B quotation generator & approvals)
│   ├── /vendor/pickups-returns     → VendorPickupReturns.jsx (QC checklist inspection, damage penalty, escrow release)
│   ├── /vendor/customers           → VendorCustomers.jsx (Renter history, trust scores, customer messaging)
│   ├── /vendor/invoices            → VendorInvoices.jsx (Vendor commission, tax invoices, customer billing)
│   ├── /vendor/payments            → VendorPayments.jsx (Payout balance, bank account link, withdrawal history)
│   ├── /vendor/reports             → VendorReports.jsx (Utilization rates, revenue analytics, top gear)
│   ├── /vendor/notifications       → VendorNotifications.jsx (Order requests, return alerts, system updates)
│   └── /vendor/settings            → VendorSettings.jsx (Store profile, KYC, operating hours, cancellation policies)
│
└── 🛡️ Super Admin SaaS Portal (/admin/...) [SuperAdminLayout with AdminProvider]
    ├── /admin/dashboard            → AdminDashboard.jsx (10 KPIs, GMV charts, category breakdown, quick approvals, live feed)
    ├── /admin/customers            → CustomerList.jsx (Customer roster, KYC filters, status switches, bulk actions, edit/delete)
    ├── /admin/customers/:id        → CustomerDetails.jsx (KYC inspector, order history, escrow deposits, dossier notes)
    ├── /admin/vendors              → VendorList.jsx (Store approval queue, commission tiers, category filter, export CSV)
    ├── /admin/vendors/:id          → VendorDetails.jsx (Document verification, gear catalog, payout release modal)
    ├── /admin/products             → ProductList.jsx (Catalog manager, approval queue, featured star toggles, rejection reasons)
    ├── /admin/categories           → CategoryManager.jsx (Category & subcategory hierarchy manager, create/edit modal)
    ├── /admin/orders               → OrderList.jsx (Master rental orders pipeline, payment status filter, dispute indicators)
    ├── /admin/orders/:id           → OrderDetails.jsx (5-step timeline, vendor/renter info, dispute arbitration desk)
    ├── /admin/payments             → PaymentManager.jsx (8 financial KPIs, ledger, refund escrow modal, export audit)
    ├── /admin/pickups-returns      → PickupsReturnsManager.jsx (7 lifecycle tabs, return QC inspector & damage flagger)
    ├── /admin/complaints           → ComplaintsManager.jsx (Split-pane support inbox, ticket assignment, chat reply composer)
    ├── /admin/reports              → ReportsAnalytics.jsx (8 analytics tabs, revenue graphs, cohort retention, top vendors)
    ├── /admin/notifications        → NotificationManager.jsx (Notification log, broadcast banner & push notification composer)
    ├── /admin/admin-users          → AdminUsersManager.jsx (Admin team roster, role tags, permission matrix editor modal)
    ├── /admin/settings             → PlatformSettings.jsx (6 policy tabs: General, Commission, Taxes, Orders, Vendors, Security)
    └── /admin/activity-logs        → ActivityLogs.jsx (Audit trail table, module filter, search, inspection drawer, export CSV)
```

---

## 💾 5. Data Architecture & Context Stores

### 1. `src/data/mockData.js`
- **`FEATURED_PRODUCTS`**: Products with properties `{ id, title/name, category, pricePerDay, deposit, images: [...], rating, vendor: { id, name, city, avatar, rating }, ... }`.
  - ⚠️ *Note*: `product.vendor` is an **object**, so always access `product.vendor.name` or `product.vendor.city`.
- **`CATEGORIES`**: Rental categories with Lucide icon references and item counts.
- **`CUSTOMER_METRICS`**, **`ACTIVE_RENTALS`**, **`CUSTOMER_BOOKINGS`**, **`CUSTOMER_QUOTATIONS`**, **`CUSTOMER_CONTRACTS`**, **`CUSTOMER_INVOICES`**, **`CUSTOMER_PAYMENTS`**, **`CUSTOMER_PICKUP_RETURNS`**.

### 2. `src/data/vendorMockData.js`
- **`VENDOR_METRICS`**: Revenue, active rentals, inventory count, return pending counts.
- **`VENDOR_PRODUCTS`**: Equipment list with SKU, serials, daily rates, stock count, status.
- **`VENDOR_ORDERS`**: Rental bookings with customer details, dates, items, status, deposit state.
- **`VENDOR_INVENTORY`**: Serial number tracking, condition state (Excellent, Good, Needs Maintenance).
- **`VENDOR_QUOTATIONS`**, **`VENDOR_CUSTOMERS`**, **`VENDOR_PAYOUTS`**, **`VENDOR_QC_CHECKS`**.

### 3. `src/data/adminMockData.js`
- **`ADMIN_METRICS`**: 10 Platform KPIs (GMV, Commission, Active Rentals, Customers, Vendors, Deposits, Approvals, Disputes).
- **`ADMIN_CUSTOMERS`**, **`ADMIN_VENDORS`**, **`ADMIN_CATEGORIES`**, **`ADMIN_PRODUCTS`**, **`ADMIN_ORDERS`**, **`ADMIN_TRANSACTIONS`**, **`ADMIN_PICKUPS_RETURNS`**, **`ADMIN_COMPLAINTS`**, **`ADMIN_REPORTS_DATA`**, **`ADMIN_NOTIFICATIONS`**, **`ADMIN_USERS`**, **`ADMIN_LOGS`**, **`ADMIN_SETTINGS`**.

### 4. Context Providers
- **`AuthContext`** (`src/context/AuthContext.jsx`): Manages current active user, login/logout, user role (`'customer' | 'vendor' | 'admin'`).
- **`BookingContext`** (`src/context/BookingContext.jsx`): Manages current booking flow, selected item, dates, deposit, checkout data.
- **`VendorContext`** (`src/context/VendorContext.jsx`): Manages vendor state, order status transitions, product edits, and QC releases.
- **`AdminContext`** (`src/context/AdminContext.jsx`): Central reactive state provider for Super Admin operations, real-time CRUD handlers, toast notifications (`showToast`), confirmation modal pipeline (`requestConfirmation`), document inspector (`openDocumentModal`), and activity audit logging (`logActivity`).

---

## ⚙️ 6. Key Components & Modals

1. **`SuperAdminLayout.jsx`** (`src/components/AdminLayout/SuperAdminLayout.jsx`):
   - Collapsible Navy sidebar (`AdminSidebar.jsx`) with live badge counters.
   - Header (`AdminHeader.jsx`) with dynamic breadcrumbs, notification panel, global search, and admin profile dropdown.
   - Global Toast Notification container (`ToastNotification`).
   - Confirmation Modal (`ConfirmationModal`) & Document Inspector (`DocumentPreviewModal`).
2. **`DocumentModal.jsx`** (`src/components/DocumentModal/`):
   - Universal preview modal for **Rental Contracts**, **Invoices**, and **Quotations**.
   - Supports Print, Download PDF, and Digital Signature verification badge.
3. **`RentalTimeline.jsx`** (`src/components/RentalTimeline/`):
   - Interactive 8-step lifecycle tracker across customer, vendor, and admin order details.
4. **`RentalStatusBadge.jsx`** & **`AdminComponents.jsx`**:
   - Standardized color-coded badges, StatCards, PriorityBadges, SearchBar, Pagination, and interactive ChartCards.

---

## ⚡ 7. Coding Rules & Best Practices

1. **Language & Communication**: Always interact with the user in **Gujarati English (Gujlish)**.
2. **Component Isolation**: Each component must reside in its own folder with an accompanying `.css` file if custom styling is needed.
3. **Safe Object Access**: Never render `product.vendor` directly as text; use `product.vendor.name`.
4. **Preserve Navigation & Layout**:
   - Customer Portal uses `CustomerLayout` with `CustomerSidebar` + `CustomerTopbar`.
   - Vendor Portal uses `VendorLayout` with dark navy collapsible `VendorSidebar` + `VendorHeader`.
   - Super Admin Portal uses `SuperAdminLayout` with `AdminSidebar` + `AdminHeader`.
   - Public pages use `PublicLayout` with global `Navbar` and `Footer`.
5. **No Broken Links**: All buttons, links, tabs, search boxes, and filters should either navigate or have rich interactive mock behavior with feedback.
6. **Testing & Screenshots Directory**: Store all test screenshots, temp files, and artifacts in `d:\rentora\tmp\` (e.g. `d:\rentora\tmp\screenshots\`).

---

*Last Updated: 2026-09-17 | Maintained by Antigravity IDE Pair Programmer*


