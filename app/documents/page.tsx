'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dropdown } from '@/components/Dropdown';
import {
  getDistricts,
  getTaluks,
  getHoblis,
  getVillages,
} from '@/src/data/karnatakaLocations';
import { fetchPdfUrl } from '@/lib/api';

const docs = [
  { id: '1', name: 'Village Map', desc: 'Survey & boundary layout', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', accent: 'emerald', active: true },
  { id: '2', name: 'Survey Map', desc: 'Coordinates & area records', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', accent: 'blue' },
  { id: '3', name: 'Property Deed', desc: 'Ownership documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', accent: 'violet' },
  { id: '4', name: 'Land Records', desc: 'RTC & mutation extracts', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', accent: 'amber' },
  { id: '5', name: 'Tax Receipt', desc: 'Revenue payment slips', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', accent: 'rose' },
  { id: '6', name: 'Encumbrance', desc: 'EC & charge details', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', accent: 'cyan' },
];

const accentMap: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/30' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    glow: 'shadow-blue-500/20',    border: 'border-blue-500/20' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  glow: 'shadow-violet-500/20',  border: 'border-violet-500/20' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   glow: 'shadow-amber-500/20',   border: 'border-amber-500/20' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    glow: 'shadow-rose-500/20',    border: 'border-rose-500/20' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    glow: 'shadow-cyan-500/20',    border: 'border-cyan-500/20' },
};

function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-3xl animate-[float_20s_ease-in-out_infinite]" />
      <div className="absolute -right-20 top-1/3 h-60 w-60 rounded-full bg-teal-400/[0.06] blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-1/4 left-1/3 h-52 w-52 rounded-full bg-cyan-400/[0.05] blur-3xl animate-[float_22s_ease-in-out_infinite_2s]" />
      <div className="absolute -bottom-10 right-1/4 h-40 w-40 rounded-full bg-emerald-600/[0.04] blur-3xl animate-[float_18s_ease-in-out_infinite_reverse_1s]" />
    </div>
  );
}

export default function DocumentsPage() {
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [hobli, setHobli] = useState('');
  const [village, setVillage] = useState('');
  const [districtOptions, setDistrictOptions] = useState<{ value: string; label: string }[]>([]);
  const [talukOptions, setTalukOptions] = useState<{ value: string; label: string }[]>([]);
  const [hobliOptions, setHobliOptions] = useState<{ value: string; label: string }[]>([]);
  const [villageOptions, setVillageOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfVillage, setPdfVillage] = useState('');
  const [mounted, setMounted] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setDistrictOptions(getDistricts()); }, []);

  useEffect(() => {
    if (district) {
      const t = getTaluks(district);
      setTalukOptions(t); setTaluka(t[0]?.value || ''); setHobli(''); setVillage('');
      setHobliOptions([]); setVillageOptions([]);
    } else { setTalukOptions([]); setTaluka(''); setHobli(''); setVillage(''); setHobliOptions([]); setVillageOptions([]); }
  }, [district]);

  useEffect(() => {
    if (district && taluka) {
      const h = getHoblis(district, taluka);
      setHobliOptions(h); setHobli(h[0]?.value || ''); setVillage(''); setVillageOptions([]);
    } else { setHobliOptions([]); setVillageOptions([]); setHobli(''); setVillage(''); }
  }, [district, taluka]);

  useEffect(() => {
    if (district && taluka && hobli) {
      const v = getVillages(district, taluka, hobli);
      setVillageOptions(v); setVillage(v[0]?.value || '');
    } else { setVillageOptions([]); setVillage(''); }
  }, [district, taluka, hobli]);

  const closePdf = useCallback(() => {
    setPdfUrl(null);
    if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); setPdfBlobUrl(null); }
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (!pdfUrl) return;
    const PI = process.env.NEXT_PUBLIC_PI_URL || 'https://geodocs-pi.staragroup.in';
    setPdfBlobUrl(`${PI}/api/pdf?url=${encodeURIComponent(pdfUrl)}`);
    setPdfLoading(false);
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfUrl) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') closePdf(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [pdfUrl, closePdf]);

  const handleSearch = async () => {
    if (!district || !taluka || !hobli || !village) { setError('Please select all fields.'); return; }
    setError(null); setProgress(null); setLoading(true);
    try {
      const label = villageOptions.find(v => v.value === village)?.label || village;
      const url = await fetchPdfUrl({ district, taluk: taluka, hobli, village: label, onProgress: setProgress });
      setPdfVillage(label); setPdfUrl(url); setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PDF.');
    } finally { setLoading(false); setProgress(null); }
  };

  return (
    <>
      {/* CSS keyframes for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.15); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.25); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .card-enter { animation: scaleIn 0.4s ease-out both; }
        .sheet-enter { animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) both; }
      `}</style>

      <FloatingOrbs />

      <div className="relative mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-10">
        {/* Hero Section */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-500/10 p-6 sm:mb-10 sm:rounded-3xl sm:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(6,78,59,0.12) 0%, rgba(13,148,136,0.08) 50%, rgba(6,182,212,0.05) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 8s ease infinite',
          }}
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl sm:h-64 sm:w-64" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="relative z-10">
            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-500 sm:text-sm">Karnataka Land Records</p>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Documents</h1>
              <p className="mt-2 max-w-md text-sm text-slate-500 sm:text-base">
                Access, search and download official land records, village maps and property documents.
              </p>
            </div>
          </div>
          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {docs.map((doc, i) => {
            const a = accentMap[doc.accent || 'emerald'];
            const isActive = doc.active;
            return (
              <button
                key={doc.id}
                onClick={() => isActive && setShowForm(true)}
                className={`card-enter group relative flex flex-col rounded-2xl border bg-white/60 p-5 text-left backdrop-blur-md transition-all duration-300 sm:p-6 ${
                  isActive
                    ? `${a.border} hover:shadow-xl hover:-translate-y-1 active:translate-y-0 cursor-pointer`
                    : 'border-slate-200/50 opacity-50 cursor-default'
                } ${isActive ? 'hover:bg-white/80' : ''}`}
                style={{
                  animationDelay: `${i * 80}ms`,
                  ...(isActive ? { animation: 'scaleIn 0.4s ease-out both, pulse-glow 3s ease-in-out infinite' } : {}),
                }}
              >
                {/* Icon */}
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${a.bg} sm:h-12 sm:w-12`}>
                  <svg className={`h-5 w-5 sm:h-6 sm:w-6 ${a.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={doc.icon} />
                  </svg>
                </div>

                {/* Text */}
                <h3 className="text-[15px] font-semibold text-slate-900 sm:text-base">{doc.name}</h3>
                <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{doc.desc}</p>

                {/* Badge */}
                <div className="mt-3">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Hover arrow for active */}
                {isActive && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Bottom Sheet / Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={() => !loading && setShowForm(false)} />
          <div
            ref={sheetRef}
            className="sheet-enter fixed z-50 overflow-y-auto bg-white/95 shadow-2xl backdrop-blur-xl inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[28px] sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:max-h-[85vh]"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300/80" />
            </div>

            <div className="p-5 sm:p-7">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-xs font-bold text-emerald-600">Village Map</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Select location to fetch the map</p>
                </div>
                <button
                  onClick={() => !loading && setShowForm(false)}
                  className="rounded-full bg-slate-100 p-2.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Dropdowns */}
              <div className="space-y-1">
                <Dropdown label="District" required value={district} options={districtOptions} onValueChange={setDistrict} />
                <Dropdown label="Taluka" required value={taluka} options={talukOptions} onValueChange={setTaluka} disabled={!district || !talukOptions.length} />
                <Dropdown label="Hobli / Town" required value={hobli} options={hobliOptions} onValueChange={setHobli} disabled={!taluka || !hobliOptions.length} />
                <Dropdown label="Village" required value={village} options={villageOptions} onValueChange={setVillage} disabled={!hobli || !villageOptions.length} />
              </div>

              {/* Progress */}
              {progress && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 animate-[fadeIn_0.3s_ease]">
                  <div className="relative h-5 w-5 shrink-0">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-emerald-700">{progress}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 animate-[fadeIn_0.3s_ease]">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => !loading && setShowForm(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading || !village}
                  className="relative flex-1 overflow-hidden rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Fetching...
                    </span>
                  ) : (
                    <>
                      <span>Get Map</span>
                      {/* shimmer effect on hover */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PDF Viewer -- Full-screen overlay */}
      {pdfUrl && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950 animate-[fadeIn_0.3s_ease]">
          {/* Top bar */}
          <div
            className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-slate-900/90 px-3 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3"
            style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
          >
            <button onClick={closePdf} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-white/60 transition hover:bg-white/10 active:bg-white/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden text-sm font-medium sm:inline">Back</span>
            </button>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <p className="truncate text-sm font-semibold text-white">{pdfVillage}</p>
              <p className="text-[11px] text-white/30">Village Map</p>
            </div>
            <div className="flex items-center gap-1">
              <a href={pdfUrl} download={`${pdfVillage}_map.pdf`} className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white/80" title="Download">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white/80" title="Open in browser">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* PDF content area */}
          {pdfLoading || !pdfBlobUrl ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-emerald-400" style={{ animationDuration: '1.2s' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/50">Loading map</p>
                <p className="mt-1 text-xs text-white/25">This may take a moment</p>
              </div>
            </div>
          ) : (
            <iframe
              src={`${pdfBlobUrl}#zoom=page-fit&view=FitH`}
              className="w-full flex-1 bg-white"
              title={`${pdfVillage} Village Map`}
              allow="fullscreen"
            />
          )}

          {/* Bottom safe area */}
          <div className="shrink-0 bg-slate-900/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      )}
    </>
  );
}
