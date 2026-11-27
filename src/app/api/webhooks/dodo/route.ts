import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPayment, verifyWebhook, type DodoPayment } from '@/lib/billing';

export const dynamic = 'force-dynamic';

/** Dodo Payments webhook (Standard Webhooks signatures). Subscribe it to payment.succeeded. */
export async function POST(req: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 500 });
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers, secret)) return NextResponse.json({ error: 'bad signature' }, { status: 401 });

  const webhookId = req.headers.get('webhook-id') || '';
  if (webhookId && (await prisma.webhookEvent.findUnique({ where: { id: webhookId } }))) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  const event = JSON.parse(raw) as { type?: string; data?: DodoPayment };
  const outcome = event.type === 'payment.succeeded' && event.data ? await fulfillPayment(event.data) : 'ignored';
  if (webhookId) await prisma.webhookEvent.create({ data: { id: webhookId, type: event.type || 'unknown' } }).catch(() => {});
  return NextResponse.json({ received: true, outcome });
}
