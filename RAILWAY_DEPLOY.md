# Deploy GeoDocs on Railway (single Docker container)

One container runs both the **Next.js frontend** (static) and the **Express + Puppeteer API**.

## Deploy

1. **Railway**: [railway.app](https://railway.app) → New Project → **Deploy from GitHub** (or use Railway CLI).

2. **Connect repo** and select this project. Railway will detect the `Dockerfile` and build the image.

3. **Environment variables** (in Railway dashboard → your service → Variables):

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `PROXY_URL` | Recommended | Bright Data proxy, e.g. `http://user:pass@brd.superproxy.io:33335` (needed if Railway IPs are blocked by Karnataka site) |
   | `PORT` | No | Set by Railway |

4. **Deploy**: Railway builds and runs the container. The app is available at the generated URL (e.g. `https://geodocs-production.up.railway.app`).

## What runs in the container

- **Port**: Single port (Railway’s `PORT`); Express listens on it.
- **Frontend**: Next.js is built with `output: 'export'`; Express serves the `out/` static files.
- **API**: Same process serves `/api/get-pdf-url`, `/api/download-pdf`, `/health`, etc.
- **Puppeteer**: Uses Chromium installed in the image; with `PROXY_URL` set, traffic goes through the proxy.

## Optional: custom domain

In Railway → Settings → Domains, add your domain and point DNS as shown.

---

## Run API on Mac and connect Railway (or any frontend) to it

Use this when you want the **PDF API to run on your Mac** (direct access to Karnataka, no proxy) and your **frontend on Railway** to call it.

### 1. On your Mac

- **API**: `npm run api` (or `PORT=3001 node api/server.js`) — leave this running.
- **Tunnel**: `ngrok http 3001` — leave this running. Copy the **HTTPS** URL (e.g. `https://xxxx.ngrok-free.app`).

### 2. Connect Railway (or any host) to your Mac API

In your **frontend** deployment (e.g. Railway, Vercel, or any Next.js app that uses the PDF API):

Set this environment variable:

| Variable | Value |
|----------|--------|
| `PDF_BACKEND_URL` | Your ngrok URL, e.g. `https://d813-2406-7400-bb-2b37-794e-689f-1109-fc0d.ngrok-free.app` |

The Next.js API routes (`/api/get-pdf-url`, etc.) will then proxy requests to your Mac via ngrok.

**Note:** The ngrok URL changes each time you restart ngrok (free tier). Update `PDF_BACKEND_URL` when it changes.
