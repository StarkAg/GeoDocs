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

  const handleDownloadPdf = async () => {
    if (!district || !taluk || !hobli || !village) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const villageLabel = villageOptions.find((v) => v.value === village)?.label || village;
      
      // Call download API endpoint
      const API_URL = process.env.NEXT_PUBLIC_PDF_BACKEND_URL || 'http://localhost:3013';
      const response = await fetch(`${API_URL}/api/download-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
        },
        body: JSON.stringify({
          district,
          taluk,
          hobli,
          village: villageLabel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download PDF');
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${villageLabel.replace(/[^a-zA-Z0-9]/g, '_')}_Map.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF.');
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleGetPdf}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Loading…' : '👁️ View PDF'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={loading}
            className="flex-1 rounded-lg border-2 border-primary bg-white px-4 py-2 font-medium text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading…' : '⬇️ Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
