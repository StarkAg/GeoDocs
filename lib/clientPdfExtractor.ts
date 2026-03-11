/**
 * Client-side PDF URL extraction.
 * Runs entirely in the user's browser, routing requests through the
 * Cloudflare Worker proxy (which adds CORS headers).
 * The user's own IP reaches the Karnataka site -- no cloud IP blocking.
 */

const CF_PROXY = process.env.NEXT_PUBLIC_CF_PROXY_URL || 'https://geodocs-proxy.harshag954.workers.dev';
const BASE = `${CF_PROXY}/service3/`;

function extractViewState(html: string) {
  const vs = html.match(/name="__VIEWSTATE" value="([^"]*)"/);
  const vsg = html.match(/name="__VIEWSTATEGENERATOR" value="([^"]*)"/);
  const ev = html.match(/name="__EVENTVALIDATION" value="([^"]*)"/);
  return {
    viewState: vs ? vs[1] : '',
    viewStateGen: vsg ? vsg[1] : '',
    eventValidation: ev ? ev[1] : '',
  };
}

function extractFormHidden(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const regex = /<input[^>]+type\s*=\s*["']hidden["'][^>]*>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const tag = m[0];
    const nameMatch = tag.match(/name\s*=\s*["']([^"']+)["']/i);
    const valueMatch = tag.match(/value\s*=\s*["']([^"']*)["']/i);
    if (nameMatch) {
      out[nameMatch[1]] = valueMatch ? valueMatch[1] : '';
    }
  }
  return out;
}

function buildPostBody(html: string, overrides: Record<string, string>): string {
  const hidden = extractFormHidden(html);
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(hidden)) params.append(name, value);
  for (const [name, value] of Object.entries(overrides)) params.set(name, value);
  return params.toString();
}

let cookieJar: string[] = [];

async function proxyFetch(path: string, method: string, body?: string): Promise<{ status: number; headers: Headers; text: string }> {
  const url = `${CF_PROXY}${path}`;
  const headers: Record<string, string> = {
    'User-Agent': navigator.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  if (cookieJar.length) headers['Cookie'] = cookieJar.join('; ');
  if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: method === 'POST' ? body : undefined,
    redirect: 'manual',
  });

  // Collect cookies from response
  const sc = res.headers.get('set-cookie');
  if (sc) {
    const cookies = sc.split(/,(?=\s*\w+=)/);
    for (const c of cookies) {
      const name = c.split('=')[0].trim();
      const idx = cookieJar.findIndex((x) => x.startsWith(name + '='));
      if (idx >= 0) cookieJar.splice(idx, 1);
      cookieJar.push(c.split(';')[0].trim());
    }
  }

  const text = await res.text();
  return { status: res.status, headers: res.headers, text };
}

export interface ClientPdfParams {
  district: string;
  taluk: string;
  hobli: string;
  village: string;
  onProgress?: (step: string) => void;
}

export async function extractPdfUrlClient(params: ClientPdfParams): Promise<string> {
  const { district, taluk, hobli, village, onProgress } = params;
  const log = onProgress || (() => {});
  cookieJar = [];

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // 1. GET initial page
  log('Loading form...');
  const initial = await proxyFetch('/service3/', 'GET');
  if (initial.status !== 200) throw new Error(`Initial page failed: ${initial.status}`);
  log('Form loaded');
  await delay(200);

  // 2. POST district
  log('Selecting district...');
  const r1 = await proxyFetch('/service3/', 'POST', buildPostBody(initial.text, {
    __EVENTTARGET: 'ddl_district',
    ddl_district: district,
    ddlMaps: '1',
  }));
  log('District selected');
  await delay(300);

  // 3. POST taluk
  log('Selecting taluk...');
  const r2 = await proxyFetch('/service3/', 'POST', buildPostBody(r1.text, {
    __EVENTTARGET: 'ddl_taluk',
    ddl_district: district,
    ddl_taluk: taluk,
    ddlMaps: '1',
  }));
  log('Taluk selected');
  await delay(300);

  // 4. POST hobli
  log('Selecting hobli...');
  const r3 = await proxyFetch('/service3/', 'POST', buildPostBody(r2.text, {
    __EVENTTARGET: 'ddl_hobli',
    ddl_district: district,
    ddl_taluk: taluk,
    ddl_hobli: hobli,
    ddlMaps: '1',
  }));
  log('Hobli selected');
  await delay(300);

  // 5. POST search
  log('Searching for village...');
  const r4 = await proxyFetch('/service3/', 'POST', buildPostBody(r3.text, {
    __EVENTTARGET: '',
    ddl_district: district,
    ddl_taluk: taluk,
    ddl_hobli: hobli,
    ddlMaps: '0',
    txtVlgName: village,
    btnSearch: 'Search',
    url_path: '',
  }));
  let html = r4.text;

  // Handle redirect
  if ((r4.status === 302 || r4.status === 301) && r4.headers.get('location')) {
    const loc = r4.headers.get('location')!;
    if (loc.includes('/service3/') && !loc.includes('Error.aspx')) {
      const path = loc.startsWith('http') ? new URL(loc).pathname + (new URL(loc).search || '') : loc;
      const follow = await proxyFetch(path || '/service3/', 'GET');
      if (follow.status === 200) html = follow.text;
    }
  }

  // 6. Extract PDF URL from HTML
  const pdfImgMatch = html.match(/id="grdMaps_ImgPdf_0"[^>]*onclick=["']([^"']+)["']/);
  if (pdfImgMatch) {
    const fileMatch = pdfImgMatch[1].match(/FileDownload\.aspx[^'"]*file=([^'"]+)/i);
    if (fileMatch) {
      log('PDF found!');
      return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${fileMatch[1]}`;
    }
  }

  const altMatch = html.match(/FileDownload\.aspx\?file=([^"'\s&]+)/i);
  if (altMatch) {
    log('PDF found!');
    return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${altMatch[1].replace(/&amp;/g, '&')}`;
  }

  // 7. Click PDF button
  if (/grdMaps_ImgPdf|grdMaps\$ctl02\$ImgPdf/i.test(html)) {
    log('Clicking PDF button...');
    const r5 = await proxyFetch('/service3/', 'POST', buildPostBody(html, {
      __EVENTTARGET: '',
      ddl_district: district,
      ddl_taluk: taluk,
      ddl_hobli: hobli,
      ddlMaps: '0',
      txtVlgName: village,
      url_path: '',
      'grdMaps$ctl02$ImgPdf.x': '16',
      'grdMaps$ctl02$ImgPdf.y': '13',
    }));

    // Check redirect
    if (r5.status === 302 && r5.headers.get('location')?.includes('FileDownload.aspx')) {
      const loc = r5.headers.get('location')!;
      log('PDF found!');
      return loc.startsWith('http') ? loc : `https://landrecords.karnataka.gov.in/service3/${loc.replace(/^\//, '')}`;
    }

    // Check window.open pattern
    const winOpen = r5.text.match(/window\.open\s*\(\s*['"]FileDownload\.aspx\?file=([^'"]+)['"]/i);
    if (winOpen) {
      log('PDF found!');
      return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${winOpen[1].replace(/&amp;/g, '&')}`;
    }

    // Check direct link
    const fileInR5 = r5.text.match(/FileDownload\.aspx\?file=([^"'\s&<>]+)/i);
    if (fileInR5) {
      log('PDF found!');
      return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${fileInR5[1].replace(/&amp;/g, '&')}`;
    }
  }

  throw new Error('PDF URL not found. The village may not have a map available.');
}
