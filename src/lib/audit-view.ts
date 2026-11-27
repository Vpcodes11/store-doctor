import type { Audit, Finding } from '@prisma/client';

/** Free audits show this many findings in full; the rest are titles only until paid. */
export const FREE_FINDINGS = 3;

/**
 * What the browser may see. Unpaid audits keep every finding's title and severity (so the merchant
 * sees what's wrong) but lose the explanation and fix steps beyond the first few, and the AI copy.
 */
export function toAuditView(audit: Audit & { findings: Finding[] }) {
  const findings = audit.findings.map((f, i) => {
    const locked = !audit.paid && i >= FREE_FINDINGS;
    return {
      id: f.id,
      category: f.category,
      severity: f.severity,
      impact: f.impact,
      ease: f.ease,
      priorityScore: f.priorityScore,
      title: f.title,
      explanation: locked ? '' : f.explanation,
      fixSteps: locked ? [] : safeJson(f.fixSteps, []),
      screenshotBox: safeJson(f.screenshotBox, {}),
      pageType: f.pageType,
      locked,
    };
  });
  return {
    id: audit.id,
    url: audit.url,
    storeName: audit.storeName,
    score: audit.score,
    grade: audit.grade,
    desktopShot: audit.desktopShot,
    mobileShot: audit.mobileShot,
    productShot: audit.productShot,
    paid: audit.paid,
    psiData: safeJson(audit.psiData, null),
    categoryScores: safeJson(audit.categoryScores, {}),
    heroRewrites: audit.paid ? safeJson(audit.heroRewrites, null) : null,
    productRewrites: audit.paid ? safeJson(audit.productRewrites, null) : null,
    topIssues: findings.slice(0, 10),
    allFindings: findings,
    createdAt: audit.createdAt,
  };
}

export function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
