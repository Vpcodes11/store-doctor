'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  FileText,
  Wrench,
  Lock,
  ArrowRight,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  auditId: string;
  storeName: string;
  initialProductType?: 'full_report' | 'fix_pack' | 'monthly_reaudit';
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  auditId,
  storeName,
  initialProductType = 'full_report',
  onSuccess,
}: Props) {
  const [productType, setProductType] = useState<'full_report' | 'fix_pack' | 'monthly_reaudit'>(
    initialProductType
  );
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [collaboratorCode, setCollaboratorCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPrice = () => {
    if (productType === 'full_report') {
      return currency === 'INR' ? '₹1,999' : '$29';
    }
    if (productType === 'fix_pack') {
      return currency === 'INR' ? '₹9,999' : '$149';
    }
    return currency === 'INR' ? '₹1,199/mo' : '$15/mo';
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address to receive report access.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          productType,
          email,
          currency,
          customerName,
          collaboratorCode,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to complete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Currency Switcher */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                currency === 'USD'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                currency === 'INR'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              INR (₹ India)
            </button>
          </div>

          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
          Supercharge {storeName} Conversions
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Choose your package to eliminate revenue leaks and unlock higher ROAS.
        </p>

        {/* Package Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Option 1: Full Report */}
          <div
            onClick={() => setProductType('full_report')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${
              productType === 'full_report'
                ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Full Audit Report
              </span>
              <span className="text-base font-black text-white">
                {currency === 'INR' ? '₹1,999' : '$29'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
              Unlock all 10+ prioritized fixes, AI hero &amp; product description rewrites, and downloadable branded PDF.
            </p>
            <span className="text-[10px] text-slate-400 block font-medium">Instant PDF Download</span>
          </div>

          {/* Option 2: Fix Pack */}
          <div
            onClick={() => setProductType('fix_pack')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${
              productType === 'fix_pack'
                ? 'border-teal-400 bg-teal-950/20 shadow-lg shadow-teal-500/10'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Done-For-You Pack
              </span>
              <span className="text-base font-black text-white">
                {currency === 'INR' ? '₹9,999' : '$149'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
              Our Shopify engineers implement all Top 10 fixes directly on your theme in 48 hours + full post-fix re-audit.
            </p>
            <span className="text-[10px] text-teal-400 block font-medium">48h Delivery • Zero Effort</span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address (for report delivery &amp; order updates)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@yourstore.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {productType === 'fix_pack' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Shopify 4-digit Collaborator Request Code
                  </label>
                  <span className="text-[10px] text-slate-400">Settings &gt; Users &amp; Permissions</span>
                </div>
                <input
                  type="text"
                  value={collaboratorCode}
                  onChange={(e) => setCollaboratorCode(e.target.value)}
                  placeholder="e.g. 4821 (or leave blank and reply to email)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Specific Fix Preferences or Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please prioritize sticky Add To Cart bar and COD badge in header"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Guarantee Pill */}
          <div className="flex items-center justify-center space-x-2 py-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Satisfaction Guarantee • 30-Day Money Back</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {productType === 'fix_pack'
                      ? `Book Done-For-You Fixes for ${getPrice()}`
                      : `Unlock Full Report for ${getPrice()}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Simulated instant checkout notice */}
            <p className="text-[10px] text-center text-slate-500">
              Instant activation demo mode enabled. Unlocks immediately upon submission.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
