-- ============================================================
-- Seed 006: Revenue Sprint — Feb-Jun 2026
-- Creates the Revenue Sprint cross-functional team, 7 new
-- recurring schedules, the Budget Season Blitz workflow,
-- auto-execute configuration updates, and CRM audit init task.
-- ============================================================

-- ============================================================
-- 1. REVENUE SPRINT AGENT TEAM (Task 4)
-- Cross-functional team focused on $300K target
-- ============================================================

INSERT INTO agent_teams (id, name, description, business_area, icon, status, daily_schedule_time)
VALUES (
  'revenue-sprint',
  'Revenue Sprint Team',
  'Cross-functional team focused on the $300K revenue target by June 30, 2026. Coordinates ESSER urgency outreach, proposal generation, pipeline tracking, and revenue gap analysis.',
  'sales',
  'zap',
  'active',
  '06:00:00'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = 'active';

-- Add members: sdr-agent (lead), proposal-agent, crm-specialist, analytics-agent
INSERT INTO agent_team_members (team_id, agent_id, role_in_team, join_order)
VALUES
  ('revenue-sprint', 'sdr-agent', 'lead', 1),
  ('revenue-sprint', 'proposal-agent', 'member', 2),
  ('revenue-sprint', 'crm-specialist', 'member', 3),
  ('revenue-sprint', 'analytics-agent', 'member', 4)
ON CONFLICT (team_id, agent_id) DO UPDATE SET
  role_in_team = EXCLUDED.role_in_team,
  join_order = EXCLUDED.join_order;

-- ============================================================
-- 2. PHASE 1 RECURRING SCHEDULES (Task 1) — 4 new schedules
-- ============================================================

-- 2a. ESSER Funding Urgency Campaign (sdr-agent, weekdays, priority 1)
-- Generates 5 personalized ESSER urgency emails daily
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'sdr-agent', 'revenue-sprint',
  'ESSER Funding Urgency Campaign',
  'Generate 5 personalized ESSER III urgency outreach emails targeting districts with expiring federal funds',
  'ESSER III federal funding is expiring — districts must "use it or lose it." Draft 5 personalized outreach emails for school districts in IN, OH, IL, MI that have ESSER allocations. For each email:

1. Address the superintendent or tech director by name (or title if name unknown)
2. Reference the district''s specific ESSER allocation or student count
3. Open with the urgency: ESSER III funds expire soon and must be committed to qualifying technology investments
4. Position Learning Time VR as a qualifying use: immersive, curriculum-aligned learning technology
5. Include a specific LTVR tier recommendation based on district size:
   - Small districts (<5K students): Tablet Subscription ($1,500-$5,000/yr) or Pilot ($1,500-$2,500)
   - Medium districts (5-15K students): Classroom Pack ($5,000-$15,000/yr)
   - Large districts (15K+ students): District Enterprise ($10,000-$50,000/yr)
6. End with a clear CTA: "Book a 15-minute demo to see how your ESSER funds can transform learning"

Use PAS (Problem-Agitate-Solution) or AIDA framework. Keep each email under 200 words.',
  'sales', 1, 'weekdays', '06:00:00', true, true,
  '{"include": ["esser_districts", "pipeline_summary", "existing_districts"]}'
);

-- 2b. Budget Season Proposal Generator (proposal-agent, weekly Monday)
-- Auto-generate proposals for qualified deals (BANT > 6)
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'proposal-agent', 'revenue-sprint',
  'Budget Season Proposal Generator',
  'Auto-generate district subscription proposals for qualified deals approaching budget decision windows',
  'Review the current pipeline for deals with BANT scores of 6 or higher (or deals in "proposal" / "negotiation" stage). For each qualified deal, generate a customized proposal that includes:

1. Executive summary tailored to the district''s specific needs and challenges
2. Recommended LTVR product tier with pricing justification:
   - Classroom Pack: $5,000-$15,000/yr (VR headsets + content + teacher tools)
   - Tablet Subscription: $1,500-$5,000/yr (AR/WebXR on existing devices)
   - District Enterprise: $10,000-$50,000/yr (district-wide deployment)
3. ROI projections using district-specific metrics (student count, current tech spend)
4. Implementation timeline aligned with the district''s budget calendar
5. ESSER III funding alignment (if applicable)
6. References to pilot results or case studies
7. Good-Better-Best packaging options
8. Next steps with specific dates

If no qualified deals are ready for proposals, analyze the pipeline and recommend which deals are closest to proposal-ready and what actions would advance them.

Use the PROPOSAL_DISTRICT.html template structure.',
  'sales', 2, 'weekly', '{1}', '06:30:00', true, true,
  '{"include": ["pipeline_deals", "budget_deadlines", "pilot_conversions", "revenue_gap"]}'
);

-- 2c. District Budget Tracker (crm-specialist, weekly Wednesday)
-- Research board vote dates and tech purchase deadlines
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'crm-specialist', 'revenue-sprint',
  'District Budget Tracker',
  'Research and track budget decision timelines for all pipeline districts',
  'For every district in our active pipeline, research and update their budget decision timeline:

1. School board meeting dates (when technology purchases are typically approved)
2. Budget submission deadlines for next fiscal year
3. Technology committee review schedules
4. ESSER III fund commitment deadlines (district-specific if available)
5. Procurement process requirements (RFP required? Sole source threshold? Vendor registration needed?)

Organize districts by urgency:
- CRITICAL (decision within 30 days): List specific dates and required actions
- UPCOMING (31-60 days): List dates and preparation needed
- PLANNING (61-90 days): List dates and relationship building actions

Flag any districts where we are at risk of missing their budget window. For each district, specify what Ascent XR needs to deliver (proposal, demo, references) and by when.',
  'sales', 2, 'weekly', '{3}', '06:30:00', true, true,
  '{"include": ["pipeline_deals", "budget_deadlines", "existing_districts", "contact_data"]}'
);

-- 2d. Weekly Revenue Gap Analysis (analytics-agent, weekly Monday)
-- Model 3 revenue scenarios, flag risks
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'analytics-agent', 'revenue-sprint',
  'Weekly Revenue Gap Analysis',
  'Model 3 revenue scenarios and flag risks against $300K target',
  'Perform a weekly revenue gap analysis for the $300K target (due June 30, 2026):

1. CURRENT STATUS: Total revenue closed to date, pipeline value by stage, weighted pipeline value
2. GAP ANALYSIS: Remaining revenue needed, days remaining, required monthly run rate
3. THREE SCENARIOS:
   - Conservative (20% close rate): What revenue can we expect from current pipeline only?
   - Baseline (30% close rate + new pipeline): Expected revenue with planned outreach
   - Optimistic (40% close rate + accelerated pipeline): Best case with ESSER urgency acceleration
4. RISK FLAGS:
   - Pipeline coverage ratio (target: 3x remaining gap)
   - Average deal cycle vs. days remaining
   - Deals stalled >14 days
   - ESSER-dependent deals at risk of fund expiration
5. CONTINGENCY TRIGGERS:
   - If Feb closes < $15K → recommend doubling ESSER blitz
   - If Mar pipeline < $100K → recommend early paid LinkedIn ads
   - If Apr close rate < 30% → recommend Win/Loss analysis
   - If May cumulative < $150K → recommend custom XR project pivot
6. TOP 3 ACTIONS: Highest-leverage actions to close the gap this week

Include revenue by product tier: Pilot, Tablet, Classroom Pack, Enterprise, Custom XR.',
  'sales', 1, 'weekly', '{1}', '06:15:00', true, false,
  '{"include": ["revenue_gap", "pipeline_summary", "pipeline_deals", "budget_deadlines", "pilot_conversions"]}'
);

-- ============================================================
-- 3. PHASE 2 RECURRING SCHEDULES (Tasks 9, 10) — 4 new schedules
-- ============================================================

-- 3a. Case Study Generator (cs-agent, monthly 1st)
-- Engagement metrics, teacher feedback, student outcomes per customer
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'cs-agent', 'revenue-sprint',
  'Monthly Case Study Generator',
  'Generate detailed case studies from active customer engagement data for sales collateral',
  'Generate case studies from our active customer base for use as sales collateral:

For each active customer/pilot district:
1. DISTRICT PROFILE: Name, size, state, student demographics, challenge they faced
2. SOLUTION: Which LTVR product tier deployed, number of classrooms/students, subjects covered
3. ENGAGEMENT METRICS: Usage frequency, session duration, feature adoption rates, teacher login frequency
4. TEACHER FEEDBACK: Qualitative feedback themes, satisfaction scores, PD session outcomes
5. STUDENT OUTCOMES: Assessment improvements, engagement changes, attendance impact (if available)
6. ROI ANALYSIS: Cost per student, time saved, curriculum coverage improvement
7. QUOTE: Draft a compelling pull-quote for the district contact to approve

Format each case study in a structure suitable for:
- LinkedIn post (150-word summary version)
- One-page PDF (detailed version with metrics)
- Proposal insert (2-paragraph version)

Prioritize districts with the strongest quantitative results.',
  'customer_success', 3, 'monthly', '{1}', '06:00:00', true, true,
  '{"include": ["health_scores", "onboarding_milestones", "pilot_conversions"]}'
);

-- 3b. LinkedIn Engagement Finder (sdr-agent, weekdays)
-- Find 10 superintendent posts for Jim to comment on
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'sdr-agent', 'revenue-sprint',
  'LinkedIn Engagement Suggestions',
  'Find superintendent and EdTech leader LinkedIn posts for Jim to engage with daily',
  'Identify 10 LinkedIn posts from K-12 superintendents, tech directors, and EdTech thought leaders in IN, OH, IL, MI that Jim should engage with today. For each post:

1. POST DETAILS: Author name, role, district/org, approximate post topic
2. ENGAGEMENT SUGGESTION: Draft a thoughtful comment (2-3 sentences) that:
   - Adds genuine value to the conversation (not promotional)
   - Demonstrates Jim''s expertise in EdTech/XR education
   - Naturally positions Ascent XR''s perspective without being salesy
   - Asks a follow-up question to encourage dialogue
3. CONNECTION OPPORTUNITY: Whether this person is a prospect, potential referral partner, or thought leadership connection
4. FOLLOW-UP: If this is a prospect, suggest a follow-up DM template for 2-3 days after engagement

Focus on posts about:
- Education technology adoption
- ESSER/federal funding usage
- STEM/science curriculum innovation
- Immersive or experiential learning
- School district budget planning',
  'sales', 3, 'weekdays', '06:45:00', true, true,
  '{"include": ["existing_districts", "pipeline_deals"]}'
);

-- 3c. Private/Charter School Prospecting (sdr-agent, weekly Thursday)
-- 5 private/charter schools in IN/OH with personalized outreach
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'sdr-agent', 'revenue-sprint',
  'Private & Charter School Prospecting',
  'Research and draft outreach for private/charter schools as secondary sales segment',
  'Research 5 private or charter schools in Indiana and Ohio that are strong candidates for Learning Time VR. Private and charter schools have different buying processes than public districts:

For each school:
1. SCHOOL PROFILE: Name, location, enrollment, tuition range, curriculum focus (STEM, college prep, Montessori, etc.)
2. KEY DECISION MAKER: Head of School, Principal, or Academic Dean (not superintendent)
3. BUYING ADVANTAGE: Faster decisions (no board approval required), independent budgets, innovation-friendly
4. COMPETITIVE POSITIONING: Emphasize competitive differentiation for parent marketing — "your school offers cutting-edge XR learning"
5. PERSONALIZED OUTREACH EMAIL: Draft using differentiated messaging:
   - Lead with parent value: "Give your families a reason to choose [School Name]"
   - Emphasize innovation leadership
   - Shorter sales cycle: suggest a 2-week trial instead of 90-day pilot
   - Pricing: focus on Tablet Subscription ($1,500-$5,000/yr) or Classroom Pack ($5,000-$15,000/yr)
6. CTA: "See how XR technology sets your school apart — book a 15-minute demo"

Avoid schools already in our pipeline.',
  'sales', 3, 'weekly', '{4}', '06:00:00', true, true,
  '{"include": ["existing_districts", "pipeline_summary"]}'
);

-- 3d. Partnership Prospecting (partner-agent, weekly Thursday) (Task 10)
INSERT INTO recurring_task_schedules (
  agent_id, team_id, title, description, prompt, business_area,
  priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template
) VALUES (
  'partner-agent', 'revenue-sprint',
  'Weekly Partnership Prospecting',
  'Identify EdTech resellers, co-marketing partners, and referral opportunities',
  'Identify and research partnership opportunities for Ascent XR / Learning Time VR:

1. RESELLER PARTNERS (identify 5):
   - EdTech distributors and VARs active in IN, OH, IL, MI
   - Companies that sell hardware (Chromebooks, tablets, VR headsets) to school districts
   - Educational technology consultants who advise districts on tech purchases
   - For each: company name, key contact, relevance to LTVR, suggested approach

2. CO-MARKETING OPPORTUNITIES (identify 3):
   - EdTech companies with complementary products (LMS, assessment, STEM curriculum)
   - Education conferences and events where joint presence would be valuable
   - Content partners for co-authored research or webinars
   - For each: company/event, partnership type, mutual benefit, draft outreach

3. REFERRAL PIPELINE:
   - Review existing contacts/network for warm introduction opportunities
   - Identify educators or consultants who could refer districts
   - Draft referral ask templates

4. PARTNERSHIP PROPOSALS:
   - For the top 2 most promising partnerships, draft a brief partnership proposal including: value proposition for both parties, commission/revenue share structure (15-25% reseller, 5-15% referral), joint go-to-market plan, and success metrics.

Target: 5 resellers, 3 co-marketing, 10 referrals by June.',
  'partnerships', 3, 'weekly', '{4}', '06:00:00', true, true,
  '{"include": ["partner_data", "partner_deals", "pipeline_summary"]}'
);

-- ============================================================
-- 4. UPDATE MISSION DIRECTOR MORNING BRIEFING (Task 6)
-- Enhanced with revenue gap, ESSER tracking, budget calendar
-- ============================================================

UPDATE recurring_task_schedules
SET prompt = 'Generate the Revenue Sprint morning briefing for Jim and Nick:

1. REVENUE GAP COUNTDOWN:
   - Days remaining until June 30, 2026 deadline
   - Total revenue closed to date vs. $300K target
   - Remaining gap in dollars
   - Required monthly run rate to hit target
   - Deals needed at current average deal size

2. ESSER DEADLINE TRACKING:
   - Districts with expiring ESSER III funds and their commitment deadlines
   - ESSER-related deals in pipeline and their status
   - Any ESSER urgency emails sent yesterday and responses received

3. BUDGET SEASON CALENDAR:
   - School board votes happening this week
   - Proposal deadlines approaching
   - Budget decision dates within 30 days

4. PILOT CONVERSION STATUS:
   - Active pilots and their progress
   - Conversion probability for each pilot
   - Expected revenue from pilot conversions
   - Actions needed to advance conversions

5. CUSTOM XR PROJECT PIPELINE:
   - Active custom project opportunities
   - Proposal status for each project
   - Expected revenue from custom projects

6. TOP 3 DAILY ACTIONS:
   - Highest-impact actions for Jim today (calls, demos, follow-ups)
   - Prioritized by revenue impact and urgency

7. AGENT TASK SUMMARY:
   - What each agent produced yesterday (approved/review/failed)
   - What is queued for today
   - Any items requiring Jim''s review or decision

8. CONTINGENCY CHECK:
   - Are we on track vs. monthly targets?
   - Any contingency triggers activated? (Feb <$15K, Mar pipeline <$100K, etc.)

Keep it actionable and structured. Start with the revenue countdown.',
  context_template = '{"include": ["revenue_gap", "pipeline_summary", "pipeline_deals", "budget_deadlines", "pilot_conversions", "esser_districts", "active_alerts", "yesterday_tasks", "today_schedules", "health_scores"]}'
WHERE title = 'Morning Briefing for Jim and Nick'
  AND agent_id = 'mission-director';

-- ============================================================
-- 5. AUTO-EXECUTE CONFIGURATION (Task 7)
-- Set auto_execute=true, requires_review=false for low-risk tasks
-- Keep requires_review=true for customer-facing content
-- ============================================================

-- Low-risk tasks: auto-execute ON, no review required
-- (Pipeline status, cash position, data quality audit, compliance checks, analytics)
UPDATE recurring_task_schedules
SET auto_execute = true, requires_review = false
WHERE title IN (
  'Pipeline Status Update',
  'Daily Cash Position Review',
  'CRM Data Quality Audit',
  'Compliance & Data Quality Check',
  'Weekly Revenue Gap Analysis',
  'Weekly Marketing Performance Report',
  'Email Campaign Analysis',
  'Brand Compliance Review',
  'Brand Consistency Audit'
);

-- Customer-facing content: auto-execute ON, review REQUIRED
-- (LinkedIn posts, outreach emails, proposals, case studies)
UPDATE recurring_task_schedules
SET auto_execute = true, requires_review = true
WHERE title IN (
  'Draft LinkedIn Post',
  'ESSER Funding Urgency Campaign',
  'Research New Target Districts',
  'Pipeline Follow-up Check',
  'Budget Season Proposal Generator',
  'Monthly Case Study Generator',
  'LinkedIn Engagement Suggestions',
  'Private & Charter School Prospecting',
  'Weekly Partnership Prospecting',
  'District Budget Tracker'
);

-- ============================================================
-- 6. BUDGET SEASON BLITZ WORKFLOW (Task 5)
-- 6-step sales workflow for budget season
-- ============================================================

INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Budget Season Blitz',
  'budget-season-blitz',
  'End-to-end budget season sales workflow: map district buying cycles, navigate ESSER funding, launch cold outreach, prep discovery calls, generate ROI documentation, and write proposals. Designed for the Feb-May K-12 budget window.',
  'Budget Season',
  280
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('district-buying-cycles', 1, 'crm-specialist'),
  ('funding-navigation', 2, 'sdr-agent'),
  ('cold-outreach', 3, 'sdr-agent'),
  ('discovery-call', 4, 'sdr-agent'),
  ('roi-calculator', 5, 'proposal-agent'),
  ('proposal-writing', 6, 'proposal-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'budget-season-blitz'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- ============================================================
-- 7. CRM DATA AUDIT INITIALIZATION (Task 11)
-- One-time task for crm-specialist to audit and seed CRM data
-- ============================================================

INSERT INTO agent_tasks (
  agent_id, title, description, business_area, priority, status,
  prompt, context, result_type, created_by
) VALUES (
  'crm-specialist',
  'CRM Data Audit & District Pipeline Initialization',
  'First-run CRM audit to verify pipeline data and generate target district list if needed',
  'sales', 1, 'queued',
  'Perform a comprehensive CRM data audit:

1. COUNT AND VERIFY:
   - Total school districts in the database
   - Total contacts (with decision-maker flag breakdown)
   - Total deals by stage
   - Data completeness: % of districts with contacts, % of contacts with email/phone

2. DATA QUALITY:
   - Identify duplicate districts or contacts
   - Flag districts missing key fields (state, student count, city)
   - Flag contacts missing key fields (email, title, decision-maker status)
   - Flag deals missing expected close dates or opportunity values

3. IF FEWER THAN 50 DISTRICTS IN DATABASE:
   Generate a priority target list of 100 school districts in IN, OH, IL, MI with:
   - District name, city, state
   - Estimated student count (5,000-50,000 students)
   - Estimated annual technology budget ($100K+ preferred)
   - STEM focus indicators
   - Superintendent name (if findable)
   - Why this district is a strong LTVR candidate

   Prioritize by:
   a. Indiana districts first (home state advantage)
   b. Districts with 10,000-30,000 students (sweet spot for enterprise tier)
   c. Districts known for EdTech adoption or STEM initiatives
   d. Districts with ESSER III allocations

4. RECOMMENDATIONS:
   - Top 20 districts to contact this week
   - Suggested pipeline stage for each
   - Key decision makers to target
   - Recommended LTVR tier for each district based on size',
  '{}', 'text', 'seed-script'
);

-- ============================================================
-- 8. ACTIVATE PAUSED AGENTS NEEDED FOR REVENUE SPRINT
-- ============================================================

UPDATE agents SET status = 'active' WHERE id IN ('brand-agent', 'compliance-agent', 'partner-agent')
  AND status = 'paused';
