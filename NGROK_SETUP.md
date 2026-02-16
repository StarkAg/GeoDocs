# Ngrok Tunnel Setup for GeoDocs API

## Quick Setup

1. **Install ngrok** (if not already installed):
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your API server**:
   ```bash
   npm run api
   ```
   Your API should be running on `http://localhost:3000`

3. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL**:
   You'll see something like:
   ```
   Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
   ```
   Copy the `https://xxxx-xx-xx-xx-xx.ngrok-free.app` part.

5. **Update API base URL**:
   Open `src/api/geodocsApi.js` and replace:
   ```javascript
   export const API_BASE = 'https://xxxx.ngrok-free.app'; // TODO: Replace
   ```
   With your actual ngrok URL:
   ```javascript
   export const API_BASE = 'https://xxxx-xx-xx-xx-xx.ngrok-free.app';
   ```

6. **Restart Expo**:
   ```bash
   npm start
   ```

## Testing

1. Open the app in Expo Go
2. Navigate to SearchScreen (or Documents tab)
3. Fill in the form and click "Get PDF"
4. The PDF should open in your default browser/PDF viewer

## Important Notes

- **Ngrok free tier**: URLs change each time you restart ngrok. Update `geodocsApi.js` each time.
- **Ngrok paid tier**: You can get a static domain that doesn't change.
- **Security**: The ngrok URL is public. Anyone with the URL can access your API.
- **Development only**: Use ngrok only for development/testing. For production, deploy your API properly.

## Alternative: Use Your Computer's IP

If you're on the same WiFi network, you can use your computer's IP instead:

1. Find your IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or
   ipconfig getifaddr en0
   ```

2. Update `geodocsApi.js`:
   ```javascript
   export const API_BASE = 'http://192.168.1.100:3000'; // Your IP
   ```

3. Make sure your firewall allows connections on port 3000.

## Troubleshooting

- **"Cannot connect to API"**: Check that ngrok is running and the URL is correct
- **"Network request failed"**: Make sure your phone and computer are on the same network (or using ngrok)
- **"PDF URL not found"**: Check API server logs for errors

