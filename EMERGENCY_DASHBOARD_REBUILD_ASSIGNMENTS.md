# EMERGENCY DASHBOARD REBUILD - AGENT ASSIGNMENTS
**Status:** APPROVED by Jim
**Deadline:** 6 hours (by Feb 4, 2026 03:30 UTC)
**Priority:** CRITICAL - MISSION CONTROL v2.0

---

## AGENT 1: UI Implementation Agent
**Task ID:** DASHBOARD-UI-001
**Assigned:** Feb 3, 2026 21:30 UTC
**Due:** Feb 4, 2026 03:30 UTC (6 hours)

### Mission
Build the 5-row dashboard layout from TASK_BUILD_DASHBOARD_V2.md specifications.

### Deliverables
1. **Row 1:** Header with revenue target, days remaining, status
2. **Row 2:** 4 Critical Business Metrics cards (Pipeline, Tasks, Agents, Conversion)
3. **Row 3:** Financial Health section (5 metrics placeholders)
4. **Row 4:** Sales Pipeline visual
5. **Row 5:** Agent Operations section

### Files to Create
- `/dashboard_v19.html` - New complete dashboard
- Use existing `dashboard_v18.html` as base
- Copy over fixed JavaScript from v18.4

### Success Criteria
- [ ] All 5 rows visible and styled
- [ ] Mobile responsive
- [ ] No layout breaking
- [ ] Ready for data injection

---

## AGENT 2: CSS/Styling Agent
**Task ID:** DASHBOARD-CSS-001
**Assigned:** Feb 3, 2026 21:30 UTC
**Due:** Feb 4, 2026 03:30 UTC (6 hours)

### Mission
Fix all styling, colors, animations, mobile responsiveness.

### Deliverables
1. **Color Scheme:** Professional blue/teal (NO PURPLE)
2. **Mobile Responsive:** All breakpoints working
3. **Animations:** Card hovers, loading states, transitions
4. **Typography:** Consistent fonts, sizes
5. **Spacing:** Proper gaps, padding, margins

### Files to Modify
- `agent_coordination_styles.css` - Update all styles
- Ensure 44px touch targets for mobile
- Fix iOS Safari issues

### Success Criteria
- [ ] Looks professional on desktop
- [ ] Works on mobile
- [ ] No color conflicts
- [ ] Smooth animations

---

## AGENT 3: JavaScript Fix Agent
**Task ID:** DASHBOARD-JS-001
**Assigned:** Feb 3, 2026 21:30 UTC
**Due:** Feb 4, 2026 03:30 UTC (6 hours)

### Mission
Eliminate ALL JavaScript errors. Add null checks everywhere.

### Deliverables
1. **Null Checks:** Every DOM query, every function
2. **Async/Await:** Fix all missing async declarations
3. **Error Handling:** Try-catch on all file operations
4. **Console Clean:** Zero errors in Brave DevTools

### Files to Audit
- `dashboard_v18.html` - All JavaScript sections
- Every `getElementById` - add null check
- Every `querySelector` - add null check
- Every `setInterval` - ensure cleanup

### Success Criteria
- [ ] Open in Brave → F12 Console → Zero red errors
- [ ] All buttons clickable
- [ ] All charts render
- [ ] No crashes on page load

---

## AGENT 4: API Integration Agent
**Task ID:** DASHBOARD-API-001
**Assigned:** Feb 3, 2026 21:30 UTC
**Due:** Feb 4, 2026 03:30 UTC (6 hours)

### Mission
Connect dashboard to real data sources.

### Deliverables
1. **Agent Registry:** Load from `agent_registry.json`
2. **Task Data:** Pull from registry task_queue
3. **Metrics:** Calculate completion rates, success rates
4. **Real-time:** Auto-refresh every 60 seconds (not 30)

### Data Sources
- `/shared_assets/tasks/agent_registry.json`
- Registry: total_agents, active_now, tasks_completed_today
- Task queue: status, progress, priority

### Success Criteria
- [ ] Real agent count displays
- [ ] Real task counts show
- [ ] Progress bars accurate
- [ ] Data updates on refresh

---

## AGENT 5: DevOps/Deployment Agent
**Task ID:** DASHBOARD-DEVOPS-001
**Assigned:** Feb 3, 2026 21:30 UTC
**Due:** Feb 4, 2026 23:30 UTC (2 hours)

### Mission
Get stable deployment pipeline working.

### Deliverables
1. **Bluehost Primary:** Auto-deploy from GitHub pushes
2. **GitHub Actions:** Workflow for FTP deploy
3. **Backup Plan:** Keep v18.4 as rollback option
4. **Domain:** Ensure ascentxr.com/dev/ works

### Skip for Now
- Railway deployment (too many issues)
- Docker optimization
- CDN setup

### Success Criteria
- [ ] Push to GitHub → Auto deploys to Bluehost
- [ ] Dashboard loads at ascentxr.com/dev/
- [ ] 99% uptime
- [ ] Rollback ready

---

## AGENT 6: QA/Testing Agent
**Task ID:** DASHBOARD-QA-001
**Assigned:** Feb 3, 2026 21:30 UTC
**Due:** Ongoing until launch

### Mission
Test everything. Catch errors before Jim sees them.

### Testing Checklist
1. **Console Test:** Brave DevTools - zero errors
2. **Functionality:** Every button, every link
3. **Mobile:** iPhone, Android, iPad
4. **Data Accuracy:** Numbers match registry
5. **Performance:** Load time < 3 seconds

### Test Report Format
```
Test: [Feature]
Status: PASS / FAIL
Errors: [Any console errors]
Notes: [Observations]
```

### Success Criteria
- [ ] QA sign-off on each agent's deliverable
- [ ] No blocking bugs
- [ ] Jim can use dashboard without issues

---

## COORDINATION PROTOCOL

**Every 2 hours, agents report:**
1. Progress %
2. Blockers (if any)
3. ETA to completion

**Sam (Main Agent) will:**
- Monitor all 6 agents
- Resolve conflicts
- Merge deliverables
- Deploy final version

---

## EMERGENCY CONTACT
If blocked for >30 minutes:
1. Post in shared task file
2. Tag Sam
3. Escalate to Jim if critical

---

**GO LIVE TARGET:** Feb 4, 2026 04:00 UTC

**APPROVED BY:** Jim (CEO)
**COORDINATED BY:** Sam (Main Agent)
