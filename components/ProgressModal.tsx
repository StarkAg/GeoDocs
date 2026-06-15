'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-screen progress modal mirroring the MyPatta "Getting Village Map (~1min)"
 * experience. The backend reports textual steps, so we animate a smooth ring that
 * climbs toward ~95% while loading and snaps to 100% the moment `open` clears.
 */
export function ProgressModal({
  open,
  title,
  step,
}: {
  open: boolean;
  title: string;
  step?: string | null;
}) {
  const [pct, setPct] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setPct(3);
      timer.current = setInterval(() => {
        setPct((p) => {
          if (p >= 95) return 95;
          // ease-out: slower as it approaches the cap (~1 min to reach ~95%)
          const inc = Math.max(0.4, (95 - p) * 0.04);
          return Math.min(95, p + inc);
        });
      }, 220);
    } else if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [open]);

  if (!open) return null;

  const r = 52;
  const c = 2 * Math.PI * r;
  const display = Math.round(pct);

  return (
    <div className="fixed inset-0 z-[58] flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="w-full max-w-sm rounded-[28px] bg-white px-6 py-8 text-center shadow-2xl">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-5 text-slate-500">
          {step || 'Almost there! Your document is being prepared.'}
        </p>

        <div className="relative mx-auto mt-7 h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#18181b"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (pct / 100) * c}
              style={{ transition: 'stroke-dashoffset 0.25s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-950">{display}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
