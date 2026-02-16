# Monitor PDF Download Progress

## Quick Commands

### View Live Progress
```bash
tail -f download_log.txt
```
Press `Ctrl+C` to stop watching

### Check Progress Count
```bash
# Downloaded PDFs
find village_maps -name "*.pdf" | wc -l

# PDF Links collected
cat all_pdf_links.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(sum(len(h) for dist in d.values() for tal in dist.values() for h in tal.values()))"

# Progress from file
cat download_progress.json | python3 -m json.tool | grep -E "(downloaded|failed)" | head -2
```

### Check Process Status
```bash
ps aux | grep download_all_pdfs.py
```

### Stop Download
```bash
pkill -f download_all_pdfs.py
```

### Resume Download
If stopped, just run again - it will skip already downloaded PDFs:
```bash
python3 download_all_pdfs.py
```

## Output Files

1. **`all_pdf_links.json`** - All PDF URLs organized by District > Taluk > Hobli > Village
2. **`village_maps/`** - Folder with all downloaded PDFs organized by location
3. **`download_progress.json`** - Tracks which PDFs are downloaded/failed
4. **`download_log.txt`** - Full log of the download process

## Expected Progress

- **Total villages**: 18,323
- **Estimated time**: ~15-25 hours
- **Progress saved**: Every 10 PDFs
- **Can resume**: Yes, just restart the script

## Example Progress Output

```
[████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25.0% | ✅   100 | ❌    5 | ⏱️   12.5/min | ⏳ ETA: 2:30:00 | 🕐 Elapsed: 0:48:00
```

