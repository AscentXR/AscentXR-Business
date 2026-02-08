-- Ascent XR Control Center - Database Migration 002
-- Adds 21 new tables for complete business control center

-- ============================================================
-- PRODUCTS & SERVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- custom_experience, subscription, professional_services, pilot
  pricing_model VARCHAR(30) NOT NULL, -- one_time, recurring, hourly
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_max NUMERIC(12,2),
  billing_frequency VARCHAR(20), -- monthly, quarterly, annually
  status VARCHAR(20) DEFAULT 'active', -- active, draft, discontinued
  features JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT,
  competitive_advantage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'planned', -- planned, in_progress, released
  priority INTEGER DEFAULT 3,
  target_date DATE,
  released_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FINANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  school_district_id UUID REFERENCES school_districts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES pipeline(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  paid_date DATE,
  payment_method VARCHAR(50),
  notes TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_by VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description VARCHAR(500) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- marketing, software, contractors, travel, office, legal, insurance, training, meals, other
  subcategory VARCHAR(100),
  vendor VARCHAR(255),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url VARCHAR(500),
  is_tax_deductible BOOLEAN DEFAULT false,
  tax_category VARCHAR(50), -- business_expense, r_and_d, home_office, vehicle, meals_entertainment
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, reimbursed
  notes TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  period VARCHAR(10) NOT NULL, -- Q1_2026, Q2_2026, etc. or 2026
  allocated NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, period)
);

-- ============================================================
-- TAXES
-- ============================================================

CREATE TABLE IF NOT EXISTS tax_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- quarterly_estimate, filing_deadline, payment_due, renewal
  due_date DATE NOT NULL,
  amount NUMERIC(12,2),
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, completed, overdue
  entity_type VARCHAR(50), -- llc, s_corp, individual
  state VARCHAR(5), -- IN, OH, IL, MI, federal
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL, -- business_expense, r_and_d, home_office, vehicle, meals_entertainment, equipment
  description VARCHAR(500) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  tax_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  is_r_and_d BOOLEAN DEFAULT false,
  r_and_d_notes TEXT,
  documentation_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending', -- pending, verified, claimed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOALS (OKR)
-- ============================================================

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  goal_type VARCHAR(30) NOT NULL, -- objective, key_result
  business_area VARCHAR(50), -- sales, marketing, finance, product, customer_success, operations
  quarter VARCHAR(10), -- Q1_2026, Q2_2026
  target_value NUMERIC(12,2),
  current_value NUMERIC(12,2) DEFAULT 0,
  unit VARCHAR(30), -- count, currency, percentage, score
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status VARCHAR(20) DEFAULT 'on_track', -- on_track, behind, at_risk, completed
  owner VARCHAR(50),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MARKETING
-- ============================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel VARCHAR(50) NOT NULL, -- linkedin, email, webinar, content, seo, referral
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2) DEFAULT 0,
  spent NUMERIC(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  target_audience TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- linkedin_post, blog, case_study, email, whitepaper, webinar
  content_pillar VARCHAR(100), -- xr_education, student_outcomes, teacher_empowerment, admin_roi, thought_leadership
  scheduled_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'planned', -- planned, draft, review, scheduled, published
  linkedin_post_id UUID REFERENCES linkedin_posts(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  author VARCHAR(50),
  content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER SUCCESS
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  usage_score INTEGER CHECK (usage_score BETWEEN 0 AND 100),
  engagement_score INTEGER CHECK (engagement_score BETWEEN 0 AND 100),
  support_score INTEGER CHECK (support_score BETWEEN 0 AND 100),
  adoption_score INTEGER CHECK (adoption_score BETWEEN 0 AND 100),
  risk_level VARCHAR(20) DEFAULT 'healthy', -- healthy, watch, at_risk, critical
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  renewal_date DATE,
  contract_value NUMERIC(12,2),
  expansion_opportunity BOOLEAN DEFAULT false,
  expansion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE CASCADE,
  milestone_name VARCHAR(255) NOT NULL,
  milestone_order INTEGER NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, skipped
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  subject VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(30) DEFAULT 'open', -- open, in_progress, waiting, resolved, closed
  tier VARCHAR(5) DEFAULT 'L1', -- L1, L2, L3
  sla_response_due TIMESTAMPTZ,
  sla_resolution_due TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  assigned_to VARCHAR(50),
  resolution TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTNERSHIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- reseller, referral, technology, integration
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(30),
  company_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'prospect', -- prospect, active, inactive, churned
  commission_rate NUMERIC(5,2) DEFAULT 0,
  commission_type VARCHAR(20) DEFAULT 'percentage', -- percentage, flat
  agreement_start DATE,
  agreement_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  school_district_id UUID REFERENCES school_districts(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES pipeline(id) ON DELETE SET NULL,
  deal_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, won, lost, paid
  referred_at DATE DEFAULT CURRENT_DATE,
  closed_at DATE,
  paid_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEAM
-- ============================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL, -- human, ai_agent
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  department VARCHAR(50),
  bio TEXT,
  avatar_url VARCHAR(500),
  agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE SET NULL,
  responsibilities TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEGAL & COMPLIANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  school_district_id UUID REFERENCES school_districts(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  contract_type VARCHAR(50) NOT NULL, -- license, service, nda, partnership, vendor
  status VARCHAR(30) DEFAULT 'draft', -- draft, sent, negotiation, signed, active, expired, terminated
  start_date DATE,
  end_date DATE,
  value NUMERIC(12,2),
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 30,
  document_url VARCHAR(500),
  signed_by VARCHAR(200),
  signed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework VARCHAR(50) NOT NULL, -- ferpa, coppa, state_privacy, accessibility, data_security
  requirement VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, compliant, non_compliant, needs_review
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  evidence_url VARCHAR(500),
  evidence_notes TEXT,
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  assigned_to VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRAND
-- ============================================================

CREATE TABLE IF NOT EXISTS brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL, -- logo, color, font, template, guideline, icon
  category VARCHAR(50), -- primary, secondary, accent, heading, body
  value VARCHAR(500), -- hex color, font name, URL, etc.
  description TEXT,
  file_url VARCHAR(500),
  usage_notes TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, deprecated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AGENT TASKS (Execution Engine)
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  business_area VARCHAR(50),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status VARCHAR(30) DEFAULT 'queued', -- queued, running, streaming, review, approved, rejected, failed
  prompt TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  result TEXT,
  result_type VARCHAR(50), -- text, document, data, report
  error TEXT,
  tokens_used INTEGER,
  execution_time_ms INTEGER,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  created_by VARCHAR(50),
  reviewed_by VARCHAR(50),
  reviewed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- renewal_due, health_drop, sla_breach, follow_up_due, tax_deadline, contract_expiring, budget_warning, goal_behind, task_complete, invoice_overdue, low_usage
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title VARCHAR(500) NOT NULL,
  message TEXT,
  section VARCHAR(50) NOT NULL, -- sales, marketing, finance, taxes, customer_success, legal, goals, agents
  action_url VARCHAR(500),
  entity_id UUID,
  entity_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  user_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id);

-- Finance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_district ON invoices(school_district_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);

-- Taxes
CREATE INDEX IF NOT EXISTS idx_tax_events_due_date ON tax_events(due_date);
CREATE INDEX IF NOT EXISTS idx_tax_events_status ON tax_events(status);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_year ON tax_deductions(tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_category ON tax_deductions(category);

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_parent ON goals(parent_id);
CREATE INDEX IF NOT EXISTS idx_goals_area ON goals(business_area);
CREATE INDEX IF NOT EXISTS idx_goals_quarter ON goals(quarter);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);

-- Marketing
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);

-- Customer Success
CREATE INDEX IF NOT EXISTS idx_customer_health_district ON customer_health(school_district_id);
CREATE INDEX IF NOT EXISTS idx_customer_health_risk ON customer_health(risk_level);
CREATE INDEX IF NOT EXISTS idx_customer_health_renewal ON customer_health(renewal_date);
CREATE INDEX IF NOT EXISTS idx_onboarding_district ON onboarding_milestones(school_district_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_district ON support_tickets(school_district_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_sla ON support_tickets(sla_resolution_due);

-- Partnerships
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partner_deals_partner ON partner_deals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_deals_status ON partner_deals(status);

-- Team
CREATE INDEX IF NOT EXISTS idx_team_members_type ON team_members(type);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Legal
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_district ON contracts(school_district_id);
CREATE INDEX IF NOT EXISTS idx_compliance_framework ON compliance_items(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_items(status);

-- Brand
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(asset_type);

-- Agent Tasks
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_area ON agent_tasks(business_area);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created ON agent_tasks(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_section ON notifications(section);
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON notifications(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ============================================================
-- TRIGGERS (auto-update updated_at)
-- ============================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'products', 'product_features', 'invoices', 'expenses', 'budgets',
    'tax_events', 'tax_deductions', 'goals', 'campaigns', 'content_calendar',
    'customer_health', 'onboarding_milestones', 'support_tickets',
    'partners', 'partner_deals', 'team_members', 'contracts', 'compliance_items',
    'brand_assets', 'agent_tasks'
  ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;
