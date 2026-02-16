#!/bin/bash
set -e

# VPS Setup Script (runs on the VPS)
# Usage: bash vps-setup.sh [app_directory]

APP_DIR="${1:-/var/www/geodocs}"

echo "🔧 Setting up GeoDocs on VPS..."
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

# Stop existing PM2 process if any
echo "🔄 Managing PM2 processes..."
pm2 stop geodocs 2>/dev/null || true
pm2 delete geodocs 2>/dev/null || true

# Start with PM2
echo "🚀 Starting app with PM2..."
pm2 start npm --name geodocs -- start
pm2 save
echo "✅ App started with PM2"
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
echo "🌐 App is running on port 3000"
echo "   Check logs: pm2 logs geodocs"
echo "   Restart: pm2 restart geodocs"
echo "   Stop: pm2 stop geodocs"
echo ""
