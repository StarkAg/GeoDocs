const https = require('https');
const { parse } = require('node-html-parser');

// Store cookies for session
let cookies = '';

// Function to fetch HTML with cookie handling
function fetchHTML(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': cookies,
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      // Extract cookies from response
      const setCookieHeaders = res.headers['set-cookie'];
      if (setCookieHeaders) {
        cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Extract ViewState and other hidden fields
function extractHiddenFields(html) {
  const root = parse(html);
  return {
    viewState: root.querySelector('input[name="__VIEWSTATE"]')?.getAttribute('value') || '',
    viewStateGenerator: root.querySelector('input[name="__VIEWSTATEGENERATOR"]')?.getAttribute('value') || '',
    eventValidation: root.querySelector('input[name="__EVENTVALIDATION"]')?.getAttribute('value') || ''
  };
}

// Extract options from select element
function extractOptions(html, selectName) {
  const root = parse(html);
  const select = root.querySelector(`select[name="${selectName}"]`);
  if (!select) return [];
  
  const options = select.querySelectorAll('option');
  return options
    .filter(opt => {
      const value = opt.getAttribute('value');
      return value && value !== '0' && value !== 'All' && value !== '--Select--';
    })
    .map(opt => ({
      value: opt.getAttribute('value'),
      label: opt.text.trim()
    }));
}

// Submit form to get cascading options
async function getCascadingOptions(districtValue, talukValue = null) {
  try {
    // Get initial page
    const initialHTML = await fetchHTML('https://landrecords.karnataka.gov.in/service3/');
    let hiddenFields = extractHiddenFields(initialHTML);
    
    // Step 1: Select district
    const formData1 = new URLSearchParams();
    formData1.append('__VIEWSTATE', hiddenFields.viewState);
    formData1.append('__VIEWSTATEGENERATOR', hiddenFields.viewStateGenerator);
    formData1.append('__EVENTVALIDATION', hiddenFields.eventValidation);
    formData1.append('__EVENTTARGET', 'ddl_district');
    formData1.append('__EVENTARGUMENT', '');
    formData1.append('ddl_district', districtValue);
    formData1.append('ddl_taluk', '');
    formData1.append('ddl_hobli', '');
    formData1.append('txtVlgName', '');
    formData1.append('ddl_mapType', '0');
    
    const html1 = await fetchHTML('https://landrecords.karnataka.gov.in/service3/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
      body: formData1.toString()
    });
    
    hiddenFields = extractHiddenFields(html1);
    const taluks = extractOptions(html1, 'ddl_taluk');
    
    // Step 2: For each taluk, get hoblis
    const talukData = [];
    for (const taluk of taluks) {
      console.log(`      Getting hoblis for taluk: ${taluk.label}`);
      
      const formData2 = new URLSearchParams();
      formData2.append('__VIEWSTATE', hiddenFields.viewState);
      formData2.append('__VIEWSTATEGENERATOR', hiddenFields.viewStateGenerator);
      formData2.append('__EVENTVALIDATION', hiddenFields.eventValidation);
      formData2.append('__EVENTTARGET', 'ddl_taluk');
      formData2.append('__EVENTARGUMENT', '');
      formData2.append('ddl_district', districtValue);
      formData2.append('ddl_taluk', taluk.value);
      formData2.append('ddl_hobli', '');
      formData2.append('txtVlgName', '');
      formData2.append('ddl_mapType', '0');
      
      const html2 = await fetchHTML('https://landrecords.karnataka.gov.in/service3/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://landrecords.karnataka.gov.in/service3/',
        },
        body: formData2.toString()
      });
      
      const hoblis = extractOptions(html2, 'ddl_hobli');
      console.log(`        Found ${hoblis.length} hoblis`);
      
      talukData.push({
        value: taluk.value,
        label: taluk.label,
        hoblis: hoblis.map(h => ({
          value: h.value,
          label: h.label,
          villages: [] // Villages are text input
        }))
      });
      
      // Update hidden fields for next iteration
      hiddenFields = extractHiddenFields(html2);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return talukData;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Main extraction function
async function extractAllData() {
  console.log('Fetching initial page...');
  const initialHTML = await fetchHTML('https://landrecords.karnataka.gov.in/service3/');
  const districts = extractOptions(initialHTML, 'ddl_district');
  
  console.log(`Found ${districts.length} districts\n`);
  
  const allData = [];
  
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    console.log(`[${i + 1}/${districts.length}] Processing district: ${district.label} (${district.value})`);
    
    const taluks = await getCascadingOptions(district.value);
    
    allData.push({
      value: district.value,
      label: district.label,
      taluks: taluks
    });
    
    console.log(`  ✅ Completed: ${taluks.length} taluks\n`);
    
    // Delay between districts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allData;
}

// Run extraction
extractAllData()
  .then(data => {
    const fs = require('fs');
    fs.writeFileSync('extracted-data-complete.json', JSON.stringify(data, null, 2));
    console.log('\n✅ Data extraction complete!');
    console.log(`Total districts: ${data.length}`);
    const totalTaluks = data.reduce((sum, d) => sum + d.taluks.length, 0);
    const totalHoblis = data.reduce((sum, d) => sum + d.taluks.reduce((s, t) => s + t.hoblis.length, 0), 0);
    console.log(`Total taluks: ${totalTaluks}`);
    console.log(`Total hoblis: ${totalHoblis}`);
    console.log('Saved to extracted-data-complete.json');
  })
  .catch(error => {
    console.error('Error during extraction:', error);
  });

