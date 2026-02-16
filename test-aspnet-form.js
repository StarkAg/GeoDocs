/**
 * Test ASP.NET form submission with ViewState
 */

const https = require('https');
const querystring = require('querystring');

// Step 1: Get the initial page with ViewState
function getInitialPage() {
  return new Promise((resolve, reject) => {
    console.log('Step 1: Fetching initial page to get ViewState...');
    https.get('https://landrecords.karnataka.gov.in/service3/', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Extract ViewState values
        const viewStateMatch = data.match(/<input[^>]*name=["']__VIEWSTATE["'][^>]*value=["']([^"']+)["']/i);
        const viewStateGeneratorMatch = data.match(/<input[^>]*name=["']__VIEWSTATEGENERATOR["'][^>]*value=["']([^"']+)["']/i);
        const eventValidationMatch = data.match(/<input[^>]*name=["']__EVENTVALIDATION["'][^>]*value=["']([^"']+)["']/i);
        
        const viewState = viewStateMatch ? viewStateMatch[1] : '';
        const viewStateGenerator = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : '';
        const eventValidation = eventValidationMatch ? eventValidationMatch[1] : '';
        
        console.log(`✓ Got ViewState (length: ${viewState.length})`);
        console.log(`✓ Got ViewStateGenerator: ${viewStateGenerator.substring(0, 20)}...`);
        console.log(`✓ Got EventValidation (length: ${eventValidation.length})`);
        
        // Extract dropdown options
        const districtOptions = extractSelectOptions(data, 'ddl_district');
        const talukOptions = extractSelectOptions(data, 'ddl_taluk');
        const hobliOptions = extractSelectOptions(data, 'ddl_hobli');
        
        console.log(`\nFound ${districtOptions.length} districts`);
        console.log(`Found ${talukOptions.length} taluks`);
        console.log(`Found ${hobliOptions.length} hoblis`);
        
        resolve({
          viewState,
          viewStateGenerator,
          eventValidation,
          districtOptions,
          talukOptions,
          hobliOptions,
          html: data,
        });
      });
    }).on('error', reject);
  });
}

function extractSelectOptions(html, selectName) {
  const regex = new RegExp(`<select[^>]*name=["']${selectName}["'][^>]*>([\\s\\S]*?)<\\/select>`, 'i');
  const match = html.match(regex);
  if (!match) return [];
  
  const selectContent = match[1];
  const optionMatches = selectContent.match(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi);
  if (!optionMatches) return [];
  
  return optionMatches.map(opt => {
    const valueMatch = opt.match(/value=["']([^"']+)["']/i);
    const textMatch = opt.match(/>([^<]+)</i);
    return {
      value: valueMatch ? valueMatch[1] : '',
      text: textMatch ? textMatch[1].trim() : '',
    };
  });
}

// Step 2: Submit the form with ViewState
function submitForm(viewStateData, district, taluk, hobli, village) {
  return new Promise((resolve, reject) => {
    console.log('\nStep 2: Submitting form...');
    
    // Find the correct values for dropdowns
    const districtValue = viewStateData.districtOptions.find(
      opt => opt.text.toUpperCase().includes(district.toUpperCase())
    )?.value || '';
    
    const talukValue = viewStateData.talukOptions.find(
      opt => opt.text.toUpperCase().includes(taluk.toUpperCase())
    )?.value || '';
    
    const hobliValue = viewStateData.hobliOptions.find(
      opt => opt.text.toUpperCase().includes(hobli.toUpperCase())
    )?.value || '';
    
    console.log(`District: ${district} -> ${districtValue}`);
    console.log(`Taluk: ${taluk} -> ${talukValue}`);
    console.log(`Hobli: ${hobli} -> ${hobliValue}`);
    console.log(`Village: ${village}`);
    
    // Build form data
    const formData = querystring.stringify({
      __VIEWSTATE: viewStateData.viewState,
      __VIEWSTATEGENERATOR: viewStateData.viewStateGenerator,
      __EVENTVALIDATION: viewStateData.eventValidation,
      ddl_district: districtValue,
      ddl_taluk: talukValue,
      ddl_hobli: hobliValue,
      txtVlgName: village,
      btnSearch: 'Search',
    });
    
    const options = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
        'Cookie': '', // May need to handle cookies
      },
    };
    
    const req = https.request(options, (res) => {
      console.log(`\nResponse Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Look for PDF links in the response
        const pdfLinks = data.match(/<a[^>]*href=["']([^"']*\.pdf[^"']*)["']/gi);
        if (pdfLinks) {
          console.log('\n✓ Found PDF links:');
          pdfLinks.forEach(link => {
            const href = link.match(/href=["']([^"']+)["']/i);
            if (href) {
              const pdfUrl = href[1].startsWith('http') 
                ? href[1] 
                : `https://landrecords.karnataka.gov.in${href[1]}`;
              console.log(`  ${pdfUrl}`);
            }
          });
        }
        
        // Look for image links that might be PDFs
        const imgLinks = data.match(/<img[^>]*src=["']([^"']*\.pdf[^"']*)["']/gi);
        if (imgLinks) {
          console.log('\n✓ Found PDF image links:');
          imgLinks.forEach(link => {
            const src = link.match(/src=["']([^"']+)["']/i);
            if (src) {
              const pdfUrl = src[1].startsWith('http') 
                ? src[1] 
                : `https://landrecords.karnataka.gov.in${src[1]}`;
              console.log(`  ${pdfUrl}`);
            }
          });
        }
        
        // Look for grid PDF links (grdMaps$ctl02$ImgPdf pattern)
        const gridPdfMatches = data.match(/grdMaps\$ctl\d+\$ImgPdf[^>]*onclick=["']([^"']+)["']/gi);
        if (gridPdfMatches) {
          console.log('\n✓ Found grid PDF onclick handlers:');
          gridPdfMatches.forEach(match => {
            const onclick = match.match(/onclick=["']([^"']+)["']/i);
            if (onclick) {
              console.log(`  ${onclick[1]}`);
            }
          });
        }
        
        // Save response for inspection
        const fs = require('fs');
        fs.writeFileSync('form-response.html', data);
        console.log('\n✓ Saved form response to form-response.html');
        
        resolve(data);
      });
    });
    
    req.on('error', reject);
    req.write(formData);
    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    const viewStateData = await getInitialPage();
    
    // Test with sample data
    await submitForm(
      viewStateData,
      'BELLARY',
      'HADAGALI',
      'HADAGALI',
      'ANGURU'
    );
    
    console.log('\n---\nTest completed!');
    console.log('Check form-response.html for the full response');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

runTest();

