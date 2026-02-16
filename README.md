# GeoDocs — Next.js Web App

A Next.js web application for **Karnataka geographic documents**: village maps and land records. Search by District → Taluka → Hobli → Village and fetch PDFs from the official land records portal.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PDF backend**: Express + Puppeteer (optional; run separately)

## Getting Started

### 1. Install and run the web app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. (Optional) Run the PDF backend

To actually fetch village map PDFs, run the Puppeteer-based API on port 3001:

```bash
npm run api
```

Then create `.env.local` in the project root:

```env
PDF_BACKEND_URL=http://localhost:3001
```

The Next.js app will proxy `/api/get-pdf-url` and `/api/health` to this backend. If you don’t run the backend, the **Documents** and **Village Search** flows will show an error when you click “Get PDF” (expected).

## Scripts

| Command      | Description                          |
|-------------|--------------------------------------|
| `npm run dev`   | Start Next.js dev server (port 3000) |
| `npm run build` | Production build                     |
| `npm run start` | Run production server                |
| `npm run api`   | Start PDF backend (port 3001)         |

## Project structure

```
├── app/
│   ├── layout.tsx          # Root layout + nav
│   ├── page.tsx             # Home
│   ├── documents/page.tsx   # Documents + Village Map form
│   ├── map/page.tsx         # Map placeholder
│   ├── profile/page.tsx     # Profile
│   ├── search/page.tsx      # Village Map search
│   └── api/
│       ├── get-pdf-url/     # Proxy to PDF backend
│       └── health/           # Health check proxy
├── components/              # Nav, Dropdown
├── lib/                     # API client
└── src/data/
    └── karnatakaLocations.ts  # Karnataka location hierarchy (districts → villages)
```

## Features

- **Home**: Links to Documents, Map, Village Search, Profile
- **Documents**: Grid of document types; “Village Map” opens a modal with cascading dropdowns (District → Taluka → Hobli → Village) and **Get PDF**
- **Village Search**: Same cascading dropdowns and **Get PDF** on one page
- **Map**: Placeholder for future map integration
- **Profile**: Placeholder for user/settings

Location options are loaded from `src/data/karnatakaLocations.ts` (Karnataka districts, taluks, hoblis, villages). PDF URLs are obtained by the backend from the official land records site (via Puppeteer).

## Environment

- **`PDF_BACKEND_URL`** (optional): URL of the PDF API (default `http://localhost:3001`). Used by Next.js API routes to proxy requests.
- **`NEXT_PUBLIC_API_URL`** (optional): If set, the frontend calls this URL directly instead of the Next.js proxy. Leave unset when using the proxy.

## Refactor note

This repo was refactored from a React Native/Expo app to a Next.js web app. The original mobile entry points (`App.tsx`, `index.js`) were removed. The PDF backend in `api/server.js` and the Karnataka location data in `src/data/` are unchanged and used by the web app.
