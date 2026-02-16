# Clear Cloudflare Cache (Fix 404 Errors)

## Quick Fix - Clear Cache in Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Select your domain: **staragroup.in**
3. Go to: **Caching** → **Configuration**
4. Click: **Purge Everything**
5. Confirm the purge

**Wait 30 seconds**, then refresh your browser: https://geodocs.staragroup.in

---

## Alternative: Development Mode (Bypass Cache)

1. Go to Cloudflare Dashboard
2. Select **staragroup.in**
3. Go to **Caching** → **Configuration**
4. Enable **Development Mode** (ON for 3 hours)
5. This bypasses cache temporarily

---

## Verify API Routes Work

### Test in browser console:

```javascript
// Test health endpoint
fetch('https://geodocs.staragroup.in/api/health')
  .then(r => r.json())
  .then(console.log);

// Test PDF endpoint
fetch('https://geodocs.staragroup.in/api/get-pdf-url', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    district: '2',
    taluk: '1', 
    hobli: '1',
    village: 'ALABALA'
  })
}).then(r => r.json()).then(console.log);
```

---

## Test from Terminal (Confirmed Working ✅)

```bash
# Health check
curl https://geodocs.staragroup.in/api/health

# Should return:
{"status":"ok","timestamp":"2026-02-16T17:36:44.044Z"}

# PDF URL
curl -X POST https://geodocs.staragroup.in/api/get-pdf-url \
  -H "Content-Type: application/json" \
  -d '{"district":"2","taluk":"1","hobli":"1","village":"ALABALA"}'
```

---

## If Still Getting 404

### Option 1: Hard Refresh in Browser
- **Chrome/Edge:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Firefox:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Safari:** Cmd+Option+E (clear cache), then Cmd+R

### Option 2: Incognito/Private Window
Open https://geodocs.staragroup.in in an incognito window

### Option 3: Clear Browser Cache
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Firefox: Settings → Privacy → Clear Data → Cached Web Content

---

## Cloudflare Page Rules (Optional)

To prevent caching API routes:

1. Go to **Rules** → **Page Rules**
2. Create new rule:
   - URL: `geodocs.staragroup.in/api/*`
   - Setting: **Cache Level: Bypass**
3. Save and deploy

---

## Current Status

✅ **API Routes:** Working on server  
✅ **HTTPS:** Configured and secure  
✅ **Nginx:** Properly proxying requests  
✅ **PM2:** Both apps running  

**The issue is browser/Cloudflare cache. Clear cache and it will work!**
