# GeoDocs: Next.js frontend + Express/Puppeteer API in one container (Railway)
FROM node:20-bookworm-slim

# Chromium for Puppeteer
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

# Dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Build Next.js static export (uses NEXT_PUBLIC_* at build time)
COPY . .
ENV NEXT_PUBLIC_PDF_BACKEND_URL=
ENV NEXT_PUBLIC_API_URL=
RUN npm run build

# Single port: Express serves API + static frontend
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "api/server.js"]
