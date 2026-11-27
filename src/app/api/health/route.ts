import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health                  -> { ok, database }  (public)
 * GET /api/health?key=<HEALTH_KEY> -> every setting, present / missing (never the values)
 */
export async function GET(req: Request) {
  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (e) {
    console.error('health: database', e);
  }
  const secret = process.env.HEALTH_KEY;
  if (!secret || new URL(req.url).searchParams.get('key') !== secret) {
    return NextResponse.json({ ok: database, database }, { status: database ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const has = (n: string) => Boolean(process.env[n]);
  const checks: Record<string, { ok: boolean; note?: string }> = {
    database: { ok: database },
    NEXT_PUBLIC_APP_URL: { ok: (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https://') },
    PAGESPEED_API_KEY: { ok: has('PAGESPEED_API_KEY'), note: 'Without it Google allows very few tests per day' },
    GEMINI_API_KEY: { ok: has('GEMINI_API_KEY'), note: 'Optional: AI copy suggestions' },
    ADMIN_PASSWORD: { ok: (process.env.ADMIN_PASSWORD || '').length >= 12, note: 'At least 12 characters' },
    DODO_PAYMENTS_API_KEY: { ok: has('DODO_PAYMENTS_API_KEY') },
    DODO_PAYMENTS_WEBHOOK_KEY: { ok: has('DODO_PAYMENTS_WEBHOOK_KEY') },
    DODO_PAYMENTS_ENVIRONMENT: { ok: true, note: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'LIVE' : 'test mode' },
    DODO_PRODUCT_FULL_REPORT_USD: { ok: has('DODO_PRODUCT_FULL_REPORT_USD') },
    DODO_PRODUCT_FIX_PACK_USD: { ok: has('DODO_PRODUCT_FIX_PACK_USD') },
  };
  const ready = Object.entries(checks).every(([k, c]) => c.ok || k === 'GEMINI_API_KEY');
  return NextResponse.json({ ready, checks }, { headers: { 'Cache-Control': 'no-store' } });
}
