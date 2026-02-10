-- Migration 008: Learning Time VR Agent Prompt Updates + New Tasks + Knowledge Base Articles
-- Updates all ~30 recurring task prompts to reference LTVR products specifically
-- Inserts new LTVR-specific agent tasks
-- Inserts 7 knowledge base articles

-- ============================================================
-- SECTION 1: UPDATE EXISTING RECURRING TASK PROMPTS
-- ============================================================

-- ---- MARKETING TEAM ----

-- Draft LinkedIn Post
UPDATE recurring_task_schedules
SET prompt = 'Draft a LinkedIn post promoting Learning Time VR for K-12 education. Reference specific product tiers: VR Classroom Pack (Pico 4 headsets + VictoryXR content, $5K-$15K/yr) or Tablet Subscription (WebXR on existing Chromebooks, $1.5K-$5K/yr). Use the "Learn Beyond Limits" tagline. Target audience: superintendents, tech directors, and curriculum coordinators. Include a clear call-to-action for scheduling a demo. Use the Learning Time VR brand voice — approachable, outcome-focused, empowering. Do NOT reference "Ascent XR" in K-12 posts.'
WHERE title ILIKE '%linkedin post%' AND title ILIKE '%draft%';

-- Content Calendar Review
UPDATE recurring_task_schedules
SET prompt = 'Review and plan the Learning Time VR content calendar for the upcoming week. Ensure content covers these 5 pillars: (1) LTVR product benefits — VR headset packs and tablet subscriptions, (2) Student outcome case studies — engagement, retention, test scores, (3) District ROI — cost per student, teacher time savings, funding sources, (4) Teacher success stories — classroom implementation wins, (5) EdTech innovation — VictoryXR content updates, AI lesson generator roadmap. Each piece should use Learning Time VR brand voice and reference specific products. Target mix: 3 LinkedIn posts, 1 blog/case study, 1 email outreach.'
WHERE title ILIKE '%content calendar%' AND title ILIKE '%review%';

-- Case Study Outline
UPDATE recurring_task_schedules
SET prompt = 'Create a case study outline for a Learning Time VR customer. Specify which LTVR product tier the customer uses (VR Classroom Pack, Tablet Subscription, or District Enterprise License). Include: district name and demographics, challenge/problem before LTVR, solution deployed (specific tier and configuration), results (student engagement metrics, teacher feedback, usage data from ArborXR), ROI analysis, and a compelling quote. Use Learning Time VR brand voice.'
WHERE title ILIKE '%case study%' AND title ILIKE '%outline%';

-- Email Campaign Analysis
UPDATE recurring_task_schedules
SET prompt = 'Analyze the performance of our Learning Time VR subscription outreach email campaigns. Review open rates, click-through rates, and reply rates for campaigns targeting school district superintendents and tech directors. Compare performance of VR Headset Pack messaging vs. Tablet Subscription messaging. Identify top-performing subject lines and calls-to-action. Recommend A/B tests for the next campaign cycle. Reference LTVR pricing tiers and "Learn Beyond Limits" positioning.'
WHERE title ILIKE '%email%' AND title ILIKE '%campaign%' AND title ILIKE '%analy%';

-- ---- SALES TEAM ----

-- Research Districts
UPDATE recurring_task_schedules
SET prompt = 'Research the top target school districts in our pipeline and assess their fit for Learning Time VR products. For each district determine: (1) Best-fit LTVR tier — VR Headset Classroom Pack ($5K-$15K/yr) if they have tech infrastructure and dedicated STEM budget, or Tablet Subscription ($1.5K-$5K/yr) if budget-conscious or Title I. (2) Funding sources — check for active ESSER funds, Title IV-A Part A allocations, state technology grants. (3) Decision makers — identify superintendent, technology director, and curriculum coordinator. (4) Infrastructure — existing 1:1 device programs, WiFi readiness, IT support capacity. (5) Timeline — budget cycle dates, board meeting schedule, ESSER spending deadlines.'
WHERE title ILIKE '%research%' AND title ILIKE '%district%';

-- Pipeline Follow-up
UPDATE recurring_task_schedules
SET prompt = 'Review all deals in the pipeline and draft follow-up actions. For each deal, reference the specific Learning Time VR product tier being proposed (Classroom Pack, Tablet Subscription, District Enterprise, or Pilot Program) and the associated pricing ($1.5K-$50K range). Include next steps specific to the deal stage: Discovery (schedule needs assessment), Needs Assessment (propose specific LTVR tier), Proposal (send tier-specific pricing), Negotiation (address objections with ROI data), Contract Review (prepare implementation timeline). Track progress toward $300K revenue target.'
WHERE title ILIKE '%pipeline%' AND title ILIKE '%follow%';

-- Lead Scoring (BANT)
UPDATE recurring_task_schedules
SET prompt = 'Score and qualify the latest leads using LTVR-specific BANT criteria. Budget: Does the district have $1,500-$50,000 available? Check ESSER funding status, Title IV-A allocations, technology line items in published budgets. Authority: Is our contact a superintendent, assistant superintendent, technology director, or curriculum coordinator? Need: Does the district need VR headset infrastructure (Classroom Pack) or can they use existing tablets (Tablet Subscription)? Are they replacing an existing solution or new to immersive learning? Timeline: What is their budget cycle? When is the next board meeting? Are there ESSER spending deadlines approaching? Score each lead 1-10 on each dimension.'
WHERE title ILIKE '%lead%' AND title ILIKE '%scor%';

-- Pipeline Status
UPDATE recurring_task_schedules
SET prompt = 'Generate a pipeline status report for Learning Time VR deals. Break down by product tier: VR Classroom Pack, Tablet Subscription, District Enterprise, and Pilot Program. For each tier show: number of active deals, total weighted pipeline value, deals expected to close this month, and top 3 deals by value. Calculate progress toward the $300K revenue target. Highlight any deals that have been stalled for 2+ weeks and recommend re-engagement actions. Include MRR and ARR projections based on current pipeline.'
WHERE title ILIKE '%pipeline%' AND title ILIKE '%status%';

-- Proposal Review
UPDATE recurring_task_schedules
SET prompt = 'Review the latest proposals in our pipeline for accuracy and persuasiveness. Each proposal should reference the specific Learning Time VR tier being offered, include tier-specific pricing and ROI projections, address the district''s specific needs identified during needs assessment, and include relevant case studies. Verify: correct LTVR product name and pricing, accurate feature list for the tier, competitive positioning vs ClassVR/Nearpod, funding guidance (ESSER, Title IV-A), clear implementation timeline, and teacher training details.'
WHERE title ILIKE '%proposal%' AND title ILIKE '%review%';

-- ---- BRAND TEAM ----

-- Compliance Review
UPDATE recurring_task_schedules
SET prompt = 'Audit all recent marketing materials and communications for correct brand usage. Key rules: (1) K-12 district-facing materials MUST use "Learning Time VR" brand (blue #0052cc + red #DC1625), tagline "Learn Beyond Limits", approachable/educational voice. (2) Enterprise/custom project materials MUST use "Ascent XR" brand (orange #ff6b00 + navy #132e5e), tagline "Delivering Immersive Experiences", premium/innovative voice. (3) Never combine both brands in the same lockup. (4) Internal dashboard uses Ascent Blue #2563EB + Learning Purple #7C3AED. Flag any instances of wrong brand usage.'
WHERE title ILIKE '%compliance%' AND title ILIKE '%review%' AND (title ILIKE '%brand%' OR business_area = 'brand');

-- Consistency Audit
UPDATE recurring_task_schedules
SET prompt = 'Perform a brand consistency audit across all Learning Time VR and Ascent XR channels. Check: (1) LinkedIn — are K-12 posts using LTVR branding and voice? (2) Email outreach — are district emails using "Learn Beyond Limits" tagline? (3) Website — is product page using LTVR colors and messaging? (4) Proposals — do they reference correct LTVR tier names and pricing? (5) Social media — is there any Ascent XR/LTVR brand confusion? Report inconsistencies with specific corrections needed.'
WHERE title ILIKE '%consistency%' AND title ILIKE '%audit%';

-- ---- CUSTOMER SUCCESS ----

-- Health Monitor
UPDATE recurring_task_schedules
SET prompt = 'Monitor Learning Time VR customer health metrics. For VR Classroom Pack customers: check ArborXR headset utilization rates, content engagement (which VictoryXR experiences are used most), teacher dashboard login frequency, and device health/battery status. For Tablet Subscription customers: check WebXR session frequency, content engagement, teacher login rates, and student participation rates. Flag any customers with: <50% headset utilization, no teacher logins in 7+ days, declining engagement trend, or upcoming renewal within 60 days. Include recommended interventions for at-risk accounts.'
WHERE title ILIKE '%health%' AND title ILIKE '%monitor%';

-- Onboarding Review
UPDATE recurring_task_schedules
SET prompt = 'Review Learning Time VR customer onboarding progress. Track milestones by product tier. VR Classroom Pack milestones: (1) Hardware delivery confirmed, (2) ArborXR device enrollment complete, (3) Teacher training session conducted, (4) First VR classroom session completed, (5) 30-day usage check-in done. Tablet Subscription milestones: (1) WebXR access provisioned, (2) Teacher accounts created, (3) Teacher training session conducted, (4) First WebXR session completed, (5) 30-day usage check-in done. Flag any customers behind schedule and recommend acceleration actions.'
WHERE title ILIKE '%onboarding%' AND title ILIKE '%review%';

-- Renewal Pipeline
UPDATE recurring_task_schedules
SET prompt = 'Review the Learning Time VR renewal pipeline. For each customer approaching renewal (within 90 days): (1) Current product tier and annual value, (2) Usage health score (from health monitor), (3) Upsell opportunity — can Tablet Subscription customers upgrade to VR Classroom Pack? Can single-classroom customers expand to district Enterprise License? (4) Risk factors — low usage, teacher turnover, budget changes, (5) Recommended renewal strategy — standard renewal, upsell proposal, or save campaign. Calculate total renewal value at risk and total upsell opportunity.'
WHERE title ILIKE '%renewal%' AND title ILIKE '%pipeline%';

-- ---- FINANCE / TAX ----

-- Tax Compliance
UPDATE recurring_task_schedules
SET prompt = 'Review tax compliance status with focus on Learning Time VR subscription revenue. Check: (1) Indiana SaaS sales tax — LTVR subscriptions taxable at 7%, verify collection on all Indiana sales, confirm ST-105 exemption certificates collected from school districts claiming tax exemption. (2) Multi-state nexus — monitor Ohio (5.75% SaaS tax), Illinois (SaaS exempt), Michigan (6% SaaS tax) sales volumes against nexus thresholds ($100K). (3) Invoice compliance — ensure VR hardware is separated from SaaS subscription on invoices for proper tax treatment. (4) R&D credits — flag LTVR development expenses (WebXR platform, AI lesson generator, ArborXR integration) for R&D credit qualification.'
WHERE title ILIKE '%tax%' AND title ILIKE '%compliance%';

-- ---- OPERATIONS ----

-- Morning Briefing
UPDATE recurring_task_schedules
SET prompt = 'Generate the daily morning briefing. Include: (1) Learning Time VR Pipeline: total weighted pipeline value, deals progressing today, deals at risk, progress toward $300K revenue target. (2) LTVR Subscription Metrics: current MRR, ARR, new subscriptions this month, renewals due this month, churn alerts. (3) Agent Task Summary: tasks completed overnight, tasks pending review, any failures requiring attention. (4) Key Deadlines: upcoming sales deadlines, ESSER funding deadlines, proposal due dates. (5) Top Priority: the single most important action for today to advance toward revenue target.'
WHERE title ILIKE '%morning%' AND title ILIKE '%briefing%';

-- Weekly Review
UPDATE recurring_task_schedules
SET prompt = 'Generate the weekly review report. Include: (1) Learning Time VR Subscription Metrics: weekly MRR/ARR change, new subscriptions closed, active pilots, conversion rate (pilot to full subscription). (2) Pipeline Activity: deals moved between stages, total pipeline value change, new leads added, deals won/lost. (3) Marketing Performance: LinkedIn post engagement, email campaign results, content published. (4) Customer Success: customer health scores, onboarding progress, renewal status. (5) Financial: revenue vs $300K target, burn rate, notable expenses. (6) Next Week Priorities: top 5 actions to focus on.'
WHERE title ILIKE '%weekly%' AND title ILIKE '%review%';


-- ============================================================
-- SECTION 2: INSERT NEW LTVR-SPECIFIC RECURRING TASKS
-- ============================================================

-- LTVR Revenue Tracker (daily, assigned to financial-controller agent)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, max_retries, is_active)
SELECT a.id, t.id,
  'LTVR Revenue Tracker',
  'Daily tracking of Learning Time VR subscription revenue metrics',
  'Track Learning Time VR subscription revenue metrics. Calculate: (1) Monthly Recurring Revenue (MRR) — sum of all active LTVR subscriptions divided by 12 for annual contracts. (2) Annual Recurring Revenue (ARR) — MRR x 12. (3) New subscriptions this month — count and value of new LTVR deals closed. (4) Renewals — upcoming renewals, renewed vs churned. (5) Churn rate — lost subscriptions / total subscriptions. (6) Revenue by tier — Classroom Pack, Tablet Subscription, Enterprise, Pilot conversions. (7) Progress toward $300K target — current revenue, pipeline-weighted forecast, months remaining. Flag any concerning trends.',
  'finance', 2, 'weekdays', '{1,2,3,4,5}', '06:30:00', true, false, 2, true
FROM agents a, agent_teams t
WHERE a.name ILIKE '%financial%' OR a.name ILIKE '%finance%controller%'
LIMIT 1;

-- LTVR Competitive Intelligence (weekly, assigned to SDR agent)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, max_retries, is_active)
SELECT a.id, t.id,
  'LTVR Competitive Intelligence',
  'Weekly monitoring of competitors in the K-12 VR/immersive learning space',
  'Monitor Learning Time VR competitors in the K-12 immersive learning market. Track: (1) ClassVR — pricing changes, new content, school district wins. (2) Nearpod VR — feature updates, acquisition news, market positioning. (3) zSpace — hardware updates, new partnerships. (4) Google Expeditions/Arts & Culture — any re-entry to VR education. (5) VictoryXR (our content partner) — new experiences released, partnerships announced. (6) General market — new entrants, M&A activity, funding rounds in K-12 EdTech VR. Provide actionable insights for LTVR positioning and objection handling.',
  'sales', 3, 'weekly', '{1}', '07:00:00', true, true, 2, true
FROM agents a, agent_teams t
WHERE a.name ILIKE '%sdr%' OR a.name ILIKE '%research%'
LIMIT 1;

-- LTVR Tablet Demo Audit (weekly, assigned to content creator)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, max_retries, is_active)
SELECT a.id, t.id,
  'LTVR Tablet Demo Audit',
  'Weekly audit of which VictoryXR experiences are optimized for tablet/WebXR access',
  'Audit the VictoryXR content library for tablet/WebXR readiness. For each experience: (1) Does it work in browser (WebXR) on Chromebook/tablet? (2) Performance — frame rate, load time, interaction quality on low-end devices. (3) Content quality — educational value rating for tablet delivery vs full VR. (4) Grade/subject alignment — which state standards does it map to? Categorize as: Tablet-Ready, Tablet-Partial (works but degraded), VR-Only. Update the tablet compatibility list. This directly supports Tablet Subscription sales — we need to know exactly what content we can promise.',
  'marketing', 3, 'weekly', '{3}', '08:00:00', true, true, 2, true
FROM agents a, agent_teams t
WHERE a.name ILIKE '%content%'
LIMIT 1;

-- LTVR Funding Alert (weekly, assigned to SDR agent)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, max_retries, is_active)
SELECT a.id, t.id,
  'LTVR Funding Alert',
  'Weekly monitoring of education funding opportunities for LTVR sales',
  'Monitor education funding sources that districts can use to purchase Learning Time VR. Track: (1) ESSER fund deadlines — which states/districts have upcoming obligation deadlines? ESSER III funds must be obligated by September 30, 2024 (verify current extension status). (2) Title IV-A Part A grants — districts can use these for "well-rounded educational opportunities" including technology. Typical allocation: $10K-$50K per district. (3) State technology grants — monitor Indiana, Ohio, Illinois, Michigan for state-level EdTech funding programs. (4) E-Rate — while primarily for connectivity, some VR-related infrastructure may qualify. (5) Private foundations — Gates Foundation, Chan Zuckerberg Initiative, local community foundations with STEM focus. Provide specific talking points for sales team to use with district business managers.',
  'sales', 2, 'weekly', '{2}', '07:30:00', true, true, 2, true
FROM agents a, agent_teams t
WHERE a.name ILIKE '%sdr%' OR a.name ILIKE '%research%'
LIMIT 1;


-- ============================================================
-- SECTION 3: INSERT KNOWLEDGE BASE ARTICLES
-- ============================================================

-- 1. Learning Time VR Product Overview
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'sales',
  'product',
  'Learning Time VR Product Overview',
  'Complete overview of LTVR subscription tiers, pricing, features, and competitive advantages',
  E'# Learning Time VR — Product Overview\n\n## Brand\n**Learning Time VR** by Ascent XR\nTagline: "Learn Beyond Limits"\n\n## Subscription Tiers\n\n### 1. Classroom Pack (VR Headsets) — $5,000-$15,000/yr\n- Pico 4 headset class set (15-30 units)\n- VictoryXR 200+ immersive experiences\n- ArborXR device management\n- Teacher dashboard & analytics\n- Onsite teacher training\n- FERPA-compliant data handling\n- **Best for:** Schools with STEM budgets, tech-ready infrastructure\n\n### 2. Tablet Subscription — $1,500-$5,000/yr\n- WebXR browser-based access\n- Works on existing Chromebooks & tablets\n- No hardware purchase required\n- VictoryXR content library (WebXR-optimized)\n- LMS integration (Google Classroom, Canvas)\n- **Best for:** Budget-conscious districts, Title I schools, 1:1 device programs\n\n### 3. District Enterprise License — $10,000-$50,000/yr\n- District-wide access (all schools)\n- Mix of VR headset packs + tablet subscriptions\n- Centralized admin analytics dashboard\n- Dedicated customer success manager\n- Curriculum alignment services\n- Quarterly business reviews\n- **Best for:** Large districts (5+ schools), superintendent-level buyers\n\n### 4. Pilot Program — $1,500-$2,500 one-time\n- Single classroom deployment (VR or tablet)\n- 90-day trial period\n- Teacher training session\n- Success metrics tracking & ROI report\n- Conversion path to full subscription\n- **Best for:** Risk-averse evaluators, technology committees\n\n## Competitive Advantages\n- All-in-one turnkey solution (no integration headaches)\n- VictoryXR has the largest K-12 VR content library (200+ experiences)\n- ArborXR simplifies fleet management for non-technical staff\n- Tablet option = zero hardware cost for budget-constrained districts\n- Dedicated success manager ensures adoption (not just deployment)\n\n## Revenue Target\n$300,000 by June 2026',
  ARRAY['ltvr', 'products', 'pricing', 'tiers', 'sales', 'overview'],
  true, 1, 'system'
);

-- 2. Ascent XR vs Learning Time VR Internal Guide
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'brand',
  'guideline',
  'Ascent XR vs Learning Time VR: Internal Guide',
  'When to use which brand — internal reference for all team members and agents',
  E'# Ascent XR vs Learning Time VR — Internal Brand Guide\n\n## Brand Architecture\n\n| Brand | Role | Tagline | Colors |\n|-------|------|---------|--------|\n| **Ascent XR** | Parent company | "Delivering Immersive Experiences" | Orange #ff6b00, Navy #132e5e |\n| **Learning Time VR** | K-12 product | "Learn Beyond Limits" | Blue #0052cc, Red #DC1625 |\n\n## Decision Matrix\n\n### Use Learning Time VR when:\n- Communicating with school districts\n- Writing LinkedIn posts about K-12 education\n- Creating proposals for VR/tablet subscriptions\n- Attending education trade shows (ISTE, FETC)\n- Drafting email outreach to superintendents/tech directors\n- Creating case studies about school implementations\n- Any customer-facing K-12 material\n\n### Use Ascent XR when:\n- Communicating with enterprise/corporate clients\n- Custom VR/AR project proposals\n- Investor relations and corporate communications\n- LinkedIn thought leadership (not K-12 specific)\n- Conference presentations (non-education)\n- Legal/corporate documents\n\n## Voice Guidelines\n\n**Learning Time VR voice:**\n- Approachable, not salesy\n- Outcome-focused (student engagement, teacher empowerment)\n- Practical, solution-oriented\n- Uses educator language\n\n**Ascent XR voice:**\n- Premium, innovative\n- Visionary, strategic\n- Technical credibility\n- Enterprise buyer language\n\n## Common Mistakes\n- Do NOT call the K-12 product "Ascent XR" in any district communication\n- Do NOT use Ascent XR colors (orange) on LTVR materials\n- Do NOT combine both logos in the same asset\n- DO use "by Ascent XR" sub-text under LTVR logo when needed for provenance',
  ARRAY['brand', 'ltvr', 'ascent-xr', 'guidelines', 'internal'],
  true, 1, 'system'
);

-- 3. LTVR Objection Handling Guide
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'sales',
  'playbook',
  'LTVR Objection Handling Guide',
  'How to handle common objections when selling Learning Time VR to school districts',
  E'# Learning Time VR — Objection Handling Guide\n\n## "It''s too expensive"\n**Response:** "I understand budget is a priority. That''s exactly why we created the Tablet Subscription starting at $1,500/year — it works on your existing Chromebooks with zero hardware cost. That breaks down to less than $5 per student per year. We also help districts identify ESSER and Title IV-A funding that can cover the full cost."\n\n## "We already have VR headsets"\n**Response:** "Great — you already see the value of immersive learning. What most districts find is that hardware without a managed content library and teacher training leads to VR headsets sitting in closets. Learning Time VR adds VictoryXR''s 200+ curriculum-aligned experiences, ArborXR device management, and teacher training so the investment actually gets used. We can also integrate with your existing hardware."\n\n## "Teachers won''t use it"\n**Response:** "That''s the #1 concern we hear, and it''s exactly why every LTVR subscription includes dedicated teacher training. Our teacher dashboard makes it as simple as assigning homework — select a VR experience, assign to the class, and track engagement. We''ve seen 85%+ teacher adoption within 30 days when training is included."\n\n## "We don''t have budget until next fiscal year"\n**Response:** "We can start with a Pilot Program ($1,500-$2,500) this semester to prove ROI, then present the results to your board for next year''s budget. Many districts use the pilot data to secure funding. We also help identify current-year ESSER funds and Title IV-A money that may be available now."\n\n## "How do I justify this to the school board?"\n**Response:** "We provide an ROI report showing cost per student, engagement metrics, teacher time savings, and curriculum alignment. The Pilot Program includes a formal ROI analysis that district leaders can present to the board. Typical talking points: $3-$8 per student per year, 40% increase in student engagement, 2 hours/week teacher time savings on lesson prep."\n\n## "Is the content aligned to our state standards?"\n**Response:** "Yes — VictoryXR''s 200+ experiences map to NGSS, Common Core, and most state standards. We provide curriculum alignment guides specific to your state. Our upcoming AI Lesson Generator (March 2026) will create custom lesson plans aligned to your specific standards."\n\n## "What about student data privacy?"\n**Response:** "Learning Time VR is fully FERPA and COPPA compliant. Student data is encrypted at rest and in transit, we never sell student data, and we support district-level data governance policies. We can provide our Data Processing Agreement and FERPA compliance documentation for your review."',
  ARRAY['ltvr', 'sales', 'objections', 'playbook', 'pricing'],
  true, 1, 'system'
);

-- 4. LTVR ROI Calculator for Districts
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'sales',
  'tool',
  'LTVR ROI Calculator for Districts',
  'Cost per student, engagement metrics, and teacher time savings for ROI conversations',
  E'# Learning Time VR — ROI Calculator\n\n## Cost Per Student Analysis\n\n### VR Classroom Pack ($5,000-$15,000/yr)\n- Class of 25 students: $200-$600/student/year\n- 2 classes sharing: $100-$300/student/year\n- 3+ classes sharing: $67-$200/student/year\n\n### Tablet Subscription ($1,500-$5,000/yr)\n- School of 500 students: $3-$10/student/year\n- School of 200 students: $7.50-$25/student/year\n\n### District Enterprise ($10,000-$50,000/yr)\n- 5,000 student district: $2-$10/student/year\n- 10,000 student district: $1-$5/student/year\n\n## Engagement Metrics (Industry Benchmarks)\n- Student engagement increase: 30-40%\n- Content retention improvement: 20-35%\n- Time-on-task increase: 25-45%\n- Student motivation/excitement: 85%+ report increased interest\n\n## Teacher Time Savings\n- Lesson prep time saved: 1-2 hours/week per teacher\n- Pre-built VR experiences replace custom activity creation\n- Built-in assessments reduce manual grading\n- Annual teacher time savings value: $2,000-$5,000/teacher\n\n## Comparison to Alternatives\n| Solution | Cost/Student/Yr | Content Library | Device Management | Training |\n|----------|----------------|-----------------|-------------------|---------|\n| LTVR Tablet | $3-$25 | 200+ (VictoryXR) | N/A (browser) | Included |\n| LTVR VR Pack | $67-$600 | 200+ (VictoryXR) | ArborXR included | Included |\n| ClassVR | $300-$800 | 50-100 | Separate cost | Extra |\n| Nearpod VR | $10-$30 | Limited VR | N/A | Self-serve |\n| DIY (buy headsets) | $200-$400 | None (find own) | None | None |\n\n## Funding Sources\n- ESSER III (deadline approaching)\n- Title IV-A Part A ($10K-$50K typical)\n- State technology grants (varies)\n- E-Rate (infrastructure component)\n- PTA/Foundation grants',
  ARRAY['ltvr', 'sales', 'roi', 'calculator', 'pricing', 'districts'],
  true, 2, 'system'
);

-- 5. ESSER/Title IV Funding Guide
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'sales',
  'resource',
  'ESSER/Title IV Funding Guide for LTVR',
  'How school districts can fund Learning Time VR purchases using federal and state programs',
  E'# Funding Guide — How Districts Pay for Learning Time VR\n\n## ESSER III (ARP ESSER)\n- **What:** Federal COVID relief funds for K-12\n- **Amount:** Varies by district (check district allocation)\n- **Eligible uses:** Technology to address learning loss, including VR/immersive learning\n- **Deadline:** Funds must be obligated by Sept 30, 2024; spent by Jan 28, 2025 (verify current extensions)\n- **LTVR fit:** Both VR Classroom Pack and Tablet Subscription qualify as technology to address learning loss\n- **Talking point:** "ESSER funds are expiring — use them or lose them. LTVR is a high-impact way to deploy remaining funds."\n\n## Title IV-A (SSAE)\n- **What:** Student Support and Academic Enrichment grants\n- **Amount:** Typically $10,000-$50,000 per district\n- **Eligible uses:** "Well-rounded educational opportunities" including technology\n- **LTVR fit:** VR experiences in STEM, social studies, and arts qualify under well-rounded education\n- **Talking point:** "Title IV-A funds are specifically designed for innovative educational technology like Learning Time VR."\n\n## State Technology Grants\n- **Indiana:** IDOE Technology Grants (check current cycle)\n- **Ohio:** Ohio EdTech initiatives, BroadbandOhio grants\n- **Illinois:** IL Digital Equity Act programs\n- **Michigan:** MI DTMB technology grants\n\n## E-Rate\n- **What:** Federal program subsidizing internet/telecom for schools\n- **LTVR fit:** WiFi infrastructure upgrades needed for VR may qualify\n- **Discount:** 20-90% based on poverty level\n\n## Private Foundations\n- Gates Foundation education grants\n- Chan Zuckerberg Initiative\n- Local community foundations (STEM focus)\n- Corporate sponsors (Intel, Google, etc.)\n\n## How to Use This in Sales\n1. Ask: "What funding sources do you have available?"\n2. Check district ESSER allocation at usaspending.gov\n3. Reference Title IV-A as backup if ESSER is spent\n4. Offer to help write the funding justification\n5. Provide ROI data to support grant applications',
  ARRAY['ltvr', 'funding', 'esser', 'title-iv', 'grants', 'sales'],
  true, 2, 'system'
);

-- 6. LTVR Implementation Playbook
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'customer_success',
  'playbook',
  'LTVR Implementation Playbook',
  'Step-by-step deployment guide for VR Classroom Pack and Tablet Subscription tiers',
  E'# Learning Time VR — Implementation Playbook\n\n## VR Classroom Pack Deployment (4-6 weeks)\n\n### Week 1: Pre-Deployment\n- [ ] Confirm hardware order and shipping timeline\n- [ ] Schedule teacher training date\n- [ ] Verify WiFi capacity (recommend 5GHz, 25+ Mbps)\n- [ ] Set up ArborXR admin account for IT coordinator\n- [ ] Share pre-training resources with teachers\n\n### Week 2: Hardware Setup\n- [ ] Receive and unbox Pico 4 headsets\n- [ ] Enroll all devices in ArborXR\n- [ ] Configure WiFi on all devices\n- [ ] Set up kiosk mode (lock to VictoryXR)\n- [ ] Create charging station/storage solution\n- [ ] Test all devices with sample experience\n\n### Week 3: Teacher Training\n- [ ] Conduct training session (half day)\n- [ ] Cover: device management, content selection, student monitoring\n- [ ] Walk through teacher dashboard\n- [ ] Practice leading a VR classroom session\n- [ ] Distribute quick-start guide\n\n### Week 4: First Sessions\n- [ ] Support teacher during first classroom VR session\n- [ ] Collect initial student feedback\n- [ ] Troubleshoot any technical issues\n- [ ] Review usage analytics in ArborXR\n\n### Week 6: 30-Day Check-In\n- [ ] Review usage metrics (headset utilization, content engagement)\n- [ ] Address any teacher concerns\n- [ ] Share success metrics with administrator\n- [ ] Discuss expansion opportunities\n\n## Tablet Subscription Deployment (1-2 weeks)\n\n### Week 1: Setup\n- [ ] Create school admin account\n- [ ] Provision teacher accounts\n- [ ] Share WebXR access links\n- [ ] Conduct teacher training (1-2 hours virtual)\n- [ ] Integrate with LMS (Google Classroom/Canvas)\n\n### Week 2: Launch\n- [ ] Support first WebXR classroom sessions\n- [ ] Verify Chromebook/tablet compatibility\n- [ ] Review engagement analytics\n- [ ] 14-day check-in with teacher\n\n## Success Metrics to Track\n- Headset/device utilization rate (target: >60%)\n- Teacher login frequency (target: 3x/week)\n- Student session count (target: 2x/week)\n- Content experiences completed\n- Student engagement scores\n- Teacher satisfaction survey (30 days)',
  ARRAY['ltvr', 'implementation', 'onboarding', 'deployment', 'customer-success'],
  true, 2, 'system'
);

-- 7. VictoryXR Content Library Overview
INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
VALUES (
  'sales',
  'product',
  'VictoryXR Content Library Overview',
  'Overview of available VictoryXR content, grades, subjects, and standards alignment',
  E'# VictoryXR Content Library — Overview\n\n## What is VictoryXR?\nVictoryXR is the content partner providing 200+ immersive learning experiences for Learning Time VR subscriptions. Content is curriculum-aligned and designed for K-12 classroom use.\n\n## Content Categories\n\n### Science (STEM) — 80+ experiences\n- Biology: Human body systems, cell division, ecosystems, dissections\n- Chemistry: Molecular structures, chemical reactions, lab simulations\n- Physics: Forces, energy, magnetism, space exploration\n- Earth Science: Geology, weather, plate tectonics, oceans\n- Environmental: Climate change, habitats, food webs\n\n### Social Studies — 40+ experiences\n- History: Ancient civilizations, US history, world events\n- Geography: World landmarks, cultures, ecosystems\n- Civics: Government structures, elections, community\n\n### Arts & Culture — 30+ experiences\n- Virtual museum tours\n- Art history explorations\n- Music and performing arts\n- Cultural heritage sites\n\n### Career & Technical — 20+ experiences\n- STEM career exploration\n- Manufacturing and engineering\n- Healthcare and medical\n- Agriculture and environmental\n\n### Special Programs — 30+ experiences\n- SEL (Social Emotional Learning)\n- College campus tours\n- Safety and health\n- Special needs accommodations\n\n## Grade Coverage\n- Elementary (K-5): 60+ experiences\n- Middle School (6-8): 100+ experiences\n- High School (9-12): 120+ experiences\n\n## Standards Alignment\n- Next Generation Science Standards (NGSS)\n- Common Core State Standards\n- State-specific standards (mapped per request)\n- ISTE Standards for Students\n\n## Content Delivery\n- **VR Headset:** Full immersive 6DOF experiences\n- **Tablet/WebXR:** Browser-based 3D experiences (subset of full library)\n- **New content:** 5-10 new experiences added monthly\n\n## Upcoming Content\n- AI-generated lesson plans (March 2026)\n- Adaptive difficulty levels (April 2026)\n- Multi-language support (May 2026)\n- Custom curriculum builder (Q3 2026)',
  ARRAY['ltvr', 'victorxr', 'content', 'curriculum', 'standards', 'library'],
  true, 2, 'system'
);
