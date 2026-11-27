import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPayment, getPayment } from '@/lib/billing';

export const dynamic = 'force-dynamic';

/**
 * Dodo sends the buyer here after checkout with ?payment_id=…&status=…. The query can't be trusted,
 * so the payment is re-read from Dodo. The webhook does the same; whichever runs first fulfils it.
 */
export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams;
  const base = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const orderId = q.get('order') || '';
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { auditId: true } });
  if (!order) return NextResponse.redirect(`${base}/`, 303);

  const paymentId = q.get('payment_id');
  let flag = 'pending=1';
  if (paymentId) {
    try {
      const result = await fulfillPayment(await getPayment(paymentId), orderId);
      if (result !== 'ignored') flag = 'paid=1';
    } catch (e) {
      console.error('checkout return failed', e);
    }
  }
  return NextResponse.redirect(`${base}/audit/${order.auditId}?${flag}`, 303);
}
