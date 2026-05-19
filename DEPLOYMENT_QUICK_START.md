# 🚀 Quick Start: Deploy to VPS (65.20.69.64)

## One-command deploy from your laptop

```bash
./scripts/deploy-to-vps.sh
```

This will:
1. ✅ Add VPS fingerprint to your laptop's `~/.ssh/known_hosts`
2. ✅ Sync project files to VPS via rsync
3. ✅ Install Node.js 20 on VPS (if needed)
4. ✅ Install dependencies and build Next.js
5. ✅ Start app with PM2 on port 3000

---

## If you need SSH key auth (optional but recommended)

On your **laptop**:

```bash
# Generate key if you don't have one
ssh-keygen -t ed25519 -f ~/.ssh/ribil_vps -N ""

# Copy public key to VPS (enter root password when prompted)
ssh-copy-id -i ~/.ssh/ribil_vps.pub root@65.20.69.64

# Add to ~/.ssh/config for easy access
cat >> ~/.ssh/config << 'EOF'

Host ribil-vps
  HostName 65.20.69.64
  User root
  IdentityFile ~/.ssh/ribil_vps
EOF

# Now you can connect without password
ssh ribil-vps
```

---

## After deployment

### 1. Check app status on VPS

```bash
ssh root@65.20.69.64
pm2 status
pm2 logs ribil
```

### 2. Access the app

Open in browser: **http://65.20.69.64:3000**

### 3. Set up domain and SSL (optional)

Install Nginx and Certbot on VPS:

```bash
ssh root@65.20.69.64

# Install Nginx
apt-get install -y nginx

# Copy Nginx config
cat > /etc/nginx/sites-available/ribil << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/ribil /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Install SSL with Certbot
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 4. Run PDF backend (optional)

The PDF backend (Puppeteer) needs to run separately:

```bash
ssh root@65.20.69.64
cd /var/www/ribil

# Install Puppeteer dependencies
apt-get install -y \
  chromium-browser \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libwayland-client0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  xdg-utils

# Install production dependencies (includes Puppeteer)
npm install --production=false

# Add environment variable for PDF backend
echo "PDF_BACKEND_URL=http://localhost:3001" > .env

# Start PDF API with PM2
pm2 start npm --name ribil-api -- run api
pm2 save
```

---

## Useful commands

| Command | Description |
|---------|-------------|
| `./scripts/deploy-to-vps.sh` | Deploy from laptop |
| `ssh root@65.20.69.64` | Connect to VPS |
| `pm2 status` | Check app status |
| `pm2 logs ribil` | View app logs |
| `pm2 restart ribil` | Restart app |
| `pm2 stop ribil` | Stop app |
| `pm2 delete ribil` | Remove app from PM2 |
| `nginx -t` | Test Nginx config |
| `systemctl reload nginx` | Reload Nginx |

---

## Troubleshooting

### Port 3000 already in use?

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change Next.js port
pm2 delete ribil
PORT=3002 pm2 start npm --name ribil -- start
pm2 save
```

### Can't connect to VPS?

```bash
# Test connection
ssh -v root@65.20.69.64

# Check firewall (on VPS)
ufw status
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

### Build fails on VPS?

```bash
ssh root@65.20.69.64
cd /var/www/ribil

# Check Node version (needs 18+)
node -v

# Try clean install
rm -rf node_modules .next
npm ci
npm run build
```
