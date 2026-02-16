/**
 * GeoDocs API Client
 * 
 * IMPORTANT: Replace the API_BASE URL below with your ngrok tunnel URL
 * Example: https://xxxx.ngrok-free.app
 */

export const API_BASE = 'https://45eb5e411039.ngrok-free.app';

/**
 * Fetch PDF URL from API
 * @param {Object} params - Location parameters
 * @param {string} params.district - District value
 * @param {string} params.taluk - Taluk value
 * @param {string} params.hobli - Hobli value
 * @param {string} params.village - Village name
 * @returns {Promise<string>} PDF URL
 * @throws {Error} If API call fails or PDF not found
 */
export async function fetchPdfUrl({ district, taluk, hobli, village }) {
  if (!district || !taluk || !hobli || !village) {
    throw new Error('All fields are required: district, taluk, hobli, village');
  }

  try {
    const response = await fetch(`${API_BASE}/api/get-pdf-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        district,
        taluk,
        hobli,
        village,
      }),
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.pdfUrl) {
      return data.pdfUrl;
    } else {
      throw new Error(data.error || 'PDF URL not found');
    }
  } catch (error) {
    // Handle network errors
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to API. Check your internet connection and ngrok tunnel.');
    }
    throw error;
  }
}

/**
 * Check API health
 * @returns {Promise<boolean>} True if API is healthy
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
    });
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

