# Download All Village Map PDFs

This script downloads all ~18,323 village map PDFs from the Karnataka Land Records website.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip3 install --break-system-packages selenium webdriver-manager requests
   ```

2. **Ensure you have the filtered data file:**
   - `complete-karnataka-data-filtered.json` should be in the project root

## Usage

### Basic Usage (Headless - Recommended)
```bash
python3 download_all_pdfs.py
```

### With Browser Visible (for debugging)
Edit `download_all_pdfs.py` and set:
```python
HEADLESS = False
```

## Features

- **Organized Storage**: PDFs are saved in folder structure:
  ```
  village_maps/
    ├── Bagalkote/
    │   ├── JAMAKHANDI/
    │   │   ├── JAMAKHANDI/
    │   │   │   ├── ALABALA.pdf
    │   │   │   ├── ALAGURA.pdf
    │   │   │   └── ...
  ```

- **Progress Tracking**: 
  - Saves progress to `download_progress.json`
  - Can resume if interrupted
  - Tracks downloaded and failed PDFs

- **Error Handling**:
  - Retries failed downloads (3 attempts)
  - Continues on errors
  - Saves progress every 10 downloads

- **Rate Limiting**:
  - 2 second delay between downloads (configurable)
  - Prevents overwhelming the server

## Configuration

Edit these variables in `download_all_pdfs.py`:

```python
DOWNLOAD_DIR = "village_maps"           # Where to save PDFs
PROGRESS_FILE = "download_progress.json" # Progress tracking file
MAX_RETRIES = 3                          # Retry attempts
DELAY_BETWEEN_REQUESTS = 2               # Seconds between downloads
HEADLESS = True                          # Run browser in background
```

## Time Estimate

- **Total PDFs**: ~18,323
- **Time per PDF**: ~5-10 seconds (form submission + download)
- **Estimated Total Time**: ~25-50 hours (depending on network speed)

**Note**: This is a long-running process. Consider:
- Running on a server/VPS
- Using `screen` or `tmux` to keep it running
- Running overnight or over multiple days

## Resuming

If the script is interrupted, simply run it again. It will:
- Skip already downloaded PDFs
- Retry failed downloads
- Continue from where it left off

## Monitoring Progress

Check progress:
```bash
# Count downloaded PDFs
find village_maps -name "*.pdf" | wc -l

# Check progress file
cat download_progress.json | python3 -m json.tool
```

## Troubleshooting

### Browser crashes
- Reduce `DELAY_BETWEEN_REQUESTS` if getting rate limited
- Increase delays in the script if timeouts occur

### Missing PDFs
- Check `download_progress.json` for failed downloads
- Re-run the script to retry failed ones
- Some villages might not have PDFs available

### Disk Space
- Each PDF is ~300-500 KB
- Total size: ~5-9 GB
- Ensure sufficient disk space

## Output Structure

```
village_maps/
├── Bagalkote/
│   ├── JAMAKHANDI/
│   │   └── JAMAKHANDI/
│   │       ├── ALABALA.pdf
│   │       └── ...
download_progress.json
```

