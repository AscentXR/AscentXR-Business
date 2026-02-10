import api from './client';
import type {
  ApiResponse, Product, ProductFeature, Invoice, Expense, Budget,
  Goal, Campaign, ContentCalendarItem, TaxEvent, TaxDeduction,
  CustomerHealth, OnboardingMilestone, SupportTicket,
  Partner, PartnerDeal, TeamMember, Contract, ComplianceItem,
  BrandAsset, AgentTask, Notification, SearchResult,
  Contact, Deal, SchoolDistrict, LinkedInPost, Document, Agent,
  KnowledgeBaseArticle, BusinessActivity, Forecast,
  MarketingSkill, SkillCategory, MarketingWorkflow, MarketingWorkflowDetail,
  WorkflowRun, WorkflowRunDetail,
  SalesSkill, SalesWorkflow, SalesWorkflowRun, SalesWorkflowRunDetail,
  AgentTeam, RecurringSchedule, DailyTaskRun, DailyBriefing,
  BackupInfo, RestoreResult,
  ExecutionPlan, SkillCalendarEntry, PlanStats,
} from '../types';

// Auth
export const auth = {
  logout: () => api.post('/auth/logout'),
  session: () => api.get('/auth/session'),
  syncSession: () => api.post('/auth/session/sync'),
};

// Admin User Management
export const adminUsers = {
  list: () => api.get('/admin/users'),
  create: (data: { email: string; displayName: string; password: string; role: string }) =>
    api.post('/admin/users', data),
  updateRole: (uid: string, role: string) => api.put(`/admin/users/${uid}`, { role }),
  disable: (uid: string) => api.put(`/admin/users/${uid}/disable`),
  enable: (uid: string) => api.put(`/admin/users/${uid}/enable`),
  resetPassword: (uid: string) => api.post(`/admin/users/${uid}/reset-password`),
  delete: (uid: string) => api.delete(`/admin/users/${uid}`),
};

// CRM / Sales
export const crm = {
  getContacts: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<{ contacts: Contact[]; total: number }>>('/crm/contacts', { params }),
  getContact: (id: string) => api.get<ApiResponse<Contact>>(`/crm/contacts/${id}`),
  createContact: (data: Partial<Contact>) => api.post<ApiResponse<Contact>>('/crm/contacts', data),
  updateContact: (id: string, data: Partial<Contact>) => api.put<ApiResponse<Contact>>(`/crm/contacts/${id}`, data),
  getCompanies: () => api.get<ApiResponse<SchoolDistrict[]>>('/crm/companies'),
  getDeals: () => api.get<ApiResponse<Deal[]>>('/crm/deals'),
  getAnalytics: () => api.get('/crm/analytics'),
};

// Products
export const products = {
  list: () => api.get<ApiResponse<Product[]>>('/products'),
  get: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),
  create: (data: Partial<Product>) => api.post<ApiResponse<Product>>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<ApiResponse<Product>>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getFeatures: (productId: string) => api.get<ApiResponse<ProductFeature[]>>(`/products/${productId}/features`),
  createFeature: (productId: string, data: Partial<ProductFeature>) => api.post<ApiResponse<ProductFeature>>(`/products/${productId}/features`, data),
};

// Finance
export const finance = {
  getInvoices: (params?: { status?: string }) => api.get<ApiResponse<Invoice[]>>('/finance/invoices', { params }),
  getInvoice: (id: string) => api.get<ApiResponse<Invoice>>(`/finance/invoices/${id}`),
  createInvoice: (data: Partial<Invoice>) => api.post<ApiResponse<Invoice>>('/finance/invoices', data),
  updateInvoice: (id: string, data: Partial<Invoice>) => api.put<ApiResponse<Invoice>>(`/finance/invoices/${id}`, data),
  getExpenses: (params?: { category?: string }) => api.get<ApiResponse<Expense[]>>('/finance/expenses', { params }),
  createExpense: (data: Partial<Expense>) => api.post<ApiResponse<Expense>>('/finance/expenses', data),
  getBudgets: (params?: { period?: string }) => api.get<ApiResponse<Budget[]>>('/finance/budgets', { params }),
  createBudget: (data: Partial<Budget>) => api.post<ApiResponse<Budget>>('/finance/budgets', data),
  updateBudget: (id: string, data: Partial<Budget>) => api.put<ApiResponse<Budget>>(`/finance/budgets/${id}`, data),
  getSummary: () => api.get('/finance/summary'),
  getDashboardMetrics: () => api.get('/finance/dashboard-metrics'),
  getPnL: (period?: string) => api.get('/finance/pnl', { params: { period } }),
  getRevenueTarget: () => api.get('/finance/revenue-target'),
  getBurnRate: () => api.get('/finance/burn-rate'),
  getRunway: () => api.get('/finance/runway'),
};

// Goals
export const goals = {
  list: (params?: { quarter?: string; business_area?: string }) => api.get<ApiResponse<Goal[]>>('/goals', { params }),
  get: (id: string) => api.get<ApiResponse<Goal>>(`/goals/${id}`),
  create: (data: Partial<Goal>) => api.post<ApiResponse<Goal>>('/goals', data),
  update: (id: string, data: Partial<Goal>) => api.put<ApiResponse<Goal>>(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  getTree: (params?: { quarter?: string }) => api.get<ApiResponse<Goal[]>>('/goals/tree', { params }),
};

// Marketing
export const marketing = {
  getCampaigns: () => api.get<ApiResponse<Campaign[]>>('/marketing/campaigns'),
  createCampaign: (data: Partial<Campaign>) => api.post<ApiResponse<Campaign>>('/marketing/campaigns', data),
  updateCampaign: (id: string, data: Partial<Campaign>) => api.put<ApiResponse<Campaign>>(`/marketing/campaigns/${id}`, data),
  getCalendar: (params?: { start_date?: string; end_date?: string }) => api.get<ApiResponse<ContentCalendarItem[]>>('/marketing/calendar', { params }),
  createCalendarItem: (data: Partial<ContentCalendarItem>) => api.post<ApiResponse<ContentCalendarItem>>('/marketing/calendar', data),
  updateCalendarItem: (id: string, data: Partial<ContentCalendarItem>) => api.put<ApiResponse<ContentCalendarItem>>(`/marketing/calendar/${id}`, data),
};

// Taxes
export const taxes = {
  getEvents: (params?: { status?: string; state?: string }) => api.get<ApiResponse<TaxEvent[]>>('/taxes/events', { params }),
  createEvent: (data: Partial<TaxEvent>) => api.post<ApiResponse<TaxEvent>>('/taxes/events', data),
  updateEvent: (id: string, data: Partial<TaxEvent>) => api.put<ApiResponse<TaxEvent>>(`/taxes/events/${id}`, data),
  getDeductions: (params?: { tax_year?: number; category?: string }) => api.get<ApiResponse<TaxDeduction[]>>('/taxes/deductions', { params }),
  createDeduction: (data: Partial<TaxDeduction>) => api.post<ApiResponse<TaxDeduction>>('/taxes/deductions', data),
  getSummary: (tax_year?: number) => api.get('/taxes/summary', { params: { tax_year } }),
  getDashboardMetrics: () => api.get('/taxes/dashboard-metrics'),
  getStateObligations: () => api.get('/taxes/state-obligations'),
  getEntityComparison: () => api.get('/taxes/entity-comparison'),
};

// Customer Success
export const customerSuccess = {
  getHealthScores: () => api.get<ApiResponse<CustomerHealth[]>>('/customer-success/health'),
  getHealthScore: (id: string) => api.get<ApiResponse<CustomerHealth>>(`/customer-success/health/${id}`),
  updateHealthScore: (id: string, data: Partial<CustomerHealth>) => api.put<ApiResponse<CustomerHealth>>(`/customer-success/health/${id}`, data),
  getOnboarding: (districtId: string) => api.get<ApiResponse<OnboardingMilestone[]>>(`/customer-success/onboarding/${districtId}`),
  updateMilestone: (id: string, data: Partial<OnboardingMilestone>) => api.put<ApiResponse<OnboardingMilestone>>(`/customer-success/onboarding/${id}`, data),
  getTickets: (params?: { status?: string; priority?: string }) => api.get<ApiResponse<SupportTicket[]>>('/customer-success/tickets', { params }),
  createTicket: (data: Partial<SupportTicket>) => api.post<ApiResponse<SupportTicket>>('/customer-success/tickets', data),
  updateTicket: (id: string, data: Partial<SupportTicket>) => api.put<ApiResponse<SupportTicket>>(`/customer-success/tickets/${id}`, data),
  getRenewals: () => api.get('/customer-success/renewals'),
  getChurnPrediction: () => api.get('/customer-success/churn-prediction'),
  getNPSSummary: () => api.get('/customer-success/nps-summary'),
  getCustomerJourney: (districtId: string) => api.get(`/customer-success/journey/${districtId}`),
};

// Partnerships
export const partnerships = {
  list: () => api.get<ApiResponse<Partner[]>>('/partnerships'),
  get: (id: string) => api.get<ApiResponse<Partner>>(`/partnerships/${id}`),
  create: (data: Partial<Partner>) => api.post<ApiResponse<Partner>>('/partnerships', data),
  update: (id: string, data: Partial<Partner>) => api.put<ApiResponse<Partner>>(`/partnerships/${id}`, data),
  getDeals: (partnerId?: string) => api.get<ApiResponse<PartnerDeal[]>>('/partnerships/deals', { params: { partner_id: partnerId } }),
  createDeal: (data: Partial<PartnerDeal>) => api.post<ApiResponse<PartnerDeal>>('/partnerships/deals', data),
};

// Legal
export const legal = {
  getContracts: (params?: { status?: string }) => api.get<ApiResponse<Contract[]>>('/legal/contracts', { params }),
  createContract: (data: Partial<Contract>) => api.post<ApiResponse<Contract>>('/legal/contracts', data),
  updateContract: (id: string, data: Partial<Contract>) => api.put<ApiResponse<Contract>>(`/legal/contracts/${id}`, data),
  getCompliance: (params?: { framework?: string }) => api.get<ApiResponse<ComplianceItem[]>>('/legal/compliance', { params }),
  createComplianceItem: (data: Partial<ComplianceItem>) => api.post<ApiResponse<ComplianceItem>>('/legal/compliance', data),
  updateComplianceItem: (id: string, data: Partial<ComplianceItem>) => api.put<ApiResponse<ComplianceItem>>(`/legal/compliance/${id}`, data),
};

// Team
export const team = {
  list: (params?: { type?: string }) => api.get<ApiResponse<TeamMember[]>>('/team', { params }),
  get: (id: string) => api.get<ApiResponse<TeamMember>>(`/team/${id}`),
  create: (data: Partial<TeamMember>) => api.post<ApiResponse<TeamMember>>('/team', data),
  update: (id: string, data: Partial<TeamMember>) => api.put<ApiResponse<TeamMember>>(`/team/${id}`, data),
};

// Brand
export const brand = {
  list: (params?: { asset_type?: string }) => api.get<ApiResponse<BrandAsset[]>>('/brand', { params }),
  create: (data: Partial<BrandAsset>) => api.post<ApiResponse<BrandAsset>>('/brand', data),
  update: (id: string, data: Partial<BrandAsset>) => api.put<ApiResponse<BrandAsset>>(`/brand/${id}`, data),
  delete: (id: string) => api.delete(`/brand/${id}`),
  getDashboardMetrics: () => api.get('/brand/dashboard-metrics'),
  getConsistencyScore: () => api.get('/brand/consistency-score'),
};

// Agent Teams
export const agentTeams = {
  list: () => api.get<ApiResponse<AgentTeam[]>>('/agent-teams'),
  get: (id: string) => api.get<ApiResponse<AgentTeam>>(`/agent-teams/${id}`),
  getTasks: (id: string, params?: { date?: string; status?: string }) =>
    api.get<ApiResponse<{ tasks: AgentTask[]; total: number }>>(`/agent-teams/${id}/tasks`, { params }),
  getSchedules: (id: string) =>
    api.get<ApiResponse<RecurringSchedule[]>>(`/agent-teams/${id}/schedules`),
  createSchedule: (teamId: string, data: Partial<RecurringSchedule>) =>
    api.post<ApiResponse<RecurringSchedule>>(`/agent-teams/${teamId}/schedules`, data),
  updateSchedule: (id: string, data: Partial<RecurringSchedule>) =>
    api.put<ApiResponse<RecurringSchedule>>(`/agent-teams/schedules/${id}`, data),
  getAllSchedules: (params?: { team_id?: string }) =>
    api.get<ApiResponse<RecurringSchedule[]>>('/agent-teams/schedules', { params }),
  getDailyBriefing: (date?: string) =>
    api.get<ApiResponse<DailyBriefing>>('/agent-teams/daily-briefing', { params: { date } }),
  getDailyRuns: (date?: string) =>
    api.get<ApiResponse<DailyTaskRun[]>>('/agent-teams/daily-runs', { params: { date } }),
  getDailyTasks: (params?: { date?: string; status?: string }) =>
    api.get<ApiResponse<{ tasks: AgentTask[]; total: number; date: string }>>('/agent-teams/daily-tasks', { params }),
  triggerDaily: (date?: string) =>
    api.post<ApiResponse<{ generated: number; skipped: number; errors: number }>>('/agent-teams/trigger-daily', { date }),
};

// Agents
export const agents = {
  list: () => api.get<ApiResponse<{ agents: Agent[]; systemMetrics: any }>>('/agents/progress'),
  get: (id: string) => api.get<ApiResponse<Agent>>(`/agents/${id}`),
  control: (id: string, action: string) => api.post(`/agents/${id}/control`, { action }),
  execute: (data: { agent_id: string; title: string; prompt: string; business_area?: string; context?: any }) =>
    api.post<ApiResponse<AgentTask>>('/agents/execute', data),
  getTasks: (params?: { status?: string; agent_id?: string }) =>
    api.get<ApiResponse<AgentTask[]>>('/agents/tasks', { params }),
  getTask: (id: string) => api.get<ApiResponse<AgentTask>>(`/agents/tasks/${id}`),
  reviewTask: (id: string, action: 'approved' | 'rejected') =>
    api.put<ApiResponse<AgentTask>>(`/agents/tasks/${id}/review`, { action }),
};

// Notifications
export const notifications = {
  list: (params?: { section?: string; is_read?: boolean }) =>
    api.get<ApiResponse<Notification[]>>('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};

// Search
export const search = {
  query: (q: string) => api.get<ApiResponse<SearchResult[]>>('/search', { params: { q } }),
};

// Metrics (existing)
export const metrics = {
  financial: () => api.get('/metrics/financial'),
  sales: () => api.get('/metrics/sales'),
  engagement: () => api.get('/metrics/engagement'),
  forecast: () => api.get('/metrics/forecast'),
  all: () => api.get('/metrics/all'),
};

// LinkedIn (existing)
export const linkedin = {
  getPosts: () => api.get<ApiResponse<LinkedInPost[]>>('/linkedin/posts'),
  schedulePost: (data: { text: string; scheduledTime: string }) => api.post('/linkedin/schedule', data),
  deletePost: (id: string) => api.delete(`/linkedin/posts/${id}`),
};

// Knowledge Base
export const knowledgeBase = {
  getArticles: (params?: { business_area?: string; category?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ articles: KnowledgeBaseArticle[]; total: number }>>('/knowledge-base', { params }),
  getArticle: (id: string) => api.get<ApiResponse<KnowledgeBaseArticle>>(`/knowledge-base/${id}`),
  createArticle: (data: Partial<KnowledgeBaseArticle>) => api.post<ApiResponse<KnowledgeBaseArticle>>('/knowledge-base', data),
  updateArticle: (id: string, data: Partial<KnowledgeBaseArticle>) => api.put<ApiResponse<KnowledgeBaseArticle>>(`/knowledge-base/${id}`, data),
  deleteArticle: (id: string) => api.delete(`/knowledge-base/${id}`),
  search: (q: string) => api.get<ApiResponse<KnowledgeBaseArticle[]>>('/knowledge-base/search', { params: { q } }),
};

// Business Activities
export const businessActivities = {
  getActivities: (params?: { business_area?: string; status?: string; priority?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ activities: BusinessActivity[]; total: number }>>('/business-activities', { params }),
  getActivity: (id: string) => api.get<ApiResponse<BusinessActivity>>(`/business-activities/${id}`),
  createActivity: (data: Partial<BusinessActivity>) => api.post<ApiResponse<BusinessActivity>>('/business-activities', data),
  updateActivity: (id: string, data: Partial<BusinessActivity>) => api.put<ApiResponse<BusinessActivity>>(`/business-activities/${id}`, data),
  deleteActivity: (id: string) => api.delete(`/business-activities/${id}`),
  getOverdue: () => api.get<ApiResponse<BusinessActivity[]>>('/business-activities/overdue'),
  getUpcoming: (days?: number) => api.get<ApiResponse<BusinessActivity[]>>('/business-activities/upcoming', { params: { days } }),
};

// Forecasts
export const forecasts = {
  getForecasts: (params?: { business_area?: string; forecast_type?: string; scenario?: string }) =>
    api.get<ApiResponse<Forecast[]>>('/forecasts', { params }),
  getForecast: (id: string) => api.get<ApiResponse<Forecast>>(`/forecasts/${id}`),
  createForecast: (data: Partial<Forecast>) => api.post<ApiResponse<Forecast>>('/forecasts', data),
  updateForecast: (id: string, data: Partial<Forecast>) => api.put<ApiResponse<Forecast>>(`/forecasts/${id}`, data),
  deleteForecast: (id: string) => api.delete(`/forecasts/${id}`),
  getBurnRate: () => api.get('/forecasts/burn-rate'),
  getRunway: () => api.get('/forecasts/runway'),
  getRevenueTarget: () => api.get('/forecasts/revenue-target'),
};

// Marketing Skills & Workflows
export const marketingSkills = {
  getSkills: (params?: { category?: string; search?: string; agent_id?: string }) =>
    api.get<ApiResponse<{ skills: MarketingSkill[]; total: number }>>('/marketing/skills', { params }),
  getCategories: () => api.get<ApiResponse<SkillCategory[]>>('/marketing/skills/categories'),
  getSkill: (id: string) => api.get<ApiResponse<MarketingSkill>>(`/marketing/skills/${id}`),
  executeSkill: (id: string, context?: any) =>
    api.post<ApiResponse<{ task_id: string; skill: string; agent_id: string }>>(`/marketing/skills/${id}/execute`, { context }),
  getWorkflows: (params?: { category?: string }) =>
    api.get<ApiResponse<MarketingWorkflow[]>>('/marketing/workflows', { params }),
  getWorkflow: (id: string) => api.get<ApiResponse<MarketingWorkflowDetail>>(`/marketing/workflows/${id}`),
  startWorkflowRun: (id: string, data?: { context?: any }) =>
    api.post<ApiResponse<WorkflowRun>>(`/marketing/workflows/${id}/run`, data),
  getWorkflowRuns: (params?: { status?: string }) =>
    api.get<ApiResponse<WorkflowRun[]>>('/marketing/workflow-runs', { params }),
  getWorkflowRun: (id: string) => api.get<ApiResponse<WorkflowRunDetail>>(`/marketing/workflow-runs/${id}`),
  advanceWorkflowRun: (id: string) =>
    api.post<ApiResponse<any>>(`/marketing/workflow-runs/${id}/advance`),
  cancelWorkflowRun: (id: string) =>
    api.post<ApiResponse<WorkflowRun>>(`/marketing/workflow-runs/${id}/cancel`),
};

// Sales Skills & Workflows
export const salesSkills = {
  getSkills: (params?: { category?: string; search?: string; agent_id?: string }) =>
    api.get<ApiResponse<{ skills: SalesSkill[]; total: number }>>('/sales/skills', { params }),
  getCategories: () => api.get<ApiResponse<SkillCategory[]>>('/sales/skills/categories'),
  getSkill: (id: string) => api.get<ApiResponse<SalesSkill>>(`/sales/skills/${id}`),
  executeSkill: (id: string, context?: any) =>
    api.post<ApiResponse<{ task_id: string; skill: string; agent_id: string }>>(`/sales/skills/${id}/execute`, { context }),
  getWorkflows: (params?: { category?: string }) =>
    api.get<ApiResponse<SalesWorkflow[]>>('/sales/workflows', { params }),
  getWorkflow: (id: string) => api.get<ApiResponse<SalesWorkflowRunDetail>>(`/sales/workflows/${id}`),
  startWorkflowRun: (id: string, data?: { context?: any }) =>
    api.post<ApiResponse<SalesWorkflowRun>>(`/sales/workflows/${id}/run`, data),
  getWorkflowRuns: (params?: { status?: string }) =>
    api.get<ApiResponse<SalesWorkflowRun[]>>('/sales/workflow-runs', { params }),
  getWorkflowRun: (id: string) => api.get<ApiResponse<SalesWorkflowRunDetail>>(`/sales/workflow-runs/${id}`),
  advanceWorkflowRun: (id: string) =>
    api.post<ApiResponse<any>>(`/sales/workflow-runs/${id}/advance`),
  cancelWorkflowRun: (id: string) =>
    api.post<ApiResponse<SalesWorkflowRun>>(`/sales/workflow-runs/${id}/cancel`),
};

// Skill Execution Calendar
export const skillCalendar = {
  getPlans: (params?: { business_area?: string; status?: string }) =>
    api.get<ApiResponse<ExecutionPlan[]>>('/skill-calendar/plans', { params }),
  getPlan: (id: string) => api.get<ApiResponse<ExecutionPlan>>(`/skill-calendar/plans/${id}`),
  createPlan: (data: Partial<ExecutionPlan>) => api.post<ApiResponse<ExecutionPlan>>('/skill-calendar/plans', data),
  updatePlan: (id: string, data: Partial<ExecutionPlan>) => api.put<ApiResponse<ExecutionPlan>>(`/skill-calendar/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/skill-calendar/plans/${id}`),
  generatePlan: (data: any) => api.post<ApiResponse<ExecutionPlan>>('/skill-calendar/plans/generate', data),
  getPlanStats: (id: string) => api.get<ApiResponse<PlanStats>>(`/skill-calendar/plans/${id}/stats`),
  getEntries: (params?: { plan_id?: string; status?: string; start_date?: string; end_date?: string }) =>
    api.get<ApiResponse<SkillCalendarEntry[]>>('/skill-calendar/entries', { params }),
  getUpcomingEntries: (days?: number) =>
    api.get<ApiResponse<SkillCalendarEntry[]>>('/skill-calendar/entries/upcoming', { params: { days } }),
  createEntry: (data: Partial<SkillCalendarEntry>) => api.post<ApiResponse<SkillCalendarEntry>>('/skill-calendar/entries', data),
  updateEntry: (id: string, data: Partial<SkillCalendarEntry>) => api.put<ApiResponse<SkillCalendarEntry>>(`/skill-calendar/entries/${id}`, data),
  deleteEntry: (id: string) => api.delete(`/skill-calendar/entries/${id}`),
  executeEntry: (id: string) =>
    api.post<ApiResponse<{ entry_id: string; task_id: string; skill: string; agent_id: string }>>(`/skill-calendar/entries/${id}/execute`),
  completeEntry: (id: string, data?: { resultSummary?: string }) =>
    api.post<ApiResponse<SkillCalendarEntry>>(`/skill-calendar/entries/${id}/complete`, data),
  skipEntry: (id: string) =>
    api.post<ApiResponse<SkillCalendarEntry>>(`/skill-calendar/entries/${id}/skip`),
};

// Admin Backup Management
export const adminBackup = {
  list: () => api.get<ApiResponse<BackupInfo[]>>('/admin/backup'),
  create: (data?: { label?: string; includeFiles?: boolean }) =>
    api.post<ApiResponse<BackupInfo>>('/admin/backup', data),
  getInfo: (filename: string) => api.get<ApiResponse<BackupInfo>>(`/admin/backup/${filename}`),
  download: (filename: string) =>
    api.get(`/admin/backup/${filename}/download`, { responseType: 'blob' }),
  restore: (filename: string) =>
    api.post<ApiResponse<RestoreResult>>(`/admin/backup/${filename}/restore`),
  delete: (filename: string) => api.delete(`/admin/backup/${filename}`),
};

// Sales Dashboard
interface DateRangeParams { start_date?: string; end_date?: string; }

export const salesDashboard = {
  getOverview: (params?: DateRangeParams) => api.get('/sales-dashboard/overview', { params }),
  getPipeline: (params?: DateRangeParams) => api.get('/sales-dashboard/pipeline', { params }),
  getDistricts: () => api.get('/sales-dashboard/districts'),
  getActivity: (params?: DateRangeParams) => api.get('/sales-dashboard/activity', { params }),
  getForecast: () => api.get('/sales-dashboard/forecast'),
  exportCSV: (section: string, params?: DateRangeParams) =>
    api.get(`/sales-dashboard/export/${section}`, { params, responseType: 'blob' }),
};

// Marketing Dashboard
export const marketingDashboard = {
  getOverview: (params?: DateRangeParams) => api.get('/marketing-dashboard/overview', { params }),
  getCampaigns: (params?: DateRangeParams) => api.get('/marketing-dashboard/campaigns', { params }),
  getContent: (params?: DateRangeParams) => api.get('/marketing-dashboard/content', { params }),
  getLinkedIn: (params?: DateRangeParams) => api.get('/marketing-dashboard/linkedin', { params }),
  getForecast: () => api.get('/marketing-dashboard/forecast'),
  exportCSV: (section: string, params?: DateRangeParams) =>
    api.get(`/marketing-dashboard/export/${section}`, { params, responseType: 'blob' }),
};

// Documents (existing)
export const documents = {
  list: (params?: { category?: string; search?: string }) => api.get<ApiResponse<Document[]>>('/documents', { params }),
  get: (id: string) => api.get<ApiResponse<Document>>(`/documents/${id}`),
  getCategories: () => api.get('/documents/categories'),
  delete: (id: string) => api.delete(`/documents/${id}`),
};
