# 🚨 URGENT: Cache Clearing Required

## Problem
The live website at `https://ascentxr.com/dev/` is serving an **OLD cached version (v15)** instead of the updated **v18**.

The local files have been updated, but the web server/CDN is aggressively caching the old version.

---

## ✅ Files Ready for Deployment

Location: `/home/jim/openclaw/deploy-v18/`

- **dashboard.html** - Main dashboard (v18, 135KB)
- **index.html** - Cache-busting loader
- **.htaccess** - Cache control headers

---

## 🛠️ SOLUTION OPTIONS

### Option 1: Clear CloudFlare Cache (If using CloudFlare)
1. Log into CloudFlare dashboard
2. Select your domain (ascentxr.com)
3. Go to **Caching** → **Configuration**
4. Click **Purge Everything**
5. Wait 2-3 minutes
6. Test the URL again

### Option 2: Clear Hosting Provider Cache
**If using shared hosting (Bluehost, HostGator, etc.):**
- Log into hosting control panel (cPanel)
- Look for "Cache" or "CloudFlare" section
- Click "Purge Cache" or "Clear Cache"

**If using AWS CloudFront:**
- Go to CloudFront console
- Select your distribution
- Click **Invalidations** tab
- Create invalidation: `/*`
- Wait for completion

**If using other CDN:**
- Log into CDN dashboard
- Find "Purge" or "Clear Cache" option
- Purge all content for `/dev/*`

### Option 3: Upload Fresh Files (FTP/SFTP)
Upload these files to your web server `/dev/` directory:

```
/dev/
  ├── index.html          (NEW - cache-busting loader)
  ├── dashboard.html      (NEW - v18 main dashboard)
  ├── .htaccess          (NEW - cache control headers)
  └── unified_dashboard.html (replace with v18)
```

**Important:** Make sure to **overwrite** the old files, don't just add new ones.

### Option 4: Force Browser Refresh
Tell users to hard refresh:
- **Chrome/Edge:** Ctrl + Shift + R
- **Firefox:** Ctrl + F5
- **Safari:** Cmd + Option + R

---

## 🔍 How to Verify Fix

After clearing cache, check for:

1. **Title bar:** Should show "Ascent XR Dashboard v18"
2. **Bottom-right corner:** Should show "v18.0 | Feb 3, 2026"
3. **Console (F12 → Console):** Should show "🚀 Initializing Ascent XR Dashboard v18..."

If you still see "v15" anywhere, the cache hasn't been cleared.

---

## 📋 Quick Test Commands

Test from command line:
```bash
# Check current version being served
curl -s https://ascentxr.com/dev/ | grep -i "v15\|v16\|v17\|v18"

# Force fresh download (bypass cache)
curl -H "Cache-Control: no-cache" https://ascentxr.com/dev/
```

---

## 🆘 If Nothing Works

1. **Rename the file:** Try accessing via a new filename that hasn't been cached:
   ```
   https://ascentxr.com/dev/dashboard-v18-new.html
   ```

2. **Add query parameter:** Force cache bypass
   ```
   https://ascentxr.com/dev/?nocache=1&v=18
   ```

3. **Contact hosting support:** Ask them to clear server-side cache

---

## 📊 Current Status

| Location | Version | Status |
|----------|---------|--------|
| Local workspace | v18 | ✅ Updated |
| Web fetch test | v15 | ❌ CACHED |
| Production site | v15 | ❌ NEEDS CLEAR |

**Last updated:** Feb 3, 2026 13:30 UTC

---

## ✅ Files Modified Today

1. `unified_dashboard.html` - Fixed JavaScript errors, added version indicator
2. `index.html` - Added cache-busting redirect loader
3. `ascent_xr_master_dashboard.html` - Updated to v18
4. `dashboard_v18.html` - New versioned file
5. `.htaccess` - Added aggressive cache-control headers
6. `version.json` - Version tracking
7. `TASK_BUILD_DASHBOARD_V2.md` - Added cache-busting requirements

---

**Next Steps:**
1. Clear CDN/server cache
2. Upload fresh files if needed
3. Test URL shows v18
4. Verify version indicator visible on page