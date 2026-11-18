'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

export interface BoundingBoxItem {
  id: string;
  title: string;
  severity: string;
  box: {
    page: 'desktop' | 'mobile' | 'product' | 'cart' | string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
}

interface Props {
  desktopShot?: string | null;
  mobileShot?: string | null;
  items: BoundingBoxItem[];
  selectedIssueId?: string | null;
  onSelectIssue?: (id: string) => void;
}

export default function AnnotatedScreenshot({
  desktopShot,
  mobileShot,
  items,
  selectedIssueId,
  onSelectIssue,
}: Props) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showBoxes, setShowBoxes] = useState(true);

  // Filter boxes matching the selected device view
  const activeBoxes = items.filter((item) => {
    if (device === 'desktop') {
      return item.box.page === 'desktop' || item.box.page === 'homepage';
    } else {
      return item.box.page === 'mobile' || item.box.page === 'product';
    }
  });

  const currentImgSrc = device === 'desktop' ? desktopShot || '/screenshots/placeholder_desktop.svg' : mobileShot || '/screenshots/placeholder_mobile.svg';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar / Controls */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-semibold text-slate-400 pl-2">
            AI Vision Inspector • {items.length} Issue Hotspots
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Toggle */}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                device === 'desktop'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop View</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                device === 'mobile'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
          </div>

          {/* Toggle Bounding Boxes Button */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showBoxes
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showBoxes ? 'Annotations ON' : 'Annotations OFF'}</span>
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div className="p-4 sm:p-6 flex justify-center bg-slate-950/60 overflow-x-auto min-h-[460px] items-center">
        <div
          className={`relative transition-all duration-300 rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 ${
            device === 'desktop'
              ? 'w-full max-w-4xl aspect-[16/10]'
              : 'w-full max-w-[340px] aspect-[9/16]'
          }`}
        >
          {/* Main Screenshot Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImgSrc}
            alt="Store Diagnostic Capture"
            className="w-full h-full object-cover object-top select-none pointer-events-none"
            onError={(e) => {
              // Fallback to synthetic preview if image fails loading
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&q=80';
            }}
          />

          {/* Interactive Bounding Box Overlays */}
          {showBoxes &&
            activeBoxes.map((item) => {
              const isSelected = selectedIssueId === item.id;
              const isCritical = item.severity === 'critical';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIssue && onSelectIssue(item.id)}
                  style={{
                    left: `${item.box.x}%`,
                    top: `${item.box.y}%`,
                    width: `${item.box.width}%`,
                    height: `${item.box.height}%`,
                  }}
                  className={`absolute cursor-pointer transition-all duration-200 group rounded-md border-2 ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.5)] z-30 scale-[1.01]'
                      : isCritical
                      ? 'border-rose-500 bg-rose-500/15 hover:bg-rose-500/25 z-10'
                      : 'border-amber-400 bg-amber-400/15 hover:bg-amber-400/25 z-10'
                  }`}
                >
                  {/* Badge Label */}
                  <div
                    className={`absolute -top-3.5 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-tight shadow-md flex items-center space-x-1 whitespace-nowrap pointer-events-none ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : isCritical
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{item.box.label || item.title}</span>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-slate-950 text-white border border-slate-700 text-xs shadow-xl z-40">
                    <p className="font-bold text-slate-200 leading-snug">{item.title}</p>
                    <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Click to jump to fix steps</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Bottom Bar: Instructions */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Click any annotated zone to inspect issue &amp; theme fix steps</span>
        <span className="text-[11px] text-slate-500">
          Showing {activeBoxes.length} annotated zones for {device}
        </span>
      </div>
    </div>
  );
}
