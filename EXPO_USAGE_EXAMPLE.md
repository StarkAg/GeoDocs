# Expo Usage Example

## Using the PDF API in Your Expo App

### Basic Usage

```typescript
import { fetchPdfUrl, openPdfUrl } from './src/services/fetchPdfUrl';

// In your component
const handleGetPdf = async () => {
  try {
    // Fetch PDF URL from API
    const pdfUrl = await fetchPdfUrl({
      district: '2',
      taluk: '1',
      hobli: '1',
      village: 'ALABALA',
    });
    
    // Open PDF in default browser/app
    await openPdfUrl(pdfUrl);
  } catch (error) {
    console.error('Error:', error.message);
    Alert.alert('Error', error.message);
  }
};
```

### Complete Screen Example

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { fetchPdfUrl, openPdfUrl } from '../services/fetchPdfUrl';

export default function ExampleScreen() {
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const pdfUrl = await fetchPdfUrl({
        district: '2',
        taluk: '1',
        hobli: '1',
        village: 'ALABALA',
      });
      
      await openPdfUrl(pdfUrl);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={handleSearch}
        disabled={loading}
        style={{
          backgroundColor: '#007AFF',
          padding: 16,
          borderRadius: 8,
        }}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16 }}>Get PDF</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

### API Configuration

Make sure your `app.json` has the API URL configured:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

For physical devices, use your computer's IP address:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:3000"
    }
  }
}
```

### API Endpoints

- **POST** `/api/get-pdf-url` - Get PDF URL
  - Body: `{ district, taluk, hobli, village }`
  - Response: `{ success: true, pdfUrl: "..." }` or `{ success: false, error: "..." }`

- **GET** `/health` - Health check
  - Response: `{ status: "ok", timestamp: "..." }`

