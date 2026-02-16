# PDF Testing Guide

## PDF Selector
The PDF image button in the results grid uses the selector: `#grdMaps_ImgPdf_0`

## How It Works

1. **Form Submission**: After selecting District, Taluka, Hobli, and Village, the form is submitted
2. **Grid Appears**: A results grid appears with id `grdMaps`
3. **PDF Button**: The PDF is in an image button with id `grdMaps_ImgPdf_0` (or `_1`, `_2`, etc. for multiple results)
4. **PDF URL Extraction**: The onclick handler contains the PDF URL in patterns like:
   - `window.open('PDF_URL', '_blank')`
   - `window.location='PDF_URL'`
   - `javascript:window.open('PDF_URL')`

## Testing Steps

1. Open the app
2. Go to Documents tab
3. Click "Village Map"
4. Select:
   - District: Bagalkote (value: '2')
   - Taluka: JAMAKHANDI (value: '1')
   - Hobli: JAMAKHANDI (value: '1')
   - Village: ALABALA (or any village)
5. Click "Search"
6. The app will:
   - Show loading modal
   - Work in background to fill form and search
   - Extract PDF URL from `#grdMaps_ImgPdf_0` onclick handler
   - Display PDF automatically

## Code Implementation

The PDF detection script in `VillageMapWebView.tsx`:
- First checks for `#grdMaps_ImgPdf_0` specifically
- Falls back to searching for all `img[id*="grdMaps_ImgPdf"]` elements
- Extracts PDF URL from onclick handlers
- Converts relative URLs to absolute URLs
- Sends PDF URL to React Native via `postMessage`

## Expected PDF URL Format

PDFs are typically at:
- `https://landrecords.karnataka.gov.in/service3/PDFs/[filename].pdf`
- Or relative paths like `/service3/PDFs/[filename].pdf`

The app automatically converts relative paths to absolute URLs.

