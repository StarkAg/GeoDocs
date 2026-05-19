# 🚀 START HERE — Ribil VPS Deployment

## What you have

✅ **Next.js 14 web app** (refactored from React Native)  
✅ **Automated deployment scripts** for VPS (65.20.69.64)  
✅ **PDF backend** (Express + Puppeteer) to fetch Karnataka land records  
✅ **Complete documentation** for setup and maintenance

---

## 🎯 Deploy to VPS in 3 steps

### 1. From your laptop, run:

```bash
cd /Users/mrstark/Desktop/Code\ PlayGround/Ribil
./scripts/deploy-to-vps.sh
```

**What happens:**
- Adds VPS fingerprint to `~/.ssh/known_hosts` ✅
- Syncs project files to VPS via rsync ✅
- Installs Node.js, dependencies, builds app ✅
- Starts app with PM2 on port 3000 ✅

**First time?** You'll be asked for the root password.

### 2. Access your app

Open: **http://65.20.69.64:3000**

### 3. (Optional) Set up SSH key for passwordless login

```bash
# Generate key
ssh-keygen -t ed25519 -f ~/.ssh/ribil_vps -N ""

# Copy to VPS (enter password when asked)
ssh-copy-id -i ~/.ssh/ribil_vps.pub root@65.20.69.64

# Add to config
cat >> ~/.ssh/config << 'EOF'

Host ribil-vps
  HostName 65.20.69.64
  User root
  IdentityFile ~/.ssh/ribil_vps
EOF

# Now connect without password
ssh ribil-vps
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **START_HERE.md** (this file) | Quick start guide |
| **DEPLOYMENT_QUICK_START.md** | One-command deploy + troubleshooting |
| **DEPLOY_CHECKLIST.md** | Step-by-step checklist |
| **VPS_SETUP.md** | Detailed VPS setup instructions |
| **README.md** | Project overview and local dev |

---

## 🛠️ Common tasks

### Deploy updates

Anytime you make changes:

```bash
./scripts/deploy-to-vps.sh
```

### SSH to VPS

```bash
ssh root@65.20.69.64
# or if you set up config:
ssh ribil-vps
```

### Check app status

```bash
ssh root@65.20.69.64
pm2 status
pm2 logs ribil
```

### Restart app

```bash
ssh root@65.20.69.64
pm2 restart ribil
```

---

## 🔧 Enable PDF fetching (optional)

The Documents and Village Search features need the PDF backend to work.

```bash
ssh root@65.20.69.64
cd /var/www/ribil

# Install Puppeteer dependencies (Chromium)
apt-get update && apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2

# Start PDF API on port 3001
pm2 start npm --name ribil-api -- run api
pm2 save
pm2 status
```

Now the **Get PDF** button in Documents and Village Search will work.

---

## 🌐 Set up domain + SSL (optional)

1. Point your domain (e.g., ribil.example.com) to **65.20.69.64**

2. On VPS:

```bash
ssh root@65.20.69.64

# Install Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config (replace your-domain.com)
cat > /etc/nginx/sites-available/ribil << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

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

# Get SSL certificate
certbot --nginx -d your-domain.com
```

3. Access via **https://your-domain.com**

---

## 🆘 Need help?

### Can't connect to VPS?

```bash
# Test connection
ssh -v root@65.20.69.64

# If timeout, check firewall/provider settings
```

### App not accessible?

```bash
ssh root@65.20.69.64

# Check if running
pm2 status

# Check logs
pm2 logs ribil

# Restart
pm2 restart ribil
```

### Build fails?

```bash
ssh root@65.20.69.64
cd /var/www/ribil

# Check Node version (needs 18+)
node -v

# Clean rebuild
rm -rf node_modules .next
npm ci
npm run build
pm2 restart ribil
```

---

## ✨ What's deployed

- **Home** (`/`) — Welcome page with feature cards
- **Documents** (`/documents`) — Village Map search with modal form
- **Village Search** (`/search`) — Dedicated search page
- **Map** (`/map`) — Placeholder for map integration
- **Profile** (`/profile`) — User profile placeholder

**Data:** 24,000+ Karnataka villages organized by District → Taluka → Hobli → Village

---

## 📞 Quick reference

| Command | Description |
|---------|-------------|
| `./scripts/deploy-to-vps.sh` | Deploy/update app |
| `ssh root@65.20.69.64` | Connect to VPS |
| `pm2 status` | Check running apps |
| `pm2 logs ribil` | View app logs |
| `pm2 restart ribil` | Restart app |
| `pm2 monit` | Live monitoring |

---

**Ready to deploy?** Run:

```bash
./scripts/deploy-to-vps.sh
```

🎉 Your app will be live at **http://65.20.69.64:3000** in ~5 minutes!
