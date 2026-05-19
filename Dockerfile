# Ribil: Next.js frontend + Express/Puppeteer API (Railway)
#
# Why the build takes ~5–10 min:
#   1. apt-get install chromium + deps (~200MB)  → 3–5 min
#   2. npm ci (all deps for build)                → 1–3 min
#   3. npm run build (Next.js static export)      → 1–2 min
# Railway caches layers; rebuilds are faster when only code changes.

FROM node:20-bookworm-slim

# Chromium for Puppeteer (largest step – cached after first build)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
    libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libxcomposite1 \
    libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Dependencies (layer cached when package*.json unchanged)
COPY package.json package-lock.json* ./
RUN npm ci

# Build Next.js static export (layer cached when source unchanged)
COPY . .
ENV NEXT_PUBLIC_PDF_BACKEND_URL=
ENV NEXT_PUBLIC_API_URL=
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "api/server.js"]
