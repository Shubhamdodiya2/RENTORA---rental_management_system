# Rentora System Rules & Core Context

## 1. User Communication Preference
- **Language**: Always respond and interact in **Gujarati English (Gujlish)**. Example: *"Ha bhai, aa feature implement thai gayu chhe ane badhu ready chhe."*

## 2. Project Architecture & Theme
- **Project**: Rentora — Multi-Vendor Rental Marketplace System
- **Colors**:
  - Primary Coral Red: `#E63946`
  - Soft White: `#F1FAEE`
  - Soft Aqua / Mint: `#A8DADC`
  - Secondary Steel Blue: `#457B9D`
  - Deep Navy: `#1D3557`
- **Typography**: Sora (Headings), Inter (Body text and buttons).
- **Logo**: `src/assets/rentoramainLOGO.png` via `<Logo />` component. Full-width navbar layout.
- **Master Guide**: See [RENTORA_MASTER_SYSTEM_GUIDE.md](file:///d:/rentora/RENTORA_MASTER_SYSTEM_GUIDE.md) for full routes, data schemas, and architecture.

## 3. Tech Stack
- Frontend: React 18+ (Vite), Tailwind CSS, Lucide React, Framer Motion.
- Backend (Planned): Node.js + Express.js, MySQL Database, Python microservices.

## 4. Coding & Data Safety
- Always access vendor object properties safely: `product.vendor?.name || product.vendor`. Never render raw vendor objects as React children.
- Keep components inside their own folders with corresponding `.css` files.
- Ensure all public, customer (`/customer/*`), and vendor (`/vendor/*`) routes remain fully connected and operational in `App.jsx`.

## 5. Testing & Screenshots Storage
- **Testing & Screenshot Path**: Whenever performing tests or capturing screenshots/artifacts, always store them directly in `d:\rentora\tmp\` (e.g. `d:\rentora\tmp\screenshots\`) instead of any C: drive temporary directory.

