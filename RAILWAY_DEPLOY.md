# Deploy Ribil (ribil.co) on Railway (single Docker container)

One container runs both the **Next.js frontend** (static) and the **Express + Puppeteer API**.

## Deploy (Railway CLI)

1. **Install CLI** (one of):
   ```bash
   npm i -g @railway/cli
   # or: brew install railway
   ```

2. **Login** and create/link the project:
   ```bash
   railway login
   # from the repo root:
   railway init   # new project — or: railway link  # existing project
   ```
   Railway detects the `Dockerfile` and will use it for the build.

3. **Set environment variables** (CLI or [dashboard](https://railway.app) → service → Variables):
   ```bash
   railway variables set NEXT_PUBLIC_APP_URL=https://ribil.co
   railway variables set PDF_BACKEND_URL=https://ribil.co
   # optional, if using Bright Data proxy:
   railway variables set PROXY_URL="http://user:pass@brd.superproxy.io:33335"
   ```
   | Variable | Required | Description |
   |----------|----------|-------------|
   | `PROXY_URL` | Recommended | Bright Data proxy (needed if Railway IPs are blocked by Karnataka site) |
   | `PORT` | No | Set by Railway |
   | `NEXT_PUBLIC_APP_URL` | For ribil.co | `https://ribil.co` |
   | `PDF_BACKEND_URL` | For ribil.co | `https://ribil.co` when API is on same domain |

4. **Deploy**:
   ```bash
   railway up
   ```
   Use `railway up --detach` to skip streaming logs. The app is available at the generated Railway URL until you add the custom domain.

5. **Use ribil.co**: In Railway → **Settings** → **Domains**, add custom domain **`ribil.co`** (and optionally `www.ribil.co`). Railway shows the CNAME target; in your DNS provider add **CNAME** `ribil.co` → that target. See [DOMAIN_RIBIL.md](./DOMAIN_RIBIL.md) for full steps. SSL is automatic.

### Alternative: Deploy from GitHub

[railway.app](https://railway.app) → New Project → **Deploy from GitHub** → connect this repo. Then set variables in the dashboard and add the custom domain as above.

## What runs in the container

- **Port**: Single port (Railway’s `PORT`); Express listens on it.
- **Frontend**: Next.js is built with `output: 'export'`; Express serves the `out/` static files.
- **API**: Same process serves `/api/get-pdf-url`, `/api/download-pdf`, `/health`, etc.
- **Puppeteer**: Uses Chromium installed in the image; with `PROXY_URL` set, traffic goes through the proxy.

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
