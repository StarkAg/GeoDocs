const https = require('https');
const http = require('http');
const { parse } = require('node-html-parser');

// Function to fetch HTML
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

// Function to extract options from select element
function extractOptions(html, selectName) {
  const root = parse(html);
  const select = root.querySelector(`select[name="${selectName}"]`);
  if (!select) return [];
  
  const options = select.querySelectorAll('option');
  return options
    .filter(opt => opt.getAttribute('value') !== '0' && opt.getAttribute('value') !== 'All')
    .map(opt => ({
      value: opt.getAttribute('value'),
      label: opt.text.trim()
    }));
}

// Function to submit form and get cascading dropdown options
async function getCascadingOptions(districtValue, talukValue = null, hobliValue = null) {
  try {
    // First, get the initial page to get ViewState
    const initialHTML = await fetchHTML('https://landrecords.karnataka.gov.in/service3/');
    const root = parse(initialHTML);
    
    const viewState = root.querySelector('input[name="__VIEWSTATE"]')?.getAttribute('value') || '';
    const eventValidation = root.querySelector('input[name="__EVENTVALIDATION"]')?.getAttribute('value') || '';
    
    // Build form data
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('__VIEWSTATEGENERATOR', '');
    
    if (districtValue) {
      formData.append('ddl_district', districtValue);
      formData.append('__EVENTTARGET', 'ddl_district');
    }
    if (talukValue) {
      formData.append('ddl_taluk', talukValue);
      formData.append('__EVENTTARGET', 'ddl_taluk');
    }
    if (hobliValue) {
      formData.append('ddl_hobli', hobliValue);
      formData.append('__EVENTTARGET', 'ddl_hobli');
    }
    
    // Post request
    const postData = formData.toString();
    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
        'User-Agent': 'Mozilla/5.0',
        'Cookie': 'ASP.NET_SessionId=test'
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Main function to extract all data
async function extractAllData() {
  console.log('Fetching initial page...');
  const initialHTML = await fetchHTML('https://landrecords.karnataka.gov.in/service3/');
  const districts = extractOptions(initialHTML, 'ddl_district');
  
  console.log(`Found ${districts.length} districts`);
  
  const allData = [];
  
  for (const district of districts) {
    console.log(`\nProcessing district: ${district.label} (${district.value})`);
    
    const districtHTML = await getCascadingOptions(district.value);
    if (!districtHTML) continue;
    
    const taluks = extractOptions(districtHTML, 'ddl_taluk');
    console.log(`  Found ${taluks.length} taluks`);
    
    const districtData = {
      value: district.value,
      label: district.label,
      taluks: []
    };
    
    for (const taluk of taluks) {
      console.log(`    Processing taluk: ${taluk.label} (${taluk.value})`);
      
      const talukHTML = await getCascadingOptions(district.value, taluk.value);
      if (!talukHTML) continue;
      
      const hoblis = extractOptions(talukHTML, 'ddl_hobli');
      console.log(`      Found ${hoblis.length} hoblis`);
      
      const talukData = {
        value: taluk.value,
        label: taluk.label,
        hoblis: hoblis.map(h => ({
          value: h.value,
          label: h.label,
          villages: [] // Villages are text input, not dropdown
        }))
      };
      
      districtData.taluks.push(talukData);
      
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    allData.push(districtData);
    
    // Add delay between districts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allData;
}

// Run extraction
extractAllData()
  .then(data => {
    const fs = require('fs');
    fs.writeFileSync('extracted-data.json', JSON.stringify(data, null, 2));
    console.log('\n✅ Data extraction complete! Saved to extracted-data.json');
    console.log(`Total districts: ${data.length}`);
  })
  .catch(error => {
    console.error('Error during extraction:', error);
  });

