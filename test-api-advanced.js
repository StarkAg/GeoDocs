/**
 * Advanced test to inspect the website structure
 */

const https = require('https');
const fs = require('fs');

// Fetch and analyze the main page
https.get('https://landrecords.karnataka.gov.in/service3/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // Save HTML for inspection
    fs.writeFileSync('website-content.html', data);
    console.log('Saved website content to website-content.html');
    
    // Look for JavaScript files that might contain API endpoints
    const jsMatches = data.match(/<script[^>]*src=["']([^"']+\.js[^"']*)["']/gi);
    if (jsMatches) {
      console.log('\nFound JavaScript files:');
      jsMatches.forEach(match => {
        const src = match.match(/src=["']([^"']+)["']/i);
        if (src) console.log(`  ${src[1]}`);
      });
    }
    
    // Look for AJAX calls or fetch requests
    const ajaxMatches = data.match(/(fetch|ajax|xmlhttp|\.post|\.get)\(["']([^"']+)["']/gi);
    if (ajaxMatches) {
      console.log('\nFound potential API calls:');
      ajaxMatches.forEach(match => console.log(`  ${match}`));
    }
    
    // Look for form fields
    const inputMatches = data.match(/<input[^>]*name=["']([^"']+)["']/gi);
    if (inputMatches) {
      console.log('\nFound form input fields:');
      const uniqueFields = new Set();
      inputMatches.forEach(match => {
        const name = match.match(/name=["']([^"']+)["']/i);
        if (name) uniqueFields.add(name[1]);
      });
      uniqueFields.forEach(field => console.log(`  ${field}`));
    }
    
    // Look for select/dropdown fields
    const selectMatches = data.match(/<select[^>]*name=["']([^"']+)["']/gi);
    if (selectMatches) {
      console.log('\nFound select/dropdown fields:');
      selectMatches.forEach(match => {
        const name = match.match(/name=["']([^"']+)["']/i);
        if (name) console.log(`  ${name[1]}`);
      });
    }
    
    // Look for any URL patterns that might be API endpoints
    const urlPatterns = data.match(/["']([^"']*\/[^"']*\.(php|aspx|jsp|do|action)[^"']*)["']/gi);
    if (urlPatterns) {
      console.log('\nFound potential endpoint URLs:');
      const uniqueUrls = new Set();
      urlPatterns.forEach(match => {
        const url = match.match(/["']([^"']+)["']/i);
        if (url && !url[1].startsWith('http')) {
          uniqueUrls.add(url[1]);
        }
      });
      uniqueUrls.forEach(url => console.log(`  ${url}`));
    }
    
    console.log('\n---\nCheck website-content.html for full HTML structure');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});

