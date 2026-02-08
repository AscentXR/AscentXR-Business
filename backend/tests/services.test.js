// Mock database connection for all service tests
const mockQuery = jest.fn();
jest.mock('../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

describe('CRM Service', () => {
  const crmService = require('../services/crmService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should get contacts with pagination', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { id: '1', first_name: 'Sarah', last_name: 'Martinez', school_district_name: 'IPS' }
        ]
      })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await crmService.getContacts({ page: 1, limit: 10 });
    expect(result.contacts).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should get contact by id', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', first_name: 'Sarah' }]
    });

    const contact = await crmService.getContactById('1');
    expect(contact.first_name).toBe('Sarah');
  });

  it('should return null for non-existent contact', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const contact = await crmService.getContactById('999');
    expect(contact).toBeNull();
  });

  it('should create a contact', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'new-1', first_name: 'Test', last_name: 'User' }]
    });

    const contact = await crmService.createContact({
      first_name: 'Test',
      last_name: 'User',
      title: 'Teacher',
      email: 'test@school.edu',
      school_district_id: 'd1'
    });
    expect(contact.id).toBe('new-1');
  });

  it('should get companies with relationship data', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', name: 'IPS', contact_count: 2, relationship_status: 'pilot' }]
    });

    const companies = await crmService.getCompanies();
    expect(companies).toHaveLength(1);
    expect(companies[0].relationship_status).toBe('pilot');
  });

  it('should get deals ordered by probability', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: '1', probability: 85, opportunity_value: 90000 },
        { id: '2', probability: 65, opportunity_value: 125000 }
      ]
    });

    const deals = await crmService.getDeals();
    expect(deals).toHaveLength(2);
  });

  it('should get analytics', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total_deals: 5, total_pipeline_value: 1000000 }] })
      .mockResolvedValueOnce({ rows: [{ stage: 'discovery', count: 2 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total_contacts: 10, decision_makers: 4 }] });

    const analytics = await crmService.getAnalytics();
    expect(analytics.pipeline.total_deals).toBe(5);
    expect(analytics.contacts.total_contacts).toBe(10);
  });

  it('should connect to CRM', async () => {
    const conn = await crmService.connect({ username: 'test', password: 'test' });
    expect(conn.connected).toBe(true);
  });
});

describe('LinkedIn Service', () => {
  const linkedinService = require('../services/linkedinService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should schedule a post', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', text: 'Test post', status: 'scheduled' }]
    });

    const post = await linkedinService.schedulePost({
      text: 'Test post',
      scheduledTime: new Date()
    });
    expect(post.status).toBe('scheduled');
  });

  it('should get scheduled posts', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', text: 'Post 1' }, { id: '2', text: 'Post 2' }]
    });

    const posts = await linkedinService.getScheduledPosts();
    expect(posts).toHaveLength(2);
  });

  it('should delete a scheduled post', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const result = await linkedinService.deleteScheduledPost('1');
    expect(result.success).toBe(true);
  });

  it('should return analytics', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ total_impressions: 5000, total_engagements: 300, engagement_rate: 6.0 }]
    });

    const analytics = await linkedinService.getAnalytics();
    expect(analytics.total_impressions).toBe(5000);
  });

  it('should generate auth URL', () => {
    const url = linkedinService.getAuthorizationUrl();
    expect(url).toContain('linkedin.com/oauth');
  });
});

describe('Agent Service', () => {
  const agentService = require('../services/agentService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should get all agents with metrics', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'agent-001', name: 'Content Creator', status: 'active', progress: 85, tasks_completed: 17 },
        { id: 'agent-002', name: 'CRM Agent', status: 'active', progress: 60, tasks_completed: 12 }
      ]
    });

    const result = await agentService.getAgents();
    expect(result.agents).toHaveLength(2);
    expect(result.systemMetrics.activeAgents).toBe(2);
    expect(result.systemMetrics.averageProgress).toBe(72.5);
  });

  it('should update agent status', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'agent-001', status: 'paused' }]
    });

    const result = await agentService.updateAgentStatus('agent-001', { status: 'paused' });
    expect(result.status).toBe('paused');
  });
});

describe('Metrics Service', () => {
  const metricsService = require('../services/metricsService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should compute financial metrics', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total_pipeline: 1000000, weighted_pipeline: 450000, deal_count: 5 }] })
      .mockResolvedValueOnce({ rows: [{ active_revenue: 90000, active_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ churned: 0, total: 5 }] });

    const metrics = await metricsService.getFinancialMetrics();
    expect(metrics.mrr).toBeDefined();
    expect(metrics.arr).toBeDefined();
    expect(metrics.cac).toBeDefined();
    expect(metrics.ltv).toBeDefined();
    expect(metrics.churnRate).toBe(0);
  });

  it('should compute sales metrics', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ stage: 'discovery', count: 2, total_value: 500000, avg_probability: 15 }] })
      .mockResolvedValueOnce({ rows: [{ closing: 1, discovery: 2, total: 5 }] })
      .mockResolvedValueOnce({ rows: [{ id: '1', opportunity_value: 200000 }] });

    const metrics = await metricsService.getSalesMetrics();
    expect(metrics.winRate).toBeDefined();
    expect(metrics.pipelineCoverage).toBeDefined();
    expect(metrics.topDeals).toBeDefined();
  });

  it('should compute engagement metrics', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total_impressions: 5000, engagement_rate: 6.5 }] })
      .mockResolvedValueOnce({ rows: [{ total_communications: 10, emails: 4, calls: 3 }] })
      .mockResolvedValueOnce({ rows: [{ total_agents: 5, active_agents: 3 }] })
      .mockResolvedValueOnce({ rows: [{ active_schools: 1, avg_adoption: 50 }] });

    const metrics = await metricsService.getEngagementMetrics();
    expect(metrics.linkedin).toBeDefined();
    expect(metrics.nps).toBeDefined();
  });

  it('should generate revenue forecast', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: '1', opportunity_value: 100000, probability: 65 },
        { id: '2', opportunity_value: 200000, probability: 30 }
      ]
    });

    const forecast = await metricsService.getRevenueForecast();
    expect(forecast).toHaveLength(12);
    expect(forecast[0].month).toBeDefined();
    expect(forecast[0].projected).toBeGreaterThan(0);
  });
});

describe('Export Service', () => {
  const exportService = require('../services/exportService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should export contacts as JSON', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', first_name: 'Sarah', last_name: 'Martinez' }]
    });

    const result = await exportService.exportData('json', { type: 'contacts' });
    expect(result.data).toHaveLength(1);
    expect(result.format).toBe('json');
  });

  it('should export as CSV', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', name: 'IPS' }]
    });

    const csv = await exportService.exportData('csv', { type: 'schools' });
    expect(csv).toContain('id,name');
    expect(csv).toContain('IPS');
  });

  it('should handle empty export', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await exportService.exportData('json', { type: 'unknown' });
    expect(result.data).toHaveLength(0);
  });
});
