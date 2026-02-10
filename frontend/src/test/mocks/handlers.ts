import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: { username: 'admin', name: 'Admin User', role: 'CEO' },
    });
  }),
  http.post('/api/auth/logout', () => HttpResponse.json({ success: true })),
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      success: true,
      data: { username: 'admin', name: 'Admin User', role: 'CEO' },
    });
  }),

  // Metrics
  http.get('/api/metrics/all', () => {
    return HttpResponse.json({
      success: true,
      data: {
        revenue: 47500,
        pipelineValue: 285000,
        activeDeals: 12,
        activeAgents: 6,
        revenueHistory: [
          { month: 'Jan', value: 35000 },
          { month: 'Feb', value: 47500 },
        ],
      },
    });
  }),

  // Goals
  http.get('/api/goals', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'g1', title: 'Revenue Target', goal_type: 'objective', progress: 50, status: 'on_track', quarter: 'Q1 2026' },
        { id: 'g2', title: 'Close 5 deals', goal_type: 'key_result', parent_id: 'g1', progress: 40, status: 'behind', quarter: 'Q1 2026' },
      ],
    });
  }),
  http.get('/api/goals/tree', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'g1', title: 'Revenue Target', goal_type: 'objective', progress: 50, status: 'on_track', business_area: 'Sales', quarter: 'Q1 2026',
          children: [
            { id: 'g2', title: 'Close 5 deals', goal_type: 'key_result', parent_id: 'g1', progress: 40, status: 'behind', quarter: 'Q1 2026' },
          ],
        },
      ],
    });
  }),

  // CRM
  http.get('/api/crm/contacts', () => {
    return HttpResponse.json({
      success: true,
      data: {
        contacts: [
          { id: 'c1', first_name: 'John', last_name: 'Doe', email: 'john@school.edu', title: 'Principal', school_district_id: 'd1', school_district_name: 'Springfield', is_primary: true, is_decision_maker: true },
          { id: 'c2', first_name: 'Jane', last_name: 'Smith', email: 'jane@school.edu', title: 'Director', school_district_id: 'd1', school_district_name: 'Springfield', is_primary: false, is_decision_maker: false },
        ],
        total: 2,
      },
    });
  }),
  http.get('/api/crm/deals', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'deal1', school_district_name: 'Springfield', stage: 'discovery', probability: 30, opportunity_value: 50000, next_action: 'Follow up', next_action_date: '2026-02-15', total_score: 65 },
        { id: 'deal2', school_district_name: 'Shelbyville', stage: 'proposal', probability: 70, opportunity_value: 75000, next_action: 'Send proposal', next_action_date: '2026-02-20', total_score: 80 },
      ],
    });
  }),

  // Agents
  http.get('/api/agents/progress', () => {
    return HttpResponse.json({
      success: true,
      data: {
        agents: [
          { id: 'a1', name: 'SDR Agent', status: 'active', progress: 75, tasks_completed: 15, total_tasks: 20, capabilities: ['outreach', 'research'], description: 'Sales development' },
          { id: 'a2', name: 'Content Agent', status: 'paused', progress: 50, tasks_completed: 5, total_tasks: 10, capabilities: ['writing'], description: 'Content creation' },
        ],
        systemMetrics: { totalTasks: 30, completedTasks: 20 },
      },
    });
  }),
  http.get('/api/agents/tasks', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 't1', agent_id: 'a1', title: 'Research leads', status: 'running', business_area: 'sales', created_at: '2026-02-01T10:00:00Z', agent_name: 'SDR Agent' },
      ],
    });
  }),
  http.post('/api/agents/execute', () => {
    return HttpResponse.json({
      success: true,
      data: { id: 't2', agent_id: 'a1', title: 'New Task', status: 'queued', created_at: '2026-02-08T10:00:00Z' },
    });
  }),

  // Finance
  http.get('/api/finance/invoices', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'inv1', invoice_number: 'INV-001', status: 'paid', total: 25000, issue_date: '2026-01-15', due_date: '2026-02-15', subtotal: 25000, tax_rate: 0, tax_amount: 0, paid_amount: 25000, line_items: [] },
        { id: 'inv2', invoice_number: 'INV-002', status: 'sent', total: 15000, issue_date: '2026-02-01', due_date: '2026-03-01', subtotal: 15000, tax_rate: 0, tax_amount: 0, paid_amount: 0, line_items: [] },
      ],
    });
  }),
  http.get('/api/finance/expenses', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'exp1', description: 'Software licenses', amount: 2500, category: 'Technology', expense_date: '2026-01-20', is_tax_deductible: true, status: 'approved' },
      ],
    });
  }),
  http.get('/api/finance/budgets', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'b1', category: 'Marketing', period: 'Q1 2026', allocated: 10000, spent: 4000 },
      ],
    });
  }),
  http.get('/api/finance/summary', () => {
    return HttpResponse.json({
      success: true,
      data: { totalRevenue: 47500, totalExpenses: 12000, netIncome: 35500 },
    });
  }),

  // Customer Success
  http.get('/api/customer-success/health', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'h1', school_district_id: 'd1', school_district_name: 'Springfield', overall_score: 85, usage_score: 90, engagement_score: 80, support_score: 85, adoption_score: 85, risk_level: 'healthy', expansion_opportunity: true },
        { id: 'h2', school_district_id: 'd2', school_district_name: 'Shelbyville', overall_score: 45, usage_score: 40, engagement_score: 50, support_score: 40, adoption_score: 50, risk_level: 'at_risk', expansion_opportunity: false },
      ],
    });
  }),
  http.get('/api/customer-success/tickets', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'tk1', subject: 'Login issue', priority: 'high', status: 'open', tier: 'L1', school_district_name: 'Springfield' },
      ],
    });
  }),
  http.get('/api/customer-success/renewals', () => {
    return HttpResponse.json({ success: true, data: [] });
  }),

  // Notifications
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'n1', type: 'alert', severity: 'high', title: 'Deal closing soon', message: 'Springfield deal needs attention', section: 'sales', is_read: false, created_at: '2026-02-07T10:00:00Z' },
        { id: 'n2', type: 'info', severity: 'low', title: 'Weekly report ready', message: 'Your weekly report is ready', section: 'general', is_read: true, created_at: '2026-02-06T10:00:00Z' },
      ],
    });
  }),
  http.get('/api/notifications/unread-count', () => {
    return HttpResponse.json({ success: true, data: { count: 3 } });
  }),
  http.put('/api/notifications/:id/read', () => {
    return HttpResponse.json({ success: true });
  }),
  http.put('/api/notifications/read-all', () => {
    return HttpResponse.json({ success: true });
  }),

  // Search
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    return HttpResponse.json({
      success: true,
      data: {
        results: [
          { section: 'Sales', type: 'contact', id: 'c1', title: `Result for ${q}`, subtitle: 'Contact', url: '/sales' },
        ],
        grouped: { Sales: [{ section: 'Sales', type: 'contact', id: 'c1', title: `Result for ${q}`, subtitle: 'Contact', url: '/sales' }] },
        total: 1,
        query: q,
      },
    });
  }),
];
