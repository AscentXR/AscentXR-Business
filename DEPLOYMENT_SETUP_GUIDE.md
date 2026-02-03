# Bluehost Auto-Deployment Setup Guide

## Quick Start (Complete These Steps)

### Step 1: Configure GitHub Secrets

Go to: https://github.com/AscentXR/AscentXR-Business/settings/secrets/actions

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `BLUEHOST_FTP_SERVER` | `ftp.ascentxr.com` | FTP server hostname |
| `BLUEHOST_FTP_USERNAME` | Your Bluehost username | FTP login username |
| `BLUEHOST_FTP_PASSWORD` | Your Bluehost password | FTP login password |

### Step 2: Get GitHub Token for Pushing

Since this environment needs authentication, you have two options:

**Option A: Personal Access Token (Recommended)**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Generate and copy the token
5. Use it to push:
   ```bash
   git remote set-url origin https://<TOKEN>@github.com/AscentXR/AscentXR-Business.git
   git push origin master
   ```

**Option B: Manual Push from Local Machine**
1. Clone the repo locally
2. Make the same changes (or pull the commit)
3. Push from your local machine with your credentials

### Step 3: Files Ready for Deployment

These files will be auto-deployed on push to master:

- `dashboard_v19.html` - Main dashboard (v19)
- `index.html` - Entry point with cache busting
- `agent_coordination_styles.css` - Styles
- `shared_assets/tasks/agent_registry.json` - Agent registry data
- `.htaccess` - Server configuration
- `version.json` - Version tracking
- `dashboard_v18.4.html` - Rollback version (backup)

### Step 4: Test the Deployment

After pushing, check GitHub Actions:
https://github.com/AscentXR/AscentXR-Business/actions

Then verify live site:
- Dev: https://ascentxr.com/dev/
- Direct: https://ascentxr.com/dev/dashboard_v19.html

## Deployment Pipeline Details

### Trigger Conditions
- Push to `master` or `main` branch → Auto-deploy to dev
- Manual trigger (workflow_dispatch) → Choose dev or production

### Deployment Path
```
/public_html/ascentxr-com/dev/
  ├── dashboard_v19.html     (NEW - v19)
  ├── dashboard_v18.4.html   (ROLLBACK - v18.4)
  ├── index.html             (Entry point)
  ├── agent_coordination_styles.css
  ├── agent_registry.json
  ├── .htaccess
  └── version.json
```

### Rollback Procedure

If v19 has issues:

1. **Quick Rollback via URL:**
   - Visit: https://ascentxr.com/dev/dashboard_v18.4.html

2. **Full Rollback via GitHub:**
   - Edit `index.html` to point to `dashboard_v18.4.html`
   - Commit and push
   - Workflow will redeploy with v18.4 as default

3. **Emergency Direct FTP:**
   ```bash
   # Use the provided deploy_to_bluehost.sh script
   ./deploy_to_bluehost.sh <username> <password>
   ```

## Monitoring & Verification

### GitHub Actions Status
- URL: https://github.com/AscentXR/AscentXR-Business/actions
- Workflow: "Deploy to Bluehost"
- Expected runtime: 1-2 minutes

### Live Site Verification
```bash
# Check version deployed
curl -s https://ascentxr.com/dev/version.json

# Check dashboard loads
curl -s https://ascentxr.com/dev/dashboard_v19.html | grep "v19"
```

### Success Criteria
✅ Push to master triggers workflow within 30 seconds  
✅ Workflow completes in under 2 minutes  
✅ Files appear at https://ascentxr.com/dev/  
✅ Version indicator shows v19.0  
✅ Rollback link works (v18.4 accessible)

## Troubleshooting

### Workflow Not Triggering
- Check: Is the push to `master` or `main`?
- Check: Are the workflow files in `.github/workflows/`?
- Check: GitHub Actions enabled in repo settings

### FTP Upload Fails
- Verify: Secrets are set correctly (case-sensitive)
- Verify: FTP credentials work with FileZilla
- Check: Bluehost FTP is enabled and not blocked
- Check: Server path `/public_html/ascentxr-com/dev/` exists

### Files Not Updating
- Clear browser cache (Ctrl+Shift+R)
- Check `.htaccess` is deployed (cache headers)
- Add `?nocache=1` to URL
- Check version.json shows v19.0

### Rollback Needed
- Access v18.4 directly: https://ascentxr.com/dev/dashboard_v18.4.html
- Or modify index.html and push

## Current Status (as of commit 5e86dd6)

✅ GitHub Actions workflow created  
✅ dashboard_v19.html created and versioned  
✅ dashboard_v18.4.html rollback version created  
✅ index.html updated with v19 + rollback link  
✅ version.json updated with deployment metadata  
⏳ Pending: Git push with authentication  
⏳ Pending: GitHub secrets configuration  
⏳ Pending: Test deployment  

## Contact

For issues with:
- **GitHub Actions**: Check https://github.com/AscentXR/AscentXR-Business/actions
- **FTP Credentials**: Check Bluehost control panel
- **Live Site**: Contact Bluehost support or check cPanel
