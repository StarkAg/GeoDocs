'use client';

import { useState, useEffect } from 'react';
import { Dropdown } from '@/components/Dropdown';
import {
  getDistricts,
  getTaluks,
  getHoblis,
  getVillages,
} from '@/src/data/karnatakaLocations';
import { fetchPdfUrl } from '@/lib/api';

const documentOptions = [
  { id: '1', name: 'Village Map', icon: 'map' },
  { id: '2', name: 'Survey Map', icon: 'location' },
  { id: '3', name: 'Property Deed', icon: 'document' },
  { id: '4', name: 'Land Records', icon: 'folder' },
  { id: '5', name: 'Tax Receipt', icon: 'receipt' },
  { id: '6', name: 'Encumbrance', icon: 'lock' },
];

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
  const [showVillageForm, setShowVillageForm] = useState(false);

  useEffect(() => {
    setDistrictOptions(getDistricts());
  }, []);

  useEffect(() => {
    if (district) {
      setTalukOptions(getTaluks(district));
      setTaluka('');
      setHobli('');
      setVillage('');
      setHobliOptions([]);
      setVillageOptions([]);
      const taluks = getTaluks(district);
      if (taluks.length > 0) setTaluka(taluks[0].value);
    } else {
      setTalukOptions([]);
      setTaluka('');
      setHobli('');
      setVillage('');
      setHobliOptions([]);
      setVillageOptions([]);
    }
  }, [district]);

  useEffect(() => {
    if (district && taluka) {
      setHobliOptions(getHoblis(district, taluka));
      setHobli('');
      setVillage('');
      setVillageOptions([]);
      const hoblis = getHoblis(district, taluka);
      if (hoblis.length > 0) setHobli(hoblis[0].value);
    } else {
      setHobliOptions([]);
      setVillageOptions([]);
      setHobli('');
      setVillage('');
    }
  }, [district, taluka]);

  useEffect(() => {
    if (district && taluka && hobli) {
      setVillageOptions(getVillages(district, taluka, hobli));
      setVillage('');
      const villages = getVillages(district, taluka, hobli);
      if (villages.length > 0) setVillage(villages[0].value);
    } else {
      setVillageOptions([]);
      setVillage('');
    }
  }, [district, taluka, hobli]);

  const handleSearch = async () => {
    if (!district || !taluka || !hobli || !village) {
      setError('Please select District, Taluka, Hobli, and Village.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const villageLabel = villageOptions.find((v) => v.value === village)?.label || village;
      const pdfUrl = await fetchPdfUrl({
        district,
        taluk: taluka,
        hobli,
        village: villageLabel,
      });
      window.open(pdfUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Documents</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => (option.id === '1' ? setShowVillageForm(true) : null)}
            className="card flex flex-col items-center justify-center p-6 transition hover:shadow-md hover:border-primary/30"
          >
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </span>
            <span className="text-center font-semibold text-slate-900">{option.name}</span>
            {option.id === '1' && (
              <span className="mt-1 text-xs text-slate-500">Tap to open form</span>
            )}
          </button>
        ))}
      </div>

      {showVillageForm && (
        <div className="card fixed inset-4 top-20 z-50 mx-auto max-h-[calc(100vh-6rem)] max-w-lg overflow-auto p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Village Map</h2>
            <button
              onClick={() => setShowVillageForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Dropdown
            label="District"
            required
            value={district}
            options={districtOptions}
            onValueChange={setDistrict}
          />
          <Dropdown
            label="Taluka"
            required
            value={taluka}
            options={talukOptions}
            onValueChange={setTaluka}
            disabled={!district || talukOptions.length === 0}
          />
          <Dropdown
            label="Hobli/Town"
            required
            value={hobli}
            options={hobliOptions}
            onValueChange={setHobli}
            disabled={!taluka || hobliOptions.length === 0}
          />
          <Dropdown
            label="Village"
            required
            value={village}
            options={villageOptions}
            onValueChange={setVillage}
            disabled={!hobli || villageOptions.length === 0}
          />

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowVillageForm(false)}
              className="flex-1 rounded-lg border border-slate-300 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Fetching…' : 'Get PDF'}
            </button>
          </div>
        </div>
      )}

      {showVillageForm && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setShowVillageForm(false)}
          aria-hidden
        />
      )}
    </div>
  );
}
