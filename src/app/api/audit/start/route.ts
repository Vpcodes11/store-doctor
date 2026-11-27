import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizeUrl, extractStoreName } from '@/lib/url-utils';
import { checkRateLimit } from '@/lib/ratelimit';
import { crawlShopifyStore } from '@/lib/crawler';
import { fetchPageSpeedMetrics } from '@/lib/psi';
import { analyzeShopifyStore } from '@/lib/analyzer';
import { generateAICopyRewrites } from '@/lib/ai-service';

export const dynamic = 'force-dynamic';
// PageSpeed runs three Lighthouse tests in parallel (~20-60s) before the analysis.
export const maxDuration = 180;

/** Runs a full audit and returns its id; the audit page loads it through GET /api/audit/:id. */
export async function POST(req: NextRequest) {
  let auditId: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const { url, email, forceRefresh } = body as { url?: string; email?: string; forceRefresh?: boolean };
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid Shopify store URL.' }, { status: 400 });
    }

    let normalized;
    try {
      normalized = normalizeUrl(url);
    } catch {
      return NextResponse.json({ error: 'Please provide a valid Shopify store URL.' }, { status: 400 });
    }
    const { url: cleanUrl, canonical, hostname } = normalized;
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';

    // Same store audited in the last 24h: reuse it.
    if (!forceRefresh) {
      const cached = await prisma.audit.findFirst({
        where: { canonicalUrl: canonical, createdAt: { gte: new Date(Date.now() - 24 * 3600_000) }, score: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (cached) return NextResponse.json({ auditId: cached.id, cached: true });
    }

    // Limit by IP (a typed email is not proof of anything).
    const rateCheck = await checkRateLimit(`ip:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.reason, rateLimitExceeded: true, resetAt: rateCheck.resetAt }, { status: 429 });
    }

    const auditRecord = await prisma.audit.create({
      data: {
        url: cleanUrl,
        canonicalUrl: canonical,
        storeName: extractStoreName(hostname),
        ipAddress: ip,
        email: typeof email === 'string' && email.includes('@') ? email.trim().slice(0, 254) : null,
      },
    });
    auditId = auditRecord.id;

    // 1. Read the store's pages (HTML only).
    const crawlResult = await crawlShopifyStore(cleanUrl);
    // 2. Measured speed data + real screenshots from PageSpeed Insights.
    const speed = await fetchPageSpeedMetrics(cleanUrl, crawlResult.productUrl);
    crawlResult.desktopScreenshot = speed.desktopShot;
    crawlResult.mobileScreenshot = speed.mobileShot;
    crawlResult.productMobileScreenshot = speed.productShot;
    // 3. Rule checks.
    const analysis = analyzeShopifyStore(crawlResult, speed.vitals);
    // 4. AI copy suggestions (none if AI is unavailable).
    const homePage = crawlResult.pages.find((p) => p.type === 'homepage');
    const prodPage = crawlResult.pages.find((p) => p.type === 'product');
    const aiCopy = await generateAICopyRewrites(crawlResult.storeName, homePage?.h1[0], undefined, prodPage?.title);

    await prisma.$transaction([
      ...analysis.allFindings.map((finding) =>
        prisma.finding.create({
          data: {
            auditId: auditId!,
            category: finding.category,
            severity: finding.severity,
            impact: finding.impact,
            ease: finding.ease,
            priorityScore: finding.priorityScore,
            title: finding.title,
            explanation: finding.explanation,
            fixSteps: JSON.stringify(finding.fixSteps),
            screenshotBox: JSON.stringify(finding.screenshotBox),
            pageType: finding.pageType,
          },
        }),
      ),
      prisma.audit.update({
        where: { id: auditId },
        data: {
          storeName: crawlResult.storeName,
          score: analysis.overallScore,
          grade: analysis.grade,
          desktopShot: speed.desktopShot,
          mobileShot: speed.mobileShot,
          productShot: speed.productShot,
          psiData: JSON.stringify(speed.vitals),
          findingsData: JSON.stringify(analysis.allFindings.map((f) => f.title)),
          categoryScores: JSON.stringify(analysis.categoryScores),
          heroRewrites: aiCopy ? JSON.stringify(aiCopy.heroRewrites) : null,
          productRewrites: aiCopy ? JSON.stringify(aiCopy.productRewrite) : null,
        },
      }),
    ]);

    return NextResponse.json({ auditId, cached: false });
  } catch (error) {
    console.error('Audit generation failed:', error);
    // Don't leave a half-finished audit that the 24h cache would serve.
    if (auditId) await prisma.audit.delete({ where: { id: auditId } }).catch(() => {});
    const message = error instanceof Error && error.message.startsWith('We could not open') ? error.message : 'Failed to complete the store audit. Please check the URL and try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
