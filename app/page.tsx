'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDistricts } from '@/src/data/karnatakaLocations';

const trending = [
  { title: 'Village Map', subtitle: 'Survey boundary layout', href: '/documents/village-map', tone: 'bg-sky-100' },
  { title: 'RTC / Pahani', subtitle: 'Land record extract', href: '/documents', tone: 'bg-violet-100' },
  { title: 'Sale Deed', subtitle: 'Ownership document', href: '/documents', tone: 'bg-emerald-100' },
  { title: 'Survey Map', subtitle: 'Coordinates and area', href: '/documents', tone: 'bg-amber-100' },
];

const documents = [
  { label: 'Village Map', href: '/documents/village-map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { label: 'RTC / Pahani', href: '/documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586L19 8.414V19a2 2 0 01-2 2z' },
  { label: 'Signed RTC', href: '/documents', icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
  { label: 'Survey Doc', href: '/documents', icon: 'M9 6h6M9 12h6m-6 6h3M5 3h14v18H5V3z' },
  { label: 'Khata Extract', href: '/documents', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z' },
  { label: 'Tax Receipt', href: '/documents', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { label: 'EC', href: '/documents', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { label: 'Mutation', href: '/documents', icon: 'M8 7h8M8 12h8M8 17h5M5 3h14v18H5V3z' },
];

export default function HomePage() {
  const [districtCount, setDistrictCount] = useState(0);

  useEffect(() => {
    setDistrictCount(getDistricts().length);
  }, []);

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <section className="bg-gradient-to-b from-[#fff0ba] to-[#fff8df] px-4 pb-6 pt-5 sm:rounded-b-[2rem]">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-bold tracking-tight text-slate-950">RIBIL</p>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">{districtCount} districts</span>
        </div>

        <Link href="/documents" className="flex h-12 items-center gap-3 rounded-xl bg-white px-4 text-sm text-slate-400 shadow-sm">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search district, taluk, village
        </Link>
      </section>

      <section className="px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-950">Trending documents</h1>
          <span className="text-sm text-amber-500">~</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trending.map((item) => (
            <Link key={item.title} href={item.href} className={`${item.tone} min-h-[120px] rounded-2xl p-4 shadow-sm`}>
              <p className="text-sm font-bold text-slate-950">{item.title}</p>
              <p className="mt-1 max-w-[9rem] text-xs leading-4 text-slate-600">{item.subtitle}</p>
              <span className="mt-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-3 text-base font-bold text-slate-950">Property Documents</h2>
        <div className="grid grid-cols-4 gap-x-3 gap-y-6">
          {documents.map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center text-center">
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </span>
              <span className="text-[11px] font-semibold leading-4 text-slate-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
