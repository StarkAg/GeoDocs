const https = require('https');
const fs = require('fs');

// Use the known working FileDownload.aspx URL pattern
// Based on the test we did earlier that worked
const pdfUrl = 'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=%5c%5cbhm-db-pp05%5cDistrict%5cMapshared%5c1258.pdf';

console.log('🗺️  Downloading Sample Village Map PDF...\n');
console.log('URL:', pdfUrl);
console.log('');

function downloadPdf() {
  return new Promise((resolve, reject) => {
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

    console.log('📥 Downloading PDF...');
    const file = fs.createWriteStream('sample-village-map.pdf');
    
    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log(`   Content-Length: ${res.headers['content-length'] || 'unknown'}`);
      
      if (res.statusCode === 200 && res.headers['content-type']?.includes('pdf')) {
        let downloaded = 0;
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          process.stdout.write(`\r   Downloaded: ${(downloaded / 1024).toFixed(2)} KB`);
        });
        
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync('sample-village-map.pdf');
          console.log(`\n\n✅ PDF downloaded successfully!`);
          console.log(`   File: sample-village-map.pdf`);
          console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
          console.log(`   Location: ${process.cwd()}/sample-village-map.pdf`);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download PDF: Status ${res.statusCode}, Type: ${res.headers['content-type']}`));
      }
    });

    req.on('error', (err) => {
      reject(new Error(`Request error: ${err.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });

    req.end();
  });
}

downloadPdf()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS: Sample village map PDF downloaded!');
    console.log('='.repeat(60));
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

