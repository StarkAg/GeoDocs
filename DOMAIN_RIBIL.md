# Using the domain ribil.co

This project is branded **Ribil** and uses the domain **https://ribil.co**.

## Point ribil.co to your deployment

### Option A: Railway

1. In [Railway](https://railway.app) → your project → **Settings** → **Domains**.
2. Add a **custom domain**: `ribil.co` (and optionally `www.ribil.co`).
3. Railway will show the required **CNAME** (e.g. `something.up.railway.app`).
4. In your DNS provider (where ribil.co is registered), add:
   - **CNAME** `ribil.co` → `something.up.railway.app`  
     (or use **A** record if Railway gives an IP.)
   - Optionally: **CNAME** `www` → same target.
5. Wait for DNS propagation. Railway will issue SSL automatically.

### Option B: Vercel / Netlify / other host

1. Add the custom domain in the host’s dashboard (e.g. Vercel → Settings → Domains).
2. Follow the host’s instructions to set **CNAME** or **A** records for `ribil.co` (and `www` if desired).
3. SSL is usually automatic.

### Option C: Your own server (VPS)

1. Point **A** record for `ribil.co` to your server IP.
2. Configure Nginx/Apache to serve the app and respond to `ribil.co`.
3. Use Let’s Encrypt (e.g. `certbot`) for HTTPS.

## Env vars for production

When deployed at ribil.co, you can set:

```env
NEXT_PUBLIC_APP_URL=https://ribil.co
PDF_BACKEND_URL=https://ribil.co   # if API is on same domain
```

The app already uses **ribil.co** in metadata, links, and API URL defaults where applicable.
