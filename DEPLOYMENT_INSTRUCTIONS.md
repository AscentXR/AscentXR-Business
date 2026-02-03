# URGENT DEPLOYMENT PACKAGE - v18

## Problem Summary
The live web server is serving **v15** from cache, but local files are **v18**.
Local files are NOT automatically synced to the live server.

## Files Ready to Deploy

Location: `/home/jim/openclaw/`

**Priority 1 - Must Deploy:**
1. `unified_dashboard.html` (135KB) - Main dashboard v18
2. `index.html` (5KB) - Cache-busting loader
3. `dashboard-v18-live.html` (135KB) - Alternative v18 file

**Priority 2 - Support Files:**
4. `.htaccess` (1.5KB) - Cache control headers
5. `version.json` (486 bytes) - Version tracking

## Deployment Options

### Option A: FTP/SFTP Upload (Recommended)

**Using FileZilla or similar:**
1. Connect to your hosting server (FTP credentials needed)
2. Navigate to `/public_html/dev/` or `/www/dev/`
3. Upload these files:
   - `unified_dashboard.html` → overwrite existing
   - `index.html` → overwrite existing  
   - `dashboard-v18-live.html` → new file
   - `.htaccess` → overwrite existing

**Expected server path:**
```
/var/www/html/dev/
  ├── unified_dashboard.html  (REPLACE with v18)
  ├── index.html              (REPLACE with new loader)
  ├── dashboard-v18-live.html (NEW)
  └── .htaccess               (REPLACE)
```

### Option B: cPanel File Manager

1. Log into cPanel
2. Go to **File Manager**
3. Navigate to `public_html/dev/` or `www/dev/`
4. Upload/overwrite:
   - `unified_dashboard.html`
   - `index.html`
   - `dashboard-v18-live.html`
   - `.htaccess`

### Option C: Command Line (If you have server access)

```bash
# If you have SSH access to the server:
scp /home/jim/openclaw/unified_dashboard.html user@ascentxr.com:/var/www/html/dev/
scp /home/jim/openclaw/index.html user@ascentxr.com:/var/www/html/dev/
scp /home/jim/openclaw/dashboard-v18-live.html user@ascentxr.com:/var/www/html/dev/
scp /home/jim/openclaw/.htaccess user@ascentxr.com:/var/www/html/dev/
```

## After Upload - Clear Cache

**CloudFlare:**
1. Log into CloudFlare
2. Caching → Purge Everything
3. Wait 2 minutes

**Or add cache-busting query:**
```
https://ascentxr.com/dev/unified_dashboard.html?nocache=1&v=18
```

## Verification Steps

After deployment, check:
1. Open browser dev tools (F12)
2. Go to Network tab
3. Hard refresh (Ctrl+Shift+R)
4. Check the Response Headers for:
   - `cache-control: no-cache`
5. Check page title: "Ascent XR Dashboard v18"
6. Check bottom-right: "v18.0 | Feb 3, 2026"

## Emergency Workaround

If you can't deploy right now, access via:
```
https://ascentxr.com/dev/unified_dashboard.html?nocache=1706969700000&v=v18&t=202602031325
```

Add random numbers to ?nocache= each time to force fresh load.

## Contact Hosting Support

If you need help deploying, contact your hosting provider:

**Tell them:**
"I need to upload updated HTML files to my /dev/ directory and clear all server/CDN cache. The current files are cached and showing an old version."

**Files to upload:**
- unified_dashboard.html (135KB)
- index.html (5KB)
- .htaccess (1.5KB)

## Current Status

| File | Local | Server | Status |
|------|-------|--------|--------|
| unified_dashboard.html | v18 (Feb 3) | v15 (cached) | NEEDS UPLOAD |
| index.html | New loader | Old version | NEEDS UPLOAD |
| .htaccess | Cache control | Unknown | NEEDS UPLOAD |

## Next Actions Required

1. [ ] Get FTP/cPanel credentials for web server
2. [ ] Upload files to /dev/ directory
3. [ ] Clear CDN/server cache
4. [ ] Test URL shows v18
5. [ ] Verify version indicator visible

---

**Created:** Feb 3, 2026 13:35 UTC
**Package:** v18 Deployment