'use client';

import { useEffect, useState } from 'react';

export type FAQ = { q: string; a: string };

export type DocInfo = {
  title: string;
  about: string;
  useCases: string[];
  faqs: FAQ[];
  whatsappNumber: string;
  whatsappMessage?: string;
};

const tabs = ['About', 'Use cases', 'Sample', 'FAQs', 'Contact'] as const;
type Tab = (typeof tabs)[number];

const benefits = [
  {
    label: 'Safe & Secure',
    icon: 'M12 3.75l7.5 3v5.25c0 4.35-3.1 8.42-7.5 9.75-4.4-1.33-7.5-5.4-7.5-9.75V6.75l7.5-3z M9.5 12l1.75 1.75L14.5 10',
  },
  {
    label: 'Fast & Guaranteed Delivery',
    icon: 'M13 2L4.5 13.5H11l-1 8L19.5 10H13l0-8z',
  },
  {
    label: 'Trusted by 3 lakh+ customers',
    icon: 'M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.04 9.04 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.5 4.5 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H5.904M14 9V5.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z',
  },
];

export function DocumentInfoSheet({
  open,
  onClose,
  info,
  initialTab = 'About',
}: {
  open: boolean;
  onClose: () => void;
  info: DocInfo;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const waLink = `https://wa.me/${info.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    info.whatsappMessage || `Hi, I need help with ${info.title}.`,
  )}`;

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-[56] flex justify-center">
        <div className="sheet-enter flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:mb-6 sm:max-h-[82vh] sm:rounded-[28px]">
          {/* Handle */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-300/80" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-3">
            <h2 className="text-lg font-bold text-slate-950">{info.title} sample</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-slate-100 p-2 text-slate-500 transition active:scale-95"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-5 overflow-x-auto border-b border-slate-100 px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative shrink-0 pb-2.5 text-sm font-semibold transition-colors ${
                  tab === t ? 'text-slate-950' : 'text-slate-400'
                }`}
              >
                {t}
                {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-slate-950" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {tab === 'About' && (
              <div className="space-y-5">
                <p className="text-sm leading-6 text-slate-600">{info.about}</p>
                <BenefitCard />
              </div>
            )}

            {tab === 'Use cases' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-950">Use Cases</h3>
                <div className="flex flex-wrap gap-2.5">
                  {info.useCases.map((u) => (
                    <span
                      key={u}
                      className="rounded-full border border-amber-300 bg-amber-50/60 px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      {u}
                    </span>
                  ))}
                </div>
                <BenefitCard />
              </div>
            )}

            {tab === 'Sample' && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="relative flex h-64 items-center justify-center bg-[linear-gradient(135deg,#f8fafc,#eef2f7)]">
                    <svg className="h-full w-full text-slate-300" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth={0.8}>
                      <path d="M20 30L60 20L110 35L150 25L185 45M15 70L55 55L95 75L140 60L185 80M25 110L70 95L120 115L165 100" />
                      <path d="M55 18L50 115M110 35L120 117M150 25L165 102" />
                      <circle cx="60" cy="20" r="2" fill="currentColor" />
                      <circle cx="110" cy="35" r="2" fill="currentColor" />
                      <circle cx="150" cy="25" r="2" fill="currentColor" />
                    </svg>
                    <span className="pointer-events-none absolute select-none text-[11px] font-semibold uppercase tracking-widest text-slate-400/70">
                      Sample preview
                    </span>
                  </div>
                  <p className="px-4 py-3 text-xs text-slate-500">
                    Actual {info.title.toLowerCase()} is high-resolution and location-specific to your selection.
                  </p>
                </div>
                <BenefitCard />
              </div>
            )}

            {tab === 'FAQs' && (
              <div className="space-y-2.5">
                {info.faqs.map((f, i) => (
                  <div key={f.q} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-slate-800">{f.q}</span>
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <p className="px-4 pb-4 pl-12 text-sm leading-6 text-slate-500">{f.a}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'Contact' && (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <svg className="h-7 w-7 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.18c-.25.7-1.44 1.33-1.99 1.41-.51.08-1.16.11-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09s.77-2.19 1.05-2.49c.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.18-.31.39-.45.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.64-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.57.34.07.13.07.73-.18 1.43z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-950">Still have questions?</h3>
                <p className="mt-1 text-sm text-slate-500">Let&apos;s solve them together</p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#1faf53] px-6 py-3.5 text-sm font-bold text-white shadow-sm active:scale-[0.99]"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.18c-.25.7-1.44 1.33-1.99 1.41-.51.08-1.16.11-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09s.77-2.19 1.05-2.49c.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.18-.31.39-.45.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.64-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.57.34.07.13.07.73-.18 1.43z" />
                  </svg>
                  Contact us
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function BenefitCard() {
  return (
    <div className="rounded-2xl bg-emerald-50/70 p-4">
      <h3 className="mb-3 text-sm font-bold text-slate-950">Why Ribil?</h3>
      <ul className="space-y-3">
        {benefits.map((b) => (
          <li key={b.label} className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
            </svg>
            <span className="text-sm font-medium text-slate-700">{b.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
