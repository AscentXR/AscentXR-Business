# UNIFIED DESIGN SYSTEM - ASCENT XR DASHBOARDS

## COLOR PALETTE

### Primary Dark Theme:
- **Background:** `#0f172a` (dark blue)
- **Surface:** `#1e293b` (darker blue surface)
- **Border:** `#334155` (medium blue border)

### Accent Colors (Blue/Teal Theme):
- **Primary Accent:** `#60a5fa` (bright blue)
- **Secondary Accent:** `#10b981` (teal green)
- **Warning/Alert:** `#f59e0b` (amber)
- **Danger:** `#ef4444` (red)
- **Success:** `#10b981` (teal)

### Text Colors:
- **Primary Text:** `#f8fafc` (white)
- **Secondary Text:** `#e2e8f0` (light gray)
- **Muted Text:** `#94a3b8` (medium gray)
- **Disabled Text:** `#64748b` (dark gray)

## PROHIBITED COLORS (STRICTLY FORBIDDEN)
- ❌ `#667eea` (purple blue)
- ❌ `#764ba2` (purple)
- ❌ `#8b5cf6` (violet)
- ❌ `#a855f7` (purple)
- ❌ `#d946ef` (magenta)
- ❌ Any purple/magenta variants

## TYPOGRAPHY
- **Font Family:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Base Font Size:** 16px
- **Line Height:** 1.5

## COMPONENT STYLES

### Headers:
```css
.header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #f8fafc;
    border-bottom: 1px solid #334155;
}
```

### Cards:
```css
.card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
```

### Progress Bars:
```css
.progress-bar {
    background: #334155;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    background: #60a5fa; /* Blue accent */
    height: 8px;
}
```

### Status Indicators:
```css
.status-ready { background: #10b981; color: #0f172a; }
.status-in-progress { background: #f59e0b; color: #0f172a; }
.status-scheduled { background: #60a5fa; color: #0f172a; }
.status-delayed { background: #ef4444; color: #0f172a; }
```

## DASHBOARD STRUCTURE

### Main Dashboard Sections:
1. **Header** - Title, date, status
2. **Key Metrics** - Revenue, connections, etc.
3. **LinkedIn Integration** - Posts, schedule, performance
4. **Content Gallery** - Visual previews
5. **Risk/Risk Management** - Current section
6. **Footer** - Timestamp, version

### LinkedIn Integration Section:
- Post schedule visualization
- Real-time metrics tracking
- Content preview gallery
- Engagement analytics

## RESPONSIVE BREAKPOINTS
- **Desktop:** > 1200px
- **Tablet:** 768px - 1200px  
- **Mobile:** < 768px

## AGENT IMPLEMENTATION GUIDELINES

### ALL AGENTS MUST:
1. Use ONLY approved color palette
2. Replace ANY purple references with blue/teal
3. Maintain dark theme consistency
4. Follow component styling patterns
5. Ensure responsive design

### Design Team Tasks:
1. Audit all files for purple references
2. Replace all purple gradients/colors
3. Create consistent styling across all pages
4. Verify dark theme implementation

### Development Team Tasks:
1. Apply design system to all HTML/CSS files
2. Integrate LinkedIn dashboard into main
3. Build visual content gallery
4. Convert markdown to HTML pages

**APPROVED BY: AGENT COORDINATION MASTER**