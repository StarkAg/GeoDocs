#!/bin/bash
set -e

# VPS Setup Script (runs on the VPS)
# Usage: bash vps-setup.sh [app_directory]

APP_DIR="${1:-/var/www/ribil}"

echo "🔧 Setting up Ribil on VPS..."
echo "📁 App directory: $APP_DIR"
echo ""

cd "$APP_DIR"

# Check Node.js
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "⚠️  Node.js not found. Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  echo "✅ Node.js $(node -v) installed"
else
  echo "✅ Node.js $(node -v) found"
fi
echo ""

# Check npm
echo "🔍 Checking npm..."
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm manually."
  exit 1
fi
echo "✅ npm $(npm -v) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false
echo "✅ Dependencies installed"
echo ""

# Build Next.js app
echo "🏗️  Building Next.js app..."
npm run build
echo "✅ Build complete"
echo ""

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2..."
  npm install -g pm2
  echo "✅ PM2 installed"
else
  echo "✅ PM2 $(pm2 -v) found"
fi
echo ""

# Install Chrome/Chromium for Puppeteer
echo "🌐 Installing Chrome for Puppeteer..."
apt-get update -qq
apt-get install -y chromium-browser || apt-get install -y chromium || true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser || which chromium || echo '')
echo "✅ Chrome installed: $PUPPETEER_EXECUTABLE_PATH"
echo ""

# Stop existing PM2 processes if any
echo "🔄 Managing PM2 processes..."
pm2 stop ribil 2>/dev/null || true
pm2 delete ribil 2>/dev/null || true
pm2 stop ribil-api 2>/dev/null || true
pm2 delete ribil-api 2>/dev/null || true

# Start Next.js app with PM2
echo "🚀 Starting Next.js app with PM2..."
pm2 start npm --name ribil -- start
echo "✅ Next.js app started (port 3000)"
echo ""

# Start API server in PRODUCTION mode with PM2
echo "🚀 Starting PDF API in PRODUCTION mode..."
pm2 start api/server.js \
  --name ribil-api \
  --env production \
  -i 1 \
  -- \
  --node-args="--max-old-space-size=2048"
echo "✅ API server started (port 3001, headless mode)"
echo ""

pm2 save
echo "✅ PM2 config saved"
echo ""

# Setup PM2 startup
echo "⚙️  Setting up PM2 startup..."
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo ""

echo "✅ Setup complete!"
echo ""
echo "📊 PM2 status:"
pm2 status
echo ""
echo "🌐 Services running:"
echo "   Next.js app:  http://localhost:3000"
echo "   PDF API:      http://localhost:3001"
echo ""
echo "📋 Useful commands:"
echo "   Check logs:    pm2 logs ribil-api"
echo "   Restart API:   pm2 restart ribil-api"
echo "   Stop all:      pm2 stop all"
echo ""
echo "⚡ Optional: Pre-fetch common villages to warm cache"
echo "   node prefetch-common-villages.js"
echo ""
