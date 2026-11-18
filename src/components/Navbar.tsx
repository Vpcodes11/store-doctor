'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, Zap, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Store<span className="text-emerald-400">Doctor</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                AI CRO
              </span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Audit Features
          </a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">
            Pricing
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
            How It Works
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin DFY Queue
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all"
          >
            Run Free Audit
          </Link>
        </div>
      </div>
    </header>
  );
}
