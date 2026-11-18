import { prisma } from './db';

const MAX_FREE_AUDITS_PER_DAY = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

export async function checkRateLimit(identifier: string, isPaid = false): Promise<RateLimitResult> {
  if (isPaid) {
    return {
      allowed: true,
      remaining: 999,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    };
  }

  const key = `ratelimit:${identifier.toLowerCase().trim()}`;
  const now = new Date();

  const record = await prisma.rateLimit.findUnique({
    where: { key },
  });

  if (!record) {
    const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);
    await prisma.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt,
      },
    });

    return {
      allowed: true,
      remaining: MAX_FREE_AUDITS_PER_DAY - 1,
      resetAt,
    };
  }

  // If window expired, reset
  if (now > record.resetAt) {
    const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        resetAt,
      },
    });

    return {
      allowed: true,
      remaining: MAX_FREE_AUDITS_PER_DAY - 1,
      resetAt,
    };
  }

  if (record.count >= MAX_FREE_AUDITS_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      reason: `Rate limit reached (${MAX_FREE_AUDITS_PER_DAY} audits/24h). Please upgrade or try again later.`,
    };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: {
      count: { increment: 1 },
    },
  });

  return {
    allowed: true,
    remaining: MAX_FREE_AUDITS_PER_DAY - (record.count + 1),
    resetAt: record.resetAt,
  };
}
