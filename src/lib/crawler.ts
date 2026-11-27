import * as cheerio from 'cheerio';

export interface CrawlPageResult {
  url: string;
  type: 'homepage' | 'collection' | 'product' | 'cart';
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  html: string;
  screenshotDesktop?: string;
  screenshotMobile?: string;
  imageCount: number;
  imagesWithoutAlt: number;
  scriptsCount: number;
  scriptsList: string[];
  shopifyAppsDetected: string[];
  trustSignals: {
    hasReviews: boolean;
    hasPolicies: boolean;
    hasReturnPolicy: boolean;
    hasShippingPolicy: boolean;
    hasPrivacyPolicy: boolean;
    hasContactInfo: boolean;
    hasAboutPage: boolean;
    hasPaymentBadges: boolean;
    hasFreeShippingThreshold: boolean;
    hasCodMention: boolean;
    hasFastCheckout: boolean;
  };
  productDetails?: {
    imageCount: number;
    hasSizeGuide: boolean;
    hasStickyAddToCart: boolean;
    hasUrgencyIndicators: boolean;
    hasShippingNearAtc: boolean;
    hasReviewsNearTitle: boolean;
    descriptionLength: number;
  };
  cartDetails?: {
    hasFreeShippingBar: boolean;
    hasTrustBadges: boolean;
    hasCheckoutButton: boolean;
  };
}

export interface CrawlStoreResult {
  targetUrl: string;
  storeName: string;
  /** Screenshots come from PageSpeed Insights (data: URIs); set after the crawl. */
  desktopScreenshot?: string | null;
  mobileScreenshot?: string | null;
  productMobileScreenshot?: string | null;
  /** First real product page found on the homepage, if any */
  productUrl: string | null;
  pages: CrawlPageResult[];
  detectedApps: string[];
  crawlStats: {
    scriptCount: number;
    imageCount: number;
    htmlSizeBytes: number;
    responseTimeMs: number;
  };
}

const KNOWN_SHOPIFY_APPS: Record<string, RegExp> = {
  'Judge.me Reviews': /judge\.me/i,
  'Loox Reviews': /loox\.io/i,
  'Yotpo Reviews': /yotpo\.com/i,
  'Okendo Reviews': /okendo\.io/i,
  'Stamped.io': /stamped\.io/i,
  'Klaviyo Email & SMS': /klaviyo\.com/i,
  'Privy Popups': /privy\.com/i,
  'Gorgias Live Chat': /gorgias\.chat/i,
  'Recharge Subscriptions': /rechargeapps\.com|rechargepayments\.com/i,
  'Smile.io Rewards': /smile\.io/i,
  'Hotjar Analytics': /hotjar\.com/i,
  'Lucky Orange': /luckyorange\.com/i,
  'PageFly Page Builder': /pagefly\.io/i,
  'Shogun Page Builder': /getshogun\.com/i,
  'Omnisend': /omnisend\.com/i,
  'GoKwik Checkout': /gokwik\.co/i,
  'Shopify Inbox': /shopify\.com\/shopify-chat/i,
};

export async function crawlShopifyStore(baseUrl: string): Promise<CrawlStoreResult> {
  const startTime = Date.now();

  // 1. Initial discovery of pages using Cheerio & fast fetch
  const initialResp = await fetch(baseUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StoreDoctor/1.0',
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!initialResp.ok) {
    throw new Error(`We could not open ${baseUrl} (HTTP ${initialResp.status}). Check the address, or the store may be password-protected.`);
  }

  const homeHtml = await initialResp.text();
  const responseTimeMs = Date.now() - startTime;
  const $home = cheerio.load(homeHtml);

  // Discover candidate collection and product links
  const discoveredCollections: string[] = [];
  const discoveredProducts: string[] = [];

  $home('a[href]').each((_, el) => {
    const href = $home(el).attr('href');
    if (!href) return;
    try {
      const fullUrl = new URL(href, baseUrl).toString();
      if (!fullUrl.startsWith(baseUrl)) return;

      if (fullUrl.includes('/collections/') && !fullUrl.includes('/products/')) {
        if (!discoveredCollections.includes(fullUrl) && discoveredCollections.length < 3) {
          discoveredCollections.push(fullUrl);
        }
      } else if (fullUrl.includes('/products/')) {
        if (!discoveredProducts.includes(fullUrl) && discoveredProducts.length < 4) {
          discoveredProducts.push(fullUrl);
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  const collectionUrl = discoveredCollections[0] || `${baseUrl.replace(/\/$/, '')}/collections/all`;
  const product1Url = discoveredProducts[0] || `${baseUrl.replace(/\/$/, '')}/products`;
  const product2Url = discoveredProducts[1] || product1Url;
  const cartUrl = `${baseUrl.replace(/\/$/, '')}/cart`;

  const detectedAppsSet = new Set<string>();

  // 2. Parse pages for in-depth CRO rules
  const pages: CrawlPageResult[] = [];

  // Parse Homepage
  const homeParsed = parsePageHtml(homeHtml, baseUrl, 'homepage');
  pages.push(homeParsed);
  homeParsed.shopifyAppsDetected.forEach((app) => detectedAppsSet.add(app));

  // Parse Collection Page
  try {
    const colResp = await fetch(collectionUrl, { headers: { 'User-Agent': 'StoreDoctor/1.0' } });
    if (colResp.ok) {
      const colHtml = await colResp.text();
      const colParsed = parsePageHtml(colHtml, collectionUrl, 'collection');
      pages.push(colParsed);
      colParsed.shopifyAppsDetected.forEach((app) => detectedAppsSet.add(app));
    }
  } catch (e) {
    console.warn('Failed fetching collection:', e);
  }

  // Parse Product Page 1
  try {
    const p1Resp = await fetch(product1Url, { headers: { 'User-Agent': 'StoreDoctor/1.0' } });
    if (p1Resp.ok) {
      const p1Html = await p1Resp.text();
      const p1Parsed = parsePageHtml(p1Html, product1Url, 'product');
      pages.push(p1Parsed);
      p1Parsed.shopifyAppsDetected.forEach((app) => detectedAppsSet.add(app));
    }
  } catch (e) {
    console.warn('Failed fetching product 1:', e);
  }

  // Parse Cart Page
  try {
    const cartResp = await fetch(cartUrl, { headers: { 'User-Agent': 'StoreDoctor/1.0' } });
    if (cartResp.ok) {
      const cartHtml = await cartResp.text();
      const cartParsed = parsePageHtml(cartHtml, cartUrl, 'cart');
      pages.push(cartParsed);
      cartParsed.shopifyAppsDetected.forEach((app) => detectedAppsSet.add(app));
    }
  } catch (e) {
    console.warn('Failed fetching cart:', e);
  }

  const hostname = new URL(baseUrl).hostname.replace(/^www\./, '');
  const storeName = $home('meta[property="og:site_name"]').attr('content') ||
    $home('title').text().split(/[-|]/)[0].trim() ||
    hostname.split('.')[0].toUpperCase();

  return {
    targetUrl: baseUrl,
    storeName,
    productUrl: discoveredProducts[0] || null,
    pages,
    detectedApps: Array.from(detectedAppsSet),
    crawlStats: {
      scriptCount: homeParsed.scriptsCount,
      imageCount: homeParsed.imageCount,
      htmlSizeBytes: Buffer.byteLength(homeHtml, 'utf8'),
      responseTimeMs,
    },
  };
}

function parsePageHtml(
  html: string,
  url: string,
  type: 'homepage' | 'collection' | 'product' | 'cart',
  screenshotDesktop?: string,
  screenshotMobile?: string
): CrawlPageResult {
  const $ = cheerio.load(html);
  const textContent = $('body').text().toLowerCase();

  const title = $('title').text().trim() || '';
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';

  const h1: string[] = [];
  $('h1').each((_, el) => {
    const txt = $(el).text().trim();
    if (txt) h1.push(txt);
  });

  const h2: string[] = [];
  $('h2').each((_, el) => {
    const txt = $(el).text().trim();
    if (txt && h2.length < 8) h2.push(txt);
  });

  // Images & Alt tags
  const images = $('img');
  const imageCount = images.length;
  let imagesWithoutAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim().length === 0) {
      imagesWithoutAlt++;
    }
  });

  // Scripts
  const scripts = $('script');
  const scriptsList: string[] = [];
  scripts.each((_, el) => {
    const src = $(el).attr('src');
    if (src) scriptsList.push(src);
  });

  // Shopify Apps Detection
  const shopifyAppsDetected: string[] = [];
  const scriptSrcs = scriptsList.join(' ');
  for (const [appName, pattern] of Object.entries(KNOWN_SHOPIFY_APPS)) {
    if (pattern.test(scriptSrcs) || pattern.test(html)) {
      shopifyAppsDetected.push(appName);
    }
  }

  // Trust & Signals
  const hasReviews =
    shopifyAppsDetected.some((app) => app.includes('Reviews')) ||
    $('.jdgm-widget, .loox-rating, .yotpo, .stamped-main-badge, [data-rating]').length > 0 ||
    /reviews|ratings|customer reviews|stars/i.test(textContent);

  const hasReturnPolicy =
    $('a[href*="return"], a[href*="refund"]').length > 0 ||
    /30[- ]day returns|easy return|free returns|refund policy/i.test(textContent);

  const hasShippingPolicy =
    $('a[href*="shipping"]').length > 0 ||
    /free shipping|delivery policy|express shipping/i.test(textContent);

  const hasPrivacyPolicy = $('a[href*="privacy"]').length > 0;
  const hasContactInfo =
    $('a[href*="contact"], a[href^="tel:"], a[href^="mailto:"]').length > 0 ||
    /support@|contact us|\+91|\+1|whatsapp/i.test(textContent);

  const hasAboutPage = $('a[href*="about"]').length > 0 || /our story|about us/i.test(textContent);

  const hasPaymentBadges =
    $('.payment-icons, .payment-methods, svg[class*="payment"], img[src*="visa"], img[src*="mastercard"], img[src*="upi"]').length > 0 ||
    /visa|mastercard|amex|upi|google pay|apple pay|razorpay|cash on delivery/i.test(textContent);

  const hasFreeShippingThreshold =
    /free shipping on orders over|free shipping above|free standard shipping/i.test(textContent);

  const hasCodMention =
    /cash on delivery|cod available|pay on delivery|cod verified/i.test(textContent);

  const hasFastCheckout =
    shopifyAppsDetected.includes('GoKwik Checkout') ||
    /shop pay|buy now with 1-click|razorpay magic|fastrr/i.test(html);

  // Product specific details
  let productDetails: CrawlPageResult['productDetails'];
  if (type === 'product') {
    const prodDesc = $('.product__description, .product-single__description, [data-product-description]').text().trim() ||
      $('article, main').text().trim();

    const hasSizeGuide = $('a[href*="size"], button:contains("Size"), [data-size-chart]').length > 0 ||
      /size chart|size guide|dimensions/i.test(textContent);

    const hasStickyAddToCart =
      $('[class*="sticky-cart"], [class*="sticky-atc"], [id*="sticky-cart"]').length > 0 ||
      /sticky/i.test(html);

    const hasUrgencyIndicators =
      /only [0-9]+ left|in high demand|selling fast|hurry/i.test(textContent);

    const hasShippingNearAtc =
      /ships in|delivery by|dispatched within/i.test(textContent);

    const hasReviewsNearTitle =
      $('.jdgm-preview-badge, .loox-rating, .yotpo-bottomline').length > 0;

    productDetails = {
      imageCount: $('img[src*="/products/"], .product-gallery img').length || imageCount,
      hasSizeGuide,
      hasStickyAddToCart,
      hasUrgencyIndicators,
      hasShippingNearAtc,
      hasReviewsNearTitle,
      descriptionLength: prodDesc.length,
    };
  }

  // Cart specific details
  let cartDetails: CrawlPageResult['cartDetails'];
  if (type === 'cart') {
    cartDetails = {
      hasFreeShippingBar: /free shipping/i.test(textContent),
      hasTrustBadges: hasPaymentBadges,
      hasCheckoutButton: $('button[name="checkout"], input[name="checkout"], a[href*="checkout"]').length > 0,
    };
  }

  return {
    url,
    type,
    title,
    metaDescription,
    h1,
    h2,
    html: html.slice(0, 150000), // capped for memory safety
    screenshotDesktop,
    screenshotMobile,
    imageCount,
    imagesWithoutAlt,
    scriptsCount: scripts.length,
    scriptsList: scriptsList.slice(0, 50),
    shopifyAppsDetected,
    trustSignals: {
      hasReviews,
      hasPolicies: hasReturnPolicy && hasShippingPolicy && hasPrivacyPolicy,
      hasReturnPolicy,
      hasShippingPolicy,
      hasPrivacyPolicy,
      hasContactInfo,
      hasAboutPage,
      hasPaymentBadges,
      hasFreeShippingThreshold,
      hasCodMention,
      hasFastCheckout,
    },
    productDetails,
    cartDetails,
  };
}
