import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAuditPdf } from '@/lib/pdf-generator';
import { AuditAnalysisResult } from '@/lib/analyzer';
import { AICopyAnalysis } from '@/lib/ai-service';

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
    // The PDF contains every finding's fix steps: paid audits only.
    if (!audit.paid) {
      return NextResponse.json({ error: 'The PDF report is included with the Full Report.' }, { status: 402 });
    }

    const categoryScores = JSON.parse(audit.categoryScores || '{}');
    const heroRewrites = audit.heroRewrites ? JSON.parse(audit.heroRewrites) : null;
    const productRewrites = audit.productRewrites ? JSON.parse(audit.productRewrites) : null;

    const parsedFindings = audit.findings.map((f) => ({
      id: f.id,
      category: f.category,
      severity: f.severity as any,
      impact: f.impact,
      ease: f.ease,
      priorityScore: f.priorityScore,
      title: f.title,
      explanation: f.explanation,
      fixSteps: JSON.parse(f.fixSteps || '[]'),
      screenshotBox: JSON.parse(f.screenshotBox || '{}'),
      pageType: f.pageType as any,
    }));

    const analysis: AuditAnalysisResult = {
      overallScore: audit.score,
      grade: audit.grade,
      categoryScores,
      topIssues: parsedFindings.slice(0, 10),
      allFindings: parsedFindings,
    };

    let aiCopy: AICopyAnalysis | undefined;
    if (heroRewrites && productRewrites) {
      aiCopy = {
        heroRewrites,
        productRewrite: productRewrites,
        croPsychologyNotes: [],
      };
    }

    const pdfBuffer = generateAuditPdf(audit.url, audit.storeName, analysis, aiCopy);

    const safeFilename = `StoreDoctor_${audit.storeName.replace(/[^a-zA-Z0-9]/g, '_')}_Audit.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 });
  }
}
