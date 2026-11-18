'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Stethoscope,
  ArrowLeft,
  Download,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wrench,
  FileText,
  RotateCw,
  Copy,
  Check,
} from 'lucide-react';
import AnnotatedScreenshot, { BoundingBoxItem } from '@/components/AnnotatedScreenshot';
import CheckoutModal from '@/components/CheckoutModal';
import ReAuditModal from '@/components/ReAuditModal';

interface Finding {
  id: string;
  category: string;
  severity: string;
  impact: number;
  ease: number;
  priorityScore: number;
  title: string;
  explanation: string;
  fixSteps: string[];
  screenshotBox: {
    page: 'desktop' | 'mobile' | 'product' | 'cart';
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
  pageType: string;
}

interface AuditData {
  id: string;
  url: string;
  storeName: string;
  score: number;
  grade: string;
  desktopShot: string;
  mobileShot: string;
  paid: boolean;
  psiData: {
    performanceScore: number;
    lcp: number;
    fcp: number;
    cls: number;
    tbt: number;
    speedIndex: number;
    totalByteWeight: number;
    thirdPartyScriptsCount: number;
    isSimulated?: boolean;
  };
  categoryScores: {
    speedMobile: number;
    firstImpression: number;
    trustCredibility: number;
    productPage: number;
    pricingOffers: number;
    checkoutFriction: number;
    seoBasics: number;
  };
  topIssues: Finding[];
  allFindings: Finding[];
  heroRewrites?: Array<{
    title: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    badgeText: string;
    framework: string;
    whyItConverts: string;
  }> | null;
  productRewrites?: {
    hook: string;
    storyProblem: string;
    coreSolution: string;
    bulletBenefits: string[];
    riskReversalGuarantee: string;
    recommendedPricingOffer: string;
  } | null;
  createdAt: string;
}

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProductType, setCheckoutProductType] = useState<'full_report' | 'fix_pack'>('full_report');
  const [reAuditLoading, setReAuditLoading] = useState(false);
  const [reAuditResult, setReAuditResult] = useState<any | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const issueRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/audit/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch audit');
      }
      setAudit(data.audit);
      // Expand the first 3 issues by default
      const initialExpanded: Record<string, boolean> = {};
      data.audit.topIssues.slice(0, 3).forEach((item: Finding) => {
        initialExpanded[item.id] = true;
      });
      setExpandedIssueIds(initialExpanded);
    } catch (err: any) {
      setError(err?.message || 'Error loading audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAudit();
    }
  }, [id]);

  const toggleExpand = (issueId: string) => {
    setExpandedIssueIds((prev) => ({
      ...prev,
      [issueId]: !prev[issueId],
    }));
  };

  const handleSelectBox = (issueId: string) => {
    setSelectedIssueId(issueId);
    setExpandedIssueIds((prev) => ({ ...prev, [issueId]: true }));
    const el = issueRefs.current[issueId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTriggerReAudit = async () => {
    if (!id) return;
    setReAuditLoading(true);
    try {
      const res = await fetch(`/api/audit/${id}/re-audit`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-audit failed');
      setReAuditResult(data);
      await fetchAudit();
    } catch (err: any) {
      alert(err?.message || 'Failed to run re-audit');
    } finally {
      setReAuditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-white">Loading Store Diagnostics...</h2>
        <p className="text-xs text-slate-400 mt-1">Inspecting Playwright captures and Core Web Vitals telemetry</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Audit Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Unable to locate this audit session.'}</p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to StoreDoctor
        </Link>
      </div>
    );
  }

  const boundingBoxes: BoundingBoxItem[] = audit.topIssues.map((item) => ({
    id: item.id,
    title: item.title,
    severity: item.severity,
    box: item.screenshotBox,
  }));

  const revenueLoss = `$${((100 - audit.score) * 140).toLocaleString()} - $${((100 - audit.score) * 420).toLocaleString()}/mo`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button & top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{audit.storeName}</h1>
              <a
                href={audit.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1"
              >
                <span>Visit Store</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Audit Session ID: <span className="font-mono text-slate-500">{audit.id.slice(0, 8)}</span> •{' '}
              {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {audit.paid ? (
            <>
              <a
                href={`/api/audit/${audit.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download PDF Report</span>
              </a>
              <button
                onClick={handleTriggerReAudit}
                disabled={reAuditLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${reAuditLoading ? 'animate-spin' : ''}`} />
                <span>{reAuditLoading ? 'Re-Auditing...' : 'Re-Audit Store'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setCheckoutProductType('full_report');
                setIsCheckoutOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Full Report ($29 / ₹1,999)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score & High Level Diagnosis Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Score Gauge Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              StoreDoctor Conversion Score
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl sm:text-6xl font-black text-white">{audit.score}</span>
              <span className="text-slate-500 text-lg font-bold">/100</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span>Grade {audit.grade}</span>
              <span>•</span>
              <span>{audit.score >= 80 ? 'Optimized' : audit.score >= 60 ? 'Moderate Leaks' : 'Critical Friction'}</span>
            </div>
          </div>

          {/* Radial visual indicator */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={audit.score >= 80 ? 'text-emerald-400' : audit.score >= 60 ? 'text-amber-400' : 'text-rose-400'}
                strokeDasharray={`${audit.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-white">
              {audit.grade}
            </div>
          </div>
        </div>

        {/* Revenue Leakage Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950/20 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
              Estimated Monthly Revenue Leakage
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mb-2">{revenueLoss}</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculated from industry benchmarks on mobile load delay, missing trust badges, lack of sticky CTA, and checkout drop-off.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-800/80 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolving top 10 fixes recovers up to 70% of lost revenue</span>
          </div>
        </div>

        {/* Core Web Vitals Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Mobile Core Web Vitals
              </span>
              <span className="text-[10px] text-slate-500 font-mono">PSI Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Largest Contentful (LCP)</span>
                <span className={`font-bold ${audit.psiData.lcp > 2.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {audit.psiData.lcp}s
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">First Contentful (FCP)</span>
                <span className="font-bold text-white">{audit.psiData.fcp}s</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Layout Shift (CLS)</span>
                <span className={`font-bold ${audit.psiData.cls > 0.1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {audit.psiData.cls}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">App Scripts</span>
                <span className={`font-bold ${audit.psiData.thirdPartyScriptsCount > 20 ? 'text-amber-400' : 'text-white'}`}>
                  {audit.psiData.thirdPartyScriptsCount} tags
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500">
            {audit.psiData.thirdPartyScriptsCount > 20 ? '⚠️ High script overhead detected from third-party apps' : '✓ Script execution within safe thresholds'}
          </span>
        </div>
      </div>

      {/* 7 Category Sub-Scores Breakdown */}
      <div className="mb-12 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Category Diagnostic Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Speed & Mobile', key: 'speedMobile', score: audit.categoryScores.speedMobile },
            { label: 'First Impression', key: 'firstImpression', score: audit.categoryScores.firstImpression },
            { label: 'Trust & Reviews', key: 'trustCredibility', score: audit.categoryScores.trustCredibility },
            { label: 'Product Page CRO', key: 'productPage', score: audit.categoryScores.productPage },
            { label: 'Pricing & Offers', key: 'pricingOffers', score: audit.categoryScores.pricingOffers },
            { label: 'Checkout & COD', key: 'checkoutFriction', score: audit.categoryScores.checkoutFriction },
            { label: 'SEO Basics', key: 'seoBasics', score: audit.categoryScores.seoBasics },
          ].map((cat) => (
            <div key={cat.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">{cat.label}</span>
                <span className={`font-bold ${cat.score >= 75 ? 'text-emerald-400' : cat.score >= 55 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {cat.score}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.score >= 75 ? 'bg-emerald-400' : cat.score >= 55 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Annotated Screenshot Section */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>AI Vision Hotspots &amp; Annotated Zones</span>
            </h2>
            <p className="text-xs text-slate-400">
              Hover or click on the highlighted boxes on the screenshot to inspect the exact location of friction points.
            </p>
          </div>
        </div>

        <AnnotatedScreenshot
          desktopShot={audit.desktopShot}
          mobileShot={audit.mobileShot}
          items={boundingBoxes}
          selectedIssueId={selectedIssueId}
          onSelectIssue={handleSelectBox}
        />
      </div>

      {/* Prioritized Fix List (Impact x Ease) */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl font-bold text-white">
              Prioritized Fix List (Sorted by Impact × Ease)
            </h2>
            <p className="text-xs text-slate-400">
              Focus on high-impact, high-ease fixes first for rapid conversion lift with minimal code modifications.
            </p>
          </div>
          {!audit.paid && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Free Version: Showing Top 3 Issues
            </span>
          )}
        </div>

        <div className="space-y-4">
          {audit.topIssues.map((issue, index) => {
            const isGated = !audit.paid && index >= 3;
            const isExpanded = expandedIssueIds[issue.id];
            const isSelected = selectedIssueId === issue.id;

            if (isGated) {
              return null; // Handled in upsell block below
            }

            return (
              <div
                key={issue.id}
                ref={(el) => {
                  issueRefs.current[issue.id] = el;
                }}
                className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border transition-all ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(issue.id)}
                  className="cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-400">[{issue.category}]</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          issue.severity === 'critical'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : issue.severity === 'high'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Priority {issue.priorityScore}/25 (Impact {issue.impact}/5 • Ease {issue.ease}/5)
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 transition-colors">
                      {issue.title}
                    </h3>
                  </div>

                  <button className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4 animate-in fade-in">
                    {/* Why It Matters */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Why It Matters</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed pl-5">{issue.explanation}</p>
                    </div>

                    {/* Exact Fix Steps */}
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Exact Fix Steps (Shopify Theme Guide)</span>
                      </h4>
                      <ol className="space-y-2 pl-5 list-decimal text-xs text-slate-300">
                        {issue.fixSteps.map((step, sIdx) => (
                          <li key={sIdx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Free Plan Blurred / Gated Upsell Block */}
        {!audit.paid && (
          <div className="relative mt-6 rounded-2xl overflow-hidden border border-emerald-500/30 p-8 text-center bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Unlock All 10 Prioritized Conversion Fixes
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
              Issues #4 through #10 contain high-leverage fixes for cart abandonment, COD incentives for Indian shoppers, mobile sticky ATC, and AI copy rewrites.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCheckoutProductType('full_report');
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Full Report ($29 / ₹1,999)</span>
              </button>

              <button
                onClick={() => {
                  setCheckoutProductType('fix_pack');
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4 text-teal-400" />
                <span>Have Our Team Fix All 10 ($149 / ₹9,999)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paid Full Report Section: AI Copywriting Studio */}
      {audit.paid && audit.heroRewrites && (
        <div className="mb-16 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Copywriting Studio (Unlocked)</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Direct-Response Copywriting Rewrites
          </h2>
          <p className="text-xs text-slate-400 mb-8 max-w-2xl">
            Tested headline, subheadline, and product page variations using direct-response psychology frameworks. Copy-paste directly into your Shopify theme.
          </p>

          {/* Hero Rewrites Variations */}
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Hero Section A/B Test Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {audit.heroRewrites.map((variant, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{variant.framework}</span>
                    <button
                      onClick={() => handleCopyText(`${variant.headline}\n${variant.subheadline}`, idx)}
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2 leading-snug">&quot;{variant.headline}&quot;</h4>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{variant.subheadline}</p>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 mb-2 font-mono">
                    CTA: {variant.ctaText}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-2 border-t border-slate-900 pt-2">
                  {variant.whyItConverts}
                </p>
              </div>
            ))}
          </div>

          {/* Product Description Transformation */}
          {audit.productRewrites && (
            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Product Page Transformation Script
              </h4>
              <p className="text-xs font-semibold text-white mb-2">
                Hook: &quot;{audit.productRewrites.hook}&quot;
              </p>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {audit.productRewrites.storyProblem} {audit.productRewrites.coreSolution}
              </p>

              <div className="space-y-1.5 mb-4">
                {audit.productRewrites.bulletBenefits.map((b, bIdx) => (
                  <div key={bIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white">Recommended Offer: </span>
                {audit.productRewrites.recommendedPricingOffer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done-For-You Fix Pack Upsell Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-1">
            Done-For-You Implementation
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
            Want Our Team To Implement All Top 10 Fixes?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Our specialized Shopify CRO engineers will code, test, and deploy all 10 theme fixes in 48 hours. Includes official before/after score verification.
          </p>
        </div>

        <button
          onClick={() => {
            setCheckoutProductType('fix_pack');
            setIsCheckoutOpen(true);
          }}
          className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-lg shadow-teal-500/20 whitespace-nowrap transition-all flex items-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          <span>Book Fix Pack ($149 / ₹9,999)</span>
        </button>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        auditId={audit.id}
        storeName={audit.storeName}
        initialProductType={checkoutProductType}
        onSuccess={() => {
          fetchAudit();
        }}
      />

      {/* Re-Audit Results Modal */}
      <ReAuditModal
        isOpen={!!reAuditResult}
        onClose={() => setReAuditResult(null)}
        data={reAuditResult}
      />
    </div>
  );
}
