# GeoDocs VPS Setup (65.20.69.64)

## 1. SSH fingerprint on your laptop

Run these on your **Mac/laptop** (in Terminal).

### Option A: Add the VPS host key (accept fingerprint once)

```bash
ssh-keyscan -H 65.20.69.64 >> ~/.ssh/known_hosts
```

This fetches the server’s public key and adds it to `~/.ssh/known_hosts`, so you won’t get an interactive “fingerprint” prompt next time.

### Option B: First connect and accept manually

```bash
ssh root@65.20.69.64
```

When prompted **“Are you sure you want to continue connecting (yes/no)?”** type `yes`. That saves the fingerprint to `~/.ssh/known_hosts`.

### Use SSH key login (recommended)

If you don’t have a key yet:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/geodocs_vps -N ""
```

Copy your public key to the VPS (use your root password when asked):

```bash
ssh-copy-id -i ~/.ssh/geodocs_vps.pub root@65.20.69.64
```

Then connect with the key:

```bash
ssh -i ~/.ssh/geodocs_vps root@65.20.69.64
```

To always use this key for this host, add to `~/.ssh/config` on your laptop:

```
Host geodocs-vps
  HostName 65.20.69.64
  User root
  IdentityFile ~/.ssh/geodocs_vps
```

Then you can just run: `ssh geodocs-vps`

---

## 2. One-command deploy from your laptop

From the **GeoDocs project folder** on your laptop:

```bash
./scripts/deploy-to-vps.sh
```

This will:

- Add the VPS to `known_hosts` if needed
- Sync the project (rsync) to the VPS
- On the VPS: install Node, install deps, build, and run with PM2

See **Scripts** below if you prefer to run the VPS steps yourself.

---

## 3. Manual setup on the VPS

SSH in first:

```bash
ssh root@65.20.69.64
```

Then run the setup script **on the VPS** (after you’ve uploaded it or pasted it):

```bash
# On VPS: run the setup script
bash -s < /path/to/scripts/vps-setup.sh
```

Or run these steps by hand:

```bash
# Install Node 20 (Ubuntu/Debian)
apt-get update && apt-get install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Create app directory
mkdir -p /var/www/geodocs
cd /var/www/geodocs

# (Project files should be here via rsync/git/scp)

# Install deps and build
npm ci
npm run build

# Run with PM2 (install if needed: npm i -g pm2)
pm2 start npm --name geodocs -- start
pm2 save && pm2 startup
```

---

## 4. Scripts reference

| Script | Run where | Purpose |
|--------|-----------|--------|
| `scripts/deploy-to-vps.sh` | Laptop | Add host to known_hosts, rsync project, run remote setup |
| `scripts/vps-setup.sh` | VPS | Install Node, npm ci, build, PM2 |

---

## 5. After deploy

- App by default runs on port **3000** (PM2).
- Use Nginx or Caddy as reverse proxy and point a domain to `65.20.69.64`.
- For PDF backend (Puppeteer), run `npm run api` in a separate PM2 process and set `PDF_BACKEND_URL` in `.env` on the VPS.
