module.exports = {
  createProduct: (overrides = {}) => ({
    id: 'prod-uuid-1', name: 'Custom XR Experience', description: 'Test product',
    category: 'custom_experience', pricing_model: 'one_time', base_price: 25000,
    status: 'active', features: [], ...overrides
  }),
  createInvoice: (overrides = {}) => ({
    id: 'inv-uuid-1', invoice_number: 'INV-202602-001', school_district_id: 'sd-1',
    status: 'draft', issue_date: '2026-02-01', due_date: '2026-03-01',
    subtotal: 25000, tax_rate: 0, tax_amount: 0, total: 25000, paid_amount: 0,
    line_items: [{ description: 'Custom Experience', quantity: 1, unit_price: 25000, total: 25000 }],
    ...overrides
  }),
  createGoal: (overrides = {}) => ({
    id: 'goal-uuid-1', parent_id: null, title: 'Build $300K pipeline',
    goal_type: 'objective', business_area: 'sales', quarter: 'Q1_2026',
    target_value: 300000, current_value: 0, unit: 'currency', progress: 0,
    status: 'on_track', owner: 'jim', ...overrides
  }),
  createKeyResult: (overrides = {}) => ({
    id: 'kr-uuid-1', parent_id: 'goal-uuid-1', title: 'Generate 150 leads',
    goal_type: 'key_result', business_area: 'sales', quarter: 'Q1_2026',
    target_value: 150, current_value: 0, unit: 'count', progress: 0,
    status: 'on_track', ...overrides
  }),
  createHealthScore: (overrides = {}) => ({
    id: 'health-uuid-1', school_district_id: 'sd-1', overall_score: 85,
    usage_score: 80, engagement_score: 90, support_score: 85, adoption_score: 82,
    risk_level: 'healthy', renewal_date: '2026-06-01', contract_value: 10000,
    expansion_opportunity: false, ...overrides
  }),
  createSupportTicket: (overrides = {}) => ({
    id: 'ticket-uuid-1', school_district_id: 'sd-1', subject: 'Login issues',
    description: 'Teachers unable to login', priority: 'high', status: 'open',
    tier: 'L1', assigned_to: 'jim', ...overrides
  }),
  createAgentTask: (overrides = {}) => ({
    id: 'task-uuid-1', agent_id: 'content-creator', title: 'Draft LinkedIn post',
    business_area: 'marketing', priority: 3, status: 'queued',
    prompt: 'Write a LinkedIn post about XR in education',
    context: {}, created_by: 'jim', ...overrides
  }),
  createExpense: (overrides = {}) => ({
    id: 'exp-uuid-1', description: 'LinkedIn Premium', amount: 59.99,
    category: 'marketing', vendor: 'LinkedIn', expense_date: '2026-02-01',
    is_tax_deductible: true, status: 'approved', ...overrides
  }),
  createBudget: (overrides = {}) => ({
    id: 'budget-uuid-1', category: 'marketing', period: 'Q1_2026',
    allocated: 15000, spent: 5000, ...overrides
  }),
  createTaxEvent: (overrides = {}) => ({
    id: 'tax-uuid-1', title: 'Q1 Estimated Tax', event_type: 'quarterly_estimate',
    due_date: '2026-04-15', amount: 5000, status: 'upcoming', state: 'federal', ...overrides
  }),
  createCampaign: (overrides = {}) => ({
    id: 'camp-uuid-1', name: 'Q1 LinkedIn Campaign', channel: 'linkedin',
    status: 'active', budget: 5000, spent: 1000, leads_generated: 25, ...overrides
  }),
  createPartner: (overrides = {}) => ({
    id: 'partner-uuid-1', name: 'EdTech Resellers', type: 'reseller',
    status: 'active', commission_rate: 15, commission_type: 'percentage', ...overrides
  }),
  createContract: (overrides = {}) => ({
    id: 'contract-uuid-1', title: 'IPS District License', contract_type: 'license',
    status: 'signed', start_date: '2026-01-01', end_date: '2026-12-31',
    value: 50000, auto_renew: true, ...overrides
  }),
  createNotification: (overrides = {}) => ({
    id: 'notif-uuid-1', type: 'renewal_due', severity: 'high',
    title: 'Renewal due in 30 days', section: 'customer_success',
    is_read: false, ...overrides
  }),
  createComplianceItem: (overrides = {}) => ({
    id: 'compliance-uuid-1', framework: 'FERPA', requirement: 'Data encryption at rest',
    description: 'All student data must be encrypted', status: 'compliant',
    priority: 'high', evidence_url: null, evidence_notes: null,
    assigned_to: 'jim', ...overrides
  }),
  createContentItem: (overrides = {}) => ({
    id: 'content-uuid-1', title: 'XR in Education Post', content_type: 'linkedin_post',
    content_pillar: 'thought_leadership', scheduled_date: '2026-02-15',
    status: 'planned', campaign_id: 'camp-uuid-1', author: 'jim',
    content: null, notes: null, ...overrides
  }),
  createDeal: (overrides = {}) => ({
    id: 'deal-uuid-1', partner_id: 'partner-uuid-1', school_district_id: 'sd-1',
    pipeline_id: null, deal_value: 25000, commission_amount: 3750,
    status: 'pending', referred_at: '2026-02-01', closed_at: null,
    notes: null, ...overrides
  }),
  createDeduction: (overrides = {}) => ({
    id: 'deduction-uuid-1', expense_id: 'exp-uuid-1', category: 'software',
    description: 'Unity Pro License', amount: 1800, tax_year: 2026,
    is_r_and_d: true, r_and_d_notes: 'XR development tool', documentation_url: null,
    status: 'pending', ...overrides
  }),
};
