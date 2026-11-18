'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle,
  AlertCircle,
  Lock,
  Layers,
  FileText,
  Wrench,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_STORES = [
  { name: 'Gymshark', url: 'https://gymshark.com', tag: 'Fitness Apparel' },
  { name: 'Allbirds', url: 'https://allbirds.com', tag: 'Sustainable Footwear' },
  { name: 'boAt Lifestyle', url: 'https://boat-lifestyle.com', tag: 'D2C Electronics & COD' },
  { name: 'BlissClub', url: 'https://blissclub.com', tag: 'Women Activewear' },
];

const SCAN_STEPS = [
  'Connecting to Shopify storefront without credentials...',
  'Discovering homepage, collection, product & cart routes...',
  'Capturing high-resolution Desktop & Mobile viewport screenshots...',
  'Analyzing PageSpeed Insights, TTFB & Core Web Vitals...',
  'Auditing 35+ CRO rules (Hero, Trust, Sticky ATC, Indian COD)...',
  'Synthesizing AI Vision hotspots and copy rewrites...',
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      setError('Please enter a valid Shopify store URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    // Progress simulation while server crawler runs
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze store');
      }

      router.push(`/audit/${data.auditId}`);
    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      setError(err?.message || 'Failed to complete audit. Please verify the URL and try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAudit(url);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New: AI Vision Annotations + Indian D2C COD Analyzer</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Paste any Shopify URL. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Get an instant AI conversion audit.
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Autonomous Playwright crawler scans your homepage, products, cart, and Core Web Vitals.
          Pinpoint exact revenue leaks with prioritized fixes ranked by <span className="text-white font-semibold">Impact × Ease</span>.
        </p>

        {/* Audit Input Form */}
        <div className="max-w-2xl mx-auto mb-6">
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-emerald-950/40 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 relative flex items-center">
              <span className="pl-3.5 text-slate-500 text-sm font-mono select-none hidden sm:inline">
                https://
              </span>
              <input
                type="text"
                disabled={loading}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourstore.com"
                className="w-full pl-2 sm:pl-1 pr-4 py-3 rounded-xl bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Diagnose Store Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Try Presets */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Or test with live stores:</span>
            {SAMPLE_STORES.map((store) => (
              <button
                key={store.name}
                type="button"
                disabled={loading}
                onClick={() => {
                  setUrl(store.url);
                  runAudit(store.url);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors flex items-center space-x-1"
              >
                <span>{store.name}</span>
                <span className="text-[10px] text-slate-500">({store.tag})</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400 pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> No password or login required
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" /> Playwright desktop + mobile captures
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Core Web Vitals telemetry
          </span>
        </div>
      </section>

      {/* Loading Modal / Scan Progression */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Analyzing Storefront</h3>
            <p className="text-xs text-slate-400 mb-6">
              Running headless Playwright crawler &amp; vision diagnostics on{' '}
              <span className="text-emerald-400 font-semibold">{url}</span>
            </p>

            {/* Steps list */}
            <div className="space-y-3 text-left mb-6">
              {SCAN_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step}
                    className={`flex items-start space-x-2.5 text-xs transition-opacity duration-300 ${
                      isCurrent
                        ? 'text-emerald-400 font-semibold'
                        : isPassed
                        ? 'text-slate-400 opacity-60'
                        : 'text-slate-600 opacity-30'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0 mt-0.5" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7 Diagnostic Categories Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
            Comprehensive CRO Framework
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            7 Deep Diagnostic Layers. 35+ Battle-Tested Rules.
          </p>
          <p className="text-slate-400 text-sm">
            We don&apos;t just check arbitrary checklist items. We inspect every friction point between initial landing and completed checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. Speed &amp; Mobile Experience</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Measures Core Web Vitals (LCP, CLS, TBT), image weight, and Shopify app script bloat that slows down mobile checkouts.
            </p>
            <span className="text-[11px] text-cyan-400 font-semibold">PageSpeed Insights Telemetry</span>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. First Impression &amp; Hero Clarity</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Audits above-the-fold value proposition, hero headline contrast, and CTA visibility within the 3-second decision window.
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold">AI Headline Rewrites Included</span>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Trust &amp; Social Proof Signals</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Detects photo review widgets (Loox, Judge.me), return/refund guarantees, direct contact info, and payment trust badges.
            </p>
            <span className="text-[11px] text-indigo-400 font-semibold">Risk Reversal Architecture</span>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">4. Product Page Optimization</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Checks gallery depth (4+ angles), sizing guides, delivery countdown near Buy button, and sticky Add-To-Cart on mobile.
            </p>
            <span className="text-[11px] text-amber-400 font-semibold">Impulse Conversion Driver</span>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">5. Pricing &amp; Offer Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Audits savings badges, bundle discounts, and free shipping progress bars in slide-out cart to maximize Average Order Value.
            </p>
            <span className="text-[11px] text-teal-400 font-semibold">AOV Expansion Strategy</span>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">6. Checkout &amp; COD Signals (India D2C)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Scans for Cash on Delivery (COD) visibility, 1-click accelerated checkout (GoKwik, Shop Pay, Magic), and cart friction.
            </p>
            <span className="text-[11px] text-rose-400 font-semibold">60%+ Indian Market Abandonment Fix</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            From Instant Audit to Done-For-You CRO
          </p>
          <p className="text-slate-400 text-sm">
            Start free. Upgrade when you are ready to scale revenue and eliminate leaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan 1: Free */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Free Health Score
              </span>
              <div className="text-3xl font-black text-white mb-1">$0</div>
              <p className="text-xs text-slate-400 mb-6">
                Instant diagnose to identify your biggest conversion leaks.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Overall Health Score (0-100) &amp; Grade</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>7 Category Sub-Score Breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top 3 Prioritized Fixes with step-by-step guides</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Annotated Screenshot viewer</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Analyze Your Store Now
            </button>
          </div>

          {/* Plan 2: Full Report ($29 / ₹1,999) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-emerald-950/20 border-2 border-emerald-500/40 relative flex flex-col justify-between shadow-xl shadow-emerald-500/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                Full AI Audit Report
              </span>
              <div className="text-3xl font-black text-white mb-1">
                $29 <span className="text-sm font-normal text-slate-400">/ ₹1,999</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Complete diagnostic roadmap for growth marketers &amp; agencies.
              </p>
              <ul className="space-y-3 text-xs text-slate-200 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 10+ Prioritized Issues unlocked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Hero Copy Rewrites (3 A/B test variants)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Product Description Transformation Script</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Downloadable Branded Executive PDF Report</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md transition-all"
            >
              Unlock via Store Audit
            </button>
          </div>

          {/* Plan 3: Done-For-You Fix Pack ($149 / ₹9,999) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-2">
                Done-For-You Fix Pack
              </span>
              <div className="text-3xl font-black text-white mb-1">
                $149 <span className="text-sm font-normal text-slate-400">/ ₹9,999</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Our Shopify engineers implement the Top 10 fixes in 48 hours.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top 10 theme fixes coded &amp; tested</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Admin task queue tracking with before/after shots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official Post-Fix Re-Audit verifying score gain</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Monthly Re-audit add-on ($15/mo)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Book DFY Implementation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
