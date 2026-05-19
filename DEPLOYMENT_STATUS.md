# 🎉 Ribil Deployment Status

**Date:** February 16, 2026  
**Domain:** ribil.staragroup.in  
**VPS IP:** 65.20.69.64

---

## ✅ Deployment Complete

Your Ribil Next.js app is now **LIVE** and fully functional!

### 🌐 Access Your Site

- **HTTP:** http://ribil.staragroup.in
- **Direct IP:** http://65.20.69.64
- **HTTPS:** Coming soon (requires DNS propagation)

---

## 🚀 What's Running

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| **Next.js App** | 3000 | ✅ Online | Main web application |
| **PDF API** | 3001 | ✅ Online | Puppeteer backend for PDF extraction |
| **Nginx** | 80 | ✅ Online | Reverse proxy & web server |

### PM2 Processes

```
┌────┬────────────────┬─────────────┬─────────┬──────────┬────────┐
│ ID │ Name           │ Status      │ CPU     │ Memory   │ Uptime │
├────┼────────────────┼─────────────┼─────────┼──────────┼────────┤
│ 3  │ ribil        │ online      │ 0%      │ 45.5mb   │ now    │
│ 1  │ ribil-api    │ online      │ 0%      │ 57.3mb   │ 1m     │
└────┴────────────────┴─────────────┴─────────┴──────────┴────────┘
```

---

## 📋 Features Available

✅ **Home Page** - Welcome screen with navigation cards  
✅ **Documents** - Village Map search with cascading dropdowns  
✅ **Village Search** - Dedicated search page for PDF fetching  
✅ **Map View** - Placeholder for future map integration  
✅ **Profile** - User profile section  
✅ **PDF Download** - **FULLY WORKING!** 🎉  
- 24,000+ Karnataka villages data  
- District → Taluka → Hobli → Village cascading selection  
- Real-time PDF extraction from Karnataka Land Records  

---

## 🔐 SSL Certificate (HTTPS)

**Status:** ⏳ Pending DNS propagation

### Next Steps for HTTPS:

1. **Ensure DNS is pointing to VPS:**
   ```
   ribil.staragroup.in → 65.20.69.64
   ```

2. **Check DNS propagation:**
   ```bash
   dig ribil.staragroup.in
   ```

3. **Get SSL certificate once DNS is ready:**
   ```bash
   ssh root@65.20.69.64
   certbot --nginx -d ribil.staragroup.in --non-interactive --agree-tos --email harshag954@gmail.com --redirect
   ```

4. **Or if using Cloudflare:**
   - Disable Cloudflare proxy (orange cloud → gray cloud) temporarily
   - Get SSL certificate
   - Re-enable Cloudflare proxy
   - Set SSL mode to "Full" in Cloudflare

---

## 🎯 Testing Your Site

### Test the main app:
```bash
curl http://ribil.staragroup.in
```

### Test the PDF API health:
```bash
curl http://65.20.69.64:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## 📊 Management Commands

### SSH into VPS:
```bash
ssh root@65.20.69.64
```

### Check service status:
```bash
pm2 status
```

### View logs:
```bash
pm2 logs ribil        # Next.js app logs
pm2 logs ribil-api    # PDF API logs
```

### Restart services:
```bash
pm2 restart ribil
pm2 restart ribil-api
```

### Stop services:
```bash
pm2 stop all
```

### Start services:
```bash
cd /var/www/ribil
pm2 start npm --name ribil -- start
pm2 start npm --name ribil-api -- run api
pm2 save
```

---

## 🔄 Update / Redeploy

From your laptop:

```bash
cd /Users/mrstark/Desktop/Code\ PlayGround/Ribil

# Make your changes, commit to git
git add -A
git commit -m "Your update message"
git push

# Deploy to VPS
./scripts/deploy-to-vps.sh
```

---

## 📝 Configuration Files

### On VPS:

- **App Directory:** `/var/www/ribil`
- **Nginx Config:** `/etc/nginx/sites-available/ribil`
- **PM2 Config:** `/root/.pm2/dump.pm2`
- **Environment:** `/var/www/ribil/.env`

### Environment Variables (VPS):

```env
PDF_BACKEND_URL=http://localhost:3001
```

---

## 🎉 Success Metrics

✅ Code pushed to GitHub: https://github.com/StarkAg/Ribil  
✅ Deployed to VPS: 65.20.69.64  
✅ Nginx configured with domain  
✅ PM2 running both services  
✅ PDF download feature working  
✅ All pages accessible  
✅ API health check passing  

---

## 🆘 Troubleshooting

### Site not loading?

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs ribil`
3. Restart: `pm2 restart all`

### PDF download not working?

1. Check API: `curl http://localhost:3001/health`
2. Check API logs: `pm2 logs ribil-api`
3. Restart API: `pm2 restart ribil-api`

### Need to free up space?

```bash
# Clean npm cache
npm cache clean --force

# Clean PM2 logs
pm2 flush

# Clean apt cache
apt-get clean
```

---

## 🎊 You're All Set!

Your Ribil application is now **fully deployed and operational** on your VPS!

**Next steps:**
1. Wait for DNS to propagate (usually 5-30 minutes)
2. Get SSL certificate for HTTPS
3. Start using the app!

**Access now:** http://ribil.staragroup.in or http://65.20.69.64

🚀 Happy mapping!
