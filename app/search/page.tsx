'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown } from '@/components/Dropdown';
import {
  getDistricts,
  getTaluks,
  getHoblis,
  getVillages,
} from '@/src/data/karnatakaLocations';
import { fetchPdfUrl } from '@/lib/api';

export default function SearchPage() {
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [hobli, setHobli] = useState('');
  const [village, setVillage] = useState('');
  const [districtOptions, setDistrictOptions] = useState<{ value: string; label: string }[]>([]);
  const [talukOptions, setTalukOptions] = useState<{ value: string; label: string }[]>([]);
  const [hobliOptions, setHobliOptions] = useState<{ value: string; label: string }[]>([]);
  const [villageOptions, setVillageOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfVillage, setPdfVillage] = useState('');

  useEffect(() => { setMounted(true); setDistrictOptions(getDistricts()); }, []);

  useEffect(() => {
    if (district) {
      const t = getTaluks(district);
      setTalukOptions(t); setTaluk(t[0]?.value || '');
      setHobli(''); setVillage(''); setHobliOptions([]); setVillageOptions([]);
    } else { setTalukOptions([]); setTaluk(''); setHobli(''); setVillage(''); setHobliOptions([]); setVillageOptions([]); }
  }, [district]);

  useEffect(() => {
    if (district && taluk) {
      const h = getHoblis(district, taluk);
      setHobliOptions(h); setHobli(h[0]?.value || '');
      setVillage(''); setVillageOptions([]);
    } else { setHobliOptions([]); setVillageOptions([]); setHobli(''); setVillage(''); }
  }, [district, taluk]);

  useEffect(() => {
    if (district && taluk && hobli) {
      const v = getVillages(district, taluk, hobli);
      setVillageOptions(v); setVillage(v[0]?.value || '');
    } else { setVillageOptions([]); setVillage(''); }
  }, [district, taluk, hobli]);

  const closePdf = useCallback(() => {
    setPdfUrl(null);
    if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); setPdfBlobUrl(null); }
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    setPdfBlobUrl(null); setPdfLoading(true);
    const CF = process.env.NEXT_PUBLIC_CF_PROXY_URL || 'https://geodocs-proxy.harshag954.workers.dev';
    fetch(pdfUrl.replace('https://landrecords.karnataka.gov.in', CF))
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.blob(); })
      .then(blob => { if (!cancelled) setPdfBlobUrl(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))); })
      .catch(() => { if (!cancelled) setPdfBlobUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`); })
      .finally(() => { if (!cancelled) setPdfLoading(false); });
    return () => { cancelled = true; };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfUrl) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') closePdf(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [pdfUrl, closePdf]);

  const handleGetPdf = async () => {
    if (!district || !taluk || !hobli || !village) { setError('Please fill in all fields.'); return; }
    setError(null); setProgress(null); setLoading(true);
    try {
      const label = villageOptions.find(v => v.value === village)?.label || village;
      const url = await fetchPdfUrl({ district, taluk, hobli, village: label, onProgress: setProgress });
      setPdfVillage(label); setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PDF.');
    } finally { setLoading(false); setProgress(null); }
  };

  return (
    <>
      <div className="relative mx-auto max-w-xl px-4 py-6 pb-24 sm:px-6 sm:py-10">
        {/* Header */}
        <div className={`mb-8 text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
            <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Village Map Search</h1>
          <p className="mt-2 text-sm text-slate-500">Enter location details to get the PDF map</p>
        </div>

        {/* Search form */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 backdrop-blur-md sm:p-7" style={{ animation: 'scaleIn 0.4s ease-out 0.1s both' }}>
          <Dropdown label="District" required value={district} options={districtOptions} onValueChange={setDistrict} />
          <Dropdown label="Taluk" required value={taluk} options={talukOptions} onValueChange={setTaluk} disabled={!district || !talukOptions.length} />
          <Dropdown label="Hobli" required value={hobli} options={hobliOptions} onValueChange={setHobli} disabled={!taluk || !hobliOptions.length} />
          <Dropdown label="Village" required value={village} options={villageOptions} onValueChange={setVillage} disabled={!hobli || !villageOptions.length} />

          {progress && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3">
              <div className="relative h-5 w-5 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
              </div>
              <p className="text-sm font-medium text-blue-700">{progress}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGetPdf}
            disabled={loading || !village}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Fetching...
              </span>
            ) : 'Get Village Map'}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      {pdfUrl && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950 animate-[fadeIn_0.3s_ease]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-slate-900/90 px-3 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3" style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}>
            <button onClick={closePdf} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-white/60 transition hover:bg-white/10">
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
          {pdfLoading || !pdfBlobUrl ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-blue-400" style={{ animationDuration: '1.2s' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/50">Loading map</p>
                <p className="mt-1 text-xs text-white/25">This may take a moment</p>
              </div>
            </div>
          ) : (
            <iframe src={`${pdfBlobUrl}#zoom=page-fit&view=FitH`} className="w-full flex-1 bg-white" title={`${pdfVillage} Village Map`} allow="fullscreen" />
          )}
          <div className="shrink-0 bg-slate-900/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      )}

      <style jsx global>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}
