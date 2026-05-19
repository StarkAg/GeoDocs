'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDistricts } from '@/src/data/karnatakaLocations';

const features = [
  { href: '/documents', name: 'Documents', desc: 'Village maps, property deeds, land records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', accent: 'emerald', ready: true },
  { href: '/search', name: 'Village Search', desc: 'Quick search by district, taluk, hobli & village', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', accent: 'blue', ready: true },
  { href: '/map', name: 'Map View', desc: 'Browse Karnataka districts on interactive map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', accent: 'violet', ready: true },
  { href: '/profile', name: 'Profile', desc: 'Account settings, saved locations & history', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', accent: 'amber', ready: true },
];

const accentColors: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-500',
  blue: 'bg-blue-500/10 text-blue-500',
  violet: 'bg-violet-500/10 text-violet-500',
  amber: 'bg-amber-500/10 text-amber-500',
};

export default function HomePage() {
  const [districtCount, setDistrictCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDistrictCount(getDistricts().length);
  }, []);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      {/* Floating background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-emerald-500/[0.06] blur-3xl" style={{ animation: 'float 20s ease-in-out infinite' }} />
        <div className="absolute -right-20 top-1/2 h-60 w-60 rounded-full bg-teal-400/[0.05] blur-3xl" style={{ animation: 'float 25s ease-in-out infinite reverse' }} />
      </div>

      {/* Hero */}
      <div className={`mb-12 text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 sm:h-20 sm:w-20">
          <svg className="h-8 w-8 text-emerald-500 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Ribil
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-slate-500 sm:text-lg">
          Karnataka land records, village maps & property documents at <span className="text-slate-700 font-medium">ribil.co</span>.
        </p>

        {/* Stats row */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
          <span>{districtCount} Districts</span>
          <span>Free & Open</span>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:bg-white/80 hover:shadow-lg active:translate-y-0 sm:p-6"
            style={{ animation: `scaleIn 0.4s ease-out ${i * 80}ms both` }}
          >
            <div className={`shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl ${accentColors[f.accent]}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{f.name}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{f.desc}</p>
            </div>
            <svg className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Quick action */}
      <div className="mt-10 text-center">
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Get Village Map
        </Link>
        <p className="mt-3 text-xs text-slate-400">No signup required</p>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
