# Web Development Team — Coordination Architecture

## Team Overview

9 agents working as a coordinated unit to build, launch, and maintain the AscentXR marketing website.

```
                    ┌─────────────────────┐
                    │   MISSION DIRECTOR   │  (existing — orchestrates all teams)
                    │   Virtual COO        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   WEB PROJECT LEAD   │  (new — coordinates web team)
                    │   Technical PM       │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
   ┌──────▼──────┐    ┌───────▼───────┐    ┌───────▼───────┐
   │  BUILD LANE  │    │ CONTENT LANE  │    │  GROWTH LANE  │
   └──────┬──────┘    └───────┬───────┘    └───────┬───────┘
          │                    │                     │
   ┌──────┼──────┐     ┌──────┼──────┐      ┌──────┼──────┐
   │      │      │     │      │      │      │      │      │
  FE    BE    DevOps  Copy  Brand  Social   SEO  Market  QA
```

---

## The 9 Agents

### BUILD LANE — Makes the website work

| Agent | ID | Role | Inputs | Outputs |
|-------|----|------|--------|---------|
| **Frontend Developer** | `frontend-dev` | HTML/CSS/JS, React/Next.js, responsive, animations, component library, design system implementation | Designs from brand-designer, copy from copywriter, SEO requirements from seo-specialist | Built pages, components, interactive elements |
| **Backend Developer** | `backend-dev` | APIs, CMS, forms, database, auth, integrations (CRM, analytics, email) | Page specs from frontend-dev, form requirements from marketing-strategist | API endpoints, CMS config, form handlers, data pipelines |
| **DevOps / Deployment** | `devops-deploy` | CI/CD, hosting, SSL, CDN, monitoring, performance, staging/prod environments | Built code from FE+BE, test results from QA | Deployed sites, monitoring dashboards, uptime alerts |

### CONTENT LANE — Makes the website compelling

| Agent | ID | Role | Inputs | Outputs |
|-------|----|------|--------|---------|
| **Copywriter** | `copywriter` | Website copy, CTAs, value props, landing pages, microcopy, A/B variants | Brand guidelines from brand-designer, SEO keywords from seo-specialist, conversion goals from marketing-strategist | Page copy, CTA variants, headline options, microcopy |
| **Brand & Design** | `brand-designer` | Visual identity, UI/UX, design system, wireframes, imagery, color/typography | Brand voice from existing brand-agent, user research from marketing-strategist | Wireframes, design comps, style guide, asset library, component specs |
| **Social Media** | `social-media` | Social proof integration, share widgets, OG tags, social content promoting website | Published pages from frontend-dev, key messaging from copywriter | Social cards, share configs, social campaign content |

### GROWTH LANE — Makes the website perform

| Agent | ID | Role | Inputs | Outputs |
|-------|----|------|--------|---------|
| **SEO Specialist** | `seo-specialist` | Technical SEO, schema markup, meta tags, sitemap, speed, indexing, keyword strategy | Page content from copywriter, site structure from frontend-dev | SEO audit reports, keyword maps, schema templates, meta tag specs |
| **Marketing Strategist** | `marketing-strategist` | Conversion optimization, landing page strategy, funnels, A/B testing, analytics, user journey mapping | Analytics data from existing analytics-agent, performance data from devops-deploy | Conversion reports, funnel designs, A/B test plans, landing page briefs |
| **QA / Accessibility** | `qa-accessibility` | Cross-browser testing, WCAG 2.1 AA compliance, mobile testing, performance audits, link checking, regression testing | Built pages from frontend-dev, deployed staging from devops-deploy | Test reports, accessibility audits, bug tickets, performance scores |

---

## Workflow: New Page (end-to-end)

This is the primary workflow — building a new page from brief to live.

```
Phase 1: PLAN
──────────────────────────────────────────────────────
  marketing-strategist  →  Page brief (goals, audience, funnel position)
  seo-specialist        →  Keyword targets, competitor analysis
  brand-designer        →  Wireframe + visual direction
  copywriter            →  Draft copy aligned to SEO keywords

  GATE: Web Project Lead reviews brief package
        → Approved? → Phase 2
        → Rejected? → Loop back with notes

Phase 2: BUILD
──────────────────────────────────────────────────────
  brand-designer        →  Final design comp + assets
  copywriter            →  Final copy (reviewed by brand-agent for voice)
  frontend-dev          →  Build page (implements design + copy)
  backend-dev           →  Build integrations (forms, CMS, APIs)

  GATE: Frontend-dev self-checks responsive + cross-browser basics
        → Ready? → Phase 3

Phase 3: REVIEW & TEST
──────────────────────────────────────────────────────
  qa-accessibility      →  Full test suite:
                            ├── Cross-browser (Chrome, Safari, Firefox, Edge)
                            ├── Mobile responsive (iOS Safari, Android Chrome)
                            ├── WCAG 2.1 AA accessibility audit
                            ├── Performance audit (Core Web Vitals)
                            ├── Link/image validation
                            └── Form submission testing
  seo-specialist        →  SEO checklist verification:
                            ├── Meta tags, OG tags, schema markup
                            ├── Page speed (LCP < 2.5s, CLS < 0.1)
                            ├── Sitemap updated
                            └── Internal linking
  brand-designer        →  Visual QA (matches design comp)
  copywriter            →  Copy proofread (final check)

  GATE: QA sign-off required — all critical issues resolved
        → Passed? → Phase 4
        → Failed? → Bug tickets back to Phase 2 agents

Phase 4: DEPLOY
──────────────────────────────────────────────────────
  devops-deploy         →  Deploy to staging
  qa-accessibility      →  Staging smoke test
  devops-deploy         →  Deploy to production
  social-media          →  OG tags verified, social cards generated

  GATE: Human approval for production push (Jim or delegate)

Phase 5: LAUNCH & MONITOR
──────────────────────────────────────────────────────
  social-media          →  Social campaign promoting new page
  marketing-strategist  →  Analytics tracking verified, baseline metrics captured
  seo-specialist        →  Search Console submission, indexing monitored
  devops-deploy         →  Uptime + performance monitoring active

  ONGOING: marketing-strategist reviews performance weekly
           → Recommends A/B tests or optimizations → triggers mini-cycle
```

---

## Workflow: Content Update (lighter cycle)

For copy changes, blog posts, or minor updates that don't need full design work.

```
  copywriter            →  Updated copy (reviewed by brand-agent)
  seo-specialist        →  SEO check on changes
  frontend-dev          →  Implement changes
  qa-accessibility      →  Quick regression test
  devops-deploy         →  Deploy

  GATE: QA regression pass required before deploy
```

---

## Workflow: Design Refresh

For visual overhauls, rebrand implementation, or major UX changes.

```
  brand-designer        →  New design system / updated components
  marketing-strategist  →  Conversion impact assessment
  frontend-dev          →  Implement design changes
  backend-dev           →  Any structural changes needed
  qa-accessibility      →  FULL test suite (same as new page Phase 3)
  seo-specialist        →  Ensure no SEO regressions
  devops-deploy         →  Staged rollout with monitoring

  GATE: Full QA + human approval required
```

---

## Cross-Team Data Flows

### Into the Web Team (from existing agents)
```
  brand-agent          →  brand-designer    : Brand voice, terminology, approved messaging
  content-creator      →  copywriter        : Existing content library, tone guidelines
  analytics-agent      →  marketing-strat   : Traffic data, conversion metrics, user behavior
  sdr-agent            →  marketing-strat   : Sales objections, prospect pain points, ICP data
  cs-agent             →  copywriter        : Customer testimonials, success stories, case studies
  product-agent        →  frontend-dev      : Product features, roadmap items for marketing
  mission-director     →  web-project-lead  : Priorities, deadlines, resource allocation
```

### Out of the Web Team (to existing agents)
```
  web-project-lead     →  mission-director  : Sprint status, blockers, launch dates
  marketing-strat      →  analytics-agent   : Website KPIs, funnel metrics
  social-media         →  content-creator   : Social content calendar alignment
  copywriter           →  brand-agent       : New messaging for brand consistency review
  frontend-dev         →  product-agent     : Technical feasibility feedback
  seo-specialist       →  content-creator   : SEO keyword targets for blog/content strategy
```

---

## Quality Gates — Nothing Ships Without These

### Pre-Deploy Checklist (QA-Accessibility owns this)

```
□ Cross-browser tested (Chrome, Safari, Firefox, Edge)
□ Mobile responsive verified (≥3 breakpoints)
□ WCAG 2.1 AA compliance passed
□ Core Web Vitals met:
    - LCP < 2.5s
    - FID < 100ms
    - CLS < 0.1
□ All links validated (no 404s)
□ All images have alt text
□ Forms tested end-to-end (submission + confirmation)
□ SEO checklist passed (meta, schema, sitemap, robots)
□ Brand consistency verified (colors, fonts, voice)
□ Copy proofread and approved
□ Analytics/tracking verified (GA4, conversion events)
□ SSL/security headers confirmed
□ No console errors
□ Favicon and OG images present
```

### Severity Levels
| Level | Definition | Ships? |
|-------|-----------|--------|
| **P0 — Blocker** | Broken functionality, security issue, accessibility failure | NO — must fix |
| **P1 — Critical** | Visual bug on primary breakpoint, wrong copy, broken form | NO — must fix |
| **P2 — Major** | Minor visual issue, edge case browser bug | YES — fix in next sprint |
| **P3 — Minor** | Cosmetic, nice-to-have improvement | YES — backlog |

---

## Sprint Cadence

```
Monday      →  Sprint planning (web-project-lead assigns tasks)
Daily       →  Async standup (each agent reports status via task system)
Wednesday   →  Mid-sprint review (web-project-lead checks progress)
Friday      →  Sprint review + QA sign-off cycle
```

Fits into existing cron schedule:
- 6:00 AM task generation includes web team recurring tasks
- 6:30 AM morning briefing includes web team status
- 12:00 PM mid-day check catches blocked web tasks
- 6:00 PM evening summary includes web sprint progress

---

## Decision Authority (Web Team)

| Decision | Authority |
|----------|-----------|
| Component/framework choices | frontend-dev (notify web-project-lead) |
| Design direction | brand-designer (approve: Jim) |
| Copy/messaging | copywriter (review: brand-agent) |
| Hosting/infra decisions | devops-deploy (approve: Jim for cost changes) |
| Go-live decision | web-project-lead (approve: Jim) |
| SEO strategy changes | seo-specialist (notify: marketing-strategist) |
| A/B test launches | marketing-strategist (autonomous) |
| Emergency hotfix | devops-deploy (autonomous, notify: web-project-lead) |
| All external-facing content | approve: Jim |

---

## Integration with Existing Agent System

### Database Tables Needed
```sql
-- Extends existing task system
-- No new tables needed — web team agents use the same:
--   recurring_task_schedules (for sprint tasks)
--   agent_tasks (for individual work items)
--   daily_task_runs (for idempotency)
--   agent_execution_results (for output tracking)

-- New agent entries in agents table:
--   frontend-dev, backend-dev, devops-deploy,
--   copywriter (update existing), brand-designer (update existing),
--   social-media (update existing), seo-specialist,
--   marketing-strategist, qa-accessibility, web-project-lead
```

### Agent Config Addition
New team entry in `agent_config.json`:
```json
{
  "team_id": "web-team",
  "name": "Web Development Team",
  "lead": "web-project-lead",
  "members": [
    "frontend-dev", "backend-dev", "devops-deploy",
    "copywriter", "brand-designer", "social-media",
    "seo-specialist", "marketing-strategist", "qa-accessibility"
  ],
  "workflows": ["new-page", "content-update", "design-refresh"],
  "reports_to": "mission-director"
}
```

### Cron Additions
```
Mon 6:00 AM  →  Generate web team sprint tasks
Daily 9:00   →  Web team async standup collection
Wed 12:00    →  Mid-sprint progress check
Fri 4:00 PM  →  Sprint review + QA summary
```

---

## What This Catches That You'd Otherwise Miss

1. **No page ships without QA sign-off** — the gate is mandatory, not optional
2. **SEO is baked in from the start** — keywords and structure come before copy, not after
3. **Brand consistency is verified twice** — once in content lane (brand-agent reviews copy), once in review phase (brand-designer checks visual)
4. **Accessibility isn't an afterthought** — QA tests WCAG before every deploy, critical for edu market (schools have legal obligations)
5. **Performance is monitored continuously** — DevOps watches Core Web Vitals post-launch, not just at deploy
6. **Social promotion is automated** — social-media agent generates cards and campaigns as part of the deploy workflow, not as a separate ask
7. **Cross-team intelligence flows both ways** — sales objections feed into website copy, website analytics feed into sales strategy
8. **A/B testing has a home** — marketing-strategist owns the optimization loop, so pages improve over time instead of launching and being forgotten

---

## Active Pickups

### `/demo` page — Calendly integration (2026-05-06)
- Page: `frontend/src/pages/website/Demo.tsx`
- Calendly URL: `https://calendly.com/learningtimevr/30min` (already in `frontend/.env` as `VITE_CALENDLY_URL`)
- Live at: `https://www.ascentxr.com/demo`
- Webhook handler removed — we're using the Calendly inline embed only, no signature/storage path. `demo_requests` table is dropped via migration `017_drop_demo_requests.sql`.
- **Owners**: Calendly setup is on Jim's account (`learningtimevr`); page polish, QA, and conversion tracking is the web team's pickup.
- **Next steps for web team**:
  - `qa-accessibility`: cross-browser + WCAG audit on the embedded widget
  - `marketing-strategist`: add conversion tracking on the booking-completed event (Calendly outbound script, no webhook)
  - `seo-specialist`: schema markup for the demo page (Event / SoftwareApplication)
  - `copywriter`: a/b variants for the hero headline and "What we'll cover" bullets
