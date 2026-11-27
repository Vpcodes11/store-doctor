/**
 * Google PageSpeed Insights (Lighthouse) results. Every number here is measured by PageSpeed;
 * when PageSpeed can't test a page, the result is null and the report says speed data is
 * unavailable. Nothing is estimated.
 */
export interface CoreWebVitals {
  performanceScore: number; // 0-100, Lighthouse mobile performance score
  fcp: number; // seconds
  lcp: number; // seconds
  cls: number;
  tbt: number; // ms
  speedIndex: number; // seconds
  totalByteWeight: number; // bytes
  scriptByteWeight: number | null;
  imageByteWeight: number | null;
  thirdPartyScriptsCount: number | null; // distinct third-party entities that loaded resources
}

export interface PageSpeedRun {
  vitals: CoreWebVitals | null;
  /** data:image/jpeg;base64,… screenshot of the page as Lighthouse rendered it */
  screenshot: string | null;
}

const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function runPageSpeed(targetUrl: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedRun> {
  const params = new URLSearchParams({ url: targetUrl, strategy, category: 'performance' });
  if (process.env.PAGESPEED_API_KEY) params.set('key', process.env.PAGESPEED_API_KEY);
  try {
    const res = await fetch(`${PSI}?${params}`, { cache: 'no-store', signal: AbortSignal.timeout(90_000) });
    if (!res.ok) {
      console.warn(`PageSpeed ${strategy} ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return { vitals: null, screenshot: null };
    }
    return parsePageSpeed(await res.json());
  } catch (err) {
    console.warn(`PageSpeed ${strategy} failed:`, (err as Error).message);
    return { vitals: null, screenshot: null };
  }
}

export function parsePageSpeed(data: any): PageSpeedRun {
  const lh = data?.lighthouseResult;
  const audits = lh?.audits || {};
  const shot = audits['final-screenshot']?.details?.data;
  const screenshot = typeof shot === 'string' && shot.startsWith('data:image/') ? shot : null;

  const num = (id: string) => {
    const v = audits[id]?.numericValue;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  const score = lh?.categories?.performance?.score;
  const fcp = num('first-contentful-paint');
  const lcp = num('largest-contentful-paint');
  const cls = num('cumulative-layout-shift');
  const tbt = num('total-blocking-time');
  const si = num('speed-index');
  const bytes = num('total-byte-weight');
  // Without the core metrics there is nothing trustworthy to report.
  if (typeof score !== 'number' || fcp === null || lcp === null || cls === null || tbt === null || si === null || bytes === null) {
    return { vitals: null, screenshot };
  }

  const summary: Array<{ resourceType?: string; transferSize?: number }> = audits['resource-summary']?.details?.items || [];
  const sizeOf = (type: string) => {
    const item = summary.find((i) => i.resourceType === type);
    return typeof item?.transferSize === 'number' ? Math.round(item.transferSize) : null;
  };
  const thirdParty = audits['third-party-summary']?.details?.items;

  return {
    screenshot,
    vitals: {
      performanceScore: Math.round(score * 100),
      fcp: round(fcp / 1000, 2),
      lcp: round(lcp / 1000, 2),
      cls: round(cls, 3),
      tbt: Math.round(tbt),
      speedIndex: round(si / 1000, 2),
      totalByteWeight: Math.round(bytes),
      scriptByteWeight: sizeOf('script'),
      imageByteWeight: sizeOf('image'),
      thirdPartyScriptsCount: Array.isArray(thirdParty) ? thirdParty.length : null,
    },
  };
}

const round = (n: number, d: number) => Number(n.toFixed(d));

/**
 * Homepage on mobile (the metrics + mobile screenshot), homepage on desktop (desktop screenshot)
 * and the first product page on mobile (product screenshot), all in parallel.
 */
export async function fetchPageSpeedMetrics(homeUrl: string, productUrl?: string | null) {
  const [mobile, desktop, product] = await Promise.all([
    runPageSpeed(homeUrl, 'mobile'),
    runPageSpeed(homeUrl, 'desktop'),
    productUrl ? runPageSpeed(productUrl, 'mobile') : Promise.resolve<PageSpeedRun>({ vitals: null, screenshot: null }),
  ]);
  return {
    vitals: mobile.vitals,
    mobileShot: mobile.screenshot,
    desktopShot: desktop.screenshot,
    productShot: product.screenshot,
  };
}
