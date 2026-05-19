'use client';

import { useState, useEffect } from 'react';
import { getDistricts } from '@/src/data/karnatakaLocations';

const menuItems = [
  { label: 'Saved Locations', desc: 'Your bookmarked districts & villages', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label: 'Download History', desc: 'Previously downloaded maps & docs', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Preferences', desc: 'Default district, language & theme', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Help & Support', desc: 'FAQ, contact & troubleshooting', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'About Ribil', desc: 'Version, credits & open source info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function ProfilePage() {
  const [districtCount, setDistrictCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setDistrictCount(getDistricts().length); }, []);

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6 pb-24 sm:px-6 sm:py-10">
      {/* Profile card */}
      <div className={`mb-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div
          className="relative flex flex-col items-center px-6 py-10"
          style={{
            background: 'linear-gradient(135deg, rgba(6,78,59,0.08) 0%, rgba(13,148,136,0.05) 100%)',
          }}
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
            GD
          </div>
          <p className="text-xl font-bold text-slate-900">Ribil User</p>
          <p className="mt-0.5 text-sm text-slate-400">Karnataka Land Records Explorer</p>

          {/* Stats */}
          <div className="mt-5 flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{districtCount}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Districts</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">0</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Saved</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">0</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Downloads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-4 text-left backdrop-blur-sm transition-all hover:border-slate-300/80 hover:bg-white/80 hover:shadow-md active:scale-[0.99] sm:p-5"
            style={{ animation: `scaleIn 0.35s ease-out ${i * 60}ms both` }}
          >
            <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Version */}
      <p className="mt-10 text-center text-xs text-slate-300">Ribil — ribil.co — Built with Next.js</p>

      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
