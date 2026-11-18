import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizeUrl, extractStoreName } from '@/lib/url-utils';
import { checkRateLimit } from '@/lib/ratelimit';
import { crawlShopifyStore } from '@/lib/crawler';
import { fetchPageSpeedMetrics } from '@/lib/psi';
import { analyzeShopifyStore } from '@/lib/analyzer';
import { generateAICopyRewrites } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, email, forceRefresh } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid Shopify store URL.' }, { status: 400 });
    }

    const { url: cleanUrl, canonical, hostname } = normalizeUrl(url);

    // IP address extraction
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const rateLimitIdentifier = email || ip;

    // Check 24-hour cache unless forced
    if (!forceRefresh) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const cached = await prisma.audit.findFirst({
        where: {
          canonicalUrl: canonical,
          createdAt: { gte: twentyFourHoursAgo },
        },
        include: {
          findings: {
            orderBy: { priorityScore: 'desc' },
          },
        },
      });

      if (cached) {
        return NextResponse.json({
          auditId: cached.id,
          cached: true,
          message: 'Retrieved 24h cached audit.',
          data: {
            id: cached.id,
            url: cached.url,
            storeName: cached.storeName,
            score: cached.score,
            grade: cached.grade,
            desktopShot: cached.desktopShot,
            mobileShot: cached.mobileShot,
            paid: cached.paid,
            psiData: JSON.parse(cached.psiData || '{}'),
            categoryScores: JSON.parse(cached.categoryScores || '{}'),
            topIssues: cached.findings.slice(0, 10),
            allFindings: cached.findings,
            heroRewrites: cached.heroRewrites ? JSON.parse(cached.heroRewrites) : null,
            productRewrites: cached.productRewrites ? JSON.parse(cached.productRewrites) : null,
            createdAt: cached.createdAt,
          },
        });
      }
    }

    // Rate limit check for fresh audit
    const rateCheck = await checkRateLimit(rateLimitIdentifier);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.reason,
          rateLimitExceeded: true,
          resetAt: rateCheck.resetAt,
        },
        { status: 429 }
      );
    }

    // Generate new Audit ID
    const auditRecord = await prisma.audit.create({
      data: {
        url: cleanUrl,
        canonicalUrl: canonical,
        storeName: extractStoreName(hostname),
        ipAddress: ip,
        email: email || null,
      },
    });

    const auditId = auditRecord.id;

    // 1. Crawl Store Pages and capture screenshots
    const crawlResult = await crawlShopifyStore(cleanUrl, auditId);

    // 2. Fetch Core Web Vitals via PageSpeed Insights API or telemetry
    const psiResult = await fetchPageSpeedMetrics(cleanUrl, crawlResult.crawlStats);

    // 3. Analyze Store with 35+ CRO rules
    const analysis = analyzeShopifyStore(crawlResult, psiResult);

    // 4. Generate AI Copy Rewrites (Hero & Product Page)
    const homePage = crawlResult.pages.find((p) => p.type === 'homepage');
    const prodPage = crawlResult.pages.find((p) => p.type === 'product');
    const aiCopy = await generateAICopyRewrites(
      crawlResult.storeName,
      homePage?.h1[0],
      undefined,
      prodPage?.title
    );

    // 5. Store findings in database
    await prisma.$transaction(
      analysis.allFindings.map((finding) =>
        prisma.finding.create({
          data: {
            auditId,
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
        })
      )
    );

    // 6. Update the Audit record
    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        storeName: crawlResult.storeName,
        score: analysis.overallScore,
        grade: analysis.grade,
        desktopShot: crawlResult.desktopScreenshot,
        mobileShot: crawlResult.mobileScreenshot,
        screenshots: JSON.stringify([
          crawlResult.desktopScreenshot,
          crawlResult.mobileScreenshot,
          crawlResult.productDesktopScreenshot,
          crawlResult.productMobileScreenshot,
        ].filter(Boolean)),
        psiData: JSON.stringify(psiResult),
        findingsData: JSON.stringify(analysis.allFindings),
        categoryScores: JSON.stringify(analysis.categoryScores),
        heroRewrites: JSON.stringify(aiCopy.heroRewrites),
        productRewrites: JSON.stringify(aiCopy.productRewrite),
      },
      include: {
        findings: {
          orderBy: { priorityScore: 'desc' },
        },
      },
    });

    return NextResponse.json({
      auditId,
      cached: false,
      data: {
        id: updatedAudit.id,
        url: updatedAudit.url,
        storeName: updatedAudit.storeName,
        score: updatedAudit.score,
        grade: updatedAudit.grade,
        desktopShot: updatedAudit.desktopShot,
        mobileShot: updatedAudit.mobileShot,
        paid: updatedAudit.paid,
        psiData: psiResult,
        categoryScores: analysis.categoryScores,
        revenueLeakageEstimate: analysis.revenueLeakageEstimate,
        topIssues: updatedAudit.findings.slice(0, 10).map((f) => ({
          ...f,
          fixSteps: JSON.parse(f.fixSteps || '[]'),
          screenshotBox: JSON.parse(f.screenshotBox || '{}'),
        })),
        allFindings: updatedAudit.findings.map((f) => ({
          ...f,
          fixSteps: JSON.parse(f.fixSteps || '[]'),
          screenshotBox: JSON.parse(f.screenshotBox || '{}'),
        })),
        heroRewrites: aiCopy.heroRewrites,
        productRewrites: aiCopy.productRewrite,
        createdAt: updatedAudit.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Audit generation failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete store audit. Please verify the URL and try again.' },
      { status: 500 }
    );
  }
}
