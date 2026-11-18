'use client';

import React from 'react';
import { X, CheckCircle2, TrendingUp, Sparkles, Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: {
    storeName: string;
    before: { score: number; grade: string; categoryScores: Record<string, number> };
    after: { score: number; grade: string; categoryScores: Record<string, number> };
    scoreGain: number;
    resolvedIssuesCount: number;
    message: string;
  } | null;
}

export default function ReAuditModal({ isOpen, onClose, data }: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Post-Implementation Re-Audit Verified</span>
        </div>

        <h3 className="text-2xl font-bold tracking-tight mb-2">
          {data.storeName}: Fixes Verified!
        </h3>
        <p className="text-xs text-slate-400 mb-6">{data.message}</p>

        {/* Score Comparison Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Before Audit
            </span>
            <div className="text-3xl font-black text-rose-400">{data.before.score}</div>
            <span className="text-xs font-bold text-slate-500">Grade {data.before.grade}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
              +{data.scoreGain} PTS
            </div>
            <span className="text-xs font-semibold text-emerald-400 block mb-1">
              After Implementation
            </span>
            <div className="text-3xl font-black text-emerald-400">{data.after.score}</div>
            <span className="text-xs font-bold text-emerald-300">Grade {data.after.grade}</span>
          </div>
        </div>

        {/* Category Breakdown Improvement */}
        <div className="space-y-2.5 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Verified Sub-Score Gains
          </h4>
          {Object.keys(data.after.categoryScores).map((catKey) => {
            const beforeVal = data.before.categoryScores[catKey] || 50;
            const afterVal = data.after.categoryScores[catKey] || 85;
            const diff = afterVal - beforeVal;

            const labelMap: Record<string, string> = {
              speedMobile: 'Speed & Mobile Experience',
              firstImpression: 'First Impression & Hero Clarity',
              trustCredibility: 'Trust, Reviews & Policies',
              productPage: 'Product Page CRO & Sticky ATC',
              pricingOffers: 'Pricing & Free Shipping Bar',
              checkoutFriction: 'Checkout & COD Availability',
              seoBasics: 'Technical & On-Page SEO',
            };

            return (
              <div key={catKey} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{labelMap[catKey] || catKey}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">{beforeVal}</span>
                  <span className="text-slate-600">→</span>
                  <span className="font-bold text-emerald-400">{afterVal}</span>
                  {diff > 0 && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                      +{diff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/20"
        >
          View Updated Audit
        </button>
      </div>
    </div>
  );
}
