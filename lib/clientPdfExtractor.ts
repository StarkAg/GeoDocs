/**
 * PDF URL extraction via Raspberry Pi (global Cloudflare Tunnel).
 * Falls back to CF Worker if Pi is down.
 */

const PI_TUNNEL = process.env.NEXT_PUBLIC_PI_URL || 'https://geodocs-pi.staragroup.in';
const CF_PROXY = process.env.NEXT_PUBLIC_CF_PROXY_URL || 'https://geodocs-proxy.harshag954.workers.dev';
const localCache = new Map<string, string>();

export interface ClientPdfParams {
  district: string;
  taluk: string;
  hobli: string;
  village: string;
  onProgress?: (step: string) => void;
}

async function tryExtract(baseUrl: string, params: ClientPdfParams, timeoutMs: number): Promise<string> {
  const { district, taluk, hobli, village } = params;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${baseUrl}/api/extract?district=${encodeURIComponent(district)}&taluk=${encodeURIComponent(taluk)}&hobli=${encodeURIComponent(hobli)}&village=${encodeURIComponent(village)}`;
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timer);
  const data = await res.json();
  if (data.success && data.pdfUrl) return data.pdfUrl;
  throw new Error(data.error || 'PDF not found');
}

export async function extractPdfUrlClient(params: ClientPdfParams): Promise<string> {
  const log = params.onProgress || (() => {});
  const cacheKey = `${params.district}-${params.taluk}-${params.hobli}-${params.village}`;
  const cached = localCache.get(cacheKey);
  if (cached) { log('PDF found (instant)!'); return cached; }
  log('Fetching map...');
  try {
    const pdfUrl = await tryExtract(PI_TUNNEL, params, 15000);
    localCache.set(cacheKey, pdfUrl);
    log('PDF found!');
    return pdfUrl;
  } catch {
    log('Fetching map (fallback)...');
    const pdfUrl = await tryExtract(CF_PROXY, params, 40000);
    localCache.set(cacheKey, pdfUrl);
    log('PDF found!');
    return pdfUrl;
  }
}
