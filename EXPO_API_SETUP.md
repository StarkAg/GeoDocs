# Expo Go API Setup Guide

When using Expo Go on a physical device, the app can't access `localhost`. You need to use your computer's IP address.

## Quick Setup

### Step 1: Find Your Computer's IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Look for something like `192.168.1.100` or `10.0.0.5`

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually `192.168.x.x`)

**Or check Network Settings:**
- Mac: System Preferences → Network
- Windows: Settings → Network & Internet → Properties

### Step 2: Update app.json

Edit `app.json` and update the `apiUrl` in the `extra` section:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP_ADDRESS:3000"
    }
  }
}
```

**Example:**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:3000"
    }
  }
}
```

### Step 3: Restart Expo

After updating `app.json`, restart Expo:
```bash
# Stop Expo (Ctrl+C)
# Then restart
npm start
```

### Step 4: Make Sure API Server is Running

In a separate terminal:
```bash
npm run api
```

The API server should show:
```
🚀 PDF API Server running on http://localhost:3000
```

### Step 5: Test Connection

1. Open the app in Expo Go
2. Try to search for a PDF
3. Check the status logs - you should see "✅ API connected"

## Troubleshooting

### "API server is not available"
- Make sure `npm run api` is running
- Check that your IP address is correct
- Make sure your phone and computer are on the same WiFi network

### "Connection refused"
- Check firewall settings - port 3000 might be blocked
- Try temporarily disabling firewall to test
- Make sure API server is actually running

### "Network request failed"
- Verify IP address is correct
- Make sure phone and computer are on same network
- Try pinging your computer's IP from another device

## Alternative: Using Environment Variable

You can also set the API URL via environment variable:

```bash
# Mac/Linux
export API_URL=http://192.168.1.100:3000
npm start

# Windows
set API_URL=http://192.168.1.100:3000
npm start
```

Then update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": process.env.API_URL || "http://localhost:3000"
    }
  }
}
```

## For Production

When deploying, update `apiUrl` in `app.json` to your production API server URL.

