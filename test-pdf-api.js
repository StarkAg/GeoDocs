const https = require('https');
const http = require('http');

// Test data - using Bagalkote -> JAMAKHANDI -> JAMAKHANDI -> ALABALA
const testData = {
  district: '2', // Bagalkote
  taluka: '1',   // JAMAKHANDI
  hobli: '1',    // JAMAKHANDI
  village: 'ALABALA'
};

console.log('🧪 Testing PDF API...\n');
console.log('Test Data:');
console.log(`  District: ${testData.district} (Bagalkote)`);
console.log(`  Taluka: ${testData.taluka} (JAMAKHANDI)`);
console.log(`  Hobli: ${testData.hobli} (JAMAKHANDI)`);
console.log(`  Village: ${testData.village}\n`);

// Step 1: Get initial page and extract ViewState
function getInitialPage() {
  return new Promise((resolve, reject) => {
    console.log('Step 1: Loading initial page...');
    
    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Extract ViewState
        const viewStateMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const viewStateGenMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const eventValidationMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        
        const viewState = viewStateMatch ? viewStateMatch[1] : '';
        const viewStateGen = viewStateGenMatch ? viewStateGenMatch[1] : '';
        const eventValidation = eventValidationMatch ? eventValidationMatch[1] : '';
        
        console.log('✓ Initial page loaded');
        console.log(`  ViewState length: ${viewState.length}`);
        
        resolve({
          viewState,
          viewStateGen,
          eventValidation,
          html: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Step 2: Submit district selection
function selectDistrict(viewStateData) {
  return new Promise((resolve, reject) => {
    console.log('\nStep 2: Selecting district...');
    
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateData.viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateData.viewStateGen);
    formData.append('__EVENTVALIDATION', viewStateData.eventValidation);
    formData.append('__EVENTTARGET', 'ddl_district');
    formData.append('__EVENTARGUMENT', '');
    formData.append('ddl_district', testData.district);
    formData.append('ddl_taluk', '0');
    formData.append('ddl_hobli', '0');
    formData.append('txtVlgName', '');
    formData.append('btnSearch', '');

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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const viewStateMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const viewStateGenMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const eventValidationMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        
        console.log('✓ District selected');
        
        resolve({
          viewState: viewStateMatch ? viewStateMatch[1] : '',
          viewStateGen: viewStateGenMatch ? viewStateGenMatch[1] : '',
          eventValidation: eventValidationMatch ? eventValidationMatch[1] : '',
          html: data
        });
      });
    });

    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 3: Select taluka
function selectTaluka(viewStateData) {
  return new Promise((resolve, reject) => {
    console.log('\nStep 3: Selecting taluka...');
    
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateData.viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateData.viewStateGen);
    formData.append('__EVENTVALIDATION', viewStateData.eventValidation);
    formData.append('__EVENTTARGET', 'ddl_taluk');
    formData.append('__EVENTARGUMENT', '');
    formData.append('ddl_district', testData.district);
    formData.append('ddl_taluk', testData.taluka);
    formData.append('ddl_hobli', '0');
    formData.append('txtVlgName', '');
    formData.append('btnSearch', '');

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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const viewStateMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const viewStateGenMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const eventValidationMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        
        console.log('✓ Taluka selected');
        
        resolve({
          viewState: viewStateMatch ? viewStateMatch[1] : '',
          viewStateGen: viewStateGenMatch ? viewStateGenMatch[1] : '',
          eventValidation: eventValidationMatch ? eventValidationMatch[1] : '',
          html: data
        });
      });
    });

    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 4: Select hobli
function selectHobli(viewStateData) {
  return new Promise((resolve, reject) => {
    console.log('\nStep 4: Selecting hobli...');
    
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateData.viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateData.viewStateGen);
    formData.append('__EVENTVALIDATION', viewStateData.eventValidation);
    formData.append('__EVENTTARGET', 'ddl_hobli');
    formData.append('__EVENTARGUMENT', '');
    formData.append('ddl_district', testData.district);
    formData.append('ddl_taluk', testData.taluka);
    formData.append('ddl_hobli', testData.hobli);
    formData.append('txtVlgName', '');
    formData.append('btnSearch', '');

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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const viewStateMatch = data.match(/name="__VIEWSTATE" value="([^"]+)"/);
        const viewStateGenMatch = data.match(/name="__VIEWSTATEGENERATOR" value="([^"]+)"/);
        const eventValidationMatch = data.match(/name="__EVENTVALIDATION" value="([^"]+)"/);
        
        console.log('✓ Hobli selected');
        
        resolve({
          viewState: viewStateMatch ? viewStateMatch[1] : '',
          viewStateGen: viewStateGenMatch ? viewStateGenMatch[1] : '',
          eventValidation: eventValidationMatch ? eventValidationMatch[1] : '',
          html: data
        });
      });
    });

    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Step 5: Submit search with village name
function submitSearch(viewStateData) {
  return new Promise((resolve, reject) => {
    console.log('\nStep 5: Submitting search with village name...');
    
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateData.viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateData.viewStateGen);
    formData.append('__EVENTVALIDATION', viewStateData.eventValidation);
    formData.append('__EVENTTARGET', '');
    formData.append('__EVENTARGUMENT', '');
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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✓ Search submitted');
        console.log(`  Response length: ${data.length} bytes`);
        
        // Look for PDF in the response
        const pdfImgMatch = data.match(/id="grdMaps_ImgPdf_0"[^>]*onclick=["']([^"']+)["']/);
        if (pdfImgMatch) {
          const onclick = pdfImgMatch[1];
          console.log('\n📄 Found PDF image button!');
          console.log(`  onclick: ${onclick.substring(0, 100)}...`);
          
          // Extract PDF URL from onclick
          const pdfUrlMatch = onclick.match(/(['"])([^'"]*\.pdf[^'"]*)\1/i);
          if (pdfUrlMatch) {
            let pdfUrl = pdfUrlMatch[2];
            if (!pdfUrl.startsWith('http')) {
              pdfUrl = 'https://landrecords.karnataka.gov.in' + (pdfUrl.startsWith('/') ? '' : '/service3/') + pdfUrl;
            }
            
            console.log(`\n✅ PDF URL found: ${pdfUrl}`);
            
            // Test if PDF is accessible
            testPdfAccess(pdfUrl).then(() => {
              resolve({success: true, pdfUrl, html: data});
            }).catch((err) => {
              console.log(`\n❌ PDF URL not accessible: ${err.message}`);
              resolve({success: false, pdfUrl, error: err.message, html: data});
            });
          } else {
            console.log('\n⚠️  Could not extract PDF URL from onclick handler');
            resolve({success: false, error: 'Could not extract PDF URL', html: data});
          }
        } else {
          console.log('\n⚠️  PDF image button not found in response');
          // Save HTML for inspection
          const fs = require('fs');
          fs.writeFileSync('search-response.html', data);
          console.log('  Saved response to search-response.html for inspection');
          resolve({success: false, error: 'PDF button not found', html: data});
        }
      });
    });

    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Test if PDF is accessible
function testPdfAccess(pdfUrl) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing PDF access: ${pdfUrl}`);
    
    const url = new URL(pdfUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };

    const req = https.request(options, (res) => {
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Content-Type: ${res.headers['content-type']}`);
      console.log(`  Content-Length: ${res.headers['content-length'] || 'unknown'}`);
      
      if (res.statusCode === 200 && res.headers['content-type']?.includes('pdf')) {
        console.log('\n✅ PDF is accessible!');
        resolve();
      } else {
        reject(new Error(`PDF not accessible: Status ${res.statusCode}, Type: ${res.headers['content-type']}`));
      }
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    const initial = await getInitialPage();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const districtSelected = await selectDistrict(initial);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const talukaSelected = await selectTaluka(districtSelected);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hobliSelected = await selectHobli(talukaSelected);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await submitSearch(hobliSelected);
    
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ TEST PASSED: PDF URL extracted and accessible!');
      console.log(`📄 PDF URL: ${result.pdfUrl}`);
    } else {
      console.log('❌ TEST FAILED: Could not get PDF');
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

runTest();

