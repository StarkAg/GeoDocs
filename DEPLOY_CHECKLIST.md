# ✅ VPS Deployment Checklist

## Pre-deployment (on your laptop)

- [ ] Project builds locally: `npm run build`
- [ ] All files committed (optional, but recommended)
- [ ] VPS IP ready: **65.20.69.64**
- [ ] SSH access to VPS: `ssh root@65.20.69.64` works

## Deploy

```bash
# From GeoDocs project folder on your laptop:
./scripts/deploy-to-vps.sh
```

Wait for it to complete (~2-5 minutes first time).

## Post-deployment verification

- [ ] SSH into VPS: `ssh root@65.20.69.64`
- [ ] Check PM2 status: `pm2 status` (should show "geodocs" online)
- [ ] Check logs: `pm2 logs geodocs --lines 20`
- [ ] Access app: Open **http://65.20.69.64:3000** in browser
- [ ] Test navigation: Home, Documents, Village Search, Map, Profile

## Optional: PDF backend

If you need the PDF fetching feature:

```bash
ssh root@65.20.69.64
cd /var/www/geodocs

# Install Puppeteer system dependencies (Chromium)
apt-get update && apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2

# Start PDF API
pm2 start npm --name geodocs-api -- run api
pm2 save
pm2 status  # Should show both geodocs and geodocs-api
```

- [ ] PDF backend running on port 3001
- [ ] Test: Navigate to Documents → Village Map → select location → Get PDF

## Optional: Domain & SSL

If you have a domain pointing to the VPS:

```bash
ssh root@65.20.69.64

# Install Nginx + Certbot
apt-get install -y nginx certbot python3-certbot-nginx

# Copy the provided Nginx config
nano /etc/nginx/sites-available/geodocs
# (Paste from scripts/nginx-geodocs.conf, update server_name)

ln -s /etc/nginx/sites-available/geodocs /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL cert
certbot --nginx -d your-domain.com
```

- [ ] Domain resolves to VPS IP
- [ ] Nginx running and proxying to port 3000
- [ ] SSL certificate installed
- [ ] Access app via **https://your-domain.com**

## Maintenance

### Update app

Re-run the deploy script from your laptop anytime you make changes:

```bash
./scripts/deploy-to-vps.sh
```

### View logs

```bash
ssh root@65.20.69.64
pm2 logs geodocs        # Live logs
pm2 logs geodocs-api    # PDF backend logs
```

### Restart app

```bash
ssh root@65.20.69.64
pm2 restart geodocs
pm2 restart geodocs-api
```

### Monitor resources

```bash
ssh root@65.20.69.64
pm2 monit               # PM2 dashboard
htop                    # System resources
df -h                   # Disk usage
free -h                 # Memory usage
```

## Troubleshooting

### App won't start

```bash
ssh root@65.20.69.64
cd /var/www/geodocs
pm2 logs geodocs --err --lines 50
```

Common issues:
- Missing dependencies: `npm ci`
- Build failed: `npm run build`
- Port in use: `pm2 delete geodocs && pm2 start npm --name geodocs -- start`

### Can't access from browser

- Check firewall: `ufw status` (allow port 80, 443, 3000)
- Check PM2: `pm2 status` (should be "online")
- Check port: `netstat -tlnp | grep 3000`

### PDF backend fails

Puppeteer needs Chromium:

```bash
apt-get install -y chromium-browser
```

Check logs:

```bash
pm2 logs geodocs-api --lines 50
```

---

## Quick commands reference

| Task | Command |
|------|---------|
| Deploy | `./scripts/deploy-to-vps.sh` |
| SSH to VPS | `ssh root@65.20.69.64` |
| Status | `pm2 status` |
| Logs | `pm2 logs geodocs` |
| Restart | `pm2 restart geodocs` |
| Stop | `pm2 stop geodocs` |
| Rebuild | `cd /var/www/geodocs && npm run build && pm2 restart geodocs` |
