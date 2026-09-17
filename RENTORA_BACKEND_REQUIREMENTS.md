# 🚀 RENTORA — COMPLETE PROJECT REQUIREMENTS AND BACKEND IMPLEMENTATION PLAN

## 1. PROJECT OVERVIEW

Rentora is a multi-vendor rental platform where customers can rent products from vendors (cameras, audio, lighting, drones, studio gear, vehicles, tools, etc.).

The platform contains three major user areas:
1. **Customer Dashboard** (`/customer/*`)
2. **Vendor Dashboard** (`/vendor/*`)
3. **Super Admin Dashboard** (`/admin/*`)

The frontend dashboards are already created in React + Vite (`client/`). The next phase is to build the complete backend, database, authentication system, multi-role management, REST APIs, business logic, analytics engine, and frontend API integration.

The backend must be scalable, secure, modular, and ready for future production deployment.

---

## 2. USER ROLES & CAPABILITIES

### 2.1 Customer
* Register and log in (Email / Phone + Password, JWT)
* Browse & search rental products with filters (category, price, dates, availability)
* View product details, specs, vendor profiles, ratings
* Select rental dates & calculate real-time pricing + security deposit
* Create rental bookings & checkout
* View booking history, active rentals, rental contracts, and invoices
* Track 8-step rental lifecycle (Pending → Approved → Dispatched → Active → Return Scheduled → Returned → Inspected → Completed)
* Manage pickup and return schedules with QR / OTP validation
* Request rental cancellation or return extension
* Raise complaints & support tickets
* Receive real-time notifications
* Manage profile, KYC docs, and account settings

### 2.2 Vendor
* Register as a vendor & submit business info (tax/GST, bank account, business address)
* Upload verification documents & wait for Super Admin approval
* Add & manage rental products (images, attributes, stock, pricing tiers, deposits)
* Manage date-based inventory & stock reservation
* Manage custom quotations for customers
* View & manage customer orders (Accept, Reject, Dispatch, Return QC inspection)
* Generate tax invoices & track rental earnings/payouts
* View business performance reports & utilization analytics
* Receive instant notifications for orders, returns, and approvals
* Manage store profile, operating hours, and cancellation policies

### 2.3 Super Admin
* Central platform command center with full system access
* Customer management (view, edit, activate, deactivate, suspend, block, inspect KYC)
* Vendor management (approval queue, commission tiers, suspension, verification)
* Product & category management (moderation queue, approval/rejection, categories hierarchy)
* Rental orders & bookings management (master pipeline, dispute arbitration)
* Payments, platform commission & escrow deposit handling
* Pickups & returns QC dispute resolution
* Support tickets & complaints management (priority, assignment, responses)
* Platform broadcast notifications & email triggers
* Financial & growth analytics reports
* Role-based access control (RBAC) & admin staff management
* Platform global settings & live audit activity logs

---

## 3. MULTI-ROLE USER SYSTEM

A single user account can hold multiple roles (e.g., both **Customer** and **Vendor**).
* During registration or later, a user can activate Customer or Vendor roles.
* Backend must never create duplicate accounts for the same email address.
* Role-based permission middleware ensures proper access control.
* Dual-role users can seamlessly switch between Customer and Vendor dashboards without re-logging in.
* Super Admin can assign and revoke roles dynamically.

---

## 4. BACKEND TECHNOLOGY STACK & ARCHITECTURE

### 4.1 Core Stack Options
- **Primary Backend Core**: Node.js + Express.js REST API *(or Python / Django REST Framework)*
- **Analytics & AI Engine**: Python (FastAPI / Pandas / Scikit-learn for dynamic pricing, utilization analytics, demand forecasting, recommendation engine)
- **Database**: PostgreSQL / MySQL (Relational schema with ACID compliance, transactions, row-level locking for inventory)
- **Authentication**: JWT (Access Token + Refresh Token), bcrypt password hashing
- **Task Queue & Caching**: Redis + Celery / BullMQ for async tasks (email, invoice PDF generation, automated return reminders)
- **Documentation**: Swagger / OpenAPI 3.0 specification
- **CORS & Security**: Strict CORS for frontend (`http://localhost:5173`), Helmet, Rate-limiting

### 4.2 Modular Backend Structure (Node/Express or Django)
```text
backend/
├── src/
│   ├── config/             # DB, JWT, Redis, Environment configs
│   ├── middlewares/        # Auth, Role-based access (RBAC), Rate limit, Error handler
│   ├── modules/
│   │   ├── auth/           # Login, Register, Refresh, Forgot/Reset Password
│   │   ├── users/          # User Profiles, Customer/Vendor profiles, KYC
│   │   ├── categories/     # Category & Subcategory CRUD
│   │   ├── products/       # Products, Images, Attributes, Pricing tiers
│   │   ├── inventory/      # Date-based availability, Stock transactions
│   │   ├── bookings/       # Booking creation, Workflow states, Availability check
│   │   ├── quotations/     # Custom B2B/B2C quotation negotiation
│   │   ├── orders/         # Master rental orders & timeline
│   │   ├── payments/       # Mock/Stripe/Razorpay gateway, Escrow handling
│   │   ├── commissions/    # Vendor commission & payout calculation
│   │   ├── invoices/       # PDF Invoice & Contract generator
│   │   ├── pickups/        # Pickup scheduling, QR/OTP verification
│   │   ├── returns/        # Return QC inspection, damage penalties
│   │   ├── complaints/     # Support tickets & arbitration desk
│   │   ├── notifications/  # In-app alerts, Email notifications
│   │   ├── reports/        # Analytics & platform KPIs
│   │   ├── settings/       # Global platform settings
│   │   └── activity_logs/  # Audit trails for all critical actions
│   ├── utils/              # PDF generator, Emailer, Currency formatters
│   └── app.js / server.js
├── analytics_service/      # Python FastAPI service for AI/analytics
└── tests/
```

---

## 5. AUTHENTICATION & SECURITY

### 5.1 Endpoints
- `POST /api/auth/register` (Customer / Vendor registration)
- `POST /api/auth/login` (Returns Access + Refresh JWT)
- `POST /api/auth/token/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `GET  /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/change-password`

### 5.2 Security Rules
* Passwords hashed using `bcrypt` (min 10-12 salt rounds).
* JWT tokens signed with secure secret; short-lived access tokens (15-30 mins), long-lived refresh tokens (7 days).
* Strict input validation with Joi / Zod / Serializers.
* Protection against double bookings using DB transactions & row locking.
* Protection against duplicate payments via idempotent transaction keys.
* Never trust client-calculated prices or total amounts; backend recalculates everything.

---

## 6. DATABASE MODELS & SCHEMA SPECIFICATION

1. **User**: `id, full_name, email, phone, password_hash, profile_image, is_active, is_verified, created_at, updated_at`
2. **UserRole**: `id, user_id, role_name (CUSTOMER, VENDOR, SUPER_ADMIN, OPERATIONS_ADMIN, FINANCE_ADMIN), is_active`
3. **CustomerProfile**: `id, user_id, address, city, state, postal_code, kyc_status, kyc_document_url`
4. **VendorProfile**: `id, user_id, business_name, business_category, tax_number, address, city, verification_status (PENDING, APPROVED, REJECTED, SUSPENDED), approved_by, approved_at`
5. **VendorDocument**: `id, vendor_id, document_type, document_url, verification_status, reviewed_by, review_notes`
6. **Category**: `id, name, slug, description, image_url, parent_id, is_active`
7. **Product**: `id, vendor_id, category_id, name, slug, sku, description, brand, base_price, rental_price_per_day, weekend_rate, security_deposit, status, approval_status, is_featured`
8. **ProductImage**: `id, product_id, image_url, is_primary, display_order`
9. **Inventory**: `id, product_id, total_units, reserved_units, available_units, damaged_units`
10. **InventoryTransaction**: `id, product_id, transaction_type (STOCK_ADDED, RESERVED, RELEASED, DAMAGED, RETURNED), quantity, reason, created_by`
11. **Booking**: `id, booking_number, customer_id, vendor_id, product_id, quantity, start_date, end_date, rental_days, price_per_day, subtotal, tax_amount, deposit_amount, total_amount, booking_status, payment_status, pickup_status, return_status`
12. **Quotation**: `id, quotation_number, vendor_id, customer_id, valid_until, subtotal, discount, tax, total, status, notes`
13. **Order**: `id, order_number, customer_id, vendor_id, booking_id, total_amount, order_status, payment_status, escrow_status`
14. **Payment**: `id, transaction_id, order_id, booking_id, amount, currency, payment_method, payment_status, gateway_response, escrow_held, escrow_released_at`
15. **Commission**: `id, vendor_id, order_id, gross_amount, commission_pct, commission_amount, vendor_payout_amount, payout_status`
16. **Invoice**: `id, invoice_number, order_id, customer_id, vendor_id, subtotal, tax, deposit, total, status, pdf_url`
17. **Pickup**: `id, pickup_number, booking_id, customer_id, vendor_id, scheduled_date, time_slot, pickup_code, status`
18. **Return**: `id, return_number, booking_id, customer_id, vendor_id, requested_date, actual_date, condition_notes, damage_penalty, refund_amount, status`
19. **Complaint**: `id, ticket_number, created_by, user_type, order_id, subject, description, priority, status, assigned_to, resolution_note`
20. **Notification**: `id, recipient_id, title, message, notification_type, is_read, metadata, created_at`
21. **ActivityLog**: `id, performed_by, action, module, object_id, description, ip_address, user_agent, created_at`

---

## 7. CORE BUSINESS LOGICS & WORKFLOWS

### 7.1 Date-Based Product Availability Engine
```text
1. Customer picks Product + Date Range [Start Date, End Date]
2. Query active & confirmed bookings overlapping the range:
   WHERE product_id = :id 
   AND status IN ('CONFIRMED', 'PROCESSING', 'ACTIVE')
   AND NOT (end_date < :startDate OR start_date > :endDate)
3. Calculate: Available Quantity = Total Units - SUM(Reserved Units in Overlapping Range)
4. If Available Quantity >= Requested Quantity -> Allow Booking
5. Use DB transaction with row locking when booking is committed.
```

### 7.2 8-Step Rental Lifecycle & Escrow
```text
[1. Booking Created (PENDING)]
           ↓
[2. Vendor Approves (CONFIRMED)]
           ↓
[3. Payment Paid into Escrow (PROCESSING)]
           ↓
[4. Dispatch / Handover / QR Verified (ACTIVE)]
           ↓
[5. Rental Period Ends / Return Requested]
           ↓
[6. Vendor Return QC Inspection (Damages checked)]
           ↓
[7. Security Deposit Refunded (minus penalties)]
           ↓
[8. Vendor Payout Released & Booking COMPLETED]
```

---

## 8. PYTHON ANALYTICS & AI ENGINE
- **Revenue & Forecast Analytics**: Time-series revenue forecasting, seasonal demand analysis.
- **Dynamic Pricing Recommendation**: Suggests weekend surge / off-season discount rates to vendors.
- **Fraud & Risk Scoring**: Flags suspicious customer booking patterns or high-risk unreturned items.
- **Equipment Utilization Engine**: Tracks idle time and ROI per equipment unit.

---

## 9. API STANDARDS & UNIFORM RESPONSE FORMAT

### Success Response:
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "errors": null
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Validation failed / Unauthorized / Error details",
  "data": null,
  "errors": {
    "field": "Specific error description"
  }
}
```

### Paginated Response:
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "count": 120,
    "page": 1,
    "totalPages": 12,
    "limit": 10,
    "results": []
  },
  "errors": null
}
```

---

## 10. STEP-BY-STEP IMPLEMENTATION ROADMAP

- [ ] **Phase 1: Backend Setup & DB Architecture** (Express/Node + PostgreSQL/MySQL setup, Prisma/Sequelize ORM or Django setup, Configs, Swagger)
- [ ] **Phase 2: Authentication & Multi-Role System** (JWT auth, Customer/Vendor profiles, RBAC middleware, Me endpoint)
- [ ] **Phase 3: Categories, Products & Inventory Engine** (Product CRUD, Image uploads, Availability calculation, Admin approval queue)
- [ ] **Phase 4: Bookings & Quotations Engine** (Booking workflow, availability lock, B2B quotations, Vendor accept/reject)
- [ ] **Phase 5: Payments, Escrow & Invoices** (Mock payment gateway, Escrow deposit lock, GST invoice generation, Commission split)
- [ ] **Phase 6: Logistics: Pickups, Returns & QC Inspection** (QR/OTP verification, Return damage inspection, Escrow release)
- [ ] **Phase 7: Complaints, Notifications & Audit Logs** (Support ticketing, In-app alerts, Email triggers, Super Admin audit trails)
- [ ] **Phase 8: Python Analytics & Reporting Service** (FastAPI / Pandas analytics microservice for platform & vendor dashboards)
- [ ] **Phase 9: Frontend API Client & Dashboard Integration** (Replace mock data in Client components step-by-step with real APIs)
- [ ] **Phase 10: End-to-End Testing & Security Hardening** (Unit tests, load tests, penetration checks, deployment ready)

---
*Created & Maintained for Rentora Platform | Antigravity AI Pair Programmer*
