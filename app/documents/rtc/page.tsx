'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown } from '@/components/Dropdown';
import { DocumentInfoSheet, type DocInfo } from '@/components/DocumentInfoSheet';
import { ProgressModal } from '@/components/ProgressModal';
import {
  fetchRtcOptions,
  fetchRtcImages,
  rtcProxyUrl,
  type RtcOption,
} from '@/lib/rtcApi';

const RTC_INFO: DocInfo = {
  title: 'RTC / Pahani',
  whatsappNumber: '8709964141',
  whatsappMessage: 'Hi, I need help with an RTC / Pahani.',
  about:
    "The RTC (Record of Rights, Tenancy and Crops), also called Pahani, is the primary land record in Karnataka. It captures ownership, the extent of the land, survey and hissa numbers, the nature of possession, crops grown, and any government restrictions or court stays. It is essential for proving ownership, applying for loans, and any property transaction.",
  useCases: [
    'Proof of Ownership',
    'Bank / Agricultural Loans',
    'Buy or Sell Property',
    'Legal Disputes / Litigations',
  ],
  faqs: [
    {
      q: 'What is a Surnoc and Hissa number?',
      a: 'A survey number identifies a parcel of land. Surnoc and Hissa are sub-divisions of a survey number — they pinpoint the exact portion of land you want the RTC for.',
    },
    {
      q: 'Is this RTC legally valid?',
      a: 'This is the "for viewing only" copy used for reference. For legal/registration use you need the digitally-signed (PKI) RTC, available from the official portal.',
    },
    {
      q: 'Which period should I choose?',
      a: 'Pick the current period for the latest record. Older periods show the RTC as it stood in that timeframe — useful for history or disputes.',
    },
    {
      q: 'Why are some fields empty for my land?',
      a: 'RTC contents come directly from the Revenue Department database. If something looks wrong or missing, it should be corrected at the local Revenue/Nadakacheri office.',
    },
  ],
};

type Opt = RtcOption;

export default function RtcPage() {
  const router = useRouter();

  // cascade values
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [hobli, setHobli] = useState('');
  const [village, setVillage] = useState('');
  const [surveyNo, setSurveyNo] = useState('');
  const [surveyLoaded, setSurveyLoaded] = useState(false);
  const [surnoc, setSurnoc] = useState('');
  const [hissa, setHissa] = useState('');
  const [period, setPeriod] = useState('');
  const [year, setYear] = useState('');

  // option lists
  const [districtOpts, setDistrictOpts] = useState<Opt[]>([]);
  const [talukOpts, setTalukOpts] = useState<Opt[]>([]);
  const [hobliOpts, setHobliOpts] = useState<Opt[]>([]);
  const [villageOpts, setVillageOpts] = useState<Opt[]>([]);
  const [surnocOpts, setSurnocOpts] = useState<Opt[]>([]);
  const [hissaOpts, setHissaOpts] = useState<Opt[]>([]);
  const [periodOpts, setPeriodOpts] = useState<Opt[]>([]);

  const [busy, setBusy] = useState<string | null>(null); // which level is loading
  const [loading, setLoading] = useState(false); // final fetch
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'About' | 'Sample'>('About');

  // viewer
  const [images, setImages] = useState<string[] | null>(null);
  const [rawImages, setRawImages] = useState<string[]>([]);

  const load = useCallback(
    async (
      level: Parameters<typeof fetchRtcOptions>[0],
      sel: Parameters<typeof fetchRtcOptions>[1],
      setOpts: (o: Opt[]) => void,
    ) => {
      setError(null);
      setBusy(level);
      try {
        setOpts(await fetchRtcOptions(level, sel));
      } catch (e) {
        setError(e instanceof Error ? e.message : `Failed to load ${level}`);
        setOpts([]);
      } finally {
        setBusy((b) => (b === level ? null : b));
      }
    },
    [],
  );

  // initial districts
  useEffect(() => {
    load('district', {}, setDistrictOpts);
  }, [load]);

  // district -> taluk
  useEffect(() => {
    setTaluk(''); setHobli(''); setVillage(''); setSurveyLoaded(false);
    setSurnoc(''); setHissa(''); setPeriod(''); setYear('');
    setTalukOpts([]); setHobliOpts([]); setVillageOpts([]); setSurnocOpts([]); setHissaOpts([]); setPeriodOpts([]);
    if (district) load('taluk', { district }, setTalukOpts);
  }, [district, load]);

  useEffect(() => {
    setHobli(''); setVillage(''); setSurveyLoaded(false);
    setSurnoc(''); setHissa(''); setPeriod(''); setYear('');
    setHobliOpts([]); setVillageOpts([]); setSurnocOpts([]); setHissaOpts([]); setPeriodOpts([]);
    if (district && taluk) load('hobli', { district, taluk }, setHobliOpts);
  }, [taluk, district, load]);

  useEffect(() => {
    setVillage(''); setSurveyLoaded(false);
    setSurnoc(''); setHissa(''); setPeriod(''); setYear('');
    setVillageOpts([]); setSurnocOpts([]); setHissaOpts([]); setPeriodOpts([]);
    if (district && taluk && hobli) load('village', { district, taluk, hobli }, setVillageOpts);
  }, [hobli, taluk, district, load]);

  // village changed -> reset survey chain
  useEffect(() => {
    setSurveyLoaded(false); setSurnoc(''); setHissa(''); setPeriod(''); setYear('');
    setSurnocOpts([]); setHissaOpts([]); setPeriodOpts([]);
  }, [village]);

  const loadSurvey = async () => {
    if (!surveyNo.trim()) return;
    setSurnoc(''); setHissa(''); setPeriod(''); setYear('');
    setHissaOpts([]); setPeriodOpts([]);
    await load('surnoc', { district, taluk, hobli, village, surveyNo }, setSurnocOpts);
    setSurveyLoaded(true);
  };

  // surnoc -> hissa
  useEffect(() => {
    setHissa(''); setPeriod(''); setYear(''); setHissaOpts([]); setPeriodOpts([]);
    if (surnoc) load('hissa', { district, taluk, hobli, village, surveyNo, surnoc }, setHissaOpts);
  }, [surnoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // hissa -> period
  useEffect(() => {
    setPeriod(''); setYear(''); setPeriodOpts([]);
    if (hissa) load('period', { district, taluk, hobli, village, surveyNo, surnoc, hissa }, setPeriodOpts);
  }, [hissa]); // eslint-disable-line react-hooks/exhaustive-deps

  // period -> auto-resolve year
  useEffect(() => {
    setYear('');
    if (!period) return;
    (async () => {
      try {
        const years = await fetchRtcOptions('year', { district, taluk, hobli, village, surveyNo, surnoc, hissa, period });
        if (years.length) setYear(years[0].value);
      } catch { /* year stays empty; View will surface the error */ }
    })();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const canView = district && taluk && hobli && village && surveyNo && surnoc && hissa && period && year;

  const handleView = async () => {
    if (!canView) { setError('Please complete all fields.'); return; }
    setError(null);
    setLoading(true);
    try {
      const urls = await fetchRtcImages({ district, taluk, hobli, village, surveyNo, surnoc, hissa, period, year });
      if (!urls.length) throw new Error('No RTC image was generated for this selection.');
      setRawImages(urls);
      setImages(urls.map(rtcProxyUrl));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch RTC.');
    } finally {
      setLoading(false);
    }
  };

  const closeViewer = () => { setImages(null); setRawImages([]); };

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
            <h1 className="text-center text-xl font-bold tracking-tight text-[#202124]">RTC / Pahani</h1>
            <button
              type="button"
              onClick={() => { setInfoTab('About'); setInfoOpen(true); }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm active:scale-95"
              aria-label="About RTC"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25h1.5v5.25M12 7.5h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[13px] font-semibold text-amber-700/80">Scanned land record extract</p>
        </header>

        <div className="px-4 pt-4">
          <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
            <Dropdown label="District" required value={district} options={districtOpts} onValueChange={setDistrict} placeholder={busy === 'district' ? 'Loading…' : 'Select District'} />
            <Dropdown label="Taluk" required value={taluk} options={talukOpts} onValueChange={setTaluk} disabled={!district || busy === 'taluk'} placeholder={busy === 'taluk' ? 'Loading…' : 'Select Taluk'} />
            <Dropdown label="Hobli" required value={hobli} options={hobliOpts} onValueChange={setHobli} disabled={!taluk || busy === 'hobli'} placeholder={busy === 'hobli' ? 'Loading…' : 'Select Hobli'} />
            <Dropdown label="Village" required value={village} options={villageOpts} onValueChange={setVillage} disabled={!hobli || busy === 'village'} placeholder={busy === 'village' ? 'Loading…' : 'Select Village'} />

            {/* Survey number + Go */}
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Survey Number <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={surveyNo}
                  onChange={(e) => { setSurveyNo(e.target.value); setSurveyLoaded(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadSurvey(); }}
                  disabled={!village}
                  placeholder="e.g. 45"
                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50/70 disabled:text-slate-400"
                />
                <button
                  type="button"
                  onClick={loadSurvey}
                  disabled={!village || !surveyNo.trim() || busy === 'surnoc'}
                  className="h-11 shrink-0 rounded-2xl bg-[#242528] px-5 text-sm font-bold text-white active:scale-[0.99] disabled:opacity-45"
                >
                  {busy === 'surnoc' ? '…' : 'Go'}
                </button>
              </div>
            </div>

            {surveyLoaded && (
              <>
                <Dropdown label="Surnoc" required value={surnoc} options={surnocOpts} onValueChange={setSurnoc} disabled={busy === 'surnoc'} placeholder="Select Surnoc" />
                <Dropdown label="Hissa Number" required value={hissa} options={hissaOpts} onValueChange={setHissa} disabled={!surnoc || busy === 'hissa'} placeholder={busy === 'hissa' ? 'Loading…' : 'Select Hissa'} />
                <Dropdown label="Period" required value={period} options={periodOpts} onValueChange={setPeriod} disabled={!hissa || busy === 'period'} placeholder={busy === 'period' ? 'Loading…' : 'Select Period'} />
              </>
            )}

            {error && (
              <div className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
            )}

            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => { setInfoTab('Sample'); setInfoOpen(true); }}
                className="min-h-11 flex-1 rounded-full text-sm font-bold text-[#202124] active:bg-slate-50"
              >
                View Sample
              </button>
              <button
                type="button"
                onClick={handleView}
                disabled={loading || !canView}
                className="min-h-11 flex-[1.35] rounded-full bg-[#242528] px-6 text-sm font-bold text-white shadow-sm active:scale-[0.99] disabled:opacity-45"
              >
                {loading ? 'Fetching…' : 'View RTC'}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[1.4rem] bg-[#fff8df] px-4 py-3">
            <p className="text-xs font-semibold leading-5 text-slate-600">Tip: choose District → Taluk → Hobli → Village, type the Survey Number and tap Go, then pick Surnoc, Hissa and Period. The RTC opens once all fields are set.</p>
          </div>
        </div>
      </main>

      <ProgressModal open={loading} title="Getting RTC / Pahani (~1min)" step="Almost there! Your land record is being prepared." />

      <DocumentInfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} info={RTC_INFO} initialTab={infoTab} />

      {images && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-slate-900/90 px-3 py-2.5 backdrop-blur-xl" style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}>
            <button onClick={closeViewer} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-white/60 transition hover:bg-white/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <p className="truncate text-sm font-semibold text-white">RTC / Pahani</p>
              <p className="text-[11px] text-white/30">Survey {surveyNo} · Hissa {hissaOpts.find((o) => o.value === hissa)?.label || hissa}</p>
            </div>
            <a href={rawImages[0]} download={`RTC_${surveyNo}.png`} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white/80" title="Download">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
          <div className="flex-1 overflow-auto bg-slate-950 p-3">
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`RTC page ${i + 1}`} className="w-full rounded-lg bg-white shadow-lg" />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
