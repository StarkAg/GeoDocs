/**
 * GeoDocs API client for PDF URL.
 * Strategy: client-side extraction first (user's device -> CF Worker -> Karnataka),
 * falls back to server API if client-side fails.
 */

import { extractPdfUrlClient } from './clientPdfExtractor';

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? '')
    : (process.env.NEXT_PUBLIC_API_URL ?? '');

export interface PdfParams {
  district: string;
  taluk: string;
  hobli: string;
  village: string;
  onProgress?: (step: string) => void;
}

export interface PdfResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

export async function fetchPdfUrl(params: PdfParams): Promise<string> {
  const { onProgress, ...apiParams } = params;

  // Try client-side extraction first (runs in user's browser through CF Worker)
  if (typeof window !== 'undefined') {
    try {
      onProgress?.('Extracting from your device...');
      const url = await extractPdfUrlClient({ ...apiParams, onProgress });
      return url;
    } catch (clientErr) {
      console.warn('[client-side] Failed, trying server API:', clientErr);
      onProgress?.('Client failed, trying server...');
    }
  }

  // Fallback: server API
  onProgress?.('Fetching from server...');
  const base = API_BASE || (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
  const url = base ? `${base}/api/get-pdf-url` : '/api/get-pdf-url';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiParams),
  });

  const data: PdfResponse = await response.json();

  if (data.success && data.pdfUrl) {
    return data.pdfUrl;
  }
  throw new Error(data.error || 'Failed to get PDF URL');
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const base = API_BASE || (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
    const url = base ? `${base}/api/health` : '/api/health';
    const res = await fetch(url);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
