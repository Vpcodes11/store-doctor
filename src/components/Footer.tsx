import React from 'react';
import Link from 'next/link';
import { Stethoscope, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-base font-bold text-white">StoreDoctor</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous AI conversion auditor for Shopify brands. Find revenue leaks, prioritize high-impact fixes, and unlock higher ROAS.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Audit Engine</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-emerald-400 transition-colors">Core Web Vitals & Mobile Speed</li>
              <li className="hover:text-emerald-400 transition-colors">First Impression & Hero Clarity</li>
              <li className="hover:text-emerald-400 transition-colors">Trust Badges & Real Reviews</li>
              <li className="hover:text-emerald-400 transition-colors">Sticky Add to Cart & Checkout</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Services</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-emerald-400 transition-colors">Free Health Score + Top 3 Fixes</li>
              <li className="hover:text-emerald-400 transition-colors">Full Report & AI Copy Rewrites ($29 / ₹1,999)</li>
              <li className="hover:text-emerald-400 transition-colors">Done-For-You 10-Fix Pack ($149 / ₹9,999)</li>
              <li className="hover:text-emerald-400 transition-colors">Monthly Re-Audit & Monitoring ($15/mo)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Admin & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="text-emerald-400 hover:underline flex items-center gap-1">
                  Done-For-You Task Queue →
                </Link>
              </li>
              <li className="text-slate-500 mt-2">Zero login required • Cached 24h</li>
              <li className="text-slate-500">Playwright + Vision LLM Integration</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StoreDoctor. All rights reserved. Built for Shopify merchants.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Non-Invasive (Public Store Audit)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
