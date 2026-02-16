const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

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

const BASE_URL = 'https://landrecords.karnataka.gov.in/service3/';

async function getPdfUrl(district, taluk, hobli, village) {
  let browser = null;
  try {
    console.log(`[${new Date().toISOString()}] Starting PDF extraction: ${district}, ${taluk}, ${hobli}, ${village}`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: !IS_DEV,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    
    const page = await browser.newPage();
    
    // Set up network response listener BEFORE navigation
    let pdfUrl = null;
    const responsePromise = new Promise((resolve) => {
      const handler = (response) => {
        const url = response.url();
        if (url.includes('FileDownload.aspx')) {
          console.log(`[${new Date().toISOString()}] ✅ Captured FileDownload.aspx URL: ${url}`);
          pdfUrl = url;
          page.removeListener('response', handler);
          resolve(url);
        }
      };
      page.on('response', handler);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        page.removeListener('response', handler);
        resolve(null);
      }, 30000);
    });
    
    // Navigate to page
    console.log('Navigating to website...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Fill district
    console.log('Filling district...');
    await page.waitForSelector('select[name="ddl_district"]', { timeout: 10000 });
    await page.evaluate((district) => {
      const select = document.querySelector('select[name="ddl_district"]');
      select.value = district;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, district);
    
    // Wait for taluk dropdown to populate
    console.log('Waiting for taluk dropdown...');
    await page.waitForFunction(
      (taluk) => {
        const select = document.querySelector('select[name="ddl_taluk"]');
        if (!select) return false;
        const options = Array.from(select.options).filter(opt => opt.value && opt.value !== '0');
        return options.length > 0 && options.some(opt => opt.value === taluk);
      },
      { timeout: 10000 },
      taluk
    );
    
    // Fill taluk
    console.log('Filling taluk...');
    await page.evaluate((taluk) => {
      const select = document.querySelector('select[name="ddl_taluk"]');
      select.value = taluk;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, taluk);
    
    // Wait for hobli dropdown to populate
    console.log('Waiting for hobli dropdown...');
    await page.waitForFunction(
      (hobli) => {
        const select = document.querySelector('select[name="ddl_hobli"]');
        if (!select) return false;
        const options = Array.from(select.options).filter(opt => opt.value && opt.value !== '0');
        return options.length > 0 && options.some(opt => opt.value === hobli);
      },
      { timeout: 10000 },
      hobli
    );
    
    // Fill hobli
    console.log('Filling hobli...');
    await page.evaluate((hobli) => {
      const select = document.querySelector('select[name="ddl_hobli"]');
      select.value = hobli;
    }, hobli);
    
    // Fill village
    console.log('Filling village...');
    await page.waitForSelector('input[name="txtVlgName"]', { timeout: 10000 });
    await page.evaluate((village) => {
      const input = document.querySelector('input[name="txtVlgName"]');
      input.value = '';
      input.value = village;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, village);
    
    // Click search
    console.log('Clicking search button...');
    await page.waitForSelector('input[name="btnSearch"]', { timeout: 10000 });
    await page.click('input[name="btnSearch"]');
    
    // Wait for grid to appear
    console.log('Waiting for results grid...');
    await page.waitForSelector('table[id*="grdMaps"], table[id*="Grid"]', { timeout: 20000 });
    
    // Wait for PDF button to be visible
    console.log('Waiting for PDF button...');
    await page.waitForSelector('#grdMaps_ImgPdf_0, img[id*="grdMaps_ImgPdf"], img[id*="ImgPdf"]', { timeout: 10000 });
    
    // Click PDF button - network listener will catch the response
    console.log('Clicking PDF button...');
    await page.click('#grdMaps_ImgPdf_0').catch(() => {
      // Fallback if specific selector fails
      return page.evaluate(() => {
        const pdfImg = document.querySelector('img[id*="grdMaps_ImgPdf"]') || 
                       document.querySelector('table[id*="grdMaps"] img[id*="ImgPdf"]');
        if (pdfImg) pdfImg.click();
      });
    });
    
    // Wait for network response (FileDownload.aspx)
    console.log('Waiting for PDF URL from network response...');
    const capturedUrl = await Promise.race([
      responsePromise,
      new Promise((resolve) => setTimeout(() => resolve(null), 10000))
    ]);
    
    if (capturedUrl || pdfUrl) {
      const finalUrl = capturedUrl || pdfUrl;
      console.log(`[${new Date().toISOString()}] ✅ PDF URL captured: ${finalUrl}`);
      return finalUrl;
    }
    
    console.log('PDF URL not found in network responses');
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
    const pdfUrl = await getPdfUrl(district, taluk, hobli, village);
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PDF API Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/api/get-pdf-url`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
  console.log(`🔧 Mode: ${IS_DEV ? 'Development (headful)' : 'Production (headless)'}`);
});
