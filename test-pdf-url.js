// Quick test script to find a sample PDF URL
const https = require('https');

// Test with a known district/taluk/hobli/village combination
// Using Bagalkote -> JAMAKHANDI -> JAMAKHANDI -> ALABALA (first village from our data)

console.log('Testing PDF URL extraction...\n');

// This would be the pattern after form submission
// The PDF would be accessible via the grdMaps_ImgPdf_0 onclick handler

// Sample test - we need to actually submit the form to get the PDF URL
// But we can document the expected pattern:

console.log('Expected PDF URL pattern:');
console.log('- After form submission, grid appears with id="grdMaps"');
console.log('- PDF image button has id="grdMaps_ImgPdf_0" (or _1, _2, etc.)');
console.log('- onclick handler contains the PDF URL');
console.log('- Pattern: window.open(\'PDF_URL\', ...) or similar\n');

console.log('To test:');
console.log('1. Open https://landrecords.karnataka.gov.in/service3/');
console.log('2. Select: District=Bagalkote, Taluk=JAMAKHANDI, Hobli=JAMAKHANDI, Village=ALABALA');
console.log('3. Click Search');
console.log('4. Check the onclick attribute of #grdMaps_ImgPdf_0');
console.log('5. Extract the PDF URL from the onclick handler\n');

// We can't easily test without a browser, but we can show the expected structure
console.log('Example onclick pattern:');
console.log('onclick="window.open(\'/service3/PDFs/village_map_123.pdf\', \'_blank\')"');
console.log('or');
console.log('onclick="javascript:window.open(\'https://landrecords.karnataka.gov.in/service3/PDFs/village_map_123.pdf\')"');

