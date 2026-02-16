# Expo Go + Ngrok Integration Guide

## Overview

This setup allows your Expo Go app to connect to your local API server via an ngrok tunnel, enabling testing on physical devices without being on the same WiFi network.

## Files Created

1. **`src/api/geodocsApi.js`** - API client helper
2. **`src/screens/SearchScreen.js`** - Sample search screen
3. **`NGROK_SETUP.md`** - Detailed ngrok setup instructions

## Quick Start

### 1. Update API Base URL

Open `src/api/geodocsApi.js` and replace the placeholder:

```javascript
export const API_BASE = 'https://xxxx.ngrok-free.app'; // TODO: Replace
```

With your actual ngrok URL:

```javascript
export const API_BASE = 'https://abc123.ngrok-free.app';
```

### 2. Start API Server

```bash
npm run api
```

### 3. Start Ngrok Tunnel

In a new terminal:

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### 4. Update API Base URL Again

Update `src/api/geodocsApi.js` with the ngrok URL from step 3.

### 5. Start Expo

```bash
npm start
```

### 6. Test in Expo Go

1. Scan QR code with Expo Go app
2. Navigate to Search screen (or add a button to navigate there)
3. Fill in the form and click "Get PDF"
4. PDF should open in your default browser/PDF viewer

## Using SearchScreen

### Option 1: Add to Navigation

The `SearchScreen` is already added to the stack navigator. You can navigate to it from any screen:

```javascript
import { useNavigation } from '@react-navigation/native';

function MyScreen() {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
      <Text>Open Search</Text>
    </TouchableOpacity>
  );
}
```

### Option 2: Replace DocumentsScreen

If you want to use SearchScreen instead of DocumentsScreen, update `AppNavigator.tsx`:

```typescript
<Tab.Screen name="Documents" component={SearchScreen} />
```

### Option 3: Use in Existing DocumentsScreen

You can also use the API helper in your existing `DocumentsScreen.tsx`:

```typescript
import { fetchPdfUrl } from '../api/geodocsApi';
import { Linking } from 'react-native';

// In your handler:
const pdfUrl = await fetchPdfUrl({ district, taluk, hobli, village });
await Linking.openURL(pdfUrl);
```

## API Helper Functions

### `fetchPdfUrl({ district, taluk, hobli, village })`

Fetches PDF URL from API.

```javascript
import { fetchPdfUrl } from '../api/geodocsApi';

const pdfUrl = await fetchPdfUrl({
  district: '2',
  taluk: '1',
  hobli: '1',
  village: 'ALABALA',
});
```

### `checkApiHealth()`

Checks if API is reachable.

```javascript
import { checkApiHealth } from '../api/geodocsApi';

const isHealthy = await checkApiHealth();
if (!isHealthy) {
  Alert.alert('API Unavailable', 'Cannot connect to server');
}
```

## Troubleshooting

### "Cannot connect to API"

- ✅ Check ngrok is running: `ngrok http 3000`
- ✅ Verify API server is running: `npm run api`
- ✅ Confirm API_BASE URL in `geodocsApi.js` matches ngrok URL
- ✅ Check ngrok web interface: `http://localhost:4040`

### "Network request failed"

- ✅ Make sure you're using HTTPS ngrok URL (not HTTP)
- ✅ Check phone has internet connection
- ✅ Try restarting ngrok and updating the URL

### "PDF URL not found"

- ✅ Check API server logs for errors
- ✅ Verify location parameters are correct
- ✅ Test API directly: `curl -X POST https://your-ngrok-url/api/get-pdf-url -H "Content-Type: application/json" -d '{"district":"2","taluk":"1","hobli":"1","village":"ALABALA"}'`

## Alternative: Local Network (Same WiFi)

If you're on the same WiFi network, you can skip ngrok:

1. Find your computer's IP:
   ```bash
   ipconfig getifaddr en0  # macOS
   ```

2. Update `geodocsApi.js`:
   ```javascript
   export const API_BASE = 'http://192.168.1.100:3000';
   ```

3. Make sure firewall allows port 3000

## Production

For production, deploy your API to a proper hosting service (Heroku, AWS, etc.) and update `API_BASE` accordingly.

