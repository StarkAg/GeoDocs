const express = require('express');
const cors = require('cors');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Lazy-load Puppeteer so server starts even if Chromium fails in container
let puppeteer = null;
function getPuppeteer() {
  if (!puppeteer) puppeteer = require('puppeteer');
  return puppeteer;
}

const app = express();
const PORT = process.env.PORT || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (for ngrok)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning'],
}));
app.use(express.json());

// Debug: prove API is up (Railway 404 fix)
app.get('/api/ping', (req, res) => res.json({ ok: true, service: 'geodocs-api' }));
app.get('/api/get-pdf-url', (req, res) => res.status(405).json({ error: 'Use POST with body: district, taluk, hobli, village' }));

const BASE_URL = 'https://landrecords.karnataka.gov.in/service3/';
const HOST = 'landrecords.karnataka.gov.in';

// Bright Data / proxy: PROXY_URL = http://user:pass@brd.superproxy.io:33335
const PROXY_URL = process.env.PROXY_URL || '';
let proxyAgent = null;
let proxyForPuppeteer = null; // { server: 'host:port', username?, password? }
if (PROXY_URL) {
  try {
    const u = new URL(PROXY_URL);
    proxyAgent = new HttpsProxyAgent(PROXY_URL);
    proxyForPuppeteer = {
      server: `${u.hostname}:${u.port || (u.protocol === 'https:' ? 443 : 80)}`,
      username: u.username || undefined,
      password: u.password || undefined,
    };
    console.log(`[Proxy] Using proxy: ${u.hostname}:${u.port} (auth: ${proxyForPuppeteer.username ? 'yes' : 'no'})`);
  } catch (e) {
    console.warn('[Proxy] Invalid PROXY_URL:', e.message);
  }
}

// In-memory cache for PDF URLs (key: district-taluk-hobli-village)
// PDF URLs are stable, cache for 7 days
const pdfUrlCache = new Map();
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
setInterval(() => {
  console.log(`[Cache] Size: ${pdfUrlCache.size} entries`);
}, 60 * 60 * 1000); // Log hourly

// Request queue for handling concurrent requests
const MAX_CONCURRENT_REQUESTS = 3; // Max 3 Puppeteer instances at once
let activeRequests = 0;
const requestQueue = [];

async function queueRequest(fn) {
  // If we're under the limit, execute immediately
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    console.log(`[Queue] Active requests: ${activeRequests}/${MAX_CONCURRENT_REQUESTS}`);
    try {
      return await fn();
    } finally {
      activeRequests--;
      // Process next item in queue
      if (requestQueue.length > 0) {
        const next = requestQueue.shift();
        next.resolve(await queueRequest(next.fn));
      }
    }
  }
  
  // Queue is full, wait in line
  console.log(`[Queue] Request queued. Queue size: ${requestQueue.length + 1}`);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const index = requestQueue.findIndex(item => item.resolve === resolve);
      if (index > -1) requestQueue.splice(index, 1);
      reject(new Error('Request timeout in queue (60s)'));
    }, 60000); // 60 second timeout
    
    requestQueue.push({
      fn,
      resolve: (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
      reject
    });
  });
}

const REQUEST_OPTS = {
  hostname: HOST,
  port: 443,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Referer': BASE_URL,
    'Origin': 'https://landrecords.karnataka.gov.in',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
  },
};
const HTTP_TIMEOUT_MS = 15000;

function extractViewState(html) {
  const vs = html.match(/name="__VIEWSTATE" value="([^"]*)"/);
  const vsg = html.match(/name="__VIEWSTATEGENERATOR" value="([^"]*)"/);
  const ev = html.match(/name="__EVENTVALIDATION" value="([^"]*)"/);
  return {
    viewState: vs ? vs[1] : '',
    viewStateGen: vsg ? vsg[1] : '',
    eventValidation: ev ? ev[1] : '',
  };
}

function httpsRequest(options, body, cookieJar) {
  return new Promise((resolve, reject) => {
    const jar = cookieJar || [];
    if (jar.length) {
      options.headers = { ...options.headers, Cookie: jar.join('; ') };
    }
    if (proxyAgent) options.agent = proxyAgent;
    const req = https.request(options, (res) => {
      if (res.headers['set-cookie']) {
        const newCookies = Array.isArray(res.headers['set-cookie'])
          ? res.headers['set-cookie']
          : [res.headers['set-cookie']];
        for (const c of newCookies) {
          const name = c.split('=')[0].trim();
          const idx = jar.findIndex((x) => x.startsWith(name + '='));
          if (idx >= 0) jar.splice(idx, 1);
          jar.push(c.split(';')[0].trim());
        }
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data, cookieJar: jar }));
    });
    req.on('error', reject);
    req.setTimeout(HTTP_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('HTTP request timeout'));
    });
    if (body) req.write(body);
    req.end();
  });
}

/**
 * HTTP-only path: ASP.NET form POSTs, no browser. Faster (~3–8s) when site is reachable.
 */
async function getPdfUrlHttpWithPuppeteer(district, taluk, hobli, village) {
  // Use Puppeteer's network stack (Chrome TLS fingerprint) without rendering pages
  let browser = null;
  try {
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    };
    if (process.platform === 'darwin' && require('fs').existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) {
      launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
    browser = await getPuppeteer().launch(launchOptions);
    const page = await browser.newPage();
    // Intercept and collect responses
    const responses = {};
    page.on('response', (response) => {
      responses[response.url()] = response;
    });
    
    // Navigate through the flow using page.goto and page.evaluate
    await page.goto('https://landrecords.karnataka.gov.in/service3/', { waitUntil: 'domcontentloaded', ignoreHTTPSErrors: true });
    await new Promise(r => setTimeout(r, 500));
    
    // Select district and wait for postback
    await page.evaluate((d) => {
      const select = document.querySelector('select[name="ddl_district"]');
      select.value = d;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, district);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 500));
    
    // Select taluk
    await page.evaluate((t) => {
      const select = document.querySelector('select[name="ddl_taluk"]');
      select.value = t;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, taluk);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 500));
    
    // Select hobli
    await page.evaluate((h) => {
      const select = document.querySelector('select[name="ddl_hobli"]');
      select.value = h;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, hobli);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 500));
    
    // Type village and click search
    await page.type('input[name="txtVlgName"]', String(village));
    await page.click('input[name="btnSearch"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if we got results
    const html = await page.content();
    if (html.includes('grdMaps') && !html.includes('Error.aspx')) {
      console.log('[HTTP-Puppeteer] Search succeeded! Clicking PDF button...');
      
      // Set up listener for new pages BEFORE clicking (PDF opens in new tab)
      let pdfUrl = null;
      let resolved = false;
      const newPagePromise = new Promise((resolve) => {
        const handler = async (target) => {
          if (resolved) return;
          if (target.type() === 'page') {
            try {
              const newPage = await target.page();
              if (newPage) {
                await new Promise(r => setTimeout(r, 500)); // Wait for URL to stabilize
                const url = newPage.url();
                console.log('[HTTP-Puppeteer] New page opened:', url.substring(0, 80));
                if (url && url.includes('FileDownload.aspx')) {
                  pdfUrl = url;
                  resolved = true;
                  browser.off('targetcreated', handler);
                  resolve(url);
                }
              }
            } catch (e) {
              console.log('[HTTP-Puppeteer] Error accessing new page:', e.message);
            }
          }
        };
        browser.on('targetcreated', handler);
        setTimeout(() => {
          if (!resolved) {
            browser.off('targetcreated', handler);
            console.log('[HTTP-Puppeteer] Timeout waiting for PDF tab');
            resolve(null);
          }
        }, 8000);
      });
      
      // Click PDF button
      console.log('[HTTP-Puppeteer] Clicking first PDF button...');
      await page.evaluate(() => {
        const pdfImg = document.querySelector('img[id*="grdMaps_ImgPdf"]');
        if (pdfImg) {
          console.log('PDF button found, clicking...');
          pdfImg.click();
          return true;
        }
        return false;
      });
      
      const capturedUrl = await newPagePromise;
      if (capturedUrl || pdfUrl) {
        console.log('[HTTP-Puppeteer] ✅ PDF URL captured:', capturedUrl || pdfUrl);
        return capturedUrl || pdfUrl;
      } else {
        console.log('[HTTP-Puppeteer] PDF URL not captured, will try full Puppeteer');
      }
    } else {
      console.log('[HTTP-Puppeteer] Search failed or redirected to Error.aspx');
    }
    
    return null;
  } catch (error) {
    console.log('[HTTP-Puppeteer] Error:', error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

async function getPdfUrlHttp(district, taluk, hobli, village) {
  let viewState = '';
  let viewStateGen = '';
  let eventValidation = '';

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const cookieJar = [];

  // 1. GET initial page (same URL as form action)
  const basePath = '/service3/';
  const getOpts = { ...REQUEST_OPTS, path: basePath, method: 'GET' };
  const initial = await httpsRequest(getOpts, null, cookieJar);
  if (initial.statusCode !== 200) throw new Error(`Initial GET failed: ${initial.statusCode}`);
  const vs0 = extractViewState(initial.data);
  viewState = vs0.viewState;
  viewStateGen = vs0.viewStateGen;
  eventValidation = vs0.eventValidation;
  console.log('[HTTP] Initial page loaded');
  await delay(300);

  function postForm(body, jar) {
    const opts = {
      ...REQUEST_OPTS,
      path: basePath,
      method: 'POST',
      headers: {
        ...REQUEST_OPTS.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    return httpsRequest(opts, body, jar);
  }

  function addCommonFields(params) {
    params.append('__EVENTARGUMENT', '');
    params.append('__LASTFOCUS', '');
    params.append('__VIEWSTATEENCRYPTED', '');
  }
  // 2. POST district
  const formDistrict = new URLSearchParams();
  formDistrict.append('__VIEWSTATE', viewState);
  formDistrict.append('__VIEWSTATEGENERATOR', viewStateGen);
  formDistrict.append('__EVENTVALIDATION', eventValidation);
  formDistrict.append('__EVENTTARGET', 'ddl_district');
  formDistrict.append('ddl_district', district);
  formDistrict.append('ddlMaps', '1');
  addCommonFields(formDistrict);
  const r1 = await postForm(formDistrict.toString(), cookieJar);
  const vs1 = extractViewState(r1.data);
  viewState = vs1.viewState;
  viewStateGen = vs1.viewStateGen;
  eventValidation = vs1.eventValidation;
  console.log('[HTTP] District selected');
  await delay(300);

  // 3. POST taluk
  const formTaluk = new URLSearchParams();
  formTaluk.append('__VIEWSTATE', viewState);
  formTaluk.append('__VIEWSTATEGENERATOR', viewStateGen);
  formTaluk.append('__EVENTVALIDATION', eventValidation);
  formTaluk.append('__EVENTTARGET', 'ddl_taluk');
  formTaluk.append('ddl_district', district);
  formTaluk.append('ddl_taluk', taluk);
  formTaluk.append('ddlMaps', '1');
  addCommonFields(formTaluk);
  const r2 = await postForm(formTaluk.toString(), cookieJar);
  const vs2 = extractViewState(r2.data);
  viewState = vs2.viewState;
  viewStateGen = vs2.viewStateGen;
  eventValidation = vs2.eventValidation;
  console.log('[HTTP] Taluk selected');
  await delay(300);

  // 4. POST hobli
  const formHobli = new URLSearchParams();
  formHobli.append('__VIEWSTATE', viewState);
  formHobli.append('__VIEWSTATEGENERATOR', viewStateGen);
  formHobli.append('__EVENTVALIDATION', eventValidation);
  formHobli.append('__EVENTTARGET', 'ddl_hobli');
  formHobli.append('ddl_district', district);
  formHobli.append('ddl_taluk', taluk);
  formHobli.append('ddl_hobli', hobli);
  formHobli.append('ddlMaps', '1');
  addCommonFields(formHobli);
  const r3 = await postForm(formHobli.toString(), cookieJar);
  const vs3 = extractViewState(r3.data);
  viewState = vs3.viewState;
  viewStateGen = vs3.viewStateGen;
  eventValidation = vs3.eventValidation;
  console.log('[HTTP] Hobli selected');
  await delay(300);

  // 5. POST search (village + btnSearch) – field order and ddlMaps=0 to match browser HAR
  const formSearch = new URLSearchParams();
  formSearch.append('__EVENTTARGET', '');
  formSearch.append('__EVENTARGUMENT', '');
  formSearch.append('__LASTFOCUS', '');
  formSearch.append('__VIEWSTATE', viewState);
  formSearch.append('__VIEWSTATEGENERATOR', viewStateGen);
  formSearch.append('__VIEWSTATEENCRYPTED', '');
  formSearch.append('__EVENTVALIDATION', eventValidation);
  formSearch.append('ddl_district', district);
  formSearch.append('ddl_taluk', taluk);
  formSearch.append('ddl_hobli', hobli);
  formSearch.append('ddlMaps', '0');
  formSearch.append('txtVlgName', String(village));
  formSearch.append('btnSearch', 'Search');
  formSearch.append('url_path', '');
  let r4 = await postForm(formSearch.toString(), cookieJar);
  let html = r4.data;
  console.log('[HTTP] Search response:', r4.statusCode, 'length:', html.length, 'Object moved:', html.includes('Object moved'), 'grdMaps:', html.includes('grdMaps'));
  if (r4.statusCode === 302 || r4.statusCode === 301) {
    const location = r4.headers?.location;
    if (location && location.includes('/service3/') && !location.includes('Error.aspx')) {
      const path = location.startsWith('http') ? new URL(location).pathname + (new URL(location).search || '') : location;
      const getOpts2 = { ...REQUEST_OPTS, path: path || '/service3/', method: 'GET' };
      const follow = await httpsRequest(getOpts2, null, cookieJar);
      if (follow.statusCode === 200) html = follow.data;
    } else if (location) {
      console.log('[HTTP] Search redirected to:', location.substring(0, 80));
    }
  }

  // 6. Parse PDF URL from grdMaps_ImgPdf_0 onclick or any FileDownload.aspx in page
  const pdfImgMatch = html.match(/id="grdMaps_ImgPdf_0"[^>]*onclick=["']([^"']+)["']/);
  if (pdfImgMatch) {
    const onclick = pdfImgMatch[1];
    const fileMatch = onclick.match(/FileDownload\.aspx[^'"]*file=([^'"]+)/i);
    if (fileMatch) {
      const fileParam = fileMatch[1];
      console.log('[HTTP] PDF URL from grdMaps_ImgPdf_0');
      return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${fileParam}`;
    }
  }
  const altMatch = html.match(/FileDownload\.aspx\?file=([^"'\s&]+)/i) || html.match(/FileDownload\.aspx[^"']*file=([^"'\s&]+)/i);
  if (altMatch) {
    const fileParam = altMatch[1].replace(/&amp;/g, '&');
    console.log('[HTTP] PDF URL from page body');
    return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${fileParam}`;
  }

  // 7. No PDF in HTML: simulate clicking first PDF button (grdMaps$ctl02$ImgPdf) and follow redirect
  const vs4 = extractViewState(html);
  if (vs4.viewState && /grdMaps_ImgPdf|grdMaps\$ctl02\$ImgPdf/i.test(html)) {
    const formPdf = new URLSearchParams();
    formPdf.append('__VIEWSTATE', vs4.viewState);
    formPdf.append('__VIEWSTATEGENERATOR', vs4.viewStateGen || 'C4EEEC0E');
    formPdf.append('__EVENTVALIDATION', vs4.eventValidation);
    formPdf.append('__EVENTTARGET', '');
    formPdf.append('__EVENTARGUMENT', '');
    formPdf.append('__LASTFOCUS', '');
    formPdf.append('__VIEWSTATEENCRYPTED', '');
    formPdf.append('ddl_district', district);
    formPdf.append('ddl_taluk', taluk);
    formPdf.append('ddl_hobli', hobli);
    formPdf.append('ddlMaps', '0');
    formPdf.append('txtVlgName', String(village));
    formPdf.append('grdMaps$ctl02$ImgPdf.x', '16');
    formPdf.append('grdMaps$ctl02$ImgPdf.y', '13');
    formPdf.append('url_path', '');
    const r5 = await postForm(formPdf.toString(), cookieJar);
    console.log('[HTTP] PDF click response:', r5.statusCode, 'length:', r5.data?.length || 0);
    if (r5.statusCode === 302 && r5.headers?.location) {
      const loc = r5.headers.location;
      if (loc.includes('FileDownload.aspx')) {
        const pdfUrl = loc.startsWith('http') ? loc : `https://landrecords.karnataka.gov.in/service3/${loc.replace(/^\//, '')}`;
        console.log('[HTTP] PDF URL from click redirect');
        return pdfUrl;
      }
    }
    // 200 response with HTML - equivalent of "capturing new page/tab" in browser
    // Pattern 1: window.open('FileDownload.aspx?file=...','_blank') - most common
    const windowOpenMatch = r5.data.match(/window\.open\s*\(\s*['"]FileDownload\.aspx\?file=([^'"]+)['"]/i);
    if (windowOpenMatch) {
      const fileParam = windowOpenMatch[1].replace(/&amp;/g, '&');
      console.log('[HTTP] PDF URL from window.open (equivalent to new tab in browser)');
      return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${fileParam}`;
    }
    // Pattern 2: Direct FileDownload.aspx link in HTML
    const fileInR5 = r5.data.match(/FileDownload\.aspx\?file=([^"'\s&<>]+)/i)
      || r5.data.match(/FileDownload\.aspx[^"']*file=([^"'\s&<>]+)/i)
      || r5.data.match(/file=([^"'\s&<>]*\.pdf)/i);
    if (fileInR5) {
      const fileParam = fileInR5[1].replace(/&amp;/g, '&').replace(/%5c/gi, '\\');
      console.log('[HTTP] PDF URL from direct link in response body');
      return `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=${fileParam}`;
    }
    // Pattern 3: Meta refresh or location.href redirect
    const metaMatch = r5.data.match(/(?:content|location\.href)\s*=\s*['"]([^'"]*FileDownload\.aspx[^'"]+)['"]/i);
    if (metaMatch) {
      const url = metaMatch[1].replace(/&amp;/g, '&');
      const fullUrl = url.startsWith('http') ? url : `https://landrecords.karnataka.gov.in/service3/${url.replace(/^\//, '')}`;
      console.log('[HTTP] PDF URL from meta redirect/location.href');
      return fullUrl;
    }
  }
  return null;
}

async function getPdfUrl(district, taluk, hobli, village) {
  let browser = null;
  try {
    console.log(`[${new Date().toISOString()}] Starting PDF extraction: ${district}, ${taluk}, ${hobli}, ${village}`);
    
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--no-zygote',
      '--single-process',
      '--ignore-certificate-errors',
    ];
    if (proxyForPuppeteer) {
      launchArgs.push(`--proxy-server=${proxyForPuppeteer.server}`);
      console.log(`[${new Date().toISOString()}] Using proxy: ${proxyForPuppeteer.server}`);
    }
    
    // Launch browser - use system Chrome on Mac if Puppeteer's Chrome fails
    const launchOptions = {
      headless: !IS_DEV, // Headless in production for speed
      args: launchArgs,
    };
    // On Mac, try system Chrome if available
    if (process.platform === 'darwin' && require('fs').existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) {
      launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      console.log(`[Puppeteer] Using system Chrome (headless: ${launchOptions.headless})`);
    }
    // In production, ensure headless
    if (!IS_DEV) {
      console.log('[Puppeteer] Running in production mode (headless)');
    }
    browser = await getPuppeteer().launch(launchOptions);
    
    const page = await browser.newPage();
    if (proxyForPuppeteer && (proxyForPuppeteer.username || proxyForPuppeteer.password)) {
      await page.authenticate({
        username: proxyForPuppeteer.username || '',
        password: proxyForPuppeteer.password || '',
      });
    }
    
    // Set up network response listener BEFORE navigation
    let pdfUrl = null;
    const responsePromise = new Promise((resolve) => {
      const handler = (response) => {
        const url = response.url();
        if (url.includes('FileDownload.aspx')) {
          console.log(`[${new Date().toISOString()}] ✅ Captured FileDownload.aspx URL: ${url}`);
          pdfUrl = url;
          page.off('response', handler);
          resolve(url);
        }
      };
      page.on('response', handler);
      
      // Also listen for new pages/tabs (PDF might open in new window)
      browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
          try {
            const newPage = await target.page();
            if (newPage) {
              const newUrl = newPage.url();
              if (newUrl && newUrl.includes('FileDownload.aspx')) {
                console.log(`[${new Date().toISOString()}] ✅ PDF opened in new tab: ${newUrl}`);
                pdfUrl = newUrl;
                page.off('response', handler);
                resolve(newUrl);
              }
            }
          } catch (e) {
            // Ignore errors from accessing new page
          }
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        page.off('response', handler);
        resolve(null);
      }, 30000);
    });
    
    // Navigate to page
    console.log('Navigating to website...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000, ignoreHTTPSErrors: true });
    console.log('✅ Page loaded successfully');
    await new Promise(r => setTimeout(r, 800)); // Wait for JS to initialize
    
    // Fill district
    console.log(`Filling district: ${district}...`);
    await page.waitForSelector('select[name="ddl_district"]', { timeout: 6000 });
    await page.evaluate((district) => {
      const select = document.querySelector('select[name="ddl_district"]');
      select.value = district;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, district);
    console.log('✅ District filled');
    
    // Wait for taluk dropdown to populate
    console.log('Waiting for taluk dropdown...');
    await page.waitForFunction(
      (taluk) => {
        const select = document.querySelector('select[name="ddl_taluk"]');
        if (!select) return false;
        const options = Array.from(select.options).filter(opt => opt.value && opt.value !== '0');
        return options.length > 0 && options.some(opt => opt.value === taluk);
      },
      { timeout: 6000 },
      taluk
    );
    
    // Fill taluk
    console.log(`Filling taluk: ${taluk}...`);
    await page.evaluate((taluk) => {
      const select = document.querySelector('select[name="ddl_taluk"]');
      select.value = taluk;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, taluk);
    console.log('✅ Taluk filled');
    
    // Wait for hobli dropdown to populate
    console.log('Waiting for hobli dropdown...');
    await page.waitForFunction(
      (hobli) => {
        const select = document.querySelector('select[name="ddl_hobli"]');
        if (!select) return false;
        const options = Array.from(select.options).filter(opt => opt.value && opt.value !== '0');
        return options.length > 0 && options.some(opt => opt.value === hobli);
      },
      { timeout: 6000 },
      hobli
    );
    
    // Fill hobli
    console.log(`Filling hobli: ${hobli}...`);
    await page.evaluate((hobli) => {
      const select = document.querySelector('select[name="ddl_hobli"]');
      select.value = hobli;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, hobli);
    console.log('✅ Hobli filled');
    
    // Fill village
    console.log(`Filling village: ${village}...`);
    await page.waitForSelector('input[name="txtVlgName"]', { timeout: 10000 });
    await page.evaluate((village) => {
      const input = document.querySelector('input[name="txtVlgName"]');
      input.value = '';
      input.value = village;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, village);
    console.log('✅ Village filled');
    
    // Click search
    console.log('Clicking search button...');
    await page.waitForSelector('input[name="btnSearch"]', { timeout: 10000 });
    await page.click('input[name="btnSearch"]');
    console.log('✅ Search button clicked');
    
    // Wait for results grid
    console.log('Waiting for results grid...');
    await page.waitForSelector('table[id*="grdMaps"]', { timeout: 10000 });
    console.log('✅ Results grid appeared');
    
    // Wait a bit for grid content to render
    await new Promise(r => setTimeout(r, 1500));
    
    // Wait for PDF button - try specific ID first
    console.log('Waiting for PDF button...');
    await page.waitForSelector('#grdMaps_ImgPdf_0, img[id*="ImgPdf"]', { timeout: 8000 });
    console.log('✅ PDF button found');
    
    // Click the PDF button directly
    console.log('Clicking PDF button (#grdMaps_ImgPdf_0)...');
    try {
      await page.click('#grdMaps_ImgPdf_0');
      console.log('✅ Clicked #grdMaps_ImgPdf_0');
    } catch (e) {
      console.log('⚠️  #grdMaps_ImgPdf_0 not found, trying generic selector...');
      await page.click('img[id*="ImgPdf"]');
      console.log('✅ Clicked img[id*="ImgPdf"]');
    }
    
    // Small delay after click
    await new Promise(r => setTimeout(r, 800));
    
    // Wait for network response (FileDownload.aspx)
    console.log('Waiting for PDF URL from network response...');
    let capturedUrl = await Promise.race([
      responsePromise,
      new Promise((resolve) => setTimeout(() => resolve(null), 15000)) // Increased timeout
    ]);
    
    // Retry logic if first attempt failed
    if (!capturedUrl && !pdfUrl) {
      console.log('⚠️  First attempt failed, retrying PDF button click...');
      
      // Try clicking again with a different strategy
      await page.evaluate(() => {
        const pdfButtons = document.querySelectorAll('img[id*="ImgPdf"]');
        if (pdfButtons.length > 0) {
          pdfButtons[0].scrollIntoView({ behavior: 'instant', block: 'center' });
          setTimeout(() => pdfButtons[0].click(), 100);
        }
      });
      
      // Wait for response again
      await new Promise(r => setTimeout(r, 1000));
      capturedUrl = pdfUrl; // Check if targetcreated listener caught it
    }
    
    if (capturedUrl || pdfUrl) {
      const finalUrl = capturedUrl || pdfUrl;
      console.log(`[${new Date().toISOString()}] ✅ PDF URL captured: ${finalUrl}`);
      return finalUrl;
    }
    
    console.log('PDF URL not found in network responses after retry');
    return null;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error extracting PDF URL:`, error.message);
    console.error('Stack:', error.stack);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API endpoint
app.post('/api/get-pdf-url', async (req, res) => {
  try {
    const { district, taluk, hobli, village } = req.body;
    
    if (!district || !taluk || !hobli || !village) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required parameters: district, taluk, hobli, village' 
      });
    }
    
    console.log(`[${new Date().toISOString()}] Request received:`, { district, taluk, hobli, village });
    
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `${district}-${taluk}-${hobli}-${village}`;
    if (pdfUrlCache.has(cacheKey)) {
      const cached = pdfUrlCache.get(cacheKey);
      console.log(`[${new Date().toISOString()}] ✅ Cache hit for ${village}`);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[${new Date().toISOString()}] Request completed in ${duration}s (cached)`);
      return res.json({ success: true, pdfUrl: cached, cached: true });
    }
    
    // Use Puppeteer (most reliable method) with request queuing
    console.log('[API] Fetching PDF URL with Puppeteer...');
    
    const pdfUrl = await queueRequest(async () => {
      return await getPdfUrl(district, taluk, hobli, village);
    });
    
    // Cache the result if successful
    if (pdfUrl) {
      pdfUrlCache.set(cacheKey, pdfUrl);
      console.log(`[${new Date().toISOString()}] ✅ Cached result for ${village}`);
    }
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`[${new Date().toISOString()}] Request completed in ${duration}s`);
    
    if (pdfUrl) {
      res.json({ success: true, pdfUrl });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'PDF URL not found. Please check your selections.' 
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Error:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Download PDF endpoint - serves PDF directly with download headers
app.post('/api/download-pdf', async (req, res) => {
  const { district, taluk, hobli, village } = req.body;
  
  if (!district || !taluk || !hobli || !village) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }
  
  try {
    // Get PDF URL using existing function (with queue management)
    const result = await queueRequest(async () => {
      return await getPdfUrl(district, taluk, hobli, village);
    });
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'PDF URL not found. Please check your selections.' 
      });
    }
    
    // Download PDF and stream to client
    console.log(`[Download] Fetching PDF from: ${result}`);
    
    const pdfReqOpts = proxyAgent ? { agent: proxyAgent } : {};
    https.get(result, pdfReqOpts, (pdfResponse) => {
      if (pdfResponse.statusCode !== 200) {
        return res.status(pdfResponse.statusCode).json({
          success: false,
          error: `Failed to download PDF: HTTP ${pdfResponse.statusCode}`
        });
      }
      
      // Set download headers
      const filename = `${village.replace(/[^a-zA-Z0-9]/g, '_')}_Map.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
      
      // Pipe PDF to response
      pdfResponse.pipe(res);
    }).on('error', (err) => {
      console.error('[Download] Error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to download PDF'
      });
    });
    
  } catch (error) {
    console.error('[Download] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cacheSize: pdfUrlCache.size,
    mode: IS_DEV ? 'development' : 'production',
    headless: !IS_DEV,
    queue: {
      active: activeRequests,
      waiting: requestQueue.length,
      maxConcurrent: MAX_CONCURRENT_REQUESTS
    }
  });
});

// Cache management
app.get('/api/cache/stats', (req, res) => {
  res.json({
    size: pdfUrlCache.size,
    sampleKeys: Array.from(pdfUrlCache.keys()).slice(0, 10),
  });
});

app.delete('/api/cache', (req, res) => {
  const size = pdfUrlCache.size;
  pdfUrlCache.clear();
  console.log(`[Cache] Cleared ${size} entries`);
  res.json({ success: true, cleared: size });
});

// Pre-fetch endpoint for common villages
app.post('/api/prefetch', async (req, res) => {
  try {
    const { villages } = req.body; // Array of {district, taluk, hobli, village}
    if (!Array.isArray(villages)) {
      return res.status(400).json({ error: 'villages must be an array' });
    }
    
    console.log(`[Prefetch] Starting for ${villages.length} villages...`);
    const results = [];
    
    for (const loc of villages.slice(0, 50)) { // Limit to 50 at once
      const { district, taluk, hobli, village } = loc;
      if (!district || !taluk || !hobli || !village) continue;
      
      const cacheKey = `${district}-${taluk}-${hobli}-${village}`;
      
      if (pdfUrlCache.has(cacheKey)) {
        results.push({ ...loc, status: 'already_cached' });
        continue;
      }
      
      try {
        const pdfUrl = await getPdfUrl(district, taluk, hobli, village);
        if (pdfUrl) {
          pdfUrlCache.set(cacheKey, pdfUrl);
          results.push({ ...loc, status: 'fetched', pdfUrl });
        } else {
          results.push({ ...loc, status: 'not_found' });
        }
      } catch (err) {
        results.push({ ...loc, status: 'error', error: err.message });
      }
      
      await new Promise(r => setTimeout(r, 1000)); // Small delay
    }
    
    const fetched = results.filter(r => r.status === 'fetched').length;
    const cached = results.filter(r => r.status === 'already_cached').length;
    console.log(`[Prefetch] Done: ${fetched} fetched, ${cached} already cached`);
    res.json({ success: true, fetched, cached, total: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Next.js static export when running in single-container mode (Railway)
const path = require('path');
const fs = require('fs');
const outDir = path.join(__dirname, '..', 'out');
if (fs.existsSync(outDir)) {
  app.use(express.static(outDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next();
    const base = req.path === '/' ? 'index' : req.path.slice(1).replace(/\/$/, '');
    const file = path.join(outDir, base + '.html');
    if (fs.existsSync(file)) return res.sendFile(path.resolve(file));
    res.sendFile(path.join(outDir, 'index.html'));
  });
  console.log('[Server] Serving Next.js static export from /out');
}

// Catch-all so we return JSON 404 (proves Express is running)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GeoDocs running on http://localhost:${PORT}`);
  console.log(`📡 API: POST /api/get-pdf-url, POST /api/download-pdf`);
  console.log(`💚 Health: GET /health, GET /api/ping`);
  console.log(`🔧 Mode: ${IS_DEV ? 'Development (headful)' : 'Production (headless)'}`);
});
