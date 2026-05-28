'use client';

import Link from 'next/link';

const orders: { id: string; title: string; status: string }[] = [];

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-0 sm:px-6 sm:py-10">
      <div className="-mx-4 mb-6 bg-gradient-to-b from-[#fff0ba] to-[#fff8df] px-4 pb-8 pt-5 sm:mx-0 sm:rounded-[2rem]">
        <p className="mb-8 text-lg font-bold tracking-tight text-slate-950">RIBIL</p>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Orders</h1>
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {['Karnataka', 'Filter', 'Sort'].map((label) => (
            <button key={label} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              {label}
            </button>
          ))}
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-left backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5A2.25 2.25 0 0119.5 6v14.25l-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5V6a2.25 2.25 0 012.25-2.25zM9 8h6M9 12h6M9 16h3" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{order.title}</p>
                <p className="truncate text-xs text-slate-400">{order.status}</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5A2.25 2.25 0 0119.5 6v14.25l-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5V6a2.25 2.25 0 012.25-2.25zM9 8h6M9 12h6M9 16h3" />
            </svg>
          </div>
          <h2 className="max-w-xs text-base font-semibold text-slate-950">No orders found. Try adjusting your filters</h2>
          <p className="mt-3 max-w-xs text-sm text-slate-400">Explore and order property documents instantly.</p>
          <Link
            href="/documents"
            className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15"
          >
            Explore Documents
          </Link>
        </div>
      )}
    </div>
  );
}
