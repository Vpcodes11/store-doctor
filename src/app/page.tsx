'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Check,
  Flame,
  Star,
  Activity,
  Maximize2,
  MousePointer,
  Compass,
  ArrowUpRight,
} from 'lucide-react';

const SAMPLE_STORES = [
  { name: 'Gymshark', url: 'https://gymshark.com', tag: 'Athleisure', flag: '🇬🇧' },
  { name: 'Allbirds', url: 'https://allbirds.com', tag: 'Sustainable Footwear', flag: '🇺🇸' },
  { name: 'boAt Lifestyle', url: 'https://boat-lifestyle.com', tag: 'D2C Electronics & COD', flag: '🇮🇳' },
  { name: 'BlissClub', url: 'https://blissclub.com', tag: 'Activewear D2C', flag: '🇮🇳' },
];

const SCAN_STEPS = [
  'Establishing secure connection to Shopify storefront...',
  'Dissecting homepage, collection, product & cart DOM routes...',
  'Capturing high-resolution Desktop & Mobile viewport screenshots...',
  'Profiling Core Web Vitals (LCP, CLS, TBT) & script bloat...',
  'Evaluating 35+ conversion rules (Hero, Trust, Sticky ATC, Indian COD)...',
  'Synthesizing AI Vision hotspots & direct-response copy rewrites...',
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pricingCurrency, setPricingCurrency] = useState<'USD' | 'INR'>('USD');
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'before' | 'after'>('after');

  const runAudit = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      setError('Please enter a valid Shopify store URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2600);

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
      setError(err?.message || 'Failed to complete audit. Please check the URL and try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAudit(url);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 overflow-hidden bg-dot-grid">
      {/* Aesthetic Ambient Light Meshes */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] orb-glow-emerald pointer-events-none -z-10" />
      <div className="absolute top-[350px] left-[5%] w-[550px] h-[550px] orb-glow-champagne pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-[5%] w-[650px] h-[650px] orb-glow-violet pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 text-center">
        {/* Floating Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-emerald-300 text-xs font-semibold mb-8 shadow-pinterest animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autonomous AI Conversion Diagnostics</span>
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="text-slate-400 font-normal">Playwright Vision Engine</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6 max-w-4xl mx-auto">
          Paste any Shopify URL.{' '}
          <span className="serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-champagne-300">
            Diagnose hidden revenue leaks.
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          An autonomous Playwright crawler visits your homepage, collections, products, and checkout.
          Get an executive audit with pinpoint visual hotspots, direct-response copy rewrites, and a{' '}
          <span className="text-white font-semibold underline decoration-emerald-400/50 underline-offset-4">
            Done-For-You
          </span>{' '}
          implementation team.
        </p>

        {/* Search / URL Input Box */}
        <div id="audit-input" className="max-w-2xl mx-auto mb-6">
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-3xl glass-card shadow-pinterest flex flex-col sm:flex-row gap-2.5 border border-white/10"
          >
            <div className="flex-1 relative flex items-center pl-3">
              <span className="text-slate-500 text-xs font-mono select-none hidden sm:inline">
                https://
              </span>
              <input
                type="text"
                disabled={loading}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="storename.com"
                className="w-full pl-2 pr-4 py-3 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-2xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 shrink-0 group disabled:opacity-50"
            >
              <Stethoscope className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Audit Store Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Preset Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500 font-medium">Or try an iconic brand:</span>
            {SAMPLE_STORES.map((store) => (
              <button
                key={store.name}
                type="button"
                disabled={loading}
                onClick={() => {
                  setUrl(store.url);
                  runAudit(store.url);
                }}
                className="px-3 py-1 rounded-full glass-pill hover:border-emerald-400/40 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <span>{store.flag}</span>
                <span className="font-semibold">{store.name}</span>
                <span className="text-[10px] text-slate-500">({store.tag})</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Social Proof Avatars & Trust Pill */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Shopify Founder"
                  className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                />
              ))}
            </div>
            <div className="text-left leading-tight pl-1">
              <div className="flex text-amber-400 text-[11px]">
                {'★★★★★'}
              </div>
              <span className="text-[11px] text-slate-300 font-semibold">
                4.9/5 from 2,840+ Shopify brands
              </span>
            </div>
          </div>

          <span className="hidden sm:inline text-slate-700">•</span>

          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            No Shopify login or password required
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Zap className="w-4 h-4 text-emerald-400" />
            24h Intelligent Cache
          </span>
        </div>
      </section>

      {/* Aesthetic Live Interactive Showcase / Hero Preview */}
      <section id="demo-preview" className="max-w-6xl mx-auto px-4 sm:px-6 mb-28">
        <div className="relative rounded-3xl glass-card p-6 sm:p-10 border border-white/10 shadow-pinterest overflow-hidden">
          {/* Subtle Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 pl-2">
                preview.storedoctor.io/gymshark-audit
              </span>
            </div>

            {/* Before vs After Switcher */}
            <div className="flex items-center rounded-full glass-pill p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveInteractiveTab('before')}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                  activeInteractiveTab === 'before'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Before Audit (Score: 58)
              </button>
              <button
                type="button"
                onClick={() => setActiveInteractiveTab('after')}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                  activeInteractiveTab === 'after'
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                After StoreDoctor Fixes (Score: 94) ✨
              </button>
            </div>
          </div>

          {/* Interactive Visual Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Mockup Viewport */}
            <div className="lg:col-span-7 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 aspect-[16/10] shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280&q=80"
                  alt="Store Diagnostic Preview"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

                {/* Hotspot 1: Hero Value Prop */}
                <div className="absolute top-[25%] left-[8%] right-[25%] p-3.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-950/60 backdrop-blur-md shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                      Hero Section A/B Test
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">+18% Lift</span>
                  </div>
                  <p className="text-xs text-white font-bold leading-tight">
                    {activeInteractiveTab === 'after'
                      ? '“Engineered for Seamless Performance. 30-Day Risk-Free Trial.”'
                      : '“Welcome to our Official Store Collection.”'}
                  </p>
                </div>

                {/* Hotspot 2: Mobile Sticky Cart / Guarantee */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl glass-panel border border-emerald-400/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-white">Sticky Mobile ATC Active</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      • ₹0 Delivery Threshold bar visible
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-400">Impact 5/5</span>
                </div>
              </div>
            </div>

            {/* Right Diagnostic Highlights */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Store Conversion Score
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeInteractiveTab === 'after'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {activeInteractiveTab === 'after' ? 'Grade A+' : 'Grade D+'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-black text-white">
                    {activeInteractiveTab === 'after' ? '94' : '58'}
                  </span>
                  <span className="text-slate-500 text-sm">/100</span>
                  <span className="text-xs font-bold text-emerald-400 pl-2">
                    {activeInteractiveTab === 'after' ? '+36 Points Gained' : 'High Friction'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeInteractiveTab === 'after'
                    ? 'All 10 friction points resolved. Mobile LCP dropped from 4.2s to 1.6s, sticky checkout activated, and trust badges deployed.'
                    : 'Unnecessary app scripts bloat mobile load time by 3.8s. Missing returns reassurance and COD indicators drop checkout rates.'}
                </p>
              </div>

              {/* 3 Quick Fix Telemetry Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl glass-panel">
                  <span className="text-[10px] text-slate-500 block uppercase">Mobile LCP</span>
                  <span className="text-base font-bold text-emerald-400">
                    {activeInteractiveTab === 'after' ? '1.6s (Optimal)' : '4.2s (Slow)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl glass-panel">
                  <span className="text-[10px] text-slate-500 block uppercase">Estimated Revenue</span>
                  <span className="text-base font-bold text-white">
                    {activeInteractiveTab === 'after' ? '+$18,400/mo' : '-$22,600/mo'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-300 flex items-center justify-between">
                <span>Want this diagnosis for your store?</span>
                <a
                  href="#audit-input"
                  className="font-bold underline underline-offset-2 flex items-center gap-1 hover:text-white"
                >
                  Run Scan Free <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pinterest-Style Asymmetric Bento Grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 glass-pill px-3 py-1 rounded-full mb-3 inline-block">
            Architected For Revenue
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            A boutique diagnostic clinic{' '}
            <span className="serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-champagne-300">
              for modern Shopify brands.
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every audit combines raw DOM signals, headless Playwright browser rendering, and AI copywriting models into one prioritized roadmap.
          </p>
        </div>

        {/* The Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Card 1: Visual Vision Hotspots (Large 7 Cols) */}
          <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                Visual Hotspot Inspector
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Annotated full-page captures for Desktop &amp; Mobile.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                No vague advice. StoreDoctor draws interactive glowing boxes directly over your store screenshots, highlighting missing guarantees, poor CTA contrast, and unoptimized layout shifts.
              </p>
            </div>

            {/* Visual crop preview inside card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-[16/9] shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Visual Bounding Box Feature"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute top-[20%] left-[10%] w-[50%] h-[40%] border-2 border-emerald-400 bg-emerald-500/15 rounded-lg flex items-start p-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded">
                  CTA Contrast Gap
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Core Web Vitals Gauge (5 Cols) */}
          <div className="md:col-span-5 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                PageSpeed &amp; Script Bloat
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Real mobile Core Web Vitals telemetry.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Measures Largest Contentful Paint, layout shifts, and flags abandoned app scripts that throttle mobile checkout speed.
              </p>
            </div>

            {/* Visual Metric Gauges */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Largest Contentful Paint</span>
                <span className="font-bold text-emerald-400">1.8s (Pass)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full w-[88%]" />
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400">Third-Party App Scripts</span>
                <span className="font-bold text-amber-400">24 detected</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Indian D2C & Checkout Friction (5 Cols) */}
          <div className="md:col-span-5 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                India D2C &amp; Global COD
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Cash on Delivery &amp; Fast Checkout Signals.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                In India, 60%+ of orders require Cash on Delivery. StoreDoctor inspects COD badges, pincode checkers, and 1-click checkouts (Shop Pay, GoKwik, Magic).
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                ✓ COD Pincode Serviceability
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                ✓ 1-Click Fast Checkout
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                ✓ Free Shipping Bar
              </span>
            </div>
          </div>

          {/* Bento Card 4: AI Copywriting Studio (7 Cols) */}
          <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5 text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-1">
                AI Direct-Response Studio
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Done-for-you headline &amp; product copy rewrites.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Receive 3 tested hero headline alternatives using PAS, Social Proof, and Outcome frameworks + high-converting product description scripts.
              </p>
            </div>

            {/* Side by side diff snippet */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
              <div className="text-rose-400/80 font-mono text-[11px]">
                <span className="line-through">Original: &quot;New Season Collection Available Now&quot;</span>
              </div>
              <div className="text-emerald-300 font-mono text-[11px] font-bold">
                ✓ Rewritten: &quot;Experience Unrivaled Comfort. Backed by Our 30-Day Risk-Free Trial.&quot;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Done-For-You (DFY) Concierge Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="rounded-3xl p-8 sm:p-12 glass-card border border-teal-500/30 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-widest glass-pill px-3 py-1 rounded-full mb-4 inline-block">
              Zero Developer Headaches
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Don&apos;t want to touch code?{' '}
              <span className="serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                We implement all 10 fixes in 48 hours.
              </span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Book our Done-For-You Fix Pack ($149 / ₹9,999). Our specialized Shopify engineers code, test, and deploy all 10 fixes directly via Shopify collaborator access. Includes official before/after verification re-audit.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="px-6 py-3.5 rounded-full font-bold text-sm text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Explore Done-For-You Pack</span>
              </a>
              <Link
                href="/admin"
                className="px-5 py-3.5 rounded-full font-semibold text-xs text-slate-300 hover:text-white glass-pill transition-colors flex items-center gap-1.5"
              >
                <span>View Live Admin Fix Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pinterest-Grade Curated Brand Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
            Results That Matter
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Loved by fast-scaling Shopify founders.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review 1 */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1 text-amber-400 text-xs mb-4">
                {'★★★★★'}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                “StoreDoctor caught 4 redundant Klaviyo and popup scripts that were choking our mobile checkout by 4.1 seconds. Fixing those top 3 alone lifted our conversion rate from 1.9% to 2.8% within two weeks.”
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                alt="Sarah L."
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div>
                <span className="text-xs font-bold text-white block">Sarah Lin</span>
                <span className="text-[11px] text-slate-400">Founder, Aura Skincare ($2.4M ARR)</span>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between border-emerald-500/20">
            <div>
              <div className="flex items-center space-x-1 text-amber-400 text-xs mb-4">
                {'★★★★★'}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                “The Indian COD and fast-checkout recommendations paid for themselves on day one. Having the sticky Add-To-Cart button on mobile and clear return badges eliminated our cart bounce.”
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
                alt="Rohan M."
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div>
                <span className="text-xs font-bold text-white block">Rohan Mehta</span>
                <span className="text-[11px] text-slate-400">Head of Growth, UrbanCraft D2C</span>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1 text-amber-400 text-xs mb-4">
                {'★★★★★'}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                “The DFY Fix Pack is the best $149 we spent this quarter. Their team took the collaborator code, executed all 10 theme changes cleanly, and our score jumped from 61 to 93 in 48 hours.”
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face"
                alt="Elena K."
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div>
                <span className="text-xs font-bold text-white block">Elena K.</span>
                <span className="text-[11px] text-slate-400">Co-founder, Vesper Footwear</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex rounded-full glass-pill p-1 border border-white/10 text-xs mb-6">
            <button
              type="button"
              onClick={() => setPricingCurrency('USD')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                pricingCurrency === 'USD'
                  ? 'bg-emerald-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($ Global)
            </button>
            <button
              type="button"
              onClick={() => setPricingCurrency('INR')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                pricingCurrency === 'INR'
                  ? 'bg-emerald-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              INR (₹ India)
            </button>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Transparent, conversion-first plans.
          </h2>
          <p className="text-slate-400 text-sm">
            Start with the free score and top 3 fixes. Upgrade when you are ready to scale revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan 1: Free */}
          <div className="p-8 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Free Diagnostic
              </span>
              <div className="text-4xl font-black text-white mb-2">$0</div>
              <p className="text-xs text-slate-400 mb-6">
                Instant diagnose to identify your store&apos;s biggest conversion roadblocks.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Overall Health Score (0-100) &amp; Grade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>7 Category Diagnostic Breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top 3 Prioritized Fixes with step-by-step guides</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Annotated Screenshot Viewer</span>
                </li>
              </ul>
            </div>
            <a
              href="#audit-input"
              className="w-full py-3.5 rounded-full font-bold text-xs text-white glass-pill hover:bg-white/10 text-center block transition-colors"
            >
              Scan Store Free
            </a>
          </div>

          {/* Plan 2: Full Report ($29 / ₹1,999) */}
          <div className="p-8 rounded-3xl glass-card border-2 border-emerald-400/50 relative flex flex-col justify-between shadow-glow-emerald">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                Full AI Audit Report
              </span>
              <div className="text-4xl font-black text-white mb-2">
                {pricingCurrency === 'INR' ? '₹1,999' : '$29'}
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Complete growth roadmap for scaling DTC brands &amp; agencies.
              </p>
              <ul className="space-y-3 text-xs text-slate-200 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 10+ Prioritized Issues unlocked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Hero Copy Rewrites (3 A/B test variants)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Product Page Transformation Script</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Downloadable Branded Executive PDF</span>
                </li>
              </ul>
            </div>
            <a
              href="#audit-input"
              className="w-full py-3.5 rounded-full font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-center block shadow-md transition-all"
            >
              Get Full Report via Audit
            </a>
          </div>

          {/* Plan 3: Done-For-You Fix Pack ($149 / ₹9,999) */}
          <div className="p-8 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-2">
                Done-For-You Fix Pack
              </span>
              <div className="text-4xl font-black text-white mb-2">
                {pricingCurrency === 'INR' ? '₹9,999' : '$149'}
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Our Shopify engineers implement all Top 10 fixes in 48 hours.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Top 10 theme fixes coded &amp; verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Admin task queue with before/after screenshots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Official Post-Fix Re-Audit verifying score gain</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Monthly Re-audit add-on ($15/mo)</span>
                </li>
              </ul>
            </div>
            <a
              href="#audit-input"
              className="w-full py-3.5 rounded-full font-bold text-xs text-white glass-pill hover:bg-white/10 text-center block transition-colors"
            >
              Book Done-For-You Fixes
            </a>
          </div>
        </div>
      </section>

      {/* Loading Modal / Scan Progression */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card border border-white/15 text-center shadow-2xl">
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Diagnosing Storefront</h3>
            <p className="text-xs text-slate-400 mb-6">
              Running headless Playwright crawler on <span className="text-emerald-400 font-semibold">{url}</span>
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
                        ? 'text-emerald-300 font-semibold'
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

            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
