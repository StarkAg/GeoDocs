# PDF API Server

This API server handles PDF extraction from the Karnataka Land Records website using Puppeteer, matching the behavior of the working test script.

## Setup

1. **Install dependencies:**
   ```bash
   npm install express cors puppeteer
   ```

2. **Start the API server:**
   ```bash
   npm run api
   ```
   
   Or directly:
   ```bash
   node api/server.js
   ```

3. **The server will run on:** `http://localhost:3000`

## API Endpoints

### POST `/api/get-pdf-url`

Get PDF URL for a village map.

**Request Body:**
```json
{
  "district": "2",
  "taluk": "1",
  "hobli": "1",
  "village": "ALABALA"
}
```

**Success Response:**
```json
{
  "success": true,
  "pdfUrl": "https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "PDF URL not found. Please check your selections."
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## How It Works

1. Uses Puppeteer to automate browser interaction
2. Fills the form with provided parameters
3. Clicks search button
4. Waits for results grid
5. Extracts PDF URL from button onclick or popup
6. Returns PDF URL to the app

## App Integration

The app now calls this API instead of using WebView. The API handles all the complex browser automation, and the app just receives the PDF URL.

## Troubleshooting

- **API not responding:** Make sure the server is running (`npm run api`)
- **Connection refused:** Check if port 3000 is available
- **PDF not found:** Verify the parameters match the data in `complete-karnataka-data-filtered.json`

