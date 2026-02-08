-- Ascent XR CRM Database Schema
-- Based on crm/schema.json

CREATE TABLE IF NOT EXISTS school_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  city VARCHAR(255) NOT NULL,
  total_students INTEGER NOT NULL DEFAULT 0,
  total_schools INTEGER DEFAULT 0,
  budget_range VARCHAR(100),
  free_reduced_lunch_percent NUMERIC(5,2),
  title_i_status BOOLEAN DEFAULT false,
  current_curriculum TEXT,
  technology_inventory TEXT,
  grade_levels VARCHAR(50),
  tech_readiness_score INTEGER CHECK (tech_readiness_score BETWEEN 1 AND 10),
  esser_funding_status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  linkedin_url VARCHAR(500),
  is_primary BOOLEAN DEFAULT false,
  is_decision_maker BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'prospect',
  implementation_status VARCHAR(50) NOT NULL DEFAULT 'discovery',
  start_date DATE,
  renewal_date DATE,
  license_count INTEGER DEFAULT 0,
  teacher_adoption_rate NUMERIC(5,2),
  avg_session_duration NUMERIC(6,2),
  most_used_experiences JSONB DEFAULT '[]'::jsonb,
  monthly_usage_trend JSONB DEFAULT '{}'::jsonb,
  roi_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  follow_up_date DATE,
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_district_id UUID REFERENCES school_districts(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL DEFAULT 'discovery',
  probability INTEGER NOT NULL DEFAULT 10 CHECK (probability BETWEEN 0 AND 100),
  opportunity_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  budget_availability INTEGER NOT NULL DEFAULT 5 CHECK (budget_availability BETWEEN 1 AND 10),
  decision_timeline INTEGER NOT NULL DEFAULT 5 CHECK (decision_timeline BETWEEN 1 AND 10),
  champion_strength INTEGER NOT NULL DEFAULT 5 CHECK (champion_strength BETWEEN 1 AND 10),
  fit_score INTEGER NOT NULL DEFAULT 5 CHECK (fit_score BETWEEN 1 AND 10),
  total_score INTEGER GENERATED ALWAYS AS (budget_availability + decision_timeline + champion_strength + fit_score) STORED,
  next_action VARCHAR(500) NOT NULL,
  next_action_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table for document management
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  mimetype VARCHAR(100),
  size INTEGER,
  category VARCHAR(100) DEFAULT 'uncategorized',
  tags TEXT[] DEFAULT '{}',
  uploaded_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn posts table
CREATE TABLE IF NOT EXISTS linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  scheduled_time TIMESTAMP WITH TIME ZONE,
  published_time TIMESTAMP WITH TIME ZONE,
  visibility VARCHAR(20) DEFAULT 'PUBLIC',
  status VARCHAR(30) DEFAULT 'draft',
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent tracking table
CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_task TEXT,
  capabilities TEXT[] DEFAULT '{}',
  performance JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_school_districts_state ON school_districts(state);
CREATE INDEX IF NOT EXISTS idx_school_districts_name ON school_districts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_district ON contacts(school_district_id);
CREATE INDEX IF NOT EXISTS idx_contacts_decision_maker ON contacts(is_decision_maker);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON relationships(status);
CREATE INDEX IF NOT EXISTS idx_relationships_renewal ON relationships(renewal_date);
CREATE INDEX IF NOT EXISTS idx_communications_district ON communications(school_district_id);
CREATE INDEX IF NOT EXISTS idx_communications_date ON communications(date);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_probability ON pipeline(probability);
CREATE INDEX IF NOT EXISTS idx_pipeline_next_action ON pipeline(next_action_date);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON linkedin_posts(status);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['school_districts', 'contacts', 'relationships', 'communications', 'pipeline', 'documents', 'linkedin_posts', 'agents'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;
