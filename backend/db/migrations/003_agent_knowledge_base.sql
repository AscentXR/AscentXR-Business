-- Migration 003: Agent Knowledge Base, Business Activities, and Forecasts
-- Adds three shared tables used across all 6 business area agents

-- ============================================================
-- Knowledge Base Articles
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_area VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  author VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_business_area ON knowledge_base_articles(business_area);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON knowledge_base_articles(category);
CREATE INDEX IF NOT EXISTS idx_kb_articles_pinned ON knowledge_base_articles(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_kb_articles_tags ON knowledge_base_articles USING GIN(tags);

-- ============================================================
-- Business Activities (ASAP action items with timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS business_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_area VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('asap', 'high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  assigned_to VARCHAR(100),
  recurrence VARCHAR(50),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_biz_activities_business_area ON business_activities(business_area);
CREATE INDEX IF NOT EXISTS idx_biz_activities_status ON business_activities(status);
CREATE INDEX IF NOT EXISTS idx_biz_activities_priority ON business_activities(priority);
CREATE INDEX IF NOT EXISTS idx_biz_activities_due_date ON business_activities(due_date);

-- ============================================================
-- Forecasts (Projections and scenario data)
-- ============================================================
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_area VARCHAR(50) NOT NULL,
  forecast_type VARCHAR(100) NOT NULL,
  period VARCHAR(20) NOT NULL,
  metric VARCHAR(200),
  projected_value NUMERIC(15,2),
  actual_value NUMERIC(15,2),
  confidence VARCHAR(20) DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  scenario VARCHAR(30) DEFAULT 'baseline' CHECK (scenario IN ('conservative', 'baseline', 'optimistic')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forecasts_business_area ON forecasts(business_area);
CREATE INDEX IF NOT EXISTS idx_forecasts_type ON forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_forecasts_period ON forecasts(period);
CREATE INDEX IF NOT EXISTS idx_forecasts_scenario ON forecasts(scenario);

-- ============================================================
-- Enhance customer_health table
-- ============================================================
ALTER TABLE customer_health ADD COLUMN IF NOT EXISTS nps_score INTEGER;
ALTER TABLE customer_health ADD COLUMN IF NOT EXISTS churn_risk_score NUMERIC(5,2);
