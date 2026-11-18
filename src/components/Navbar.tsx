'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, Sparkles, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-6xl mx-auto rounded-full glass-panel px-4 sm:px-6 h-14 flex items-center justify-between shadow-pinterest border border-white/10 transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
            <Stethoscope className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center">
              Store<span className="text-emerald-400 font-serif serif-italic pl-0.5">Doctor</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
              STUDIO
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-slate-300">
          <a href="#demo-preview" className="hover:text-emerald-300 transition-colors">
            Live Preview
          </a>
          <a href="#features" className="hover:text-emerald-300 transition-colors">
            Diagnostic Matrix
          </a>
          <a href="#pricing" className="hover:text-emerald-300 transition-colors">
            Pricing
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors hover:bg-white/5 px-2.5 py-1 rounded-full"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Queue</span>
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <a
            href="#audit-input"
            className="group relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_auto] hover:bg-right transition-all shadow-md shadow-emerald-500/20"
          >
            <span>Scan Store Free</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </header>
  );
}
