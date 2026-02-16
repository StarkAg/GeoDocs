/**
 * Test with redirect handling and cascading dropdowns
 */

const https = require('https');
const querystring = require('querystring');
const {URL} = require('url');

function getInitialPage() {
  return new Promise((resolve, reject) => {
    https.get('https://landrecords.karnataka.gov.in/service3/', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const viewStateMatch = data.match(/<input[^>]*name=["']__VIEWSTATE["'][^>]*value=["']([^"']+)["']/i);
        const viewStateGeneratorMatch = data.match(/<input[^>]*name=["']__VIEWSTATEGENERATOR["'][^>]*value=["']([^"']+)["']/i);
        const eventValidationMatch = data.match(/<input[^>]*name=["']__EVENTVALIDATION["'][^>]*value=["']([^"']+)["']/i);
        
        resolve({
          viewState: viewStateMatch ? viewStateMatch[1] : '',
          viewStateGenerator: viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : '',
          eventValidation: eventValidationMatch ? eventValidationMatch[1] : '',
          html: data,
        });
      });
    }).on('error', reject);
  });
}

function followRedirect(url, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': cookies,
      },
      maxRedirects: 5,
    };
    
    https.get(options, (res) => {
      // Handle redirects
      if (res.statusCode === 302 || res.statusCode === 301) {
        const location = res.headers['location'];
        if (location) {
          const redirectUrl = location.startsWith('http') 
            ? location 
            : `https://${urlObj.hostname}${location}`;
          console.log(`Following redirect to: ${redirectUrl}`);
          return followRedirect(redirectUrl, cookies).then(resolve).catch(reject);
        }
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({data, statusCode: res.statusCode, headers: res.headers});
      });
    }).on('error', reject);
  });
}

function submitFormWithCascading(viewStateData, district, taluk, hobli, village) {
  return new Promise((resolve, reject) => {
    console.log('\nSubmitting form with cascading dropdowns...');
    
    // Step 1: Select district to populate taluk
    const formData1 = querystring.stringify({
      __VIEWSTATE: viewStateData.viewState,
      __VIEWSTATEGENERATOR: viewStateData.viewStateGenerator,
      __EVENTVALIDATION: viewStateData.eventValidation,
      ddl_district: district,
      ddl_taluk: '',
      ddl_hobli: '',
      txtVlgName: '',
      'ddl_district': district, // Trigger change event
    });
    
    const options1 = {
      hostname: 'landrecords.karnataka.gov.in',
      path: '/service3/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData1),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
    };
    
    const req1 = https.request(options1, (res1) => {
      let data1 = '';
      res1.on('data', (chunk) => {
        data1 += chunk;
      });
      res1.on('end', () => {
        // Extract new ViewState and taluk options
        const newViewState = data1.match(/<input[^>]*name=["']__VIEWSTATE["'][^>]*value=["']([^"']+)["']/i)?.[1] || '';
        const newViewStateGen = data1.match(/<input[^>]*name=["']__VIEWSTATEGENERATOR["'][^>]*value=["']([^"']+)["']/i)?.[1] || '';
        const newEventVal = data1.match(/<input[^>]*name=["']__EVENTVALIDATION["'][^>]*value=["']([^"']+)["']/i)?.[1] || '';
        
        // Extract taluk options
        const talukRegex = /<select[^>]*name=["']ddl_taluk["'][^>]*>([\s\S]*?)<\/select>/i;
        const talukMatch = data1.match(talukRegex);
        let talukValue = '';
        if (talukMatch) {
          const talukOptions = talukMatch[1].match(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi);
          if (talukOptions) {
            const found = talukOptions.find(opt => {
              const text = opt.match(/>([^<]+)</i)?.[1];
              return text && text.toUpperCase().includes(taluk.toUpperCase());
            });
            if (found) {
              talukValue = found.match(/value=["']([^"']+)["']/i)?.[1] || '';
            }
          }
        }
        
        console.log(`Found taluk value: ${talukValue}`);
        
        // Step 2: Select taluk to populate hobli
        if (talukValue) {
          const formData2 = querystring.stringify({
            __VIEWSTATE: newViewState,
            __VIEWSTATEGENERATOR: newViewStateGen,
            __EVENTVALIDATION: newEventVal,
            ddl_district: district,
            ddl_taluk: talukValue,
            ddl_hobli: '',
            txtVlgName: '',
          });
          
          const options2 = {
            hostname: 'landrecords.karnataka.gov.in',
            path: '/service3/',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(formData2),
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://landrecords.karnataka.gov.in/service3/',
            },
          };
          
          const req2 = https.request(options2, (res2) => {
            let data2 = '';
            res2.on('data', (chunk) => {
              data2 += chunk;
            });
            res2.on('end', () => {
              // Extract final ViewState and hobli options
              const finalViewState = data2.match(/<input[^>]*name=["']__VIEWSTATE["'][^>]*value=["']([^"']+)["']/i)?.[1] || '';
              const finalViewStateGen = data2.match(/<input[^>]*name=["']__VIEWSTATEGENERATOR["'][^>]*value=["']([^"']+)["']/i)?.[1] || '';
              const finalEventVal = data2.match(/<input[^>]*name=["']__EVENTVALIDATION["'][^>]*value=["']([^"']+)["']/i)?.[1] || '';
              
              // Extract hobli options
              const hobliRegex = /<select[^>]*name=["']ddl_hobli["'][^>]*>([\s\S]*?)<\/select>/i;
              const hobliMatch = data2.match(hobliRegex);
              let hobliValue = '';
              if (hobliMatch) {
                const hobliOptions = hobliMatch[1].match(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi);
                if (hobliOptions) {
                  const found = hobliOptions.find(opt => {
                    const text = opt.match(/>([^<]+)</i)?.[1];
                    return text && text.toUpperCase().includes(hobli.toUpperCase());
                  });
                  if (found) {
                    hobliValue = found.match(/value=["']([^"']+)["']/i)?.[1] || '';
                  }
                }
              }
              
              console.log(`Found hobli value: ${hobliValue}`);
              
              // Step 3: Final search
              const formData3 = querystring.stringify({
                __VIEWSTATE: finalViewState,
                __VIEWSTATEGENERATOR: finalViewStateGen,
                __EVENTVALIDATION: finalEventVal,
                ddl_district: district,
                ddl_taluk: talukValue,
                ddl_hobli: hobliValue,
                txtVlgName: village,
                btnSearch: 'Search',
              });
              
              const options3 = {
                hostname: 'landrecords.karnataka.gov.in',
                path: '/service3/',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(formData3),
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Referer': 'https://landrecords.karnataka.gov.in/service3/',
                },
              };
              
              const req3 = https.request(options3, (res3) => {
                let data3 = '';
                res3.on('data', (chunk) => {
                  data3 += chunk;
                });
                res3.on('end', () => {
                  // Look for PDF links
                  const pdfLinks = data3.match(/<a[^>]*href=["']([^"']*\.pdf[^"']*)["']/gi);
                  const imgPdfLinks = data3.match(/<img[^>]*src=["']([^"']*\.pdf[^"']*)["']/gi);
                  
                  console.log('\n=== RESULTS ===');
                  if (pdfLinks) {
                    console.log('Found PDF links:');
                    pdfLinks.forEach(link => {
                      const href = link.match(/href=["']([^"']+)["']/i)?.[1];
                      if (href) {
                        const pdfUrl = href.startsWith('http') 
                          ? href 
                          : `https://landrecords.karnataka.gov.in${href}`;
                        console.log(`  ✓ ${pdfUrl}`);
                      }
                    });
                  }
                  
                  if (imgPdfLinks) {
                    console.log('Found PDF image links:');
                    imgPdfLinks.forEach(link => {
                      const src = link.match(/src=["']([^"']+)["']/i)?.[1];
                      if (src) {
                        const pdfUrl = src.startsWith('http') 
                          ? src 
                          : `https://landrecords.karnataka.gov.in${src}`;
                        console.log(`  ✓ ${pdfUrl}`);
                      }
                    });
                  }
                  
                  // Save final response
                  const fs = require('fs');
                  fs.writeFileSync('final-response.html', data3);
                  console.log('\n✓ Saved final response to final-response.html');
                  
                  resolve(data3);
                });
              });
              
              req3.on('error', reject);
              req3.write(formData3);
              req3.end();
            });
          });
          
          req2.on('error', reject);
          req2.write(formData2);
          req2.end();
        } else {
          resolve(data1);
        }
      });
    });
    
    req1.on('error', reject);
    req1.write(formData1);
    req1.end();
  });
}

async function runTest() {
  try {
    const viewStateData = await getInitialPage();
    await submitFormWithCascading(
      viewStateData,
      '12', // BELLARY district code
      'HADAGALI',
      'HADAGALI',
      'ANGURU'
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runTest();

