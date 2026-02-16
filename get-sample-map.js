const https = require('https');
const fs = require('fs');

// Test data - using Bagalkote -> JAMAKHANDI -> JAMAKHANDI -> ALABALA
const testData = {
  district: '2', // Bagalkote
  taluka: '1',   // JAMAKHANDI
  hobli: '1',    // JAMAKHANDI
  village: 'ALABALA'
};

console.log('🗺️  Fetching Sample Village Map PDF...\n');
console.log('Location:');
console.log(`  District: ${testData.district} (Bagalkote)`);
console.log(`  Taluka: ${testData.taluka} (JAMAKHANDI)`);
console.log(`  Hobli: ${testData.hobli} (JAMAKHANDI)`);
console.log(`  Village: ${testData.village}\n`);

let viewState = '';
let viewStateGen = '';
let eventValidation = '';

// Step 1: Get initial page
function getInitialPage() {
  return new Promise((resolve, reject) => {
    console.log('Step 1: Loading initial page...');
    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const vsMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const vsgMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const evMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        
        viewState = vsMatch ? vsMatch[1] : '';
        viewStateGen = vsgMatch ? vsgMatch[1] : '';
        eventValidation = evMatch ? evMatch[1] : '';
        
        console.log('✓ Initial page loaded');
        resolve();
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Step 2: Select district
function selectDistrict() {
  return new Promise((resolve, reject) => {
    console.log('Step 2: Selecting district...');
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGen);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('__EVENTTARGET', 'ddl_district');
    formData.append('ddl_district', testData.district);

    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString()),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const vsMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const vsgMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const evMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        viewState = vsMatch ? vsMatch[1] : '';
        viewStateGen = vsgMatch ? vsgMatch[1] : '';
        eventValidation = evMatch ? evMatch[1] : '';
        console.log('✓ District selected');
        resolve();
      });
    });
    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 3: Select taluka
function selectTaluka() {
  return new Promise((resolve, reject) => {
    console.log('Step 3: Selecting taluka...');
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGen);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('__EVENTTARGET', 'ddl_taluk');
    formData.append('ddl_district', testData.district);
    formData.append('ddl_taluk', testData.taluka);

    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString()),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const vsMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const vsgMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const evMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        viewState = vsMatch ? vsMatch[1] : '';
        viewStateGen = vsgMatch ? vsgMatch[1] : '';
        eventValidation = evMatch ? evMatch[1] : '';
        console.log('✓ Taluka selected');
        resolve();
      });
    });
    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 4: Select hobli
function selectHobli() {
  return new Promise((resolve, reject) => {
    console.log('Step 4: Selecting hobli...');
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGen);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('__EVENTTARGET', 'ddl_hobli');
    formData.append('ddl_district', testData.district);
    formData.append('ddl_taluk', testData.taluka);
    formData.append('ddl_hobli', testData.hobli);

    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString()),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const vsMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const vsgMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const evMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        viewState = vsMatch ? vsMatch[1] : '';
        viewStateGen = vsgMatch ? vsgMatch[1] : '';
        eventValidation = evMatch ? evMatch[1] : '';
        console.log('✓ Hobli selected');
        resolve();
      });
    });
    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 5: Submit search
function submitSearch() {
  return new Promise((resolve, reject) => {
    console.log('Step 5: Submitting search...');
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGen);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('ddl_district', testData.district);
    formData.append('ddl_taluk', testData.taluka);
    formData.append('ddl_hobli', testData.hobli);
    formData.append('txtVlgName', testData.village);
    formData.append('btnSearch', 'Search');

    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString()),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('✓ Search submitted');
        
        // Extract PDF URL from #grdMaps_ImgPdf_0
        const pdfImgMatch = data.match(/id="grdMaps_ImgPdf_0"[^>]*onclick=["']([^"']+)["']/);
        if (pdfImgMatch) {
          const onclick = pdfImgMatch[1];
          console.log('\n📄 Found PDF button!');
          
          // Extract FileDownload.aspx URL
          const fileDownloadMatch = onclick.match(/FileDownload\.aspx[^'"]*file=([^'"]+)/i);
          if (fileDownloadMatch) {
            const fileParam = fileDownloadMatch[1];
            const pdfUrl = 'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=' + fileParam;
            console.log(`✅ PDF URL: ${pdfUrl.substring(0, 100)}...`);
            resolve(pdfUrl);
          } else {
            reject(new Error('Could not extract FileDownload.aspx URL from onclick'));
          }
        } else {
          // Save HTML for debugging
          fs.writeFileSync('search-result.html', data);
          console.log('⚠️  PDF button not found. Saved response to search-result.html');
          reject(new Error('PDF button not found in response'));
        }
      });
    });
    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 6: Download PDF
function downloadPdf(pdfUrl) {
  return new Promise((resolve, reject) => {
    console.log('\n📥 Downloading PDF...');
    const url = new URL(pdfUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };

    const file = fs.createWriteStream('sample-village-map.pdf');
    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log(`   Content-Length: ${res.headers['content-length'] || 'unknown'}`);
      
      if (res.statusCode === 200 && res.headers['content-type']?.includes('pdf')) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync('sample-village-map.pdf');
          console.log(`\n✅ PDF downloaded successfully!`);
          console.log(`   File: sample-village-map.pdf`);
          console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download PDF: Status ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
    req.end();
  });
}

// Run the full flow
async function run() {
  try {
    await getInitialPage();
    await new Promise(r => setTimeout(r, 1000));
    
    await selectDistrict();
    await new Promise(r => setTimeout(r, 1000));
    
    await selectTaluka();
    await new Promise(r => setTimeout(r, 1000));
    
    await selectHobli();
    await new Promise(r => setTimeout(r, 1000));
    
    const pdfUrl = await submitSearch();
    
    await downloadPdf(pdfUrl);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS: Sample village map PDF downloaded!');
    console.log('='.repeat(60));
    console.log('\nFile saved as: sample-village-map.pdf');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

run();

