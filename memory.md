# Ribil Memory

## Key Lesson: Karnataka Site IP Blocking

**The Karnataka land records site (`landrecords.karnataka.gov.in`) blocks all cloud datacenter IPs.**

- Railway, Vercel, AWS, Cloudflare Workers (as origin) — all blocked with HTTP 522/504
- Regular user devices (Indian ISPs, mobile networks) — NOT blocked

**The correct approach: run PDF extraction client-side in the user's browser.**

- Browser makes ASP.NET form POSTs through the Cloudflare Worker (for CORS headers only)
- CF Worker: `https://ribil-proxy.harshag954.workers.dev`
- Client-side extractor: `lib/clientPdfExtractor.ts`
- Entry point: `lib/api.ts` → `fetchPdfUrl()` tries client-side first, falls back to server API

**Do NOT try to reach the Karnataka site from any server/cloud function. It will always fail.**

---

## Architecture

```
User Browser
  └─> lib/api.ts → fetchPdfUrl()
        └─> lib/clientPdfExtractor.ts (client-side, primary)
              └─> fetch() to ribil-proxy.harshag954.workers.dev (CF Worker, CORS only)
                    └─> landrecords.karnataka.gov.in (Karnataka site)
        └─> /api/get-pdf-url (server fallback, will fail for cloud-blocked IPs)
```

## PDF Extraction Flow (ASP.NET form POST sequence)

1. GET `/service3/` → grab hidden form fields (`__VIEWSTATE` etc.)
2. POST district selection (`__EVENTTARGET: ddl_district`)
3. POST taluk selection (`__EVENTTARGET: ddl_taluk`)
4. POST hobli selection (`__EVENTTARGET: ddl_hobli`)
5. POST village search (`btnSearch: Search`)
6. Parse `window.open('FileDownload.aspx?file=...')` from response HTML
7. Return full `https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=...` URL

## Infrastructure

- **Railway**: `https://ribil-production.up.railway.app` — hosts Next.js static export + Express API server
- **Cloudflare Worker**: `https://ribil-proxy.harshag954.workers.dev` — CORS proxy only, deployed via `cf-proxy/`
- **Railway env vars**: `CF_PROXY_URL`, `NEXT_PUBLIC_CF_PROXY_URL` (both set)
- **No** `PDF_BACKEND_URL` or `PROXY_URL` — both were removed (dead ngrok, broken Bright Data)
