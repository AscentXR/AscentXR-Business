// ============================================================
// Core Types
// ============================================================

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
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
  brand_entity?: 'ascent_xr' | 'learning_time_vr';
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
  schedule_id?: string;
  team_id?: string;
  team_name?: string;
  run_date?: string;
  requires_review?: boolean;
}

// ============================================================
// Agent Teams
// ============================================================

export interface AgentTeam {
  id: string;
  name: string;
  description?: string;
  business_area?: string;
  icon?: string;
  status: 'active' | 'paused' | 'archived';
  daily_schedule_time?: string;
  member_count: number;
  schedule_count: number;
  tasks_today: number;
  tasks_completed: number;
  tasks_review: number;
  tasks_running: number;
  tasks_failed: number;
  members?: AgentTeamMember[];
  created_at: string;
}

export interface AgentTeamMember {
  id: string;
  team_id: string;
  agent_id: string;
  role_in_team: 'lead' | 'member';
  join_order: number;
  agent_name: string;
  agent_description?: string;
  agent_status: string;
  agent_tasks_completed: number;
  agent_current_task?: string;
}

export interface RecurringSchedule {
  id: string;
  agent_id: string;
  team_id: string;
  title: string;
  description?: string;
  prompt: string;
  business_area?: string;
  priority: number;
  schedule_type: 'daily' | 'weekdays' | 'weekly' | 'monthly';
  schedule_days: number[];
  schedule_time: string;
  auto_execute: boolean;
  requires_review: boolean;
  max_retries: number;
  is_active: boolean;
  context_template?: any;
  last_generated_at?: string;
  agent_name?: string;
  team_name?: string;
  created_at: string;
}

export interface DailyTaskRun {
  id: string;
  run_date: string;
  schedule_id: string;
  task_id?: string;
  agent_id: string;
  team_id: string;
  status: 'generated' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
  agent_name?: string;
  team_name?: string;
  schedule_title?: string;
  created_at: string;
}

export interface DailyBriefing {
  date: string;
  stats: {
    total_tasks: number;
    completed: number;
    running: number;
    pending_review: number;
    failed: number;
  };
  pending_reviews: {
    id: string;
    title: string;
    agent_id: string;
    agent_name: string;
    team_id: string;
    team_name: string;
  }[];
  alert_count: number;
  briefing_text: string | null;
  team_summary: {
    team_id: string;
    team_name: string;
    total_tasks: number;
    completed: number;
    pending_review: number;
  }[];
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
// Sales Skills & Workflows
// ============================================================

export interface SalesSkill {
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

export interface SalesWorkflow {
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

export interface SalesWorkflowRun {
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

export interface SalesWorkflowRunDetail extends SalesWorkflowRun {
  steps: SalesWorkflowRunStep[];
}

export interface SalesWorkflowRunStep {
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

// ============================================================
// Skill Execution Calendar
// ============================================================

export interface ExecutionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  business_area: 'marketing' | 'sales';
  team_id?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  revenue_target?: number;
  context?: any;
  created_by?: string;
  total_entries: number;
  completed_entries: number;
  running_entries: number;
  created_at: string;
  updated_at: string;
}

export interface SkillCalendarEntry {
  id: string;
  plan_id: string;
  marketing_skill_id?: string;
  sales_skill_id?: string;
  scheduled_date: string;
  scheduled_time?: string;
  priority: number;
  day_order: number;
  assigned_agent_id?: string;
  assigned_team_id?: string;
  status: 'pending' | 'scheduled' | 'running' | 'completed' | 'failed' | 'skipped';
  task_id?: string;
  result_summary?: string;
  title_override?: string;
  notes?: string;
  week_label?: string;
  phase?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  skill_name?: string;
  skill_slug?: string;
  skill_category?: string;
  skill_duration_minutes?: number;
  skill_description?: string;
  assigned_agent_name?: string;
}

export interface PlanStats {
  total: number;
  pending: number;
  scheduled: number;
  running: number;
  completed: number;
  failed: number;
  skipped: number;
  total_phases: number;
  earliest_date?: string;
  latest_date?: string;
  progress: number;
  phases: {
    phase: string;
    total: number;
    completed: number;
    running: number;
  }[];
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

// ============================================================
// Backups
// ============================================================

export interface BackupInfo {
  filename: string;
  size: number;
  created: string;
  manifest?: {
    version: string;
    timestamp: string;
    label: string;
    createdBy: string;
    tableCount: number;
    totalRows: number;
    tableCounts: Record<string, number>;
    includesFiles: boolean;
  };
}

export interface BackupProgress {
  filename?: string;
  stage: string;
  message: string;
  progress?: number;
  table?: string;
  size?: number;
}

export interface RestoreResult {
  success: boolean;
  tablesRestored: number;
  rowsRestored: number;
  manifest: BackupInfo['manifest'];
}

// ============================================================
// Sales Dashboard
// ============================================================

export interface SalesDashboardOverview {
  totalPipeline: number;
  weightedPipeline: number;
  totalDeals: number;
  avgDealSize: number;
  winRate: number;
  activeDistricts: number;
  avgAdoption: number;
  communicationsLast30: number;
  communicationsTrend: number;
  completedSkills: number;
  totalSkills: number;
}

export interface PipelineStageData {
  stage: string;
  deal_count: number;
  total_value: number;
  avg_value: number;
  avg_probability: number;
  weighted_value: number;
}

export interface DistrictPerformanceRow {
  name: string;
  state: string;
  total_students: number;
  budget_range: string;
  tech_readiness_score: number;
  opportunity_value: number;
  probability: number;
  stage: string;
  relationship_status: string;
  teacher_adoption_rate: number;
}

// ============================================================
// Marketing Dashboard
// ============================================================

export interface MarketingDashboardOverview {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalLeads: number;
  totalConversions: number;
  ctr: number;
  costPerLead: number;
  linkedinImpressions: number;
  linkedinEngagementRate: number;
  publishedPosts: number;
  contentPipeline: Record<string, number>;
  completedSkills: number;
  totalSkills: number;
}

export interface CampaignAnalyticsRow {
  id: string;
  name: string;
  channel: string;
  status: string;
  budget: number;
  spent: number;
  leads_generated: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cost_per_lead: number;
  roas: number;
}

export interface LinkedInTrendPoint {
  week: string;
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  engagement_rate: number;
}
