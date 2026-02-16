import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the correct API URL based on platform
function getApiBaseUrl(): string {
  if (__DEV__) {
    const customApiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (customApiUrl && customApiUrl !== 'http://localhost:3000') {
      return customApiUrl;
    }
    
    // For physical devices, use IP from config; for simulators, use localhost
    if (Constants.isDevice && Platform.OS !== 'web') {
      return customApiUrl || 'http://localhost:3000';
    }
    return 'http://localhost:3000';
  }
  
  return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();

export interface PdfApiParams {
  district: string;
  taluk: string;
  hobli: string;
  village: string;
}

export interface PdfApiResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

export async function getPdfUrlFromApi(params: PdfApiParams): Promise<string | null> {
  try {
    console.log('Calling PDF API with params:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/get-pdf-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data: PdfApiResponse = await response.json();

    if (data.success && data.pdfUrl) {
      console.log('✅ PDF URL received from API:', data.pdfUrl);
      return data.pdfUrl;
    } else {
      console.error('❌ API Error:', data.error);
      throw new Error(data.error || 'Failed to get PDF URL');
    }
  } catch (error: any) {
    console.error('PDF API request failed:', error);
    throw new Error(error.message || 'Failed to connect to PDF API');
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

