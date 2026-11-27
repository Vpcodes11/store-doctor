# StoreDoctor™ 🩺

> **Autonomous AI Shopify Conversion Rate Optimization (CRO) Auditor & Done-For-You Implementation Engine**

Paste any Shopify store URL without credentials or login, and instantly receive an AI conversion audit diagnosing revenue leaks, Core Web Vitals, mobile UX, trust signals, and Indian D2C friction points (COD/Fast Checkout). Prioritizes every fix by **Impact × Ease**, provides pinpoint annotated screenshots, generates direct-response copy rewrites, and powers a complete Done-For-You (DFY) engineering queue with before/after re-audits.

---

## ⚡ Key Highlights

1. **Zero-Login Crawler (fetch + Cheerio)**:
   - Discovers Homepage, Collections (`/collections/*`), Products (`/products/*`), and Cart (`/cart`).
   - Detects 15+ third-party Shopify apps (Judge.me, Loox, Klaviyo, Privy, GoKwik, etc.).
2. **Google PageSpeed Insights (measured, never estimated)**:
   - LCP, FCP, CLS, TBT, page weight and third-party services from Lighthouse, plus the real mobile, desktop and product-page screenshots.
   - If PageSpeed can't test a store, the report says speed data is unavailable instead of guessing.
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
6. **Built-in 24h Cache & Rate Limiting**:
   - Caches audits for the same canonical URL for 24 hours (instant sub-20ms retrieval).
   - Rate limits free audits per IP address.

---

## 🗄️ Database Architecture (Prisma & PostgreSQL)

- **`audits`**: `id`, `url`, `canonicalUrl`, `storeName`, `score`, `grade`, `desktopShot`, `mobileShot`, `screenshots` (JSON array), `psiData` (JSON), `findingsData` (JSON), `categoryScores` (JSON), `email`, `ipAddress`, `paid`, `heroRewrites` (JSON), `productRewrites` (JSON).
- **`findings`**: `id`, `auditId`, `category`, `severity`, `impact`, `ease`, `priorityScore`, `title`, `explanation`, `fixSteps`, `screenshotBox` (JSON `{ page, x, y, width, height, label }`), `pageType`.
- **`fix_orders`**: `id`, `auditId`, `customerEmail`, `customerName`, `storeUrl`, `collaboratorCode`, `packageType`, `amountPaid`, `currency`, `status` (`pending`, `in_progress`, `completed`), `notes`.
- **`fix_tasks`**: `id`, `fixOrderId`, `findingId`, `title`, `category`, `impact`, `ease`, `status`, `assignedTo`, `beforeScreenshot`, `afterScreenshot`, `developerNotes`, `completedAt`.
- **`orders`**: `id`, `auditId`, `email`, `productType`, `amount`, `currency`, `status`, `paymentId`, `paymentMethod`.
- **`RateLimit`**: `id`, `key`, `count`, `resetAt`.

---

## 🚀 Deploy (Vercel + Neon)

1. Import the repo into Vercel. Project → Storage → create a **Neon (Postgres)** database (sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`).
2. Add the settings from `.env.example` (Project → Settings → Environment Variables).
3. **Dodo Payments**: create two one-time products (Full Report $29, Fix Pack $149; optional ₹1,999 / ₹9,999 versions), put their IDs in `DODO_PRODUCT_*`, and add a webhook to `https://YOUR-DOMAIN/api/webhooks/dodo` for `payment.succeeded`.
4. Deploy. The build applies the database migrations.
5. Open `https://YOUR-DOMAIN/api/health?key=YOUR_HEALTH_KEY` to see any missing settings.
6. The fix queue is at `/admin` (password: `ADMIN_PASSWORD`, any username).

## 💻 Local development

```bash
npm install
cp .env.example .env    # set DATABASE_URL to any Postgres
npx prisma migrate dev
npm run dev
```

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
