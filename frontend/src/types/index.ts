// ============================================================
// Core Types
// ============================================================

export interface User {
  username: string;
  name: string;
  role: 'CEO' | 'CTO';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// ============================================================
// CRM / Sales
// ============================================================

export interface SchoolDistrict {
  id: string;
  name: string;
  state: string;
  city: string;
  total_students: number;
  total_schools: number;
  budget_range: string;
  tech_readiness_score: number;
  contact_count?: number;
  relationship_status?: string;
  pipeline_stage?: string;
  opportunity_value?: number;
}

export interface Contact {
  id: string;
  school_district_id: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  is_primary: boolean;
  is_decision_maker: boolean;
  notes?: string;
  school_district_name?: string;
}

export interface Deal {
  id: string;
  school_district_id: string;
  school_district_name: string;
  stage: string;
  probability: number;
  opportunity_value: number;
  next_action: string;
  next_action_date: string;
  total_score: number;
}

// ============================================================
// Products
// ============================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'custom_experience' | 'subscription' | 'professional_services' | 'pilot';
  pricing_model: 'one_time' | 'recurring' | 'hourly';
  base_price: number;
  price_max?: number;
  billing_frequency?: string;
  status: 'active' | 'draft' | 'discontinued';
  features: any[];
  target_audience?: string;
}

export interface ProductFeature {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'released';
  priority: number;
  target_date?: string;
}

// ============================================================
// Finance
// ============================================================

export interface Invoice {
  id: string;
  invoice_number: string;
  school_district_id?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  line_items: InvoiceLineItem[];
  school_district_name?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  vendor?: string;
  expense_date: string;
  is_tax_deductible: boolean;
  status: 'pending' | 'approved' | 'reimbursed';
}

export interface Budget {
  id: string;
  category: string;
  period: string;
  allocated: number;
  spent: number;
}

// ============================================================
// Taxes
// ============================================================

export interface TaxEvent {
  id: string;
  title: string;
  event_type: string;
  due_date: string;
  amount?: number;
  status: 'upcoming' | 'completed' | 'overdue';
  state?: string;
}

export interface TaxDeduction {
  id: string;
  category: string;
  description: string;
  amount: number;
  tax_year: number;
  is_r_and_d: boolean;
  status: 'pending' | 'verified' | 'claimed';
}

// ============================================================
// Goals (OKR)
// ============================================================

export interface Goal {
  id: string;
  parent_id?: string;
  title: string;
  description?: string;
  goal_type: 'objective' | 'key_result';
  business_area?: string;
  quarter?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  progress: number;
  status: 'on_track' | 'behind' | 'at_risk' | 'completed';
  owner?: string;
  due_date?: string;
  children?: Goal[];
}

// ============================================================
// Marketing
// ============================================================

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  channel: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  budget: number;
  spent: number;
  leads_generated: number;
  conversions: number;
  impressions: number;
  clicks: number;
}

export interface ContentCalendarItem {
  id: string;
  title: string;
  content_type: string;
  content_pillar?: string;
  scheduled_date: string;
  status: 'planned' | 'draft' | 'review' | 'scheduled' | 'published';
  author?: string;
  content?: string;
}

// ============================================================
// Customer Success
// ============================================================

export interface CustomerHealth {
  id: string;
  school_district_id: string;
  overall_score: number;
  usage_score: number;
  engagement_score: number;
  support_score: number;
  adoption_score: number;
  risk_level: 'healthy' | 'watch' | 'at_risk' | 'critical';
  renewal_date?: string;
  contract_value?: number;
  expansion_opportunity: boolean;
  school_district_name?: string;
}

export interface OnboardingMilestone {
  id: string;
  school_district_id: string;
  milestone_name: string;
  milestone_order: number;
  description?: string;
  due_date?: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface SupportTicket {
  id: string;
  school_district_id?: string;
  contact_id?: string;
  subject: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  tier: 'L1' | 'L2' | 'L3';
  sla_response_due?: string;
  sla_resolution_due?: string;
  assigned_to?: string;
  school_district_name?: string;
}

// ============================================================
// Partnerships
// ============================================================

export interface Partner {
  id: string;
  name: string;
  type: 'reseller' | 'referral' | 'technology' | 'integration';
  contact_name?: string;
  contact_email?: string;
  status: 'prospect' | 'active' | 'inactive' | 'churned';
  commission_rate: number;
  commission_type: 'percentage' | 'flat';
}

export interface PartnerDeal {
  id: string;
  partner_id: string;
  school_district_id?: string;
  deal_value: number;
  commission_amount: number;
  status: 'pending' | 'won' | 'lost' | 'paid';
  partner_name?: string;
}

// ============================================================
// Team
// ============================================================

export interface TeamMember {
  id: string;
  name: string;
  type: 'human' | 'ai_agent';
  role: string;
  email?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  agent_id?: string;
  responsibilities: string[];
  status: 'active' | 'inactive';
}

// ============================================================
// Legal
// ============================================================

export interface Contract {
  id: string;
  title: string;
  school_district_id?: string;
  contract_type: string;
  status: string;
  start_date?: string;
  end_date?: string;
  value?: number;
  auto_renew: boolean;
}

export interface ComplianceItem {
  id: string;
  framework: string;
  requirement: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'compliant' | 'non_compliant' | 'needs_review';
  priority: string;
  evidence_url?: string;
  assigned_to?: string;
}

// ============================================================
// Brand
// ============================================================

export interface BrandAsset {
  id: string;
  name: string;
  asset_type: 'logo' | 'color' | 'font' | 'template' | 'guideline' | 'icon';
  category?: string;
  value?: string;
  description?: string;
  file_url?: string;
  usage_notes?: string;
}

// ============================================================
// Agents
// ============================================================

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'stopped';
  progress: number;
  tasks_completed: number;
  total_tasks: number;
  current_task?: string;
  capabilities: string[];
}

export interface AgentTask {
  id: string;
  agent_id: string;
  title: string;
  description?: string;
  business_area?: string;
  priority: number;
  status: 'queued' | 'running' | 'streaming' | 'review' | 'approved' | 'rejected' | 'failed';
  prompt?: string;
  context?: any;
  result?: string;
  result_type?: string;
  error?: string;
  tokens_used?: number;
  execution_time_ms?: number;
  created_by?: string;
  created_at: string;
  agent_name?: string;
  current_task?: string;
}

// ============================================================
// Notifications
// ============================================================

export interface Notification {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message?: string;
  section: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// Search
// ============================================================

export interface SearchResult {
  section: string;
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

// ============================================================
// LinkedIn (existing)
// ============================================================

export interface LinkedInPost {
  id: string;
  text: string;
  media_urls: string[];
  scheduled_time?: string;
  published_time?: string;
  status: string;
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
}

// ============================================================
// Knowledge Base
// ============================================================

export interface KnowledgeBaseArticle {
  id: string;
  business_area: string;
  category: string;
  title: string;
  summary?: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  priority: number;
  author?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Business Activities
// ============================================================

export interface BusinessActivity {
  id: string;
  business_area: string;
  title: string;
  description?: string;
  priority: 'asap' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  assigned_to?: string;
  recurrence?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Forecasts
// ============================================================

export interface Forecast {
  id: string;
  business_area: string;
  forecast_type: string;
  period: string;
  metric?: string;
  projected_value?: number;
  actual_value?: number;
  confidence: 'high' | 'medium' | 'low';
  scenario: 'conservative' | 'baseline' | 'optimistic';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BurnRateData {
  monthly_burn: number;
  last_month: number;
  max_monthly: number;
  min_monthly: number;
}

export interface RunwayData {
  cash_on_hand: number;
  monthly_burn: number;
  months_remaining: number;
}

export interface RevenueTarget {
  target: number;
  current: number;
  percentage: number;
  remaining: number;
  weighted_pipeline: number;
  projected: number;
}

export interface PnLSummary {
  revenue: number;
  expenses: number;
  net_income: number;
  margin: number;
  expense_breakdown: { category: string; total: number }[];
  period: string;
}

export interface TaxDashboardMetrics {
  upcoming_deadlines: number;
  total_deductions: number;
  r_and_d_credits: number;
  estimated_liability: number;
  estimated_savings: number;
}

export interface EntityComparison {
  entity_type: string;
  tax_treatment: string;
  self_employment_tax: string;
  liability_protection: string;
  complexity: string;
  annual_cost: string;
  recommended_when: string;
}

export interface BrandDashboardMetrics {
  total_assets: number;
  active_assets: number;
  asset_types: number;
  consistency_score: number;
  coverage_by_type: { asset_type: string; count: number }[];
}

// ============================================================
// Marketing Skills & Workflows
// ============================================================

export interface MarketingSkill {
  id: string;
  skill_id: string;
  name: string;
  category: string;
  description?: string;
  content: string;
  applicable_agents: string[];
  edtech_relevance: number;
  estimated_duration_minutes: number;
  output_format: string;
  tags: string[];
  is_active: boolean;
  source_repo?: string;
  source_version?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillCategory {
  category: string;
  count: number;
}

export interface MarketingWorkflow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  is_template: boolean;
  estimated_total_minutes: number;
  is_active: boolean;
  step_count: number;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  skill_id: string;
  step_order: number;
  is_optional: boolean;
  custom_prompt_override?: string;
  depends_on_step?: number;
  agent_id?: string;
  skill_slug: string;
  skill_name: string;
  skill_category: string;
  skill_duration: number;
  skill_description?: string;
}

export interface MarketingWorkflowDetail extends MarketingWorkflow {
  steps: WorkflowStep[];
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  workflow_name: string;
  workflow_slug: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  total_steps: number;
  context: any;
  created_by?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface WorkflowRunStep {
  id: string;
  run_id: string;
  step_id: string;
  task_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result_summary?: string;
  step_order: number;
  skill_name: string;
  skill_slug: string;
  skill_category: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowRunDetail extends WorkflowRun {
  steps: WorkflowRunStep[];
}

// ============================================================
// Documents (existing)
// ============================================================

export interface Document {
  id: string;
  title: string;
  description?: string;
  filename: string;
  original_name?: string;
  mimetype?: string;
  size?: number;
  category: string;
  tags: string[];
  uploaded_by?: string;
  created_at: string;
}
