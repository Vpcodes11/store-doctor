import { prisma } from './db';
export { verifyWebhook } from './webhook-signature';

/**
 * Dodo Payments (merchant of record: charges in USD/INR, handles GST/VAT, pays out to you).
 * One-time products created in the Dodo dashboard; their IDs go in env vars:
 *   DODO_PRODUCT_FULL_REPORT_USD / _INR   ($29 / ₹1,999)
 *   DODO_PRODUCT_FIX_PACK_USD / _INR      ($149 / ₹9,999)
 * The _INR ones are optional (Indian buyers then get the USD product).
 */

export type ProductType = 'full_report' | 'fix_pack';
export type Currency = 'USD' | 'INR';

export const PRICES: Record<ProductType, Record<Currency, number>> = {
  full_report: { USD: 29, INR: 1999 },
  fix_pack: { USD: 149, INR: 9999 },
};

const apiBase = () =>
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

export const billingEnabled = () => Boolean(process.env.DODO_PAYMENTS_API_KEY);

export function productId(type: ProductType, currency: Currency): string | undefined {
  const k = type.toUpperCase();
  return (currency === 'INR' ? process.env[`DODO_PRODUCT_${k}_INR`] : undefined) || process.env[`DODO_PRODUCT_${k}_USD`] || undefined;
}

async function dodo<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`, ...init.headers },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Dodo ${init.method ?? 'GET'} ${path} failed: ${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`);
  return (await res.json()) as T;
}

export type DodoPayment = {
  payment_id: string;
  status?: string | null; // succeeded | failed | cancelled | processing | requires_* ...
  customer: { customer_id: string; email: string; name?: string };
  metadata?: Record<string, string | number | boolean>;
  total_amount?: number;
  currency?: string;
};

export async function createCheckout(opts: { productId: string; email: string; name?: string | null; orderId: string; returnUrl: string }) {
  const res = await dodo<{ session_id: string; checkout_url: string }>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      product_cart: [{ product_id: opts.productId, quantity: 1 }],
      customer: { email: opts.email, ...(opts.name ? { name: opts.name } : {}) },
      metadata: { order_id: opts.orderId },
      return_url: opts.returnUrl,
    }),
  });
  return res.checkout_url;
}

export const getPayment = (id: string) => dodo<DodoPayment>(`/payments/${encodeURIComponent(id)}`);

/**
 * Marks the order paid and unlocks the audit. A Fix Pack also opens the fix queue with the top 10
 * findings. Safe to call twice (the return redirect and the webhook both call it).
 */
export async function fulfillPayment(payment: DodoPayment, expectedOrderId?: string): Promise<'fulfilled' | 'already' | 'ignored'> {
  if (payment.status !== 'succeeded') return 'ignored';
  const orderId = payment.metadata?.order_id ? String(payment.metadata.order_id) : null;
  if (!orderId || (expectedOrderId && orderId !== expectedOrderId)) return 'ignored';

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return 'ignored';
  if (order.status === 'completed') return 'already';

  try {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: 'pending' },
        data: { status: 'completed', paymentId: payment.payment_id, paymentMethod: 'dodo' },
      });
      if (claimed.count !== 1) throw new AlreadyFulfilled();
      await tx.audit.update({ where: { id: order.auditId }, data: { paid: true, email: order.email } });

      if (order.productType === 'fix_pack') {
        const audit = await tx.audit.findUniqueOrThrow({
          where: { id: order.auditId },
          include: { findings: { orderBy: { priorityScore: 'desc' }, take: 10 } },
        });
        const fixOrder = await tx.fixOrder.create({
          data: {
            auditId: order.auditId,
            customerEmail: order.email,
            customerName: order.customerName,
            storeUrl: audit.url,
            collaboratorCode: order.collaboratorCode,
            packageType: 'fix_pack',
            amountPaid: order.amount,
            currency: order.currency,
            status: 'pending',
            notes: order.notes || 'Standard 10-point CRO implementation pack',
          },
        });
        for (const finding of audit.findings) {
          await tx.fixTask.create({
            data: {
              fixOrderId: fixOrder.id,
              findingId: finding.id,
              title: finding.title,
              category: finding.category,
              impact: finding.impact,
              ease: finding.ease,
              status: 'pending',
            },
          });
        }
      }
    });
  } catch (e) {
    if (e instanceof AlreadyFulfilled || (e as { code?: string }).code === 'P2002') return 'already';
    throw e;
  }
  return 'fulfilled';
}

class AlreadyFulfilled extends Error {}
