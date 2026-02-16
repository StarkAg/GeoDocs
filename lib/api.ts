/**
 * GeoDocs API client for PDF URL.
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3000 for Next.js API route, or your backend URL).
 */

// In browser: use same origin (/api) so Next.js API routes proxy to backend. Or set NEXT_PUBLIC_API_URL to your backend.
const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? '')
    : (process.env.NEXT_PUBLIC_API_URL ?? '');

export interface PdfParams {
  district: string;
  taluk: string;
  hobli: string;
  village: string;
}

export interface PdfResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

export async function fetchPdfUrl(params: PdfParams): Promise<string> {
  const base = API_BASE || (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
  const url = base ? `${base}/api/get-pdf-url` : '/api/get-pdf-url';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
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
