# AGENT DEPLOYMENT PROTOCOL

## CRITICAL: EXECUTION OVER PLANNING

Agents MUST deploy working files, not just create plans. Every task ends with files uploaded to `/dev/` and verified working.

## DEPLOYMENT CHECKLIST (MUST COMPLETE ALL)

### PHASE 1: LOCAL DEVELOPMENT
- [ ] Create/update HTML files locally
- [ ] Apply Ascent XR design system (dark theme, NO PURPLE)
- [ ] Test locally in browser
- [ ] Fix any issues

### PHASE 2: FTP DEPLOYMENT
- [ ] Upload ALL files to `/dev/` directory:
```bash
curl -T filename.html "ftp://Sam564564457844537%40ascentxr.com:2Cl%23%2Ah2cdl%40cKNCO@ctz.hzv.mybluehost.me/dev/filename.html"
```

### PHASE 3: HTTP VERIFICATION  
- [ ] Test each file loads (HTTP 200):
```bash
curl -I "https://ascentxr.com/dev/filename.html"
```
- [ ] Verify content appears correctly:
```bash
curl -s "https://ascentxr.com/dev/filename.html" | head -5
```

### PHASE 4: LINK TESTING
- [ ] Test all navigation links work
- [ ] Verify no broken images
- [ ] Check .md files redirect to HTML

### PHASE 5: COLOR AUDIT
- [ ] NO PURPLE anywhere (`#667eea`, `#764ba2`, `#9f7aea`)
- [ ] Use Ascent XR palette only:
  - Primary Blue: `#3b82f6`
  - Secondary Teal: `#0ea5e9`
  - Dark Background: `#0f172a`
  - Card Background: `#1e293b`

## AGENT TEAM ROLES & RESPONSIBILITIES

### Dashboard Team (Integration)
**DELIVERABLE:** Working unified dashboard
**MUST:**
1. Merge all components into `unified_dashboard.html`
2. Ensure LinkedIn integration works
3. Test all navigation
4. Deploy to `/dev/unified_dashboard.html`

### Design Team (Visual Consistency)
**DELIVERABLE:** No purple anywhere
**MUST:**
1. Find and replace ALL purple references
2. Apply consistent design system
3. Verify across all files
4. Deploy fixed files

### Content Team (Gallery & Assets)
**DELIVERABLE:** LinkedIn gallery with images
**MUST:**
1. Create `linkedin_gallery.html`
2. Upload images to server
3. Test image loading
4. Deploy gallery

### Development Team (HTML Conversion)
**DELIVERABLE:** All markdown converted to HTML
**MUST:**
1. Convert `.md` → `.html`
2. Apply design system
3. Add navigation
4. Deploy HTML files

### QA Team (Verification)
**DELIVERABLE:** Everything works
**MUST:**
1. Test all pages (HTTP 200)
2. Test all links
3. Verify no purple
4. Confirm deployment complete

## COMMON FAILURE PATTERNS & SOLUTIONS

### 1. "Planned but didn't deploy"
**SOLUTION:** Always end with FTP upload commands

### 2. "Colors wrong"
**SOLUTION:** Run color audit:
```bash
grep -r "#667eea\|#764ba2\|#9f7aea\|purple" *.html *.css
```

### 3. "Links broken"
**SOLUTION:** Use relative paths (`filename.html`) not absolute (`/dev/filename.html`)

### 4. "JavaScript not working"
**SOLUTION:** Copy working patterns from `unified_dashboard.html`

### 5. "Files not accessible"
**SOLUTION:** Verify FTP upload succeeded:
```bash
curl -s "ftp://Sam564564457844537%40ascentxr.com:2Cl%23%2Ah2cdl%40cKNCO@ctz.hzv.mybluehost.me/dev/" | grep filename
```

## SUCCESS METRICS

### ✅ TASK COMPLETE WHEN:
1. All files uploaded to `/dev/`
2. All pages return HTTP 200
3. All navigation works
4. No purple colors
5. .md files redirect to HTML

### ❌ TASK INCOMPLETE IF:
1. Files only exist locally
2. HTTP tests fail
3. Links broken
4. Purple colors present
5. .md files show original content

## IMMEDIATE NEXT STEPS FOR CURRENT SITUATION

### Problem: Agents created plans but didn't deploy
### Solution: Execute deployment NOW

1. **Dashboard Team:** Deploy `unified_dashboard.html` (already done)
2. **Design Team:** Audit ALL files for purple (do now)
3. **Content Team:** Fix LinkedIn gallery image loading (do now)
4. **Development Team:** Convert remaining .md files (do now)
5. **QA Team:** Verify everything works (do now)

## URGENT: TEST CURRENT DEPLOYMENT
```bash
# Test all HTML pages
for page in unified_dashboard.html ASCENT_XR_DASHBOARD.html ASCENT_XR_LINKEDIN_STRATEGY.html ASCENT_XR_ROI_TEMPLATE.html ASCENT_ASSISTANT_CONSTITUTION.html NICK_STATUS.html LINKEDIN_SCHEDULE.html linkedin_gallery.html ascent_dashboard_docs.html; do
  curl -s -o /dev/null -w "%{http_code} $page\n" "https://ascentxr.com/dev/$page"
done

# Test .md files redirect
for md in ASCENT_XR_DASHBOARD.md ASCENT_XR_LINKEDIN_STRATEGY.md ASCENT_XR_ROI_TEMPLATE.md linkedin_week1_posts.md; do
  curl -s "https://ascentxr.com/dev/$md" | head -1 | grep -q "FILE MOVED TO HTML" && echo "✅ $md" || echo "❌ $md"
done
```

## FINAL RULE: DEPLOYMENT IS MANDATORY
No task is complete until files are:
1. Uploaded to `/dev/`
2. Accessible via HTTPS
3. Tested working
4. Verified by QA