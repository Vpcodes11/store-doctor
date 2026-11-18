import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        findings: {
          orderBy: { priorityScore: 'desc' },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const psiData = JSON.parse(audit.psiData || '{}');
    const categoryScores = JSON.parse(audit.categoryScores || '{}');
    const heroRewrites = audit.heroRewrites ? JSON.parse(audit.heroRewrites) : null;
    const productRewrites = audit.productRewrites ? JSON.parse(audit.productRewrites) : null;

    const parsedFindings = audit.findings.map((f) => ({
      id: f.id,
      category: f.category,
      severity: f.severity,
      impact: f.impact,
      ease: f.ease,
      priorityScore: f.priorityScore,
      title: f.title,
      explanation: f.explanation,
      fixSteps: JSON.parse(f.fixSteps || '[]'),
      screenshotBox: JSON.parse(f.screenshotBox || '{}'),
      pageType: f.pageType,
    }));

    return NextResponse.json({
      audit: {
        id: audit.id,
        url: audit.url,
        storeName: audit.storeName,
        score: audit.score,
        grade: audit.grade,
        desktopShot: audit.desktopShot,
        mobileShot: audit.mobileShot,
        paid: audit.paid,
        psiData,
        categoryScores,
        heroRewrites: audit.paid ? heroRewrites : null,
        productRewrites: audit.paid ? productRewrites : null,
        topIssues: parsedFindings.slice(0, 10),
        allFindings: parsedFindings,
        createdAt: audit.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error fetching audit' }, { status: 500 });
  }
}
