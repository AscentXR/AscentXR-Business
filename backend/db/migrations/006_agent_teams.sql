-- ============================================================
-- Migration 006: Agent Teams & Self-Running Task Scheduler
-- Enables autonomous daily task generation and execution
-- ============================================================

-- 1. Agent Teams - Groups agents by business area
CREATE TABLE IF NOT EXISTS agent_teams (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  business_area VARCHAR(50),
  icon VARCHAR(50) DEFAULT 'users',
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  daily_schedule_time TIME DEFAULT '06:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agent Team Members - Links agents to teams
CREATE TABLE IF NOT EXISTS agent_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(50) NOT NULL REFERENCES agent_teams(id) ON DELETE CASCADE,
  agent_id VARCHAR(50) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role_in_team VARCHAR(30) DEFAULT 'member' CHECK (role_in_team IN ('lead', 'member')),
  join_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, agent_id)
);

-- 3. Recurring Task Schedules - Defines auto-generated tasks
CREATE TABLE IF NOT EXISTS recurring_task_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  team_id VARCHAR(50) NOT NULL REFERENCES agent_teams(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  business_area VARCHAR(50),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('daily', 'weekdays', 'weekly', 'monthly')),
  schedule_days INTEGER[] DEFAULT '{}',
  schedule_time TIME DEFAULT '06:00:00',
  auto_execute BOOLEAN DEFAULT true,
  requires_review BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  context_template JSONB DEFAULT '{}',
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Task Runs - Audit trail for each day's executions
CREATE TABLE IF NOT EXISTS daily_task_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL,
  schedule_id UUID NOT NULL REFERENCES recurring_task_schedules(id) ON DELETE CASCADE,
  task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  agent_id VARCHAR(50) REFERENCES agents(id),
  team_id VARCHAR(50) REFERENCES agent_teams(id),
  status VARCHAR(30) DEFAULT 'generated' CHECK (status IN ('generated', 'running', 'completed', 'failed', 'skipped')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (schedule_id, run_date)
);

-- 5. Add columns to existing tables
ALTER TABLE agent_tasks ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES recurring_task_schedules(id);
ALTER TABLE agent_tasks ADD COLUMN IF NOT EXISTS team_id VARCHAR(50) REFERENCES agent_teams(id);
ALTER TABLE agent_tasks ADD COLUMN IF NOT EXISTS run_date DATE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS team_id VARCHAR(50) REFERENCES agent_teams(id);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_agent_team_members_team ON agent_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_team_members_agent ON agent_team_members(agent_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_team ON recurring_task_schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_agent ON recurring_task_schedules(agent_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_active ON recurring_task_schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_daily_task_runs_date ON daily_task_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_daily_task_runs_schedule ON daily_task_runs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_schedule ON agent_tasks(schedule_id) WHERE schedule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_tasks_team ON agent_tasks(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_tasks_run_date ON agent_tasks(run_date) WHERE run_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_team ON agents(team_id) WHERE team_id IS NOT NULL;

-- 7. Auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_agent_teams_updated') THEN
    CREATE TRIGGER trg_agent_teams_updated BEFORE UPDATE ON agent_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_recurring_schedules_updated') THEN
    CREATE TRIGGER trg_recurring_schedules_updated BEFORE UPDATE ON recurring_task_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_daily_task_runs_updated') THEN
    CREATE TRIGGER trg_daily_task_runs_updated BEFORE UPDATE ON daily_task_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================
-- SEED DATA: Teams
-- ============================================================

INSERT INTO agent_teams (id, name, description, business_area, icon, status, daily_schedule_time)
VALUES
  ('marketing-team', 'Marketing Team', 'Content creation, SEO, campaign analytics, and thought leadership', 'marketing', 'megaphone', 'active', '06:00:00'),
  ('sales-team', 'Sales Team', 'Prospecting, pipeline management, proposals, and outreach', 'sales', 'trending-up', 'active', '06:00:00'),
  ('brand-team', 'Brand Team', 'Brand consistency, compliance audits, and brand health monitoring', 'brand', 'palette', 'active', '06:00:00'),
  ('cs-team', 'Customer Success Team', 'Customer health monitoring, onboarding, and renewals', 'customer_success', 'heart', 'active', '06:00:00'),
  ('finance-tax-team', 'Finance & Tax Team', 'Cash management, P&L tracking, tax compliance, and deductions', 'finance', 'dollar-sign', 'active', '06:00:00'),
  ('ops-team', 'Operations Team', 'Daily briefings, business reviews, compliance, and partnerships', 'cross-functional', 'layout-dashboard', 'active', '06:00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA: Team Members (assign all 12 agents to teams)
-- ============================================================

INSERT INTO agent_team_members (team_id, agent_id, role_in_team, join_order)
VALUES
  -- Marketing Team
  ('marketing-team', 'content-creator', 'lead', 1),
  ('marketing-team', 'analytics-agent', 'member', 2),
  -- Sales Team
  ('sales-team', 'sdr-agent', 'lead', 1),
  ('sales-team', 'crm-specialist', 'member', 2),
  ('sales-team', 'proposal-agent', 'member', 3),
  -- Brand Team
  ('brand-team', 'brand-agent', 'lead', 1),
  -- Customer Success Team
  ('cs-team', 'cs-agent', 'lead', 1),
  -- Finance & Tax Team
  ('finance-tax-team', 'financial-controller', 'lead', 1),
  ('finance-tax-team', 'tax-agent', 'member', 2),
  -- Operations Team
  ('ops-team', 'mission-director', 'lead', 1),
  ('ops-team', 'compliance-agent', 'member', 2),
  ('ops-team', 'partner-agent', 'member', 3)
ON CONFLICT (team_id, agent_id) DO NOTHING;

-- Update agents table with team assignments
UPDATE agents SET team_id = 'marketing-team' WHERE id IN ('content-creator', 'analytics-agent');
UPDATE agents SET team_id = 'sales-team' WHERE id IN ('sdr-agent', 'crm-specialist', 'proposal-agent');
UPDATE agents SET team_id = 'brand-team' WHERE id = 'brand-agent';
UPDATE agents SET team_id = 'cs-team' WHERE id = 'cs-agent';
UPDATE agents SET team_id = 'finance-tax-team' WHERE id IN ('financial-controller', 'tax-agent');
UPDATE agents SET team_id = 'ops-team' WHERE id IN ('mission-director', 'compliance-agent', 'partner-agent');

-- ============================================================
-- SEED DATA: Recurring Task Schedules (~30 tasks)
-- ============================================================

-- ---- Marketing Team ----

-- Content Creator: Draft LinkedIn post (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('content-creator', 'marketing-team',
  'Draft LinkedIn Post',
  'Draft a LinkedIn post aligned with the content calendar and brand guidelines',
  'Review our content calendar and brand guidelines, then draft a compelling LinkedIn post for today. The post should target K-12 superintendents in IN, OH, IL, MI and highlight how XR/VR technology transforms classroom learning. Include a strong hook, clear value proposition, and call-to-action. Keep it between 150-300 words. Use our brand voice: professional, innovative, student-outcome-focused.',
  'marketing', 2, 'weekdays', '06:00:00', true, true,
  '{"include": ["content_calendar", "brand_guidelines", "recent_linkedin_posts"]}');

-- Content Creator: Weekly content calendar review (Monday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('content-creator', 'marketing-team',
  'Weekly Content Calendar Review',
  'Review content calendar and suggest topics for the week',
  'Review our content calendar for this week and upcoming gaps. Suggest 5 topic ideas for LinkedIn posts and other content that align with our content pillars: (1) XR/VR Education Innovation, (2) Student Outcomes & ROI, (3) District Digital Transformation, (4) Teacher Empowerment, (5) EdTech Thought Leadership. For each suggestion, provide the topic, target audience angle, and recommended format.',
  'marketing', 3, 'weekly', '{1}', '06:00:00', true, true,
  '{"include": ["content_calendar", "recent_content_performance"]}');

-- Content Creator: Monthly case study outline (1st Wednesday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('content-creator', 'marketing-team',
  'Draft Case Study Outline',
  'Create a case study outline from customer health and usage data',
  'Based on our customer health data, identify the best candidate for a new case study. Draft a case study outline that includes: customer profile, challenge they faced, our XR solution implemented, quantitative results (usage metrics, engagement scores), qualitative feedback, and key takeaways for prospect superintendents. Focus on measurable student outcomes.',
  'marketing', 3, 'monthly', '{1}', '06:00:00', true, true,
  '{"include": ["customer_health_scores", "onboarding_data"]}');

-- Analytics Agent: SEO & marketing performance (Monday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('analytics-agent', 'marketing-team',
  'Weekly Marketing Performance Report',
  'SEO & marketing performance analysis report',
  'Generate a comprehensive weekly marketing performance report covering: LinkedIn post engagement metrics (impressions, clicks, engagement rate), email campaign performance, content calendar execution rate, lead generation metrics, and SEO performance indicators. Compare against previous week and monthly targets. Highlight top-performing content and recommend optimizations.',
  'marketing', 3, 'weekly', '{1}', '06:15:00', true, false,
  '{"include": ["campaign_metrics", "linkedin_analytics"]}');

-- Analytics Agent: Email campaign analysis (Thursday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('analytics-agent', 'marketing-team',
  'Email Campaign Analysis',
  'Analyze email campaign performance and suggest optimizations',
  'Analyze our active email campaigns and outreach sequences. Review open rates, click rates, reply rates, and conversion metrics. Identify which subject lines, messaging approaches, and send times perform best for superintendent outreach. Provide 3-5 specific optimization recommendations with expected impact.',
  'marketing', 3, 'weekly', '{4}', '06:15:00', true, false,
  '{"include": ["campaign_metrics", "outreach_performance"]}');

-- ---- Sales Team ----

-- SDR Agent: Research target districts (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('sdr-agent', 'sales-team',
  'Research New Target Districts',
  'Research 3 new target school districts and draft outreach emails',
  'Research and identify 3 new K-12 school districts in IN, OH, IL, or MI that are strong candidates for XR/VR education technology. For each district provide: district name, location, student count, superintendent name and contact info, technology readiness indicators, recent technology initiatives or grants, and a personalized outreach email draft. Focus on districts with 5,000+ students, demonstrated interest in educational innovation, and available technology budgets.',
  'sales', 2, 'weekdays', '06:00:00', true, true,
  '{"include": ["existing_districts", "pipeline_summary"]}');

-- SDR Agent: Pipeline follow-up check (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('sdr-agent', 'sales-team',
  'Pipeline Follow-up Check',
  'Review pipeline for follow-up opportunities and draft follow-up messages',
  'Review our current sales pipeline and identify deals that need follow-up action today. For each deal needing attention: summarize the current stage, last interaction date, what was discussed, and draft a personalized follow-up email or talking points for a phone call. Prioritize deals by: (1) overdue next actions, (2) high-value opportunities, (3) deals at risk of going cold.',
  'sales', 2, 'weekdays', '06:15:00', true, true,
  '{"include": ["pipeline_deals", "recent_activities"]}');

-- SDR Agent: Lead scoring update (Tuesday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('sdr-agent', 'sales-team',
  'Lead Scoring Update (BANT)',
  'Re-evaluate lead scores using BANT criteria',
  'Review all active leads and prospects in our pipeline using BANT criteria (Budget, Authority, Need, Timeline). For each prospect: assess current BANT score based on available data, flag any score changes since last evaluation, identify gaps in our knowledge that need to be filled, and recommend specific actions to advance qualification. Provide an updated priority ranking of our top 10 prospects.',
  'sales', 3, 'weekly', '{2}', '06:00:00', true, true,
  '{"include": ["pipeline_deals", "contact_data"]}');

-- CRM Specialist: Pipeline status update (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('crm-specialist', 'sales-team',
  'Pipeline Status Update',
  'Daily pipeline status with next action recommendations',
  'Generate a pipeline status report covering: total pipeline value, deals by stage, deals with overdue next actions, deals advancing or stalling, and recommended next actions for each active deal. Include a brief risk assessment for any deals that have been in the same stage for more than 2 weeks. Format as an actionable daily brief for the sales team.',
  'sales', 2, 'weekdays', '06:30:00', true, false,
  '{"include": ["pipeline_deals", "deal_activities"]}');

-- CRM Specialist: Data quality audit (Wednesday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('crm-specialist', 'sales-team',
  'CRM Data Quality Audit',
  'Audit CRM data for completeness and accuracy',
  'Audit our CRM data quality across all contacts, districts, and deals. Check for: missing contact information (email, phone, title), districts without assigned contacts, deals missing next action dates, stale data (no updates in 30+ days), duplicate records, and incomplete BANT scoring. Provide a data quality score and specific items that need correction.',
  'sales', 4, 'weekly', '{3}', '06:30:00', true, false,
  '{"include": ["contact_data", "pipeline_deals", "districts"]}');

-- Proposal Agent: Template review (Friday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('proposal-agent', 'sales-team',
  'Proposal Template Review',
  'Review proposal templates against win/loss data',
  'Review our proposal templates and recent win/loss outcomes. Analyze: which proposal sections correlate with wins, common objections that led to losses, pricing presentation effectiveness, ROI calculator accuracy vs actual results, and competitive positioning. Provide specific recommendations to improve our proposal win rate, including suggested template modifications and new proof points to include.',
  'sales', 4, 'weekly', '{5}', '06:00:00', true, true,
  '{"include": ["recent_proposals", "deal_outcomes"]}');

-- ---- Brand Team ----

-- Brand Agent: Review draft content (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('brand-agent', 'brand-team',
  'Brand Compliance Review',
  'Review recent draft content for brand compliance',
  'Review any content drafts created in the last 24 hours for brand compliance. Check against our brand guidelines: voice and tone consistency (professional, innovative, student-focused), visual identity compliance, messaging alignment with our core value propositions, proper use of company name and product terminology, and compliance with K-12 education sector communication standards. Flag any issues and provide specific correction suggestions.',
  'brand', 3, 'weekdays', '07:00:00', true, false,
  '{"include": ["recent_content_drafts", "brand_guidelines"]}');

-- Brand Agent: Weekly consistency audit (Monday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('brand-agent', 'brand-team',
  'Brand Consistency Audit',
  'Audit brand consistency across recent content and communications',
  'Conduct a weekly brand consistency audit across all content produced last week. Evaluate: messaging consistency across channels, visual brand element usage, tone of voice alignment, competitive differentiation clarity, and overall brand health score. Provide a brand consistency score (0-100) and highlight the top 3 areas for improvement.',
  'brand', 3, 'weekly', '{1}', '07:00:00', true, false,
  '{"include": ["recent_content", "brand_assets"]}');

-- Brand Agent: Monthly brand health report (1st)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('brand-agent', 'brand-team',
  'Monthly Brand Health Report',
  'Comprehensive monthly brand health assessment',
  'Generate a comprehensive monthly brand health report covering: brand consistency score trends, content quality analysis, messaging effectiveness, brand awareness indicators, competitive positioning assessment, and brand asset utilization. Include month-over-month comparisons and actionable recommendations for the upcoming month. Focus on how our brand perception aligns with our target of being the leading XR education platform for K-12.',
  'brand', 3, 'monthly', '{1}', '07:00:00', true, true,
  '{"include": ["brand_metrics", "content_performance", "brand_assets"]}');

-- ---- Customer Success Team ----

-- CS Agent: Customer health monitor (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('cs-agent', 'cs-team',
  'Customer Health Monitor',
  'Monitor customer health scores and flag at-risk districts',
  'Review all customer health scores and flag any districts showing concerning trends. For each flagged district: identify the specific health score components declining (usage, engagement, support, adoption), analyze root causes, and recommend intervention actions. Prioritize by: (1) upcoming renewals within 90 days, (2) rapid score declines, (3) high contract value accounts. Include a summary of overall portfolio health.',
  'customer_success', 2, 'weekdays', '06:00:00', true, true,
  '{"include": ["health_scores", "renewal_pipeline"]}');

-- CS Agent: Onboarding progress review (Tuesday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('cs-agent', 'cs-team',
  'Onboarding Progress Review',
  'Review onboarding milestones for active implementations',
  'Review all active customer onboarding programs. For each district in onboarding: assess milestone completion progress, identify blockers or delays, evaluate time-to-value metrics, and recommend actions to accelerate adoption. Flag any onboardings that are behind schedule with specific catch-up recommendations.',
  'customer_success', 3, 'weekly', '{2}', '06:00:00', true, true,
  '{"include": ["onboarding_milestones", "health_scores"]}');

-- CS Agent: Renewal pipeline review (Thursday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('cs-agent', 'cs-team',
  'Renewal Pipeline Review',
  '90-day renewal lookahead with risk assessment',
  'Review all customer renewals coming up in the next 90 days. For each upcoming renewal: assess renewal likelihood based on health score, usage trends, support history, and relationship strength. Categorize as: likely to renew, at risk, or likely to churn. For at-risk accounts, provide a detailed save plan with specific actions, timeline, and responsible parties. Calculate total ARR at risk.',
  'customer_success', 2, 'weekly', '{4}', '06:00:00', true, true,
  '{"include": ["renewal_pipeline", "health_scores", "support_tickets"]}');

-- ---- Finance & Tax Team ----

-- Financial Controller: Cash position & expense review (Weekdays)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('financial-controller', 'finance-tax-team',
  'Daily Cash Position Review',
  'Cash position and expense monitoring',
  'Generate a daily financial snapshot: current cash position, recent expenses by category, outstanding invoices (sent and overdue), expected incoming payments, and burn rate status. Flag any unusual expenses or budget overruns. Include a 30-day cash flow forecast based on known commitments and expected revenue.',
  'finance', 2, 'weekdays', '06:00:00', true, false,
  '{"include": ["cash_position", "recent_expenses", "outstanding_invoices"]}');

-- Financial Controller: Weekly P&L summary (Monday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('financial-controller', 'finance-tax-team',
  'Weekly P&L Summary',
  'Profit & Loss summary vs budget',
  'Generate a weekly P&L summary comparing actuals vs budget. Include: revenue breakdown by source, expense breakdown by category, gross margin analysis, operating expenses trend, net income/loss, and variance analysis for any line items exceeding 10% budget deviation. Provide a brief narrative explaining the week''s financial performance and any concerns for the $300K revenue target.',
  'finance', 2, 'weekly', '{1}', '06:00:00', true, true,
  '{"include": ["pnl_data", "budget_data", "revenue_target"]}');

-- Financial Controller: Monthly financial health (1st)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('financial-controller', 'finance-tax-team',
  'Monthly Financial Health Report',
  'Comprehensive monthly financial health assessment',
  'Generate a comprehensive monthly financial health report covering: revenue vs target ($300K by June 2026), expense analysis by category, burn rate and runway, cash flow statement, key financial ratios, budget vs actuals by department, and financial risk assessment. Include month-over-month trends and a 3-month forward projection. Highlight any financial decisions needed.',
  'finance', 2, 'monthly', '{1}', '06:00:00', true, true,
  '{"include": ["pnl_data", "budget_data", "burn_rate", "runway", "revenue_target"]}');

-- Tax Agent: Tax compliance check (Wednesday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('tax-agent', 'finance-tax-team',
  'Tax Compliance Check',
  '30-day tax compliance lookahead',
  'Review all tax obligations and deadlines in the next 30 days. Check: federal tax filings, state tax obligations (IN, OH, IL, MI), estimated quarterly payments, R&D tax credit documentation status, sales tax compliance, and any regulatory changes affecting our obligations. Flag any upcoming deadlines with required actions and responsible parties.',
  'taxes', 2, 'weekly', '{3}', '06:00:00', true, true,
  '{"include": ["tax_events", "tax_deductions", "state_obligations"]}');

-- Tax Agent: Monthly deduction tracker (15th)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('tax-agent', 'finance-tax-team',
  'Monthly Deduction Tracker',
  'Update and review tax deductions and R&D credits',
  'Review and update our tax deduction tracker for the current month. Include: new eligible expenses identified, R&D tax credit qualifying activities (XR/VR development, educational content creation, platform engineering), state-specific deduction opportunities, total YTD deductions by category, and estimated tax savings. Flag any deductions that need supporting documentation.',
  'taxes', 3, 'monthly', '{15}', '06:00:00', true, true,
  '{"include": ["tax_deductions", "recent_expenses", "r_and_d_activities"]}');

-- ---- Operations Team ----

-- Mission Director: Morning briefing (Daily)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_time, auto_execute, requires_review, context_template)
VALUES ('mission-director', 'ops-team',
  'Morning Briefing for Jim and Nick',
  'Daily morning operational briefing',
  'Generate a concise morning briefing for Jim and Nick covering: (1) Yesterday''s key accomplishments across all teams, (2) Today''s scheduled tasks and priorities, (3) Revenue target progress ($300K by June 2026 - current status and trajectory), (4) Active alerts and items requiring attention, (5) Key metrics snapshot (pipeline value, active deals, customer health), (6) Any blocked items or decisions needed. Keep it actionable and under 500 words. Start with the most important items.',
  'cross-functional', 1, 'daily', '06:30:00', true, false,
  '{"include": ["revenue_target", "pipeline_summary", "active_alerts", "yesterday_tasks", "today_schedules", "health_scores"]}');

-- Mission Director: Weekly business review (Friday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('mission-director', 'ops-team',
  'Weekly Business Review',
  'Comprehensive weekly review across all business areas',
  'Generate a comprehensive weekly business review covering all areas: Sales (pipeline health, new leads, deals progressed), Marketing (content published, engagement metrics, campaign performance), Customer Success (health score trends, onboarding progress, at-risk accounts), Finance (weekly P&L, cash position, burn rate), Operations (task completion rates, agent performance, system health). Include OKR progress assessment against Q1 2026 targets and specific recommendations for the upcoming week.',
  'cross-functional', 2, 'weekly', '{5}', '06:00:00', true, true,
  '{"include": ["revenue_target", "pipeline_summary", "campaign_metrics", "health_scores", "pnl_data", "okr_progress"]}');

-- Mission Director: Monthly OKR progress (last business day)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('mission-director', 'ops-team',
  'Monthly OKR Progress Report',
  'OKR progress assessment with trajectory analysis',
  'Generate a monthly OKR progress report for all objectives and key results. For each OKR: current progress vs target, trajectory analysis (on track, behind, at risk), key contributing factors, blockers, and recommended adjustments. Include a $300K revenue target deep dive with scenario analysis (conservative, baseline, optimistic). Provide strategic recommendations for the upcoming month and flag any OKRs that need goal revision.',
  'cross-functional', 2, 'monthly', '{28}', '06:00:00', true, true,
  '{"include": ["okr_progress", "revenue_target", "pipeline_summary", "financial_metrics"]}');

-- Compliance Agent: Weekly compliance check (Monday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('compliance-agent', 'ops-team',
  'Compliance & Data Quality Check',
  'FERPA, COPPA, and data quality compliance review',
  'Conduct a compliance review covering: FERPA compliance status for all student data handling, COPPA compliance for any features targeting students under 13, state privacy law compliance (IN, OH, IL, MI), data quality metrics across our systems, accessibility compliance status (WCAG 2.1), and any regulatory changes in EdTech that may affect us. Flag any compliance gaps with severity and recommended remediation actions.',
  'legal', 3, 'weekly', '{1}', '06:00:00', true, true,
  '{"include": ["compliance_items", "data_quality_metrics"]}');

-- Compliance Agent: Monthly system health (1st)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('compliance-agent', 'ops-team',
  'Monthly System Health Report',
  'System reliability, security, and compliance assessment',
  'Generate a monthly system health report covering: overall compliance posture (FERPA, COPPA, SOC 2 readiness), security assessment summary, data handling practices review, incident log (if any), system uptime and reliability metrics, pending compliance items and their status, and recommendations for security and compliance improvements. Include a compliance readiness score.',
  'legal', 3, 'monthly', '{1}', '06:00:00', true, true,
  '{"include": ["compliance_items", "system_metrics"]}');

-- Partner Agent: Partnership pipeline review (Wednesday)
INSERT INTO recurring_task_schedules (agent_id, team_id, title, description, prompt, business_area, priority, schedule_type, schedule_days, schedule_time, auto_execute, requires_review, context_template)
VALUES ('partner-agent', 'ops-team',
  'Partnership Pipeline Review',
  'Review partnership opportunities and active partner relationships',
  'Review our partnership pipeline and active partner relationships. Cover: active partner performance (referral rates, commission tracking, deal attribution), pipeline of potential new partners (resellers, referral partners, technology integrations), partner satisfaction and engagement levels, upcoming partner-related activities or deadlines, and recommendations for partnership program improvements. Identify any new partnership opportunities in the K-12 EdTech ecosystem.',
  'partnerships', 3, 'weekly', '{3}', '06:00:00', true, true,
  '{"include": ["partner_data", "partner_deals"]}');

-- ============================================================
-- SEED DATA: Campaigns for the Immersive Learning Initiative
-- ============================================================

INSERT INTO campaigns (name, description, channel, status, budget, spent, leads_generated, conversions, impressions, clicks)
VALUES
  ('LinkedIn Thought Leadership', 'Ongoing LinkedIn content program targeting K-12 superintendents with XR/VR education thought leadership', 'linkedin', 'active', 5000, 1200, 45, 8, 25000, 1500),
  ('Superintendent Email Outreach', '4-week personalized email cadence for superintendent prospects in IN, OH, IL, MI', 'email', 'active', 2000, 500, 22, 3, 0, 0),
  ('ROI & Case Study Content', 'Monthly case studies and ROI analyses showcasing XR education outcomes', 'content', 'active', 3000, 800, 15, 2, 12000, 800),
  ('Webinar & Demo Pipeline', 'Quarterly webinar series and demo pipeline for qualified superintendent leads', 'events', 'draft', 5000, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;
