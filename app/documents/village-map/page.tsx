'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown } from '@/components/Dropdown';
import { fetchPdfUrl } from '@/lib/api';
import {
  getDistricts,
  getHoblis,
  getTaluks,
  getVillages,
} from '@/src/data/karnatakaLocations';

export default function VillageMapPage() {
  const router = useRouter();
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [hobli, setHobli] = useState('');
  const [village, setVillage] = useState('');
  const [districtOptions] = useState<{ value: string; label: string }[]>(() => getDistricts());
  const [talukOptions, setTalukOptions] = useState<{ value: string; label: string }[]>([]);
  const [hobliOptions, setHobliOptions] = useState<{ value: string; label: string }[]>([]);
  const [villageOptions, setVillageOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfVillage, setPdfVillage] = useState('');
  const completedCount = [district, taluk, hobli, village].filter(Boolean).length;
  const steps = [
    { label: 'District', done: !!district },
    { label: 'Taluka', done: !!taluk },
    { label: 'Hobli', done: !!hobli },
    { label: 'Village', done: !!village },
  ];

  useEffect(() => {
    if (!district) {
      setTaluk('');
      setHobli('');
      setVillage('');
      setTalukOptions([]);
      setHobliOptions([]);
      setVillageOptions([]);
      return;
    }
    const options = getTaluks(district);
    setTalukOptions(options);
    setTaluk('');
    setHobli('');
    setVillage('');
    setHobliOptions([]);
    setVillageOptions([]);
  }, [district]);

  useEffect(() => {
    if (!district || !taluk) {
      setHobli('');
      setVillage('');
      setHobliOptions([]);
      setVillageOptions([]);
      return;
    }
    const options = getHoblis(district, taluk);
    setHobliOptions(options);
    setHobli('');
    setVillage('');
    setVillageOptions([]);
  }, [district, taluk]);

  useEffect(() => {
    if (!district || !taluk || !hobli) {
      setVillage('');
      setVillageOptions([]);
      return;
    }
    const options = getVillages(district, taluk, hobli);
    setVillageOptions(options);
    setVillage('');
  }, [district, taluk, hobli]);

  useEffect(() => {
    if (!pdfUrl) return;
    const piUrl = process.env.NEXT_PUBLIC_PI_URL || 'https://ribil-pi.staragroup.in';
    setPdfBlobUrl(`${piUrl}/api/pdf?url=${encodeURIComponent(pdfUrl)}`);
  }, [pdfUrl]);

  const closePdf = useCallback(() => {
    setPdfUrl(null);
    setPdfBlobUrl(null);
  }, []);

  const handleSearch = async () => {
    if (!district || !taluk || !hobli || !village) {
      setError('Please select all fields.');
      return;
    }

    setError(null);
    setProgress(null);
    setShowComingSoon(false);
    setLoading(true);
    try {
      const label = villageOptions.find((item) => item.value === village)?.label || village;
      const url = await fetchPdfUrl({
        district,
        taluk,
        hobli,
        village: label,
        onProgress: setProgress,
        serverFallback: false,
      });
      setPdfVillage(label);
      setPdfUrl(url);
    } catch {
      setShowComingSoon(true);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-2xl pb-32">
        <header className="relative overflow-hidden bg-gradient-to-b from-[#fff0ba] to-[#fff8df] px-4 pb-7 pt-5 sm:rounded-b-[2rem]">
          <div className="mb-7 grid grid-cols-[44px_1fr_44px] items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm active:scale-95"
              aria-label="Back"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-center text-xl font-bold tracking-tight text-[#202124]">Village Map</h1>
            <span />
          </div>

        </header>

        <div className="px-4 pt-4">
          <div className="mb-3 rounded-[1.2rem] bg-white p-3.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Location details</p>
              <p className="text-xs font-semibold text-slate-400">{completedCount}/4 selected</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step) => (
                <div key={step.label} className="min-w-0">
                  <div className={`h-1.5 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <p className={`mt-1 truncate text-[10px] font-semibold ${step.done ? 'text-slate-700' : 'text-slate-300'}`}>{step.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
          <section>
            <Dropdown
              label="District"
              required
              value={district}
              options={districtOptions}
              onValueChange={setDistrict}
              placeholder="Select District"
            />
            <Dropdown
              label="Taluka"
              required
              value={taluk}
              options={talukOptions}
              onValueChange={setTaluk}
              disabled={!district}
              placeholder="Select Taluka"
            />
            <Dropdown
              label="Hobli/Town"
              required
              value={hobli}
              options={hobliOptions}
              onValueChange={setHobli}
              disabled={!taluk}
              placeholder="Select Hobli/Town"
            />
            <Dropdown
              label="Village"
              required
              value={village}
              options={villageOptions}
              onValueChange={setVillage}
              disabled={!hobli}
              placeholder="Select Village"
            />
          </section>

          {progress && (
            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              <span>{progress}</span>
            </div>
          )}
          {error && (
            <div className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {showComingSoon && (
            <div className="mt-3 overflow-hidden rounded-[1.35rem] border border-amber-100 bg-gradient-to-br from-[#fff8df] to-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-slate-950">Coming soon</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">Village map fetch is temporarily unavailable for this location. We are improving this flow.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowComingSoon(false)}
                  className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm"
                >
                  Change location
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  Back home
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="min-h-11 flex-1 rounded-full text-sm font-bold text-[#202124] active:bg-slate-50"
            >
              View Sample
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !village}
              className="min-h-11 flex-[1.35] rounded-full bg-[#242528] px-6 text-sm font-bold text-white shadow-sm active:scale-[0.99] disabled:opacity-45"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          </div>

          <div className="mt-4 rounded-[1.4rem] bg-[#fff8df] px-4 py-3">
            <p className="text-xs font-semibold leading-5 text-slate-600">Tip: Start from district, then choose taluka, hobli/town, and village. The search button activates after all fields are selected.</p>
          </div>
        </div>
      </main>

      {pdfUrl && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-slate-900/90 px-3 py-2.5 backdrop-blur-xl" style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}>
            <button onClick={closePdf} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-white/60 transition hover:bg-white/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <p className="truncate text-sm font-semibold text-white">{pdfVillage}</p>
              <p className="text-[11px] text-white/30">Village Map</p>
            </div>
            <a href={pdfUrl} download={`${pdfVillage}_map.pdf`} className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white/80" title="Download">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
          {pdfBlobUrl ? (
            <iframe src={`${pdfBlobUrl}#zoom=page-fit&view=FitH`} className="w-full flex-1 bg-white" title={`${pdfVillage} Village Map`} allow="fullscreen" />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm font-semibold text-white/50">Loading map</div>
          )}
        </div>
      )}
    </>
  );
}
