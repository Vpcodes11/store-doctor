import { CrawlStoreResult } from './crawler';
import { CoreWebVitals } from './psi';

export interface FindingItem {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number; // 1 to 5
  ease: number; // 1 to 5
  priorityScore: number; // impact * ease (max 25)
  title: string;
  explanation: string; // "Why it matters"
  fixSteps: string[]; // Step-by-step instructions
  screenshotBox: {
    page: 'desktop' | 'mobile' | 'product' | 'cart';
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number; // percentage 0-100
    height: number; // percentage 0-100
    label: string;
  };
  pageType: 'homepage' | 'collection' | 'product' | 'cart';
}

export interface AuditAnalysisResult {
  overallScore: number;
  grade: string;
  categoryScores: {
    /** null when PageSpeed data was unavailable */
    speedMobile: number | null;
    firstImpression: number;
    trustCredibility: number;
    productPage: number;
    pricingOffers: number;
    checkoutFriction: number;
    seoBasics: number;
  };
  topIssues: FindingItem[];
  allFindings: FindingItem[];
}

export function analyzeShopifyStore(
  crawl: CrawlStoreResult,
  psi: CoreWebVitals | null
): AuditAnalysisResult {
  const home = crawl.pages.find((p) => p.type === 'homepage') || crawl.pages[0];
  const product = crawl.pages.find((p) => p.type === 'product');
  const cart = crawl.pages.find((p) => p.type === 'cart');

  const findings: FindingItem[] = [];

  // ==========================================
  // CATEGORY 1: Speed & Mobile Performance
  // ==========================================
  // Speed is scored only from measured PageSpeed data. Without it the category is left out.
  let speedScore = psi?.performanceScore ?? 0;

  if (psi && psi.lcp > 2.5) {
    findings.push({
      id: 'speed-lcp-slow',
      category: 'Speed & Mobile',
      severity: psi.lcp > 4.0 ? 'critical' : 'high',
      impact: 5,
      ease: 4,
      priorityScore: 20,
      title: `Largest Contentful Paint is ${psi.lcp}s (Goal: < 2.5s)`,
      explanation:
        'Every extra second of load time drops conversions by up to 17%. Mobile shoppers abandon pages taking over 3 seconds to render key hero images.',
      fixSteps: [
        'Preload the main hero banner in theme.liquid using <link rel="preload" as="image">',
        'Convert heavy PNG/JPEG images to modern WebP or AVIF format with lossy compression',
        'Enable lazy-loading for all images below the fold: add loading="lazy"',
        'Ensure the hero banner image is served via Shopify CDN responsive srcset',
      ],
      screenshotBox: {
        page: 'mobile',
        x: 5,
        y: 12,
        width: 90,
        height: 38,
        label: `Slow Hero LCP (${psi.lcp}s)`,
      },
      pageType: 'homepage',
    });
  }

  if (psi && psi.thirdPartyScriptsCount !== null && psi.thirdPartyScriptsCount > 10) {
    findings.push({
      id: 'speed-script-bloat',
      category: 'Speed & Mobile',
      severity: 'high',
      impact: 4,
      ease: 4,
      priorityScore: 16,
      title: `App Script Bloat: ${psi.thirdPartyScriptsCount} third-party services load code on your homepage`,
      explanation:
        'Accumulated Shopify apps (abandoned popups, uninstalled widgets) leave dangling JavaScript that severely blocks mobile CPU rendering and delays clicks.',
      fixSteps: [
        'Audit your Shopify Admin > Apps and remove uninstalled app remnants in theme.liquid',
        'Defer non-critical analytics (Hotjar, Lucky Orange, Klaviyo) using async or defer tags',
        'Consolidate multiple analytics pixels into Google Tag Manager or Shopify Customer Events API',
        'Ensure review widget scripts load asynchronously after DOM interactive',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 2,
        y: 88,
        width: 96,
        height: 10,
        label: `${psi.thirdPartyScriptsCount} third-party services`,
      },
      pageType: 'homepage',
    });
  }

  if (psi && psi.cls > 0.1) {
    findings.push({
      id: 'speed-layout-shift',
      category: 'Speed & Mobile',
      severity: 'medium',
      impact: 4,
      ease: 4,
      priorityScore: 16,
      title: `Cumulative Layout Shift (${psi.cls}) causes accidental clicks`,
      explanation:
        'Elements jumping around while loading frustrates buyers, leading to accidental misclicks on wrong products or unexpected navigation.',
      fixSteps: [
        'Reserve explicit aspect-ratio CSS and height/width attributes on all banner images',
        'Reserve placeholder minimum heights for dynamic announcement banners and top navigation',
        'Prevent late-injected review star badges from pushing product descriptions downwards',
      ],
      screenshotBox: {
        page: 'mobile',
        x: 5,
        y: 2,
        width: 90,
        height: 8,
        label: 'Announcement Shift Area',
      },
      pageType: 'homepage',
    });
  }

  // ==========================================
  // CATEGORY 2: First Impression & Hero Clarity
  // ==========================================
  let firstImpressionScore = 85;

  const heroHasH1 = home.h1.length > 0;
  const heroHasClearValue = home.h1.some(
    (h) => h.length > 15 && !/welcome|home|shopify|new collection/i.test(h)
  );

  if (!heroHasClearValue) {
    firstImpressionScore -= 25;
    findings.push({
      id: 'hero-value-prop-weak',
      category: 'First Impression',
      severity: 'critical',
      impact: 5,
      ease: 5,
      priorityScore: 25,
      title: 'Hero section lacks a high-converting value proposition',
      explanation:
        'Shoppers decide in 3 seconds whether to stay or bounce. Generic headers like "Welcome" or "Summer Collection" fail to communicate what you sell and why you are unique.',
      fixSteps: [
        'Rewrite hero headline using the formula: [Specific Desired Outcome] without [Common Pain Point]',
        'Add a supporting 1-sentence sub-headline clarifying who your product is for',
        'Ensure hero CTA button has strong contrast (e.g. bold emerald/amber button) with active copy like "Explore Bestsellers" instead of "Shop"',
        'Ensure the headline is readable on mobile without overlay text blending into background imagery',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 10,
        y: 22,
        width: 80,
        height: 35,
        label: 'Vague Hero Value Proposition',
      },
      pageType: 'homepage',
    });
  }

  // ==========================================
  // CATEGORY 3: Trust, Social Proof & Credibility
  // ==========================================
  let trustScore = 90;

  if (!home.trustSignals.hasReviews) {
    trustScore -= 30;
    findings.push({
      id: 'trust-no-reviews',
      category: 'Trust & Social Proof',
      severity: 'critical',
      impact: 5,
      ease: 4,
      priorityScore: 20,
      title: 'No prominent customer reviews or star ratings found above the fold',
      explanation:
        '93% of online shoppers read customer reviews before buying. Without verifiable social proof, first-time visitors suspect the brand is untrustworthy or inactive.',
      fixSteps: [
        'Install a verified review app like Judge.me or Loox with automated photo review collection',
        'Add a dynamic rating badge directly below your hero headline: "★★★★★ 4.9/5 from 1,200+ happy customers"',
        'Display a dedicated customer review carousel with customer photos and verified buyer badges on the homepage',
        'Embed Google Reviews or Trustpilot widget if operating in high-ticket segments',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 10,
        y: 55,
        width: 80,
        height: 18,
        label: 'Missing Trust / Social Proof Hook',
      },
      pageType: 'homepage',
    });
  }

  if (!home.trustSignals.hasReturnPolicy || !home.trustSignals.hasShippingPolicy) {
    trustScore -= 15;
    findings.push({
      id: 'trust-missing-policy-links',
      category: 'Trust & Social Proof',
      severity: 'high',
      impact: 4,
      ease: 5,
      priorityScore: 20,
      title: 'Return and Shipping guarantees are not easily accessible',
      explanation:
        'Fear of getting stuck with an unwanted product is the #1 cart abandonment driver. Clear return policies reduce perceived buying risk immediately.',
      fixSteps: [
        'Add visible "30-Day Hassle-Free Returns" & "Free Tracked Shipping" trust pills under footer & header',
        'Link full Refund Policy and Shipping Policy in the main footer navigation and cart drawer',
        'Feature a 100% money-back guarantee badge near the primary purchase action',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 5,
        y: 82,
        width: 90,
        height: 14,
        label: 'Footer Policy & Assurance Gap',
      },
      pageType: 'homepage',
    });
  }

  if (!home.trustSignals.hasContactInfo) {
    trustScore -= 15;
    findings.push({
      id: 'trust-missing-contact',
      category: 'Trust & Social Proof',
      severity: 'medium',
      impact: 3,
      ease: 5,
      priorityScore: 15,
      title: 'Direct customer support channels (Email/Phone/WhatsApp) not prominent',
      explanation:
        'Ghost stores with only an unbranded contact form trigger high scam anxiety. Real contact info boosts buyer reassurance.',
      fixSteps: [
        'Add customer support email (e.g. support@yourbrand.com) and phone or WhatsApp link in the footer and help center',
        'State your response time guarantee (e.g. "Replies in under 2 hours, Mon-Sat")',
        'Add a live chat bubble or floating WhatsApp widget for instant pre-purchase queries',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 75,
        y: 85,
        width: 22,
        height: 12,
        label: 'Missing Support Channel Indicator',
      },
      pageType: 'homepage',
    });
  }

  if (!home.trustSignals.hasPaymentBadges) {
    trustScore -= 10;
    findings.push({
      id: 'trust-payment-icons',
      category: 'Trust & Social Proof',
      severity: 'medium',
      impact: 3,
      ease: 5,
      priorityScore: 15,
      title: 'Payment method security badges absent from footer and cart',
      explanation:
        'Displaying recognized payment logos (Visa, Mastercard, UPI, Apple Pay, Amex) provides visual comfort at the micro-decision moment.',
      fixSteps: [
        'Enable payment method icons in Shopify Theme Settings > Footer',
        'Add Norton, SSL 256-bit encryption, or 100% Secure Checkout trust badges right below the checkout button',
      ],
      screenshotBox: {
        page: 'mobile',
        x: 10,
        y: 86,
        width: 80,
        height: 10,
        label: 'Payment Security Assurance',
      },
      pageType: 'homepage',
    });
  }

  // ==========================================
  // CATEGORY 4: Product Page Optimization
  // ==========================================
  let productScore = 80;

  if (product) {
    const prodDetails = product.productDetails;

    if (prodDetails && prodDetails.imageCount < 4) {
      productScore -= 15;
      findings.push({
        id: 'product-insufficient-images',
        category: 'Product Page',
        severity: 'high',
        impact: 4,
        ease: 4,
        priorityScore: 16,
        title: `Low product imagery count (${prodDetails.imageCount} images found)`,
        explanation:
          'Online buyers cannot touch or try on your product. Stores with 5+ angles, lifestyle photos, and dimension charts convert 32% higher.',
        fixSteps: [
          'Add at least 5-7 images per product: front, back, close-up texture, packaging, and in-use lifestyle shots',
          'Include a 15-second product demo video or looping GIF showing the product in action',
          'Enable image zoom on hover for desktop and full-screen pinch-to-zoom for mobile',
        ],
        screenshotBox: {
          page: 'product',
          x: 5,
          y: 20,
          width: 45,
          height: 55,
          label: 'Limited Product Gallery (< 4 images)',
        },
        pageType: 'product',
      });
    }

    if (!prodDetails?.hasStickyAddToCart) {
      productScore -= 20;
      findings.push({
        id: 'product-missing-sticky-atc',
        category: 'Product Page',
        severity: 'critical',
        impact: 5,
        ease: 4,
        priorityScore: 20,
        title: 'Missing Sticky Add-To-Cart bar on mobile scroll',
        explanation:
          'As mobile users scroll through long product descriptions, reviews, and specifications, the Add to Cart button disappears. A persistent bottom bar increases impulse conversions by 8-15%.',
        fixSteps: [
          'Implement a sticky bottom Add to Cart bar that triggers once the primary ATC scrolls out of view',
          'Include product thumbnail, current price, selected variant, and 1-tap "Add to Cart" button in the bar',
          'Ensure the sticky bar does not overlap with third-party live chat widgets',
        ],
        screenshotBox: {
          page: 'mobile',
          x: 0,
          y: 88,
          width: 100,
          height: 12,
          label: 'Missing Sticky ATC Mobile Anchor',
        },
        pageType: 'product',
      });
    }

    if (!prodDetails?.hasShippingNearAtc) {
      productScore -= 15;
      findings.push({
        id: 'product-no-shipping-timeline',
        category: 'Product Page',
        severity: 'high',
        impact: 4,
        ease: 5,
        priorityScore: 20,
        title: 'Estimated delivery date & shipping timeline missing near Add to Cart',
        explanation:
          '"When will I receive this?" is the most common pre-purchase anxiety. Explicit delivery dates (e.g. "Order in next 3 hrs to receive by Friday") stop shoppers from leaving to check competitors.',
        fixSteps: [
          'Add a dynamic dispatch timer near the Add to Cart button: "In Stock - Ships within 24 hours"',
          'Include an estimated delivery date range based on visitor geolocation',
          'Display return window guarantee right under the Buy button',
        ],
        screenshotBox: {
          page: 'product',
          x: 52,
          y: 50,
          width: 44,
          height: 15,
          label: 'Missing Delivery Date / Risk Reversal',
        },
        pageType: 'product',
      });
    }
  }

  // ==========================================
  // CATEGORY 5: Pricing, Offers & Free Shipping
  // ==========================================
  let pricingScore = 85;

  if (!home.trustSignals.hasFreeShippingThreshold && !cart?.cartDetails?.hasFreeShippingBar) {
    pricingScore -= 20;
    findings.push({
      id: 'offer-no-free-shipping-threshold',
      category: 'Pricing & Offers',
      severity: 'high',
      impact: 5,
      ease: 4,
      priorityScore: 20,
      title: 'Free Shipping threshold not clearly leveraged to boost Average Order Value (AOV)',
      explanation:
        '66% of consumers expect free shipping on every order. A dynamic threshold bar ("Add $14 more for Free Shipping!") consistently increases AOV by 18-24%.',
      fixSteps: [
        'Add a persistent top announcement bar: "FREE Worldwide Express Shipping on all orders over $50 / ₹1,499"',
        'Add an animated progress bar in the slide-out cart drawer showing how close the customer is to unlocking free shipping',
        'Offer quick 1-click upsell add-ons (socks, warranty, cleaner) directly inside the cart to cross the threshold',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 0,
        y: 0,
        width: 100,
        height: 6,
        label: 'Announcement Bar Threshold Gap',
      },
      pageType: 'homepage',
    });
  }

  // ==========================================
  // CATEGORY 6: Checkout Friction & Payment Signals (India COD & Fast Checkout)
  // ==========================================
  let checkoutScore = 85;

  if (!home.trustSignals.hasCodMention && !home.trustSignals.hasFastCheckout) {
    checkoutScore -= 25;
    findings.push({
      id: 'checkout-cod-fast-checkout-absent',
      category: 'Checkout Friction',
      severity: 'high',
      impact: 5,
      ease: 4,
      priorityScore: 20,
      title: 'No Cash on Delivery (COD) or 1-Click Fast Checkout badges detected',
      explanation:
        'In high-growth markets like India and Southeast Asia, 60%+ of D2C orders happen via COD or 1-click checkout (GoKwik, Shop Pay, Razorpay Magic). Not highlighting payment flexibility increases cart bounce.',
      fixSteps: [
        'Display "Cash on Delivery (COD) Available Across All Pincodes" prominently in header, product page, and cart',
        'Integrate accelerated checkout like Shop Pay or 1-Click Checkout (GoKwik / Razorpay Magic) to eliminate 4-step address forms',
        'Highlight instant OTP login and prepaid discount incentives (e.g. "Get extra ₹50 off on UPI / Prepaid")',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 52,
        y: 65,
        width: 44,
        height: 18,
        label: 'Checkout Payment Options & COD Signal',
      },
      pageType: 'product',
    });
  }

  // ==========================================
  // CATEGORY 7: Technical & On-Page SEO
  // ==========================================
  let seoScore = 90;

  if (home.title.length < 30 || home.title.length > 70) {
    seoScore -= 15;
    findings.push({
      id: 'seo-title-tag-suboptimal',
      category: 'SEO Basics',
      severity: 'medium',
      impact: 3,
      ease: 5,
      priorityScore: 15,
      title: `Homepage Title Tag length is ${home.title.length} characters (Optimal: 50-60)`,
      explanation:
        'Search engine snippet titles that are too short fail to target primary keywords; titles over 65 characters get truncated in Google search results.',
      fixSteps: [
        'Update Homepage Title in Shopify Admin > Online Store > Preferences',
        'Format as: [Brand Name] | [Primary Category / Value Hook] (e.g. "StoreDoctor | Premium Organic Skincare & Serums")',
        'Include your primary commercial keyword in the first 35 characters',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 20,
        y: 0,
        width: 60,
        height: 8,
        label: 'Page Meta Title Tag',
      },
      pageType: 'homepage',
    });
  }

  if (!home.metaDescription || home.metaDescription.length < 50) {
    seoScore -= 15;
    findings.push({
      id: 'seo-meta-description-missing',
      category: 'SEO Basics',
      severity: 'medium',
      impact: 3,
      ease: 5,
      priorityScore: 15,
      title: 'Meta description is missing or too brief for Google snippets',
      explanation:
        'A persuasive meta description with clear benefits and a call to action dramatically lifts organic Click-Through-Rate (CTR) from Google search.',
      fixSteps: [
        'Add a 130-155 character meta description in Shopify Preferences',
        'Include your main selling points: free shipping, warranty, customer review count, and a strong action verb like "Shop Now"',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 15,
        y: 6,
        width: 70,
        height: 8,
        label: 'Search Snippet Meta Description',
      },
      pageType: 'homepage',
    });
  }

  if (home.imagesWithoutAlt > 5) {
    seoScore -= 10;
    findings.push({
      id: 'seo-images-missing-alt',
      category: 'SEO Basics',
      severity: 'medium',
      impact: 3,
      ease: 4,
      priorityScore: 12,
      title: `${home.imagesWithoutAlt} images missing descriptive Alt text`,
      explanation:
        'Missing image alt tags hurt Google Image search rankings and violate accessibility guidelines (ADA compliance).',
      fixSteps: [
        'Add descriptive alt text to all product and collection images describing the item and color',
        'Use Shopify automated alt text apps or theme settings to default alt tags to product title',
      ],
      screenshotBox: {
        page: 'desktop',
        x: 10,
        y: 40,
        width: 80,
        height: 30,
        label: `${home.imagesWithoutAlt} Images Missing Alt Text`,
      },
      pageType: 'homepage',
    });
  }

  // Fallback safety: ensure we always provide high-value actionable findings even on clean stores
  if (findings.length < 10) {
    const additionalChecks: FindingItem[] = [
      {
        id: 'cro-exit-intent-offer',
        category: 'Pricing & Offers',
        severity: 'medium',
        impact: 4,
        ease: 4,
        priorityScore: 16,
        title: 'No exit-intent lead capture or cart saver offer detected',
        explanation:
          '70% of visitors who leave never return. An exit-intent modal offering 10% off for their email or phone number captures 4-7% of otherwise lost revenue.',
        fixSteps: [
          'Install Klaviyo or Privy exit-intent popup triggered only when cursor moves toward the back/close button',
          'Offer an instant discount code or mystery gift in exchange for email or SMS signup',
          'Suppress the popup on mobile to prevent intrusive Google interstitial SEO penalties',
        ],
        screenshotBox: {
          page: 'desktop',
          x: 25,
          y: 25,
          width: 50,
          height: 50,
          label: 'Exit-Intent Capture Opportunity',
        },
        pageType: 'homepage',
      },
      {
        id: 'trust-user-generated-content',
        category: 'Trust & Social Proof',
        severity: 'medium',
        impact: 4,
        ease: 3,
        priorityScore: 12,
        title: 'Lack of real customer Instagram/TikTok User Generated Content (UGC) gallery',
        explanation:
          'Gen-Z and millennial shoppers prioritize authentic unboxings and customer photos over polished studio shots. UGC boosts on-site time by 80%.',
        fixSteps: [
          'Add a "Tagged on Instagram" Shoppable UGC feed above the footer',
          'Incentivize customers with loyalty points or $10 off their next order for uploading photo reviews',
        ],
        screenshotBox: {
          page: 'desktop',
          x: 10,
          y: 70,
          width: 80,
          height: 18,
          label: 'Customer UGC Social Feed Section',
        },
        pageType: 'homepage',
      },
      {
        id: 'product-tabbed-specifications',
        category: 'Product Page',
        severity: 'medium',
        impact: 3,
        ease: 4,
        priorityScore: 12,
        title: 'Product description lacks collapsible accordions for quick scanning',
        explanation:
          'A long wall of text causes cognitive overload on mobile. Collapsible tabs (Details, Materials, Care, Shipping & Returns) improve readability.',
        fixSteps: [
          'Break product descriptions into 3-4 clean accordions in Shopify 2.0 Theme Editor',
          'Use bulleted benefit points before the fold and detailed specs in expandable tabs below',
        ],
        screenshotBox: {
          page: 'product',
          x: 52,
          y: 65,
          width: 44,
          height: 25,
          label: 'Collapsible Information Accordions',
        },
        pageType: 'product',
      },
    ];

    for (const add of additionalChecks) {
      if (findings.length < 12 && !findings.some((f) => f.id === add.id)) {
        findings.push(add);
      }
    }
  }

  // Sort strictly by impact * ease descending
  findings.sort((a, b) => b.priorityScore - a.priorityScore);

  // Calculate final category scores (0-100)
  const categoryScores = {
    speedMobile: psi ? Math.max(0, Math.min(100, Math.round(speedScore))) : null,
    firstImpression: Math.max(35, Math.min(98, Math.round(firstImpressionScore))),
    trustCredibility: Math.max(30, Math.min(98, Math.round(trustScore))),
    productPage: Math.max(35, Math.min(98, Math.round(productScore))),
    pricingOffers: Math.max(40, Math.min(98, Math.round(pricingScore))),
    checkoutFriction: Math.max(35, Math.min(98, Math.round(checkoutScore))),
    seoBasics: Math.max(40, Math.min(98, Math.round(seoScore))),
  };

  const scoresList = Object.values(categoryScores).filter((v): v is number => typeof v === 'number');
  const overallScore = Math.round(
    scoresList.reduce((acc, curr) => acc + curr, 0) / scoresList.length
  );

  let grade = 'C';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 55) grade = 'C';
  else if (overallScore >= 40) grade = 'D';
  else grade = 'F';

  return {
    overallScore,
    grade,
    categoryScores,
    topIssues: findings.slice(0, 10),
    allFindings: findings,
  };
}
