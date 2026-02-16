# Quick Start - Expo Go + Ngrok

## 🚀 Setup in 5 Steps

### 1. Install Ngrok (if needed)
```bash
brew install ngrok
# Or download from https://ngrok.com/download
```

### 2. Start API Server
```bash
npm run api
```
Keep this terminal open. API runs on `http://localhost:3000`

### 3. Start Ngrok Tunnel
In a **new terminal**:
```bash
ngrok http 3000
```

You'll see:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### 4. Update API Base URL

Open `src/api/geodocsApi.js` and replace:

```javascript
export const API_BASE = 'https://xxxx.ngrok-free.app'; // TODO: Replace
```

With your ngrok URL:

```javascript
export const API_BASE = 'https://abc123.ngrok-free.app';
```

### 5. Start Expo
```bash
npm start
```

Scan QR code with Expo Go app!

## 📱 Testing

### Option A: Use SearchScreen

Navigate to Search screen from any screen:

```javascript
import { useNavigation } from '@react-navigation/native';

navigation.navigate('Search');
```

Or add a button in HomeScreen:

```javascript
<TouchableOpacity onPress={() => navigation.navigate('Search')}>
  <Text>Test PDF Search</Text>
</TouchableOpacity>
```

### Option B: Use in DocumentsScreen

The existing `DocumentsScreen` can also use the new API. It's already set up to use `fetchPdfUrl` from `src/services/fetchPdfUrl.ts`.

## 🔍 Verify Setup

1. **Check API health**: Open `https://your-ngrok-url.ngrok-free.app/health` in browser
2. **Check ngrok dashboard**: Open `http://localhost:4040` to see requests
3. **Test in app**: Fill form → Click "Get PDF" → PDF should open

## ⚠️ Important Notes

- **Ngrok URL changes** each time you restart ngrok (free tier)
- **Update `API_BASE`** in `geodocsApi.js` each time ngrok restarts
- **Keep both terminals open**: API server + ngrok tunnel
- **For production**: Deploy API to proper hosting (not ngrok)

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to API" | Check ngrok is running, verify API_BASE URL |
| "Network request failed" | Use HTTPS ngrok URL, check phone internet |
| "PDF URL not found" | Check API server logs, verify location params |

## 📚 More Info

- **NGROK_SETUP.md** - Detailed ngrok setup
- **EXPO_NGROK_INTEGRATION.md** - Full integration guide
- **API_README.md** - API server documentation

