/**
 * Service to fetch dropdown options from Karnataka Land Records website
 */

export interface DropdownOption {
  value: string;
  label: string;
}

/**
 * Fetches all districts from the website
 */
export async function fetchDistricts(): Promise<DropdownOption[]> {
  try {
    const response = await fetch('https://landrecords.karnataka.gov.in/service3/');
    const html = await response.text();
    
    // Extract district options
    const districtRegex = /<select[^>]*name=["']ddl_district["'][^>]*>([\s\S]*?)<\/select>/i;
    const districtMatch = html.match(districtRegex);
    
    if (!districtMatch) {
      return [];
    }
    
    const options = extractOptions(districtMatch[1]);
    return options.filter(opt => opt.value && opt.value !== '0' && opt.value !== '');
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}

/**
 * Fetches taluk options for a given district
 * ASP.NET dropdowns require triggering the change event properly
 */
export async function fetchTaluks(districtValue: string): Promise<DropdownOption[]> {
  try {
    // First, get the initial page to get ViewState
    const initialResponse = await fetch('https://landrecords.karnataka.gov.in/service3/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const initialHtml = await initialResponse.text();
    
    const viewState = extractViewState(initialHtml, '__VIEWSTATE');
    const viewStateGenerator = extractViewState(initialHtml, '__VIEWSTATEGENERATOR');
    const eventValidation = extractViewState(initialHtml, '__EVENTVALIDATION');
    
    if (!viewState) {
      console.error('Could not extract ViewState');
      return [];
    }
    
    // ASP.NET dropdowns often need the __EVENTTARGET to trigger the change
    // Try with __EVENTTARGET set to the dropdown
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('__EVENTTARGET', 'ddl_district'); // Trigger district change event
    formData.append('__EVENTARGUMENT', '');
    formData.append('ddl_district', districtValue);
    formData.append('ddl_taluk', '');
    formData.append('ddl_hobli', '');
    formData.append('txtVlgName', '');
    
    const response = await fetch('https://landrecords.karnataka.gov.in/service3/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: formData.toString(),
    });
    
    const html = await response.text();
    
    // Check if response is a redirect or error
    if (response.status !== 200) {
      console.error(`Response status: ${response.status}`);
      return [];
    }
    
    // Extract taluk options - try multiple patterns
    let talukMatch = html.match(/<select[^>]*name=["']ddl_taluk["'][^>]*>([\s\S]*?)<\/select>/i);
    
    if (!talukMatch) {
      // Try with id attribute
      talukMatch = html.match(/<select[^>]*id=["'][^"']*taluk[^"']*["'][^>]*>([\s\S]*?)<\/select>/i);
    }
    
    if (!talukMatch) {
      // Try case-insensitive search for "taluk" anywhere in select
      talukMatch = html.match(/<select[^>]*[^>]*taluk[^>]*>([\s\S]*?)<\/select>/i);
    }
    
    if (!talukMatch) {
      console.error('Taluk select not found in response');
      console.log('Response preview (first 1000 chars):', html.substring(0, 1000));
      
      // Check if there's an UpdatePanel or AJAX response
      if (html.includes('|') && html.includes('ddl_taluk')) {
        // Might be an AJAX UpdatePanel response
        const ajaxMatch = html.match(/ddl_taluk[^|]*\|([^|]*)/i);
        if (ajaxMatch) {
          // Try to parse AJAX response format
          const ajaxContent = ajaxMatch[1];
          const options = extractOptions(ajaxContent);
          return options.filter(opt => opt.value && opt.value !== '0' && opt.value !== '');
        }
      }
      
      return [];
    }
    
    const options = extractOptions(talukMatch[1]);
    const filtered = options.filter(opt => opt.value && opt.value !== '0' && opt.value !== '');
    
    if (filtered.length === 0) {
      console.warn('No taluk options found after filtering');
      console.log('Raw options count:', options.length);
    }
    
    return filtered;
  } catch (error) {
    console.error('Error fetching taluks:', error);
    return [];
  }
}

/**
 * Fetches hobli options for given district and taluk
 */
export async function fetchHoblis(
  districtValue: string,
  talukValue: string,
): Promise<DropdownOption[]> {
  try {
    // First, get the initial page
    const initialResponse = await fetch('https://landrecords.karnataka.gov.in/service3/');
    const initialHtml = await initialResponse.text();
    
    let viewState = extractViewState(initialHtml, '__VIEWSTATE');
    let viewStateGenerator = extractViewState(initialHtml, '__VIEWSTATEGENERATOR');
    let eventValidation = extractViewState(initialHtml, '__EVENTVALIDATION');
    
    // Step 1: Select district to get taluk options
    const formData1 = new URLSearchParams();
    formData1.append('__VIEWSTATE', viewState);
    formData1.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData1.append('__EVENTVALIDATION', eventValidation);
    formData1.append('__EVENTTARGET', 'ddl_district');
    formData1.append('__EVENTARGUMENT', '');
    formData1.append('ddl_district', districtValue);
    formData1.append('ddl_taluk', '');
    formData1.append('ddl_hobli', '');
    formData1.append('txtVlgName', '');
    
    const response1 = await fetch('https://landrecords.karnataka.gov.in/service3/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: formData1.toString(),
    });
    
    const html1 = await response1.text();
    
    // Update ViewState
    viewState = extractViewState(html1, '__VIEWSTATE');
    viewStateGenerator = extractViewState(html1, '__VIEWSTATEGENERATOR');
    eventValidation = extractViewState(html1, '__EVENTVALIDATION');
    
    // Step 2: Select taluk to get hobli options
    const formData2 = new URLSearchParams();
    formData2.append('__VIEWSTATE', viewState);
    formData2.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData2.append('__EVENTVALIDATION', eventValidation);
    formData2.append('__EVENTTARGET', 'ddl_taluk');
    formData2.append('__EVENTARGUMENT', '');
    formData2.append('ddl_district', districtValue);
    formData2.append('ddl_taluk', talukValue);
    formData2.append('ddl_hobli', '');
    formData2.append('txtVlgName', '');
    
    const response2 = await fetch('https://landrecords.karnataka.gov.in/service3/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://landrecords.karnataka.gov.in/service3/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: formData2.toString(),
    });
    
    const html2 = await response2.text();
    
    // Extract hobli options
    const hobliRegex = /<select[^>]*name=["']ddl_hobli["'][^>]*>([\s\S]*?)<\/select>/i;
    const hobliMatch = html2.match(hobliRegex);
    
    if (!hobliMatch) {
      return [];
    }
    
    const options = extractOptions(hobliMatch[1]);
    return options.filter(opt => opt.value && opt.value !== '0' && opt.value !== '');
  } catch (error) {
    console.error('Error fetching hoblis:', error);
    return [];
  }
}

/**
 * Extracts options from select HTML
 */
function extractOptions(selectHtml: string): DropdownOption[] {
  const optionRegex = /<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi;
  const options: DropdownOption[] = [];
  let match;
  
  while ((match = optionRegex.exec(selectHtml)) !== null) {
    const value = match[1].trim();
    const label = match[2].trim();
    
    // Skip empty or default options
    if (value && value !== '0' && value !== '' && label) {
      options.push({
        value,
        label: label.toUpperCase(), // Match the website's uppercase format
      });
    }
  }
  
  return options;
}

/**
 * Extracts ViewState values from HTML
 */
function extractViewState(html: string, fieldName: string): string {
  const regex = new RegExp(
    `<input[^>]*name=["']${fieldName}["'][^>]*value=["']([^"']+)["']`,
    'i',
  );
  const match = html.match(regex);
  return match ? match[1] : '';
}

/**
 * Pre-fetch all districts on app load (can be cached)
 */
let cachedDistricts: DropdownOption[] | null = null;

export async function getDistricts(useCache = true): Promise<DropdownOption[]> {
  if (useCache && cachedDistricts) {
    return cachedDistricts;
  }
  
  cachedDistricts = await fetchDistricts();
  return cachedDistricts;
}

