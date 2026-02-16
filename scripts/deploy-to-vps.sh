#!/bin/bash
set -e

# GeoDocs VPS Deploy Script
# Run from your laptop: ./scripts/deploy-to-vps.sh

VPS_IP="65.20.69.64"
VPS_USER="root"
VPS_DIR="/var/www/geodocs"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 GeoDocs VPS Deployment to $VPS_IP"
echo ""

# Step 1: Add VPS to known_hosts (accept fingerprint)
echo "📝 Step 1: Adding VPS host key to known_hosts..."
if ! grep -q "$VPS_IP" ~/.ssh/known_hosts 2>/dev/null; then
  ssh-keyscan -H "$VPS_IP" >> ~/.ssh/known_hosts 2>/dev/null
  echo "✅ Host key added to known_hosts"
else
  echo "✅ Host key already in known_hosts"
fi
echo ""

# Step 2: Test SSH connection
echo "🔐 Step 2: Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_IP" exit 2>/dev/null; then
  echo "⚠️  Cannot connect with key-based auth."
  echo "💡 You may be prompted for password. To set up key auth, run:"
  echo "   ssh-copy-id -i ~/.ssh/id_rsa.pub $VPS_USER@$VPS_IP"
  echo ""
fi

# Step 3: Create directory on VPS
echo "📁 Step 3: Creating app directory on VPS..."
ssh "$VPS_USER@$VPS_IP" "mkdir -p $VPS_DIR"
echo "✅ Directory created: $VPS_DIR"
echo ""

# Step 4: Rsync project files
echo "📦 Step 4: Syncing project files to VPS..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'scripts' \
  --exclude '.env.local' \
  --exclude '*.log' \
  --exclude 'package-lock.json' \
  "$PROJECT_DIR/" "$VPS_USER@$VPS_IP:$VPS_DIR/"
echo "✅ Files synced"
echo ""

# Step 5: Run setup script on VPS
echo "⚙️  Step 5: Running setup on VPS..."
ssh "$VPS_USER@$VPS_IP" "bash -s" < "$PROJECT_DIR/scripts/vps-setup.sh" "$VPS_DIR"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be running at:"
echo "   http://$VPS_IP:3000"
echo ""
echo "📋 Next steps:"
echo "   1. Set up Nginx reverse proxy (port 80/443 → 3000)"
echo "   2. Point your domain to $VPS_IP"
echo "   3. (Optional) Run PDF backend: ssh $VPS_USER@$VPS_IP 'cd $VPS_DIR && pm2 start npm --name geodocs-api -- run api'"
echo ""
