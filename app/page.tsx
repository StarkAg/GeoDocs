'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  states,
  documents,
  docTabs,
  trending,
  serviceCards,
  testimonials,
  stats,
  trustBadges,
  type DocCategory,
} from '@/components/landing/data';

export default function LandingPage() {
  const [state, setState] = useState('Karnataka');
  const [stateOpen, setStateOpen] = useState(false);
  const [tab, setTab] = useState<'all' | DocCategory>('all');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  // When running inside the Capacitor native app, the home screen is the
  // mobile experience at /app — redirect there so the marketing landing
  // page only ever shows in a desktop/web browser.
  const [isNative, setIsNative] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const placeholders = useMemo(() => ['‘RTC / Pahani’', '‘EC’', '‘Village Map’', '‘Sale Deed’'], []);
  const heroStates = useMemo(() => ['Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'Kerala', 'Gujarat'], []);

  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % heroStates.length), 1300);
    return () => clearInterval(id);
  }, [heroStates.length]);

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; platform?: string } }).Capacitor;
    const native = !!cap && (cap.isNativePlatform ? cap.isNativePlatform() : cap.platform !== 'web');
    if (native) {
      setIsNative(true);
      window.location.replace('/app/');
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % placeholders.length), 2200);
    return () => clearInterval(id);
  }, [placeholders.length]);

  if (isNative) return null;

  const visibleDocs = tab === 'all' ? documents : documents.filter((d) => d.category === tab);

  const scrollTestimonials = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingHeader />

      {/* HERO */}
      <section className="relative bg-gradient-to-b from-[#fff3c4] via-[#fff8df] to-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <Image src="/landing/golden-star.svg" alt="" width={12} height={12} className="h-3 w-3" />
              India&apos;s Most Trusted Property Title Platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-950 sm:text-[2.6rem]">
              <span className="block">
                Get{' '}
                <span key={wordIdx} className="rotating-word inline-block whitespace-nowrap align-baseline text-amber-500">
                  {heroStates[wordIdx]}
                </span>
              </span>
              <span className="block">land records &amp;</span>
              <span className="block">
                <span className="relative whitespace-nowrap">
                  property documents
                  <svg className="absolute -bottom-1.5 left-0 h-2.5 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M2 6 Q100 0 198 5" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                in minutes
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-600">
              RTC, EC, Village Maps, Khata, Sale Deeds &amp; more — verified and delivered to your phone. Plus expert checks before you buy.
            </p>

            {/* Search bar */}
            <div className="mt-7 flex max-w-xl items-center rounded-2xl bg-white p-1.5 shadow-lg shadow-amber-900/5 ring-1 ring-slate-200/80">
              <div className="relative">
                <button
                  onClick={() => setStateOpen((v) => !v)}
                  className="flex h-12 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-800"
                >
                  <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
                  </svg>
                  <span className="hidden sm:inline">{state}</span>
                  <span className="sm:hidden">{state.slice(0, 2).toUpperCase()}</span>
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {stateOpen && (
                  <div className="absolute left-0 top-full z-30 mt-2 max-h-72 w-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    {states.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setState(s);
                          setStateOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-amber-50 ${
                          s === state ? 'font-bold text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {s}
                        {s === state && <Image src="/landing/check-mark.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center px-3">
                <svg className="mr-2 h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-slate-400">
                  Search for <span className="font-semibold text-slate-600">{placeholders[placeholderIdx]}</span>
                </span>
              </div>
              <Link
                href="/documents"
                className="hidden h-12 items-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:inline-flex"
              >
                Search
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                <Image src="/landing/trending.gif" alt="" width={18} height={18} className="h-4 w-4" unoptimized />
                Trending:
              </span>
              {trending.map((t) => (
                <Link key={t} href="/documents" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:ring-amber-300">
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl shadow-amber-900/10 ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Government of Karnataka</p>
                  <p className="text-sm font-bold text-slate-800">RTC / Pahani Extract</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Verified
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {['Survey No. 142/3 · Anekal', 'Owner: held in name records', 'Extent: 2 acres 14 guntas', 'Khata: BBMP / GP linked'].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span className="text-sm text-slate-600">{row}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                <span className="text-sm font-semibold text-white">Delivered in 10 mins</span>
                <span className="text-xs font-semibold text-amber-400">Digitally signed</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rotate-[-6deg] rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200">
              <p className="text-2xl font-extrabold text-slate-900">4.8★</p>
              <p className="text-[11px] font-semibold text-slate-400">7 Lakh+ happy users</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-slate-50/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:px-6 md:flex-row md:justify-center md:gap-12 lg:px-8">
          {trustBadges.map((b) => (
            <div key={b.alt} className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{b.group}</span>
              <Image src={b.src} alt={b.alt} width={120} height={44} className="h-10 w-auto object-contain opacity-80 grayscale transition hover:grayscale-0" />
            </div>
          ))}
        </div>
      </section>

      {/* DOCUMENT EXPLORER */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Explore Documents in <span className="text-amber-500">{state}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Tap any document to check availability and place an order.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {docTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleDocs.map((d) => (
            <Link
              key={d.label}
              href={d.href}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-amber-300 hover:shadow-md hover:shadow-amber-900/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{d.label}</p>
                <p className="truncate text-xs text-slate-400">{d.sub}</p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section className="bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Not just documents — <span className="text-amber-500">complete property help</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">Expert services to keep your property purchase safe and dispute-free.</p>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {serviceCards.map((card) => (
              <div key={card.title} className={`rounded-3xl bg-gradient-to-br ${card.tone} p-6 ring-1 ring-slate-200/70`}>
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Image src={card.icon} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                    <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-slate-600">
                      {card.prompts.map((p, i) => (
                        <li key={p} className="flex items-center gap-2">
                          {i > 0 && <span className="text-slate-300">|</span>}
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Link
                  href="/account"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  {card.cta}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">What our users say about us</h2>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scrollTestimonials(-1)} aria-label="Previous" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollTestimonials(1)} aria-label="Next" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t) => (
            <figure key={t.name} className="w-[300px] shrink-0 snap-start rounded-3xl border border-slate-200 bg-white p-6 sm:w-[340px]">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Image key={i} src="/landing/golden-star.svg" alt="" width={16} height={16} className="h-4 w-4" />
                ))}
              </div>
              <figcaption className="mt-3 text-base font-bold text-slate-900">{t.title}</figcaption>
              <blockquote className="mt-2 text-sm leading-relaxed text-slate-600">{t.body}</blockquote>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-sm font-bold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* APP DOWNLOAD CTA */}
      <section id="download" className="relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'url(/landing/download-section-pattern.svg)', backgroundSize: 'cover' }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-amber-400">Trusted by over 30+ property developers</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              One platform for all your <span className="text-amber-400">real estate</span> needs
            </h2>
            <ul className="mt-6 space-y-3">
              {['Access property documents instantly', 'Avail expert advice before you buy', 'Buy and sell verified properties'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-slate-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#" aria-label="Get it on Google Play">
                <Image src="/landing/google-play-dark.svg" alt="Get it on Google Play" width={170} height={52} className="h-[52px] w-auto" />
              </a>
              <a href="#" aria-label="Download on the App Store">
                <Image src="/landing/apple-store-dark.svg" alt="Download on the App Store" width={170} height={52} className="h-[52px] w-auto" />
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-64 rounded-[2.5rem] border-[6px] border-slate-800 bg-white p-3 shadow-2xl">
              <div className="rounded-[1.8rem] bg-gradient-to-b from-[#fff3c4] to-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">RIBIL<span className="text-amber-500">.</span></span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold text-slate-600">KA ▾</span>
                </div>
                <div className="mt-3 rounded-lg bg-white p-2 text-[10px] text-slate-400 shadow-sm">🔍 Search district, taluk, village</div>
                <p className="mt-4 text-[11px] font-bold text-slate-800">Trending documents</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-sky-100 p-2 text-[9px] font-bold text-slate-700">Village Map</div>
                  <div className="rounded-xl bg-violet-100 p-2 text-[9px] font-bold text-slate-700">RTC / Pahani</div>
                  <div className="rounded-xl bg-emerald-100 p-2 text-[9px] font-bold text-slate-700">Sale Deed</div>
                  <div className="rounded-xl bg-amber-100 p-2 text-[9px] font-bold text-slate-700">EC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
