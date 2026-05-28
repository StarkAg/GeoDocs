'use client';

import { useEffect, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  required?: boolean;
  value: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Dropdown({
  label,
  required = false,
  value,
  options,
  onValueChange,
  disabled = false,
  placeholder = 'Select...',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className="relative mb-3.5">
      <label className="mb-1.5 block text-[13px] font-bold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`relative flex h-11 w-full items-center rounded-2xl border bg-white pl-10 pr-10 text-left text-sm font-semibold shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50/70 disabled:text-slate-400 ${
          open ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
        }`}
      >
        <svg className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${disabled ? 'text-slate-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>
        <span className={`block min-w-0 flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected?.label || placeholder}
        </span>
        <span className={`absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full ${open ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-400'} transition`}>
          <svg className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        </span>
      </button>

      {open && (
        <>
        <button
          type="button"
          aria-label="Close dropdown"
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          onClick={() => setOpen(false)}
        />
        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-50 overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-2xl shadow-slate-900/15">
          <div className="max-h-64 overflow-y-auto p-1.5">
          {options.length === 0 ? (
            <div className="flex items-center gap-3 px-3 py-4 text-sm font-semibold text-slate-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.5a1 1 0 00-.7.3l-2.6 2.4a1 1 0 01-.7.3h-3a1 1 0 01-.7-.3l-2.6-2.4a1 1 0 00-.7-.3H4" />
                </svg>
              </span>
              No data found
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  option.value === value
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.value === value && (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))
          )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
