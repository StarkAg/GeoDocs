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
