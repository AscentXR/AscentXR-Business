-- ============================================================
-- Migration 009: Skill Execution Calendar & Plan Builder
-- Maps skills to specific dates for structured Q1 2026 execution
-- ============================================================

-- 1. Execution Plans - Container for a plan (e.g., "Q1 2026 Marketing Plan")
CREATE TABLE IF NOT EXISTS execution_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  business_area VARCHAR(50) CHECK (business_area IN ('marketing', 'sales')),
  team_id VARCHAR(50) REFERENCES agent_teams(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  revenue_target NUMERIC(12, 2),
  context JSONB DEFAULT '{}',
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skill Calendar Entries - Individual skill executions on specific dates
CREATE TABLE IF NOT EXISTS skill_calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES execution_plans(id) ON DELETE CASCADE,
  marketing_skill_id UUID REFERENCES marketing_skills(id) ON DELETE SET NULL,
  sales_skill_id UUID REFERENCES sales_skills(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME DEFAULT '09:00:00',
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  day_order INTEGER DEFAULT 1,
  assigned_agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE SET NULL,
  assigned_team_id VARCHAR(50) REFERENCES agent_teams(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'running', 'completed', 'failed', 'skipped')),
  task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  result_summary TEXT,
  title_override VARCHAR(500),
  notes TEXT,
  week_label VARCHAR(100),
  phase VARCHAR(200),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_skill_xor CHECK (
    (marketing_skill_id IS NOT NULL AND sales_skill_id IS NULL) OR
    (marketing_skill_id IS NULL AND sales_skill_id IS NOT NULL)
  )
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_execution_plans_business_area ON execution_plans(business_area);
CREATE INDEX IF NOT EXISTS idx_execution_plans_status ON execution_plans(status);
CREATE INDEX IF NOT EXISTS idx_execution_plans_slug ON execution_plans(slug);
CREATE INDEX IF NOT EXISTS idx_skill_calendar_plan ON skill_calendar_entries(plan_id);
CREATE INDEX IF NOT EXISTS idx_skill_calendar_date ON skill_calendar_entries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_skill_calendar_status ON skill_calendar_entries(status);
CREATE INDEX IF NOT EXISTS idx_skill_calendar_marketing_skill ON skill_calendar_entries(marketing_skill_id) WHERE marketing_skill_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skill_calendar_sales_skill ON skill_calendar_entries(sales_skill_id) WHERE sales_skill_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skill_calendar_task ON skill_calendar_entries(task_id) WHERE task_id IS NOT NULL;

-- 4. Auto-update triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_execution_plans_updated') THEN
    CREATE TRIGGER trg_execution_plans_updated BEFORE UPDATE ON execution_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_skill_calendar_entries_updated') THEN
    CREATE TRIGGER trg_skill_calendar_entries_updated BEFORE UPDATE ON skill_calendar_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================
-- SEED DATA: Execution Plans
-- ============================================================

INSERT INTO execution_plans (id, name, slug, description, business_area, team_id, status, start_date, end_date, revenue_target, created_by)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Q1 2026 Marketing Plan', 'q1-2026-marketing', 'Comprehensive marketing execution plan for Q1 2026 targeting $75K in marketing-attributed revenue, 150 leads, and 30 customers through content, SEO, paid ads, and conversion optimization.', 'marketing', 'marketing-team', 'active', '2026-02-02', '2026-03-31', 75000, 'system'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Q1 2026 Sales Plan', 'q1-2026-sales', 'Structured sales execution plan for Q1 2026 targeting $75K in closed revenue through prospecting, qualification, demos, proposals, and negotiation across K-12 districts.', 'sales', 'sales-team', 'active', '2026-02-02', '2026-03-31', 75000, 'system')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Marketing Calendar Entries (Phase 1-4)
-- Uses INSERT ... SELECT ... JOIN to only create entries if skills exist
-- ============================================================

-- Phase 1: Foundation (Weeks 1-2: Feb 2-13)
INSERT INTO skill_calendar_entries (plan_id, marketing_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0001-4000-8000-000000000001', ms.id, d.sdate, d.pri, d.dord, 'marketing-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('product-marketing-context', '2026-02-02'::date, 1, 1, 'Week 1', 'Phase 1: Foundation'),
  ('seo-audit',                 '2026-02-02'::date, 2, 2, 'Week 1', 'Phase 1: Foundation'),
  ('competitor-alternatives',   '2026-02-03'::date, 1, 1, 'Week 1', 'Phase 1: Foundation'),
  ('schema-markup',             '2026-02-03'::date, 2, 2, 'Week 1', 'Phase 1: Foundation'),
  ('analytics-tracking',        '2026-02-04'::date, 1, 1, 'Week 1', 'Phase 1: Foundation'),
  ('copywriting',               '2026-02-05'::date, 1, 1, 'Week 1', 'Phase 1: Foundation'),
  ('page-cro',                  '2026-02-06'::date, 1, 1, 'Week 1', 'Phase 1: Foundation'),
  ('signup-flow-cro',           '2026-02-09'::date, 1, 1, 'Week 2', 'Phase 1: Foundation'),
  ('pricing-strategy',          '2026-02-10'::date, 1, 1, 'Week 2', 'Phase 1: Foundation'),
  ('marketing-psychology',      '2026-02-11'::date, 1, 1, 'Week 2', 'Phase 1: Foundation')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN marketing_skills ms ON ms.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- Phase 2: Content & Outreach Launch (Weeks 3-4: Feb 16-27)
INSERT INTO skill_calendar_entries (plan_id, marketing_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0001-4000-8000-000000000001', ms.id, d.sdate, d.pri, d.dord, 'marketing-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('marketing-ideas',    '2026-02-16'::date, 1, 1, 'Week 3', 'Phase 2: Content & Outreach Launch'),
  ('social-content',     '2026-02-16'::date, 2, 2, 'Week 3', 'Phase 2: Content & Outreach Launch'),
  ('email-sequence',     '2026-02-17'::date, 1, 1, 'Week 3', 'Phase 2: Content & Outreach Launch'),
  ('copywriting',        '2026-02-18'::date, 1, 1, 'Week 3', 'Phase 2: Content & Outreach Launch'),
  ('paid-ads',           '2026-02-19'::date, 1, 1, 'Week 3', 'Phase 2: Content & Outreach Launch'),
  ('launch-strategy',    '2026-02-20'::date, 1, 1, 'Week 3', 'Phase 2: Content & Outreach Launch'),
  ('free-tool-strategy', '2026-02-23'::date, 1, 1, 'Week 4', 'Phase 2: Content & Outreach Launch'),
  ('referral-program',   '2026-02-24'::date, 1, 1, 'Week 4', 'Phase 2: Content & Outreach Launch'),
  ('ab-test-setup',      '2026-02-25'::date, 1, 1, 'Week 4', 'Phase 2: Content & Outreach Launch')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN marketing_skills ms ON ms.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- Phase 3: Optimization & Scale (Weeks 5-6: Mar 2-13)
INSERT INTO skill_calendar_entries (plan_id, marketing_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0001-4000-8000-000000000001', ms.id, d.sdate, d.pri, d.dord, 'marketing-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('analytics-tracking', '2026-03-02'::date, 1, 1, 'Week 5', 'Phase 3: Optimization & Scale'),
  ('ab-test-setup',      '2026-03-02'::date, 2, 2, 'Week 5', 'Phase 3: Optimization & Scale'),
  ('page-cro',           '2026-03-03'::date, 1, 1, 'Week 5', 'Phase 3: Optimization & Scale'),
  ('email-sequence',     '2026-03-04'::date, 1, 1, 'Week 5', 'Phase 3: Optimization & Scale'),
  ('social-content',     '2026-03-05'::date, 1, 1, 'Week 5', 'Phase 3: Optimization & Scale'),
  ('form-cro',           '2026-03-06'::date, 1, 1, 'Week 5', 'Phase 3: Optimization & Scale'),
  ('popup-cro',          '2026-03-09'::date, 1, 1, 'Week 6', 'Phase 3: Optimization & Scale'),
  ('onboarding-cro',     '2026-03-10'::date, 1, 1, 'Week 6', 'Phase 3: Optimization & Scale'),
  ('programmatic-seo',   '2026-03-11'::date, 1, 1, 'Week 6', 'Phase 3: Optimization & Scale')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN marketing_skills ms ON ms.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- Phase 4: Q1 Closeout (Weeks 7-8: Mar 16-31)
INSERT INTO skill_calendar_entries (plan_id, marketing_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0001-4000-8000-000000000001', ms.id, d.sdate, d.pri, d.dord, 'marketing-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('marketing-ideas',        '2026-03-16'::date, 1, 1, 'Week 7', 'Phase 4: Q1 Closeout'),
  ('copywriting',            '2026-03-17'::date, 1, 1, 'Week 7', 'Phase 4: Q1 Closeout'),
  ('paid-ads',               '2026-03-18'::date, 1, 1, 'Week 7', 'Phase 4: Q1 Closeout'),
  ('social-content',         '2026-03-19'::date, 1, 1, 'Week 7', 'Phase 4: Q1 Closeout'),
  ('analytics-tracking',     '2026-03-20'::date, 1, 1, 'Week 7', 'Phase 4: Q1 Closeout'),
  ('launch-strategy',        '2026-03-23'::date, 1, 1, 'Week 8', 'Phase 4: Q1 Closeout'),
  ('competitor-alternatives', '2026-03-24'::date, 1, 1, 'Week 8', 'Phase 4: Q1 Closeout'),
  ('paywall-upgrade-cro',    '2026-03-25'::date, 1, 1, 'Week 8', 'Phase 4: Q1 Closeout'),
  ('marketing-psychology',   '2026-03-26'::date, 1, 1, 'Week 8', 'Phase 4: Q1 Closeout'),
  ('ab-test-setup',          '2026-03-27'::date, 1, 1, 'Week 8', 'Phase 4: Q1 Closeout')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN marketing_skills ms ON ms.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Sales Calendar Entries (Phase 1-4)
-- ============================================================

-- Phase 1: Foundation & Research (Weeks 1-2: Feb 2-13)
INSERT INTO skill_calendar_entries (plan_id, sales_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0002-4000-8000-000000000002', ss.id, d.sdate, d.pri, d.dord, 'sales-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('district-buying-cycles', '2026-02-02'::date, 1, 1, 'Week 1', 'Phase 1: Foundation & Research'),
  ('funding-navigation',     '2026-02-02'::date, 2, 2, 'Week 1', 'Phase 1: Foundation & Research'),
  ('stakeholder-mapping',    '2026-02-03'::date, 1, 1, 'Week 1', 'Phase 1: Foundation & Research'),
  ('battle-cards',           '2026-02-04'::date, 1, 1, 'Week 1', 'Phase 1: Foundation & Research'),
  ('pipeline-management',    '2026-02-05'::date, 1, 1, 'Week 1', 'Phase 1: Foundation & Research'),
  ('cold-outreach',          '2026-02-06'::date, 1, 1, 'Week 1', 'Phase 1: Foundation & Research'),
  ('social-selling',         '2026-02-09'::date, 1, 1, 'Week 2', 'Phase 1: Foundation & Research'),
  ('lead-qualification',     '2026-02-10'::date, 1, 1, 'Week 2', 'Phase 1: Foundation & Research'),
  ('discovery-call',         '2026-02-11'::date, 1, 1, 'Week 2', 'Phase 1: Foundation & Research'),
  ('sales-forecasting',      '2026-02-12'::date, 1, 1, 'Week 2', 'Phase 1: Foundation & Research')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN sales_skills ss ON ss.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- Phase 2: Active Prospecting (Weeks 3-4: Feb 16-27)
INSERT INTO skill_calendar_entries (plan_id, sales_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0002-4000-8000-000000000002', ss.id, d.sdate, d.pri, d.dord, 'sales-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('cold-outreach',       '2026-02-16'::date, 1, 1, 'Week 3', 'Phase 2: Active Prospecting'),
  ('social-selling',      '2026-02-16'::date, 2, 2, 'Week 3', 'Phase 2: Active Prospecting'),
  ('conference-selling',  '2026-02-17'::date, 1, 1, 'Week 3', 'Phase 2: Active Prospecting'),
  ('referral-generation', '2026-02-18'::date, 1, 1, 'Week 3', 'Phase 2: Active Prospecting'),
  ('needs-assessment',    '2026-02-19'::date, 1, 1, 'Week 3', 'Phase 2: Active Prospecting'),
  ('demo-preparation',    '2026-02-20'::date, 1, 1, 'Week 3', 'Phase 2: Active Prospecting'),
  ('roi-calculator',      '2026-02-23'::date, 1, 1, 'Week 4', 'Phase 2: Active Prospecting'),
  ('proposal-writing',    '2026-02-24'::date, 1, 1, 'Week 4', 'Phase 2: Active Prospecting'),
  ('objection-handling',  '2026-02-25'::date, 1, 1, 'Week 4', 'Phase 2: Active Prospecting'),
  ('pipeline-management', '2026-02-26'::date, 1, 1, 'Week 4', 'Phase 2: Active Prospecting')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN sales_skills ss ON ss.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- Phase 3: Deals & Proposals (Weeks 5-6: Mar 2-13)
INSERT INTO skill_calendar_entries (plan_id, sales_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0002-4000-8000-000000000002', ss.id, d.sdate, d.pri, d.dord, 'sales-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('discovery-call',       '2026-03-02'::date, 1, 1, 'Week 5', 'Phase 3: Deals & Proposals'),
  ('needs-assessment',     '2026-03-03'::date, 1, 1, 'Week 5', 'Phase 3: Deals & Proposals'),
  ('demo-preparation',     '2026-03-04'::date, 1, 1, 'Week 5', 'Phase 3: Deals & Proposals'),
  ('proposal-writing',     '2026-03-05'::date, 1, 1, 'Week 5', 'Phase 3: Deals & Proposals'),
  ('pricing-negotiation',  '2026-03-06'::date, 1, 1, 'Week 5', 'Phase 3: Deals & Proposals'),
  ('negotiation-tactics',  '2026-03-09'::date, 1, 1, 'Week 6', 'Phase 3: Deals & Proposals'),
  ('pilot-to-purchase',    '2026-03-10'::date, 1, 1, 'Week 6', 'Phase 3: Deals & Proposals'),
  ('account-planning',     '2026-03-11'::date, 1, 1, 'Week 6', 'Phase 3: Deals & Proposals'),
  ('expansion-upsell',     '2026-03-12'::date, 1, 1, 'Week 6', 'Phase 3: Deals & Proposals'),
  ('sales-forecasting',    '2026-03-13'::date, 1, 1, 'Week 6', 'Phase 3: Deals & Proposals')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN sales_skills ss ON ss.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- Phase 4: Close & Scale (Weeks 7-8: Mar 16-31)
INSERT INTO skill_calendar_entries (plan_id, sales_skill_id, scheduled_date, priority, day_order, assigned_team_id, status, week_label, phase)
SELECT 'a1b2c3d4-0002-4000-8000-000000000002', ss.id, d.sdate, d.pri, d.dord, 'sales-team', 'pending', d.wlabel, d.phase
FROM (VALUES
  ('negotiation-tactics',    '2026-03-16'::date, 1, 1, 'Week 7', 'Phase 4: Close & Scale'),
  ('proposal-writing',       '2026-03-17'::date, 1, 1, 'Week 7', 'Phase 4: Close & Scale'),
  ('cold-outreach',          '2026-03-18'::date, 1, 1, 'Week 7', 'Phase 4: Close & Scale'),
  ('qbr-preparation',        '2026-03-19'::date, 1, 1, 'Week 7', 'Phase 4: Close & Scale'),
  ('win-loss-analysis',      '2026-03-20'::date, 1, 1, 'Week 7', 'Phase 4: Close & Scale'),
  ('call-coaching',          '2026-03-23'::date, 1, 1, 'Week 8', 'Phase 4: Close & Scale'),
  ('pipeline-management',    '2026-03-24'::date, 1, 1, 'Week 8', 'Phase 4: Close & Scale'),
  ('district-buying-cycles', '2026-03-25'::date, 1, 1, 'Week 8', 'Phase 4: Close & Scale'),
  ('account-planning',       '2026-03-26'::date, 1, 1, 'Week 8', 'Phase 4: Close & Scale'),
  ('sales-forecasting',      '2026-03-27'::date, 1, 1, 'Week 8', 'Phase 4: Close & Scale')
) AS d(skill_slug, sdate, pri, dord, wlabel, phase)
JOIN sales_skills ss ON ss.skill_id = d.skill_slug
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Plan Builder Workflows
-- ============================================================

-- Marketing Plan Builder Workflow
INSERT INTO marketing_workflows (name, slug, description, category, is_template, estimated_total_minutes, is_active)
VALUES (
  'Marketing Plan Builder',
  'marketing-plan-builder',
  'Comprehensive 8-step workflow that chains foundational skills to produce a complete Q1 marketing execution plan. Starts with product context and competitive analysis, then builds content strategy, messaging, and analytics tracking.',
  'Strategy & Monetization',
  true,
  240,
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, is_optional, depends_on_step, agent_id)
SELECT w.id, ms.id, d.step_order, false, d.depends_on, d.agent_id
FROM (VALUES
  ('product-marketing-context', 1, NULL, 'content-creator'),
  ('competitor-alternatives',   2, 1,    'analytics-agent'),
  ('marketing-ideas',           3, 2,    'content-creator'),
  ('launch-strategy',           4, 3,    'content-creator'),
  ('copywriting',               5, 4,    'content-creator'),
  ('email-sequence',            6, 5,    'content-creator'),
  ('social-content',            7, 5,    'content-creator'),
  ('analytics-tracking',        8, 6,    'analytics-agent')
) AS d(skill_slug, step_order, depends_on, agent_id)
CROSS JOIN marketing_workflows w
JOIN marketing_skills ms ON ms.skill_id = d.skill_slug
WHERE w.slug = 'marketing-plan-builder'
ON CONFLICT DO NOTHING;

-- Sales Plan Builder Workflow
INSERT INTO sales_workflows (name, slug, description, category, is_template, estimated_total_minutes, is_active)
VALUES (
  'Sales Plan Builder',
  'sales-plan-builder',
  'Comprehensive 8-step workflow that builds a complete Q1 sales execution plan. Starts with market research and stakeholder mapping, then develops outreach, discovery, qualification, and proposal strategies.',
  'Sales Operations',
  true,
  240,
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, is_optional, depends_on_step, agent_id)
SELECT w.id, ss.id, d.step_order, false, d.depends_on, d.agent_id
FROM (VALUES
  ('district-buying-cycles', 1, NULL, 'sdr-agent'),
  ('funding-navigation',     2, 1,    'sdr-agent'),
  ('stakeholder-mapping',    3, 2,    'sdr-agent'),
  ('cold-outreach',          4, 3,    'sdr-agent'),
  ('discovery-call',         5, 4,    'sdr-agent'),
  ('needs-assessment',       6, 5,    'crm-specialist'),
  ('proposal-writing',       7, 6,    'proposal-agent'),
  ('roi-calculator',         8, 7,    'proposal-agent')
) AS d(skill_slug, step_order, depends_on, agent_id)
CROSS JOIN sales_workflows w
JOIN sales_skills ss ON ss.skill_id = d.skill_slug
WHERE w.slug = 'sales-plan-builder'
ON CONFLICT DO NOTHING;
