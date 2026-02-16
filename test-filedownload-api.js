const https = require('https');

// Test the FileDownload.aspx endpoint with a sample file parameter
// Based on the pattern: https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=%5c%5cbhm-db-pp05%5cDistrict%5cMapshared%5c1258.pdf

console.log('🧪 Testing FileDownload.aspx API...\n');

// Test with the example URL pattern you provided
const testUrls = [
  'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=%5c%5cbhm-db-pp05%5cDistrict%5cMapshared%5c1258.pdf',
  // Try with different encoding
  'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=\\\\bhm-db-pp05\\District\\Mapshared\\1258.pdf',
];

function testPdfUrl(url, testName) {
  return new Promise((resolve, reject) => {
    console.log(`\n📄 Testing: ${testName}`);
    console.log(`   URL: ${url.substring(0, 100)}...`);
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log(`   Content-Length: ${res.headers['content-length'] || 'unknown'}`);
      console.log(`   Content-Disposition: ${res.headers['content-disposition'] || 'none'}`);
      
      let data = '';
      let isPdf = false;
      
      res.on('data', (chunk) => {
        data += chunk;
        // Check first few bytes for PDF magic number
        if (data.length >= 4) {
          const header = data.substring(0, 4);
          if (header === '%PDF') {
            isPdf = true;
          }
        }
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          if (isPdf || res.headers['content-type']?.includes('pdf')) {
            console.log(`   ✅ SUCCESS: PDF is accessible!`);
            console.log(`   PDF size: ${data.length} bytes`);
            resolve({success: true, url, size: data.length, isPdf});
          } else {
            console.log(`   ⚠️  Response is not a PDF`);
            console.log(`   First 200 chars: ${data.substring(0, 200)}`);
            resolve({success: false, url, error: 'Not a PDF', data: data.substring(0, 500)});
          }
        } else if (res.statusCode === 302 || res.statusCode === 301) {
          console.log(`   🔄 Redirect to: ${res.headers.location}`);
          resolve({success: false, url, error: 'Redirect', location: res.headers.location});
        } else {
          console.log(`   ❌ Failed: Status ${res.statusCode}`);
          resolve({success: false, url, error: `Status ${res.statusCode}`, data: data.substring(0, 500)});
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve({success: false, url, error: err.message});
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⏱️  Timeout`);
      resolve({success: false, url, error: 'Timeout'});
    });

    req.end();
  });
}

// Also test if we need to get the actual file parameter from the website first
async function testWithFormSubmission() {
  console.log('\n\n🔍 Testing: Getting file parameter from form submission...\n');
  
  // This would require the full form submission flow
  // For now, let's just test the FileDownload.aspx pattern
  console.log('Note: To get actual file parameter, we need to:');
  console.log('1. Submit form with district/taluk/hobli/village');
  console.log('2. Wait for grid to appear');
  console.log('3. Extract FileDownload.aspx URL from #grdMaps_ImgPdf_0 onclick');
  console.log('4. Use that URL to download PDF\n');
}

// Run tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('FileDownload.aspx API Test');
  console.log('='.repeat(60));
  
  const results = [];
  
  // Test URL 1: URL encoded
  results.push(await testPdfUrl(testUrls[0], 'URL Encoded'));
  
  // Test URL 2: Direct path
  results.push(await testPdfUrl(testUrls[1], 'Direct Path'));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary:');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ Test ${index + 1}: SUCCESS - PDF accessible (${result.size} bytes)`);
    } else {
      console.log(`❌ Test ${index + 1}: FAILED - ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  if (successCount > 0) {
    console.log(`\n✅ ${successCount}/${results.length} tests passed!`);
    console.log('The FileDownload.aspx endpoint is working correctly.');
  } else {
    console.log(`\n❌ All tests failed.`);
    console.log('Possible reasons:');
    console.log('- File parameter format is incorrect');
    console.log('- Server requires authentication/session');
    console.log('- File path needs to be extracted from actual form submission');
  }
  
  await testWithFormSubmission();
}

runTests().catch(console.error);

