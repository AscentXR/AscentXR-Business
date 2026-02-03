---
name: ascent-xr-development
description: "Specialized skill for Ascent XR web development, deployment, and design system implementation. Use for dashboard creation, HTML deployment, FTP uploads, and design consistency tasks."
---

# Ascent XR Development Skill

Specialized workflows for Ascent XR web development, deployment, and design system implementation.

## Design System

### Color Palette (NO PURPLE ANYWHERE)
- **Primary Blue:** `#3b82f6` (buttons, highlights)
- **Secondary Teal:** `#0ea5e9` (accent elements)
- **Dark Background:** `#0f172a` (main background)
- **Card Background:** `#1e293b` (content cards)
- **Border Color:** `#334155` (dividers, borders)
- **Text Primary:** `#f8fafc` (main text)
- **Text Secondary:** `#94a3b8` (secondary text)
- **Success:** `#10b981` (positive indicators)
- **Warning:** `#f59e0b` (warnings)
- **Danger:** `#ef4444` (errors, alerts)

### **CRITICAL RULE:** NO PURPLE ANYWHERE
- **Replace:** `#667eea` → `#60a5fa`
- **Replace:** `#764ba2` → `#1e293b`
- **Replace:** `#9f7aea` → `#3b82f6`
- **Replace any purple gradients** with blue/teal gradients

### Font System
- **Primary:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace:** `monospace` for code

### Layout Standards
- **Container Width:** `max-width: 1200px`
- **Padding:** `20px` outer, `25px` inner
- **Border Radius:** `16px` containers, `8px` cards
- **Shadows:** `0 25px 75px rgba(0,0,0,0.5)` main, `0 10px 25px rgba(0,0,0,0.3)` hover

## File Structure

### `/dev/` Directory (Primary Deployment Target)
```
/dev/
├── unified_dashboard.html          # Main dashboard
├── ASCENT_XR_DASHBOARD.html        # Dashboard document
├── ASCENT_XR_LINKEDIN_STRATEGY.html # LinkedIn strategy
├── ASCENT_XR_ROI_TEMPLATE.html     # ROI template
├── ASCENT_ASSISTANT_CONSTITUTION.html # Company constitution
├── NICK_STATUS.html                # CTO status update
├── LINKEDIN_SCHEDULE.html          # Posting schedule
├── linkedin_gallery.html           # Content gallery
├── ascent_dashboard_docs.html      # Documentation hub
└── index.html                      # Landing page
```

### Local Development Structure
```
/home/jim/openclaw/
├── *.html                          # All HTML files
├── *.md                            # Markdown source files
└── shared_assets/                  # Shared assets
    └── content/
        └── linkedin/
            └── week1/
                ├── posts/          # LinkedIn post content
                └── images/         # Post images
```

## Deployment Procedures

### FTP Upload to Production
```bash
# Upload single file
curl -T filename.html "ftp://Sam564564457844537%40ascentxr.com:2Cl%23%2Ah2cdl%40cKNCO@ctz.hzv.mybluehost.me/dev/filename.html"

# Check uploaded files
curl -s "ftp://Sam564564457844537%40ascentxr.com:2Cl%23%2Ah2cdl%40cKNCO@ctz.hzv.mybluehost.me/dev/" 2>/dev/null | grep filename
```

### HTTP Verification
```bash
# Test file accessibility
curl -I "https://ascentxr.com/dev/filename.html"

# Test content
curl -s "https://ascentxr.com/dev/filename.html" | head -5
```

### Markdown to HTML Conversion
1. **Create HTML template** with Ascent XR design system
2. **Convert markdown content** preserving structure
3. **Apply consistent styling** (dark theme, no purple)
4. **Add navigation** back to unified dashboard
5. **Upload and verify** with FTP/HTTP tests

## Task Execution Workflow

### 1. Analysis Phase (15 minutes)
- Read task requirements
- Check existing files in `/dev/`
- Identify dependencies
- Plan approach

### 2. Development Phase (45 minutes)
- Create/update HTML files locally
- Apply design system consistently
- Test locally in browser
- Fix any issues

### 3. Deployment Phase (15 minutes)
- Upload all files via FTP
- Verify HTTP accessibility
- Test all links
- Update any references

### 4. Verification Phase (15 minutes)
- Test all pages load (HTTP 200)
- Verify no broken links
- Check color consistency (no purple)
- Confirm navigation works

## Common Tasks & Solutions

### Dashboard Integration
```javascript
// Navigation links should open IN-PAGE, not new tabs
<a href="#" class="nav-link document-link" data-doc="dashboard">Dashboard Docs</a>

// JavaScript handling
document.querySelectorAll('.nav-link.document-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const docKey = this.dataset.doc;
        openDocument(docKey, e); // Pass event for active state
    });
});
```

### Color Audit
```bash
# Find purple references
grep -r "#667eea\|#764ba2\|#9f7aea\|purple\|667eea\|764ba2\|9f7aea" *.html *.css *.md

# Fix purple colors
sed -i 's/#667eea/#60a5fa/g' file.html
sed -i 's/#764ba2/#1e293b/g' file.html
```

### Link Testing
```bash
# Test all HTML pages
for page in unified_dashboard.html ASCENT_XR_DASHBOARD.html ASCENT_XR_LINKEDIN_STRATEGY.html; do
    curl -s -o /dev/null -w "%{http_code} $page\n" "https://ascentxr.com/dev/$page"
done

# Test .md files redirect
curl -s "https://ascentxr.com/dev/ASCENT_XR_DASHBOARD.md" | head -1 | grep -q "FILE MOVED TO HTML"
```

## Critical Success Factors

### 1. EXECUTION OVER PLANNING
- Agents must **deploy working files**, not just create plans
- Every task ends with **files uploaded to `/dev/`**
- **Test before marking complete**

### 2. DESIGN CONSISTENCY
- **NO PURPLE** anywhere in final output
- All pages use dark theme
- Navigation works correctly
- Links are relative (`filename.html`) not absolute (`/dev/filename.html`)

### 3. COMPLETE VERIFICATION
- All HTML pages return HTTP 200
- All .md files show redirect notices
- No broken images or links
- Navigation between pages works

## Agent Team Specializations

### Dashboard Agent
- Focus: HTML/CSS/JavaScript dashboard development
- Skills: Dashboard integration, real-time metrics, navigation
- Output: Working unified dashboard with all features

### Design Agent  
- Focus: Color consistency, CSS, visual design
- Skills: Color auditing, design system implementation
- Output: All files using Ascent XR color palette

### Content Agent
- Focus: Content creation and visualization
- Skills: Gallery creation, image handling, content formatting
- Output: Visual galleries, formatted content pages

### Deployment Agent
- Focus: File deployment and verification
- Skills: FTP uploads, HTTP testing, link checking
- Output: All files deployed and verified working

## Error Recovery

### Common Issues & Fixes
1. **FTP upload fails** → Check credentials, network, file permissions
2. **HTTP 404 errors** → Verify file exists in `/dev/`, check filename case
3. **Broken links** → Use relative paths, test all navigation
4. **Purple colors** → Run color audit, replace with approved palette
5. **JavaScript errors** → Check console, fix event handlers

### When Stuck
1. **Check existing working examples** (unified_dashboard.html)
2. **Review this skill document** for procedures
3. **Test incrementally** (one page at a time)
4. **Verify each step** before proceeding
5. **Ask for help** if blocked >15 minutes

## Quality Checklist

### Before Deployment
- [ ] No purple colors anywhere
- [ ] All links use relative paths
- [ ] Navigation works in-page (not new tabs)
- [ ] Design system applied consistently
- [ ] Files saved locally with correct names

### After Deployment  
- [ ] All pages return HTTP 200
- [ ] All .md files show redirect notices
- [ ] Navigation between pages works
- [ ] No JavaScript errors in console
- [ ] Mobile responsive (test different sizes)

### Final Verification
- [ ] Unified dashboard loads all sections
- [ ] LinkedIn gallery shows images
- [ ] All document links work
- [ ] Color audit passes (no purple)
- [ ] Cross-browser testing (Chrome, Firefox)