'use client';

import Link from 'next/link';

const savedItems: { title: string; subtitle: string }[] = [];

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-0 sm:px-6 sm:py-10">
      <div className="-mx-4 mb-6 bg-gradient-to-b from-[#fff0ba] to-[#fff8df] px-4 pb-8 pt-5 sm:mx-0 sm:rounded-[2rem]">
        <p className="mb-8 text-lg font-bold tracking-tight text-slate-950">RIBIL</p>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Saved Documents</h1>
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {['Karnataka', 'Filter', 'Sort'].map((label) => (
            <button key={label} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              {label}
            </button>
          ))}
        </div>
      </div>

      {savedItems.length > 0 ? (
        <div className="space-y-3">
          {savedItems.map((item) => (
            <button
              key={item.title}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-left backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.25L6 21V4.75z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="truncate text-xs text-slate-400">{item.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[48vh] flex-col items-center justify-center text-center">
          <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#fff4cf] text-slate-600">
            <span className="absolute -left-4 bottom-5 h-2 w-2 rounded-full bg-[#ffe69b]" />
            <span className="absolute -right-2 top-3 h-1.5 w-1.5 rounded-full bg-[#ffe69b]" />
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75A2.75 2.75 0 016.5 4h4.8l2 2h4.2a2.75 2.75 0 012.75 2.75v7.75a2.75 2.75 0 01-2.75 2.75h-11A2.75 2.75 0 013.75 16.5V6.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.5v4M16 11.5h4" />
            </svg>
          </div>
          <h2 className="max-w-xs text-base font-semibold text-slate-950">No saved documents found. Try adjusting the filters</h2>
          <Link
            href="/"
            className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15"
          >
            Adjust Filters
          </Link>
        </div>
      )}
    </div>
  );
}
