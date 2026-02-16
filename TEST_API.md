# API Testing Guide

## Quick Test

### 1. Start API Server
```bash
npm run api
```

You should see:
```
🚀 PDF API Server running on http://localhost:3000
📡 Endpoint: POST http://localhost:3000/api/get-pdf-url
💚 Health check: GET http://localhost:3000/health
```

### 2. Test Health (in another terminal)
```bash
node test-api-simple.js
```

Or with curl:
```bash
curl http://localhost:3000/health
```

### 3. Test PDF Extraction
```bash
node test-api.js
```

Or with curl:
```bash
curl -X POST http://localhost:3000/api/get-pdf-url \
  -H 'Content-Type: application/json' \
  -d '{"district":"2","taluk":"1","hobli":"1","village":"ALABALA"}'
```

## Expected Response

**Success:**
```json
{
  "success": true,
  "pdfUrl": "https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=..."
}
```

**Error:**
```json
{
  "success": false,
  "error": "PDF URL not found. Please check your selections."
}
```

## Troubleshooting

### API server not starting
- Check if port 3000 is already in use: `lsof -ti:3000`
- Kill existing process: `kill -9 $(lsof -ti:3000)`
- Then restart: `npm run api`

### PDF extraction failing
- Check API server logs for errors
- Make sure Puppeteer is installed: `npm list puppeteer`
- The API uses the same logic as `test_website_flow.py` - if that works, API should work too

### Connection refused
- Make sure API server is running
- Check firewall settings
- For mobile devices, use computer's IP address (see EXPO_API_SETUP.md)

