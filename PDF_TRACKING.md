# PDF Location Tracking

The download script now creates `pdf_location_tracking.json` which maps each PDF file to its location data.

## Structure

```json
{
  "Bagalkote/JAMAKHANDI/JAMAKHANDI/ALABALA.pdf": {
    "district": "Bagalkote",
    "district_value": "2",
    "taluk": "JAMAKHANDI",
    "taluk_value": "1",
    "hobli": "JAMAKHANDI",
    "hobli_value": "1",
    "village": "ALABALA",
    "village_value": "1",
    "pdf_url": "https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=...",
    "filepath": "/full/path/to/village_maps/Bagalkote/JAMAKHANDI/JAMAKHANDI/ALABALA.pdf",
    "relative_path": "Bagalkote/JAMAKHANDI/JAMAKHANDI/ALABALA.pdf",
    "timestamp": "2025-12-25T01:14:20.123456"
  }
}
```

## Usage

### Find PDF by location
```python
import json

tracking = json.load(open('pdf_location_tracking.json'))
# Find all PDFs in a district
bagalkote_pdfs = {k: v for k, v in tracking.items() if v['district'] == 'Bagalkote'}

# Find PDF for specific village
village_pdf = None
for path, data in tracking.items():
    if (data['district'] == 'Bagalkote' and 
        data['taluk'] == 'JAMAKHANDI' and 
        data['village'] == 'ALABALA'):
        village_pdf = data['filepath']
        break
```

### Get location from PDF file
```python
import json
import os

tracking = json.load(open('pdf_location_tracking.json'))
pdf_file = "Bagalkote/JAMAKHANDI/JAMAKHANDI/ALABALA.pdf"
location_data = tracking.get(pdf_file)
if location_data:
    print(f"District: {location_data['district']}")
    print(f"Taluk: {location_data['taluk']}")
    print(f"Hobli: {location_data['hobli']}")
    print(f"Village: {location_data['village']}")
```

## Files Created

1. **`pdf_location_tracking.json`** - Maps PDF file paths to location data
2. **`all_pdf_links.json`** - Hierarchical structure with PDF URLs
3. **`download_progress.json`** - Download progress tracking
4. **`village_maps/`** - Organized PDF files by location

