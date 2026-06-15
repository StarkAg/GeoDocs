'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/app',
    label: 'Search',
    icon: 'M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    href: '/saved',
    label: 'Saved',
    icon: 'M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.25L6 21V4.75z',
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    href: '/account',
    label: 'Account',
    icon: 'M16 7.5a4 4 0 11-8 0 4 4 0 018 0zM4.75 20.25a7.25 7.25 0 0114.5 0',
  },
];

export function Nav() {
  const pathname = usePathname();

  // The desktop marketing site (root) has its own header/footer chrome.
  if (pathname === '/') {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-slate-200/50 bg-white/85 backdrop-blur-xl md:block">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/app" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">RIBIL</span>
          </Link>
          <ul className="hidden items-center gap-1 md:flex">
            {tabs.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/70 bg-white/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {tabs.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-400 active:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <svg
                  className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span className="leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
