import { Linking } from 'react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URL from config, with fallback to hardcoded ngrok URL
const API_BASE_URL = __DEV__
  ? (Constants.expoConfig?.extra?.apiUrl || 'https://c9a0a749a978.ngrok-free.app')
  : (Constants.expoConfig?.extra?.apiUrl || 'https://c9a0a749a978.ngrok-free.app');

export interface PdfParams {
  district: string;
  taluk: string;
  hobli: string;
  village: string;
}

export interface PdfResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

/**
 * Fetch PDF URL from API
 */
export async function fetchPdfUrl(params: PdfParams): Promise<string> {
  try {
    console.log('📡 Calling PDF API:', params);
    console.log('🌐 API Base URL:', API_BASE_URL);
    console.log('🔗 Full URL:', `${API_BASE_URL}/api/get-pdf-url`);
    
    const response = await fetch(`${API_BASE_URL}/api/get-pdf-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok browser warning
      },
      body: JSON.stringify(params),
    });

    const data: PdfResponse = await response.json();

    if (data.success && data.pdfUrl) {
      console.log('✅ PDF URL received:', data.pdfUrl);
      return data.pdfUrl;
    } else {
      throw new Error(data.error || 'Failed to get PDF URL');
    }
  } catch (error: any) {
    console.error('❌ PDF API error:', error);
    throw new Error(error.message || 'Failed to connect to PDF API');
  }
}

/**
 * Open PDF URL in default browser/app
 */
export async function openPdfUrl(pdfUrl: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(pdfUrl);
    if (canOpen) {
      await Linking.openURL(pdfUrl);
    } else {
      throw new Error('Cannot open PDF URL');
    }
  } catch (error: any) {
    console.error('❌ Error opening PDF:', error);
    throw error;
  }
}

