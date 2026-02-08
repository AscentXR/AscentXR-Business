-- Migration 004: Marketing Skills & Workflows
-- Stores 25 professional marketing skills and composable workflow engine

-- Marketing Skills - stores skill definitions from marketingskills repo
CREATE TABLE IF NOT EXISTS marketing_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  applicable_agents TEXT[] DEFAULT '{}',
  edtech_relevance INTEGER DEFAULT 5 CHECK (edtech_relevance >= 1 AND edtech_relevance <= 10),
  estimated_duration_minutes INTEGER DEFAULT 30,
  output_format VARCHAR(100) DEFAULT 'text',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  source_repo VARCHAR(255),
  source_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Workflows - composable workflow templates
CREATE TABLE IF NOT EXISTS marketing_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_template BOOLEAN DEFAULT true,
  estimated_total_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Steps - ordered steps within a workflow
CREATE TABLE IF NOT EXISTS marketing_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES marketing_workflows(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES marketing_skills(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  custom_prompt_override TEXT,
  depends_on_step INTEGER,
  agent_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, step_order)
);

-- Workflow Runs - execution tracking
CREATE TABLE IF NOT EXISTS marketing_workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES marketing_workflows(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}',
  created_by VARCHAR(100),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Run Steps - individual step execution records
CREATE TABLE IF NOT EXISTS marketing_workflow_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES marketing_workflow_runs(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES marketing_workflow_steps(id) ON DELETE CASCADE,
  task_id UUID,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  result_summary TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_marketing_skills_category ON marketing_skills(category);
CREATE INDEX IF NOT EXISTS idx_marketing_skills_active ON marketing_skills(is_active);
CREATE INDEX IF NOT EXISTS idx_marketing_workflow_steps_workflow ON marketing_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_marketing_workflow_runs_status ON marketing_workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_marketing_workflow_run_steps_run ON marketing_workflow_run_steps(run_id);
