import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { billingEnabled, createCheckout, PRICES, productId, type Currency, type ProductType } from '@/lib/billing';

export const dynamic = 'force-dynamic';

/** Creates a pending order and returns the Dodo checkout URL. Access unlocks only after payment succeeds. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { auditId, productType, email, customerName, collaboratorCode, notes } = body as Record<string, string | undefined>;
    const currency: Currency = body.currency === 'INR' ? 'INR' : 'USD';

    if (!auditId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (productType !== 'full_report' && productType !== 'fix_pack') {
      return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
    }
    const type = productType as ProductType;
    const pid = productId(type, currency);
    if (!billingEnabled() || !pid) {
      return NextResponse.json({ error: 'Payments are not available yet. Please try again soon.' }, { status: 503 });
    }

    const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { id: true } });
    if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

    const order = await prisma.order.create({
      data: {
        auditId,
        email: email.trim().toLowerCase(),
        productType: type,
        amount: PRICES[type][currency],
        currency,
        status: 'pending',
        customerName: customerName?.slice(0, 120) || null,
        collaboratorCode: collaboratorCode?.slice(0, 120) || null,
        notes: notes?.slice(0, 2000) || null,
      },
    });

    const base = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const checkoutUrl = await createCheckout({
      productId: pid,
      email: order.email,
      name: order.customerName,
      orderId: order.id,
      returnUrl: `${base}/api/checkout/return?order=${order.id}`,
    });
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'We could not open the checkout. Please try again.' }, { status: 500 });
  }
}
