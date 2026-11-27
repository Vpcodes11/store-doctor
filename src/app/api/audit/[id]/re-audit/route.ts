import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { crawlShopifyStore } from '@/lib/crawler';
import { fetchPageSpeedMetrics } from '@/lib/psi';
import { analyzeShopifyStore } from '@/lib/analyzer';
import { checkRateLimit } from '@/lib/ratelimit';
import { safeJson } from '@/lib/audit-view';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;

/**
 * Re-runs the same checks on the live store (paid audits, a few times a day) and reports the
 * measured result: the new score, and which earlier findings no longer appear. Fix tasks are not
 * touched; mark them done in the admin queue when the work is actually finished.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const previous = await prisma.audit.findUnique({ where: { id: params.id }, include: { findings: true } });
    if (!previous) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    if (!previous.paid) return NextResponse.json({ error: 'Re-audits are included with the Full Report.' }, { status: 402 });
    const limit = await checkRateLimit(`reaudit:${previous.id}`);
    if (!limit.allowed) return NextResponse.json({ error: 'You have used today\'s re-audits for this store. Try again tomorrow.' }, { status: 429 });

    const crawl = await crawlShopifyStore(previous.url);
    const speed = await fetchPageSpeedMetrics(previous.url, crawl.productUrl);
    const now = analyzeShopifyStore(crawl, speed.vitals);

    const stillFound = new Set(now.allFindings.map((f) => f.title));
    const resolved = previous.findings.filter((f) => !stillFound.has(f.title)).map((f) => f.title);
    const newIssues = now.allFindings.filter((f) => !previous.findings.some((p) => p.title === f.title)).map((f) => f.title);

    await prisma.audit.update({
      where: { id: previous.id },
      data: {
        score: now.overallScore,
        grade: now.grade,
        categoryScores: JSON.stringify(now.categoryScores),
        psiData: JSON.stringify(speed.vitals),
        desktopShot: speed.desktopShot ?? previous.desktopShot,
        mobileShot: speed.mobileShot ?? previous.mobileShot,
        productShot: speed.productShot ?? previous.productShot,
      },
    });

    return NextResponse.json({
      success: true,
      storeName: previous.storeName,
      url: previous.url,
      before: { score: previous.score, grade: previous.grade, categoryScores: safeJson(previous.categoryScores, {}) },
      after: { score: now.overallScore, grade: now.grade, categoryScores: now.categoryScores },
      scoreGain: now.overallScore - previous.score,
      resolvedIssuesCount: resolved.length,
      resolvedIssues: resolved,
      newIssues,
      message: `Re-audit complete: ${previous.score} (${previous.grade}) → ${now.overallScore} (${now.grade}). ${resolved.length} earlier findings no longer appear.`,
    });
  } catch (error) {
    console.error('Re-audit failed:', error);
    return NextResponse.json({ error: 'Re-audit failed. Please try again.' }, { status: 500 });
  }
}
