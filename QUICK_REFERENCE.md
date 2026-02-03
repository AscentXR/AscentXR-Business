# 🚀 Quick Deployment Reference Card

## Files Created/Modified

### Core Deployment Files
```
.github/workflows/deploy-bluehost.yml    # GitHub Actions workflow
dashboard_v19.html                       # Main dashboard (NEW v19)
dashboard_v18.4.html                     # Rollback version
index.html                               # Updated with v19 + rollback
version.json                             # Deployment metadata
```

### Helper Scripts
```
push_with_token.sh          # GitHub push with token
test_ftp_connection.sh      # Test FTP to Bluehost
deploy_to_bluehost.sh       # Direct FTP deployment
```

### Documentation
```
DEPLOYMENT_SETUP_GUIDE.md   # Full setup instructions
DEPLOYMENT_STATUS_REPORT.md # This status report
```

---

## One-Minute Setup

### 1. Push Code (30 seconds)
```bash
# Get token from https://github.com/settings/tokens
./push_with_token.sh ghp_your_token_here
```

### 2. Configure Secrets (30 seconds)
Go to: https://github.com/AscentXR/AscentXR-Business/settings/secrets/actions

Add 3 secrets:
- `BLUEHOST_FTP_SERVER` = `ftp.ascentxr.com`
- `BLUEHOST_FTP_USERNAME` = your_bluehost_user
- `BLUEHOST_FTP_PASSWORD` = your_bluehost_pass

### 3. Done!
Workflow auto-triggers on push. Check:
- https://github.com/AscentXR/AscentXR-Business/actions
- https://ascentxr.com/dev/

---

## Rollback Options

| Method | URL | When to Use |
|--------|-----|-------------|
| **Quick View** | https://ascentxr.com/dev/dashboard_v18.4.html | Test v18.4 |
| **Full Rollback** | Edit index.html → push | Switch default to v18.4 |
| **Emergency FTP** | `./deploy_to_bluehost.sh` | Direct file upload |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Push fails | Check token has `repo` scope |
| FTP fails | Verify secrets in GitHub settings |
| Site not updating | Clear cache: Ctrl+Shift+R |
| Wrong version shows | Add `?nocache=1` to URL |

---

## Contact & Links

- **GitHub Actions:** https://github.com/AscentXR/AscentXR-Business/actions
- **Secrets:** https://github.com/AscentXR/AscentXR-Business/settings/secrets/actions
- **Live Site:** https://ascentxr.com/dev/
- **v19 Direct:** https://ascentxr.com/dev/dashboard_v19.html
- **v18.4 Rollback:** https://ascentxr.com/dev/dashboard_v18.4.html

---

## Current Commit

Latest: `aab7c38` - "Add deployment documentation and helper scripts"

All changes ready to push!
