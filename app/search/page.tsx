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

  useEffect(() => {
    setDistrictOptions(getDistricts());
  }, []);

  useEffect(() => {
    if (district) {
      setTalukOptions(getTaluks(district));
      setTaluk('');
      setHobli('');
      setVillage('');
      setHobliOptions([]);
      setVillageOptions([]);
      const t = getTaluks(district);
      if (t.length > 0) setTaluk(t[0].value);
    } else {
      setTalukOptions([]);
      setTaluk('');
      setHobli('');
      setVillage('');
      setHobliOptions([]);
      setVillageOptions([]);
    }
  }, [district]);

  useEffect(() => {
    if (district && taluk) {
      setHobliOptions(getHoblis(district, taluk));
      setHobli('');
      setVillage('');
      setVillageOptions([]);
      const h = getHoblis(district, taluk);
      if (h.length > 0) setHobli(h[0].value);
    } else {
      setHobliOptions([]);
      setVillageOptions([]);
      setHobli('');
      setVillage('');
    }
  }, [district, taluk]);

  useEffect(() => {
    if (district && taluk && hobli) {
      setVillageOptions(getVillages(district, taluk, hobli));
      setVillage('');
      const v = getVillages(district, taluk, hobli);
      if (v.length > 0) setVillage(v[0].value);
    } else {
      setVillageOptions([]);
      setVillage('');
    }
  }, [district, taluk, hobli]);

  const handleGetPdf = async () => {
    if (!district || !taluk || !hobli || !village) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const villageLabel = villageOptions.find((v) => v.value === village)?.label || village;
      const pdfUrl = await fetchPdfUrl({
        district,
        taluk,
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
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Village Map Search</h1>
        <p className="mt-2 text-slate-600">Enter location details to get the PDF</p>
      </div>

      <div className="card p-6">
        <Dropdown
          label="District"
          required
          value={district}
          options={districtOptions}
          onValueChange={setDistrict}
        />
        <Dropdown
          label="Taluk"
          required
          value={taluk}
          options={talukOptions}
          onValueChange={setTaluk}
          disabled={!district || talukOptions.length === 0}
        />
        <Dropdown
          label="Hobli"
          required
          value={hobli}
          options={hobliOptions}
          onValueChange={setHobli}
          disabled={!taluk || hobliOptions.length === 0}
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

        <button
          type="button"
          onClick={handleGetPdf}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Fetching PDF…' : 'Get PDF'}
        </button>
      </div>
    </div>
  );
}
