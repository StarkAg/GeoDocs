'use client';

import Link from 'next/link';
import { useState } from 'react';
import { productMenu, servicesMenu, type NavGroup } from './data';

function MegaMenu({ groups }: { groups: NavGroup[] }) {
  return (
    <div className="absolute left-0 top-full z-50 hidden pt-3 group-hover:block">
      <div className="grid w-[min(46rem,90vw)] grid-cols-3 gap-x-6 gap-y-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/10">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wide text-amber-600">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-amber-50"
                  >
                    <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                    {item.sub && <span className="block text-xs text-slate-400">{item.sub}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              RIBIL<span className="text-amber-500">.</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            <li className="group relative">
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                Property Documents
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <MegaMenu groups={productMenu} />
            </li>
            <li className="group relative">
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                Property Services
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <MegaMenu groups={servicesMenu} />
            </li>
            <li>
              <Link href="#" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                About us
              </Link>
            </li>
          </ul>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="#download"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Download app
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Login / Sign up
          </Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {[...productMenu, ...servicesMenu].flatMap((g) => g.items).slice(0, 8).map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/account" onClick={() => setOpen(false)} className="block rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">
                Login / Sign up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
