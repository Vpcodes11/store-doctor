import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toAuditView } from '@/lib/audit-view';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const audit = await prisma.audit.findUnique({
    where: { id: params.id },
    include: { findings: { orderBy: { priorityScore: 'desc' } } },
  });
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  return NextResponse.json({ audit: toAuditView(audit) }, { headers: { 'Cache-Control': 'no-store' } });
}
