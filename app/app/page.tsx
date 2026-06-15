'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const trending = [
  { title: 'RTC / Pahani', subtitle: 'Scanned land record extract', href: '/documents/rtc', tone: 'bg-sky-100', big: true },
  { title: 'Village Map', subtitle: 'Survey boundary', href: '/documents/village-map', tone: 'bg-violet-100' },
  { title: 'Encumbrance Certificate', subtitle: 'EC search', href: '/documents', tone: 'bg-pink-100' },
];

const documents = [
  { label: 'RTC / Pahani', href: '/documents/rtc', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586L19 8.414V19a2 2 0 01-2 2z' },
  { label: 'Signed RTC', href: '/documents', icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
  { label: 'Village Map', href: '/documents/village-map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { label: 'Survey Map', href: '/documents', icon: 'M9 6h6M9 12h6m-6 6h3M5 3h14v18H5V3z' },
  { label: 'Khata Extract', href: '/documents', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z' },
  { label: 'Mutation', href: '/documents', icon: 'M8 7h8M8 12h8M8 17h5M5 3h14v18H5V3z' },
  { label: 'EC', href: '/documents', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { label: 'Sale Deed', href: '/documents', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { label: 'Akarband', href: '/documents', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { label: 'Tippani', href: '/documents', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { label: '11E Sketch', href: '/documents', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 12h4m-4 4h4m-4 4h4' },
  { label: 'Khata Cert.', href: '/documents', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function HomePage() {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholders = useMemo(() => ["'RTC / Pahani'", "'EC'", "'Village Map'", "'Sale Deed'"], []);

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % placeholders.length), 2000);
    return () => clearInterval(id);
  }, [placeholders.length]);

  return (
    <div className="mx-auto max-w-2xl pb-28">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#fff0ba] to-[#fff8df] px-4 pb-6 pt-5 sm:rounded-b-[2rem]">
        <div className="mb-5 flex items-center gap-3">
          <p className="text-lg font-extrabold tracking-tight text-slate-950">RIBIL</p>
          <span className="h-6 w-px bg-slate-400/40" />
          <span className="flex items-center gap-1.5 text-xs font-semibold leading-tight text-slate-700">
            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586L19 8.414V19a2 2 0 01-2 2z" />
            </svg>
            <span>
              <span className="font-extrabold text-slate-900">Lakhs+</span> Docs
              <br />delivered
            </span>
          </span>
        </div>

        {/* Search bar */}
        <Link href="/documents" className="flex h-12 items-center rounded-xl bg-white pl-1.5 pr-3 text-sm text-slate-400 shadow-sm">
          <span className="mr-1.5 inline-flex h-9 items-center gap-1 rounded-lg px-1.5 text-xs font-bold text-slate-800">
            <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
            </svg>
            KA
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
          <span className="mr-2 h-6 w-px bg-slate-200" />
          <svg className="mr-2 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="truncate">Search for <span className="font-semibold text-slate-500">{placeholders[placeholderIdx]}</span></span>
        </Link>
      </section>

      {/* Trending documents — bento */}
      <section className="px-4 py-5">
        <h1 className="mb-3 flex items-center gap-1.5 text-base font-bold text-slate-950">
          Trending documents <span className="text-amber-500">📈</span>
        </h1>
        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          {trending.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`${item.tone} ${item.big ? 'row-span-2' : ''} relative flex flex-col rounded-2xl p-4 shadow-sm`}
            >
              <p className="text-sm font-bold leading-5 text-slate-950">{item.title}</p>
              <p className="mt-0.5 text-xs leading-4 text-slate-600">{item.subtitle}</p>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ${item.big ? 'mt-auto' : 'mt-3'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Property Documents grid */}
      <section className="px-4">
        <h2 className="mb-3 text-base font-bold text-slate-950">Property Documents</h2>
        <div className="grid grid-cols-4 gap-x-3 gap-y-6">
          {documents.map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center text-center">
              <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </span>
              <span className="text-[11px] font-semibold leading-4 text-slate-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bulk ordering banner */}
      <section className="px-4 pt-7">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3.5">
          <p className="text-sm font-semibold leading-5 text-white">
            Get big discounts on bulk ordering property documents
          </p>
          <Link href="/documents" className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900">
            Order now
          </Link>
        </div>
      </section>

      {/* Trust stats bar */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-3 divide-x divide-amber-200/70 rounded-2xl bg-gradient-to-r from-[#fff3c4] to-[#fff8df] py-4">
          {[
            { value: '5 Lakh+', label: 'Happy users' },
            { value: 'Lakhs+', label: 'Docs delivered' },
            { value: '100%', label: 'Safe & secure' },
          ].map((s) => (
            <div key={s.label} className="px-2 text-center">
              <p className="text-sm font-extrabold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
