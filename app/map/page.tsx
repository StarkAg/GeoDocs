'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDistricts, getTaluks, getHoblis, getVillages } from '@/src/data/karnatakaLocations';

export default function MapPage() {
  const [districts, setDistricts] = useState<{ value: string; label: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [taluks, setTaluks] = useState<{ value: string; label: string }[]>([]);
  const [selectedTaluk, setSelectedTaluk] = useState<string | null>(null);
  const [hoblis, setHoblis] = useState<{ value: string; label: string }[]>([]);
  const [selectedHobli, setSelectedHobli] = useState<string | null>(null);
  const [villages, setVillages] = useState<{ value: string; label: string }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setDistricts(getDistricts()); }, []);

  useEffect(() => {
    if (selected) {
      setTaluks(getTaluks(selected));
      setSelectedTaluk(null); setSelectedHobli(null);
      setHoblis([]); setVillages([]);
    } else {
      setTaluks([]); setHoblis([]); setVillages([]);
      setSelectedTaluk(null); setSelectedHobli(null);
    }
  }, [selected]);

  useEffect(() => {
    if (selected && selectedTaluk) {
      setHoblis(getHoblis(selected, selectedTaluk));
      setSelectedHobli(null); setVillages([]);
    } else { setHoblis([]); setVillages([]); setSelectedHobli(null); }
  }, [selected, selectedTaluk]);

  useEffect(() => {
    if (selected && selectedTaluk && selectedHobli) {
      setVillages(getVillages(selected, selectedTaluk, selectedHobli));
    } else { setVillages([]); }
  }, [selected, selectedTaluk, selectedHobli]);

  const breadcrumbs = [
    selected && districts.find(d => d.value === selected)?.label,
    selectedTaluk && taluks.find(t => t.value === selectedTaluk)?.label,
    selectedHobli && hoblis.find(h => h.value === selectedHobli)?.label,
  ].filter(Boolean);

  const goBack = () => {
    if (selectedHobli) setSelectedHobli(null);
    else if (selectedTaluk) setSelectedTaluk(null);
    else if (selected) setSelected(null);
  };

  const currentItems = selectedHobli ? villages
    : selectedTaluk ? hoblis
    : selected ? taluks
    : districts;

  const currentLabel = selectedHobli ? 'Villages'
    : selectedTaluk ? 'Hoblis'
    : selected ? 'Taluks'
    : 'Districts';

  const handleClick = (value: string) => {
    if (!selected) setSelected(value);
    else if (!selectedTaluk) setSelectedTaluk(value);
    else if (!selectedHobli) setSelectedHobli(value);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-10">
      {/* Header */}
      <div className={`mb-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Explore Karnataka</h1>
        <p className="mt-1 text-sm text-slate-500">Browse {districts.length} districts and their subdivisions</p>
      </div>

      {/* Breadcrumbs */}
      {selected && (
        <div className="mb-5 flex items-center gap-2 overflow-x-auto">
          <button onClick={() => { setSelected(null); setSelectedTaluk(null); setSelectedHobli(null); }} className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition">
            All Districts
          </button>
          {breadcrumbs.map((b, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <svg className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => {
                  if (i === 0) { setSelectedTaluk(null); setSelectedHobli(null); }
                  else if (i === 1) { setSelectedHobli(null); }
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                {b}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Back button + count */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selected && (
            <button onClick={goBack} className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 active:scale-95">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-lg font-semibold text-slate-700">{currentLabel}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{currentItems.length}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
        {currentItems.map((item, i) => {
          const isVillage = !!selectedHobli;
          return isVillage ? (
            <Link
              key={item.value}
              href={`/documents`}
              className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 p-3.5 text-left backdrop-blur-sm transition-all hover:border-emerald-200 hover:bg-white/80 hover:shadow-md sm:p-4"
              style={{ animation: `scaleIn 0.3s ease-out ${Math.min(i * 30, 300)}ms both` }}
            >
              <div className="shrink-0 h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.value}
              onClick={() => handleClick(item.value)}
              className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 p-3.5 text-left backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white/80 hover:shadow-md active:scale-[0.98] sm:p-4"
              style={{ animation: `scaleIn 0.3s ease-out ${Math.min(i * 30, 300)}ms both` }}
            >
              <div className="shrink-0 h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-slate-700 truncate">{item.label}</span>
              </div>
              <svg className="h-4 w-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>

      {currentItems.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-4 h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">No items found</p>
          <p className="mt-1 text-xs text-slate-400">Try going back and selecting a different option</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
