# StoreDoctor™ 🩺

> **Autonomous AI Shopify Conversion Rate Optimization (CRO) Auditor & Done-For-You Implementation Engine**

Paste any Shopify store URL without credentials or login, and instantly receive an AI conversion audit diagnosing revenue leaks, Core Web Vitals, mobile UX, trust signals, and Indian D2C friction points (COD/Fast Checkout). Prioritizes every fix by **Impact × Ease**, provides pinpoint annotated screenshots, generates direct-response copy rewrites, and powers a complete Done-For-You (DFY) engineering queue with before/after re-audits.

---

## ⚡ Key Highlights

1. **Zero-Login Crawler (Playwright + Cheerio)**:
   - Discovers Homepage, Collections (`/collections/*`), Products (`/products/*`), and Cart (`/cart`).
   - Headless Playwright captures high-resolution Desktop (`1280x800`) and Mobile (`390x844`) viewport screenshots.
   - Measures asset weights, image counts, and 15+ third-party Shopify app signatures (Judge.me, Loox, Klaviyo, Privy, GoKwik, etc.).
2. **PageSpeed Insights & Core Web Vitals**:
   - Analyzes Largest Contentful Paint (LCP), First Contentful Paint (FCP), Cumulative Layout Shift (CLS), Total Blocking Time (TBT), and third-party script bloat.
3. **35+ CRO Rules Engine across 7 Core Categories**:
   - **Speed & Mobile Experience**: LCP thresholds, layout shifts, unoptimized images, app script bloat.
   - **First Impression & Hero Clarity**: Above-the-fold value proposition, headline contrast, primary CTA visibility.
   - **Trust & Social Proof**: Verified photo reviews, clear return/refund guarantees, direct contact info, payment security badges.
   - **Product Page CRO**: Image gallery depth (≥4 angles), size guides, delivery dispatch timers near Buy button, mobile sticky Add-To-Cart.
   - **Pricing & Offer Architecture**: Strikethrough pricing, savings badges, free shipping progress bars in slide-out cart.
   - **Checkout Friction & Indian Market Signals**: Cash on Delivery (COD) visibility, 1-click accelerated checkout (Shop Pay, GoKwik, Razorpay Magic).
   - **Technical & On-Page SEO**: Title tags (50-60 chars), meta descriptions, single H1 tags, missing alt text.
4. **Prioritized Action List (Impact × Ease)**:
   - Every issue is scored from 1 to 25 based on $Impact \times Ease$.
   - Includes "Why it matters", annotated screenshot bounding boxes (`{ x, y, width, height, label }`), and exact step-by-step fix guides for Shopify theme code/admin.
5. **Free vs. Paid Tiers**:
   - **Free ($0)**: Health score (0-100), Grade (A+ to F), 7 category sub-scores, and Top 3 prioritized issues.
   - **Full Report ($29 / ₹1,999)**: Unlocks all 10+ prioritized fixes, AI direct-response copy rewrites (3 Hero variants + Product transformation script), and instant downloadable branded PDF report.
   - **Done-For-You Fix Pack ($149 / ₹9,999)**: Seller books 10 fixes implemented by Shopify developers in 48h; includes collaborator code intake, admin task tracking, and official post-fix re-audit.
   - **Monthly Re-Audit ($15/mo / ₹1,199/mo)**: Recurring automated monitoring and alerting.
6. **Built-in 24h Cache & Rate Limiting**:
   - Caches audits for the same canonical URL for 24 hours (instant sub-20ms retrieval).
   - Rate limits free audits to 5 requests per 24 hours per IP/email.

---

## 🗄️ Database Architecture (Prisma & SQLite)

- **`audits`**: `id`, `url`, `canonicalUrl`, `storeName`, `score`, `grade`, `desktopShot`, `mobileShot`, `screenshots` (JSON array), `psiData` (JSON), `findingsData` (JSON), `categoryScores` (JSON), `email`, `ipAddress`, `paid`, `heroRewrites` (JSON), `productRewrites` (JSON).
- **`findings`**: `id`, `auditId`, `category`, `severity`, `impact`, `ease`, `priorityScore`, `title`, `explanation`, `fixSteps`, `screenshotBox` (JSON `{ page, x, y, width, height, label }`), `pageType`.
- **`fix_orders`**: `id`, `auditId`, `customerEmail`, `customerName`, `storeUrl`, `collaboratorCode`, `packageType`, `amountPaid`, `currency`, `status` (`pending`, `in_progress`, `completed`), `notes`.
- **`fix_tasks`**: `id`, `fixOrderId`, `findingId`, `title`, `category`, `impact`, `ease`, `status`, `assignedTo`, `beforeScreenshot`, `afterScreenshot`, `developerNotes`, `completedAt`.
- **`orders`**: `id`, `auditId`, `email`, `productType`, `amount`, `currency`, `status`, `paymentId`, `paymentMethod`.
- **`RateLimit`**: `id`, `key`, `count`, `resetAt`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v26 LTS)
- npm or pnpm

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "Store Doctor"

# Install dependencies
npm install

# Initialize Prisma SQLite database
npx prisma db push
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3008"

# Optional: Google PageSpeed Insights API Key
PAGESPEED_API_KEY=""

# Optional: Gemini API Key for Vision & Copywriting AI (StoreDoctor uses built-in CRO synthesis when unset)
GEMINI_API_KEY=""
```

### 4. Running the Application
```bash
# Start development server
npm run dev

# Or build and run production server
npm run build
npm start -- -p 3008
```

Visit `http://localhost:3008` in your browser.

---

## 🧭 Page Routes & API Endpoints

| Route | Method | Description |
|---|---|---|
| `/` | GET | StoreDoctor homepage: URL input, instant sample presets, feature breakdown, pricing |
| `/audit/[id]` | GET | Interactive audit dashboard: Score gauge, Category radar, Annotated Vision hotspots, Top issues, AI Copy Studio |
| `/admin` | GET | Done-For-You operations dashboard: Order queue, 10-task checklists, before/after upload, Re-Audit trigger |
| `/api/audit/start` | POST | Discovers store routes, captures screenshots via Playwright, measures vitals, runs 35+ CRO rules, caches for 24h |
| `/api/audit/[id]` | GET | Fetches audit session data and findings |
| `/api/audit/[id]/pdf` | GET | Generates and downloads branded executive PDF report |
| `/api/audit/[id]/re-audit` | POST | Executes post-implementation re-audit, recalculates score, marks fixes as verified |
| `/api/checkout` | POST | Handles unlock orders, Fix Pack booking, creates `fix_orders` and 10 `fix_tasks` |
| `/api/admin/orders` | GET | Admin endpoint for all customer fix orders and queue analytics |
| `/api/admin/tasks` | PATCH | Updates task assignment, status (`pending` -> `in_progress` -> `completed`), before/after shots, notes |

---

## 🛠️ Verification & E2E Testing
The system includes automated end-to-end verification covering:
1. Live headless Playwright crawler on Shopify stores.
2. 24-hour cache resolution (< 20ms response time).
3. Branded PDF report binary stream generation.
4. Instant checkout unlocking and `FixOrder` generation.
5. Admin task assignment and status updates.
6. Post-fix re-audit delta calculations.
