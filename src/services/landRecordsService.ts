/**
 * Service to fetch PDF from Karnataka Land Records website
 * https://landrecords.karnataka.gov.in/service3/
 */

export interface LandRecordParams {
  district: string;
  taluka: string;
  hobli: string;
  village: string;
}

/**
 * Constructs the PDF URL based on the form parameters
 * The website uses a specific URL pattern to generate PDFs
 * Based on Karnataka Land Records website structure
 */
export async function getVillageMapPDFUrl(
  params: LandRecordParams,
): Promise<string> {
  // The website typically uses POST requests with form data
  // The endpoint for village maps is usually: /service3/getMap or similar
  
  // URL encoding the parameters
  const encodedDistrict = encodeURIComponent(params.district);
  const encodedTaluka = encodeURIComponent(params.taluka);
  const encodedHobli = encodeURIComponent(params.hobli);
  const encodedVillage = encodeURIComponent(params.village);

  const baseUrl = 'https://landrecords.karnataka.gov.in/service3';
  
  // Common endpoint patterns for Karnataka Land Records:
  // 1. Direct PDF URL with query parameters
  // 2. POST endpoint that returns PDF
  // 3. WebView with form submission
  
  // Try the most common pattern first
  const pdfUrl = `${baseUrl}/getMap?district=${encodedDistrict}&taluka=${encodedTaluka}&hobli=${encodedHobli}&village=${encodedVillage}`;
  
  return pdfUrl;
}

/**
 * Fetches the PDF by making a request to the website
 * This function handles the web scraping/fetching logic
 */
export async function fetchVillageMapPDF(
  params: LandRecordParams,
): Promise<{url: string; success: boolean; error?: string}> {
  try {
    // First, try to get the PDF URL
    const pdfUrl = await getVillageMapPDFUrl(params);
    
    // Verify the URL is accessible
    const response = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; GeoDocs/1.0)',
      },
    });

    if (response.ok && response.headers.get('content-type')?.includes('pdf')) {
      return {url: pdfUrl, success: true};
    }

    // If direct URL doesn't work, we might need to:
    // 1. Make a POST request to submit the form
    // 2. Parse the response to get the PDF URL
    // 3. Handle session/cookies if needed

    // Alternative approach: Use the website's form submission endpoint
    // The website might use different field names, common ones are:
    // - district, taluk, hobli, village
    // - dist, tq, hobli, village
    // - district_code, taluka_code, etc.
    
    const formUrl = 'https://landrecords.karnataka.gov.in/service3/getMap';
    
    const formData = new URLSearchParams();
    // Try common field name variations
    formData.append('district', params.district);
    formData.append('taluka', params.taluka);
    formData.append('taluk', params.taluka); // Alternative spelling
    formData.append('hobli', params.hobli);
    formData.append('village', params.village);

    const formResponse = await fetch(formUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/pdf, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
      },
      body: formData.toString(),
    });

    if (formResponse.ok) {
      const contentType = formResponse.headers.get('content-type');
      if (contentType?.includes('pdf')) {
        // For React Native, we'll use the response URL directly
        // or download to file system (handled in PDFViewer)
        return {url: formResponse.url, success: true};
      }
      
      // Check if response contains a redirect to PDF
      const responseText = await formResponse.text();
      const pdfMatch = responseText.match(/href=["']([^"']*\.pdf[^"']*)["']/i);
      if (pdfMatch) {
        return {url: pdfMatch[1], success: true};
      }
    }

    return {
      url: pdfUrl,
      success: false,
      error: 'Could not fetch PDF. Please check the parameters.',
    };
  } catch (error) {
    return {
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Alternative: Use WebView to load the website and extract PDF
 * This is useful if the website requires JavaScript execution
 * Since the website uses ASP.NET with ViewState and JavaScript,
 * the best approach is to load the page in WebView and let the user
 * interact with it, or inject JavaScript to fill the form
 */
export function getVillageMapWebUrl(params: LandRecordParams): string {
  // Return the base URL - the WebView will handle form submission
  return 'https://landrecords.karnataka.gov.in/service3/';
}

/**
 * Generate JavaScript to auto-fill the form in WebView
 * Now uses the actual dropdown values from the website
 */
export function getFormFillScript(params: LandRecordParams): string {
  // Escape single quotes in params to prevent script injection issues
  const district = (params.district || '').replace(/'/g, "\\'");
  const taluka = (params.taluka || '').replace(/'/g, "\\'");
  const hobli = (params.hobli || '').replace(/'/g, "\\'");
  const village = (params.village || '').replace(/'/g, "\\'");
  
  // Use exact same flow as test_website_flow.py - minimal waits
  return `
    (function() {
      console.log('Starting form fill script (minimal waits)...');
      
      // Wait for page to be ready
      setTimeout(function() {
        // Fill district
        var districtSelect = document.querySelector('select[name="ddl_district"]');
        if (districtSelect) {
          districtSelect.value = '${district}';
          districtSelect.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('District selected: ${district}');
          
          // Wait minimal time for taluk dropdown
          setTimeout(function() {
            var talukSelect = document.querySelector('select[name="ddl_taluk"]');
            if (talukSelect) {
              // Wait minimal time for options
              setTimeout(function() {
                var options = talukSelect.querySelectorAll('option');
                var validOptions = Array.from(options).filter(function(opt) { return opt.value; });
                if (validOptions.length > 1) {
                  talukSelect.value = '${taluka}';
                  talukSelect.dispatchEvent(new Event('change', { bubbles: true }));
                  console.log('Taluka selected: ${taluka}');
                  
                  // Wait minimal time for hobli dropdown
                  setTimeout(function() {
                    var hobliSelect = document.querySelector('select[name="ddl_hobli"]');
                    if (hobliSelect) {
                      // Wait minimal time for options
                      setTimeout(function() {
                        var options = hobliSelect.querySelectorAll('option');
                        var validOptions = Array.from(options).filter(function(opt) { return opt.value; });
                        if (validOptions.length > 1) {
                          hobliSelect.value = '${hobli}';
                          console.log('Hobli selected: ${hobli}');
                          
                          // Fill village - minimal wait
                          setTimeout(function() {
                            var villageInput = document.querySelector('input[name="txtVlgName"]');
                            if (villageInput) {
                              villageInput.value = '';
                              villageInput.focus();
                              villageInput.value = '${village}';
                              villageInput.dispatchEvent(new Event('input', { bubbles: true }));
                              villageInput.dispatchEvent(new Event('change', { bubbles: true }));
                              console.log('Village filled: ${village}');
                              
                              // Click search button - minimal wait
                              setTimeout(function() {
                                var searchBtn = document.querySelector('input[name="btnSearch"]');
                                if (searchBtn) {
                                  console.log('Clicking search button...');
                                  searchBtn.click();
                                  console.log('Search button clicked!');
                                }
                              }, 300);
                            }
                          }, 300);
                        }
                      }, 500);
                    }
                  }, 500);
                }
              }, 500);
            }
          }, 500);
        }
      }, 1000);
    })();
    true;
  `;
}

