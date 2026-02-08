const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createHealthScore, createSupportTicket } = require('../fixtures/testData');

describe('Customer Success Service', () => {
  const csService = require('../../services/customerSuccessService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // CUSTOMER HEALTH
  // ========================

  // 1. getHealthScores returns list
  it('should get customer health scores with pagination', async () => {
    const h1 = createHealthScore();
    const h2 = createHealthScore({ id: 'health-uuid-2', school_district_id: 'sd-2', overall_score: 45, risk_level: 'at_risk' });

    mockQuery
      .mockResolvedValueOnce({ rows: [h1, h2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await csService.getCustomerHealth();

    expect(result.customers).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.customers[0].overall_score).toBe(85);
  });

  // 2. getHealthScore by ID
  it('should get health score by id with milestones and tickets', async () => {
    const health = createHealthScore({ school_district_name: 'IPS' });
    const milestones = [
      { id: 'ms-1', school_district_id: 'sd-1', milestone_name: 'Kickoff', status: 'completed' },
      { id: 'ms-2', school_district_id: 'sd-1', milestone_name: 'Training', status: 'in_progress' }
    ];
    const tickets = [
      { id: 'ticket-1', school_district_id: 'sd-1', subject: 'Login issue', status: 'open' }
    ];

    // Main query
    mockQuery.mockResolvedValueOnce({ rows: [health] });
    // Milestones
    mockQuery.mockResolvedValueOnce({ rows: milestones });
    // Tickets
    mockQuery.mockResolvedValueOnce({ rows: tickets });

    const result = await csService.getCustomerHealthById('health-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('health-uuid-1');
    expect(result.onboarding_milestones).toHaveLength(2);
    expect(result.recent_tickets).toHaveLength(1);
  });

  // 3. calculateHealthScore weighted average
  it('should calculate health score using weighted average', () => {
    // usage(25%) + engagement(30%) + support(20%) + adoption(25%)
    // 80*0.25 + 90*0.30 + 85*0.20 + 82*0.25 = 20 + 27 + 17 + 20.5 = 84.5 -> 85 (rounded)
    const result = csService.calculateHealthScore(80, 90, 85, 82);

    expect(result.score).toBe(85);
    expect(result.risk_level).toBe('healthy');
  });

  // 4. risk level: 0-40 = critical
  it('should classify score 0-40 as critical', () => {
    const result = csService.calculateHealthScore(20, 10, 15, 25);
    // 20*0.25 + 10*0.30 + 15*0.20 + 25*0.25 = 5 + 3 + 3 + 6.25 = 17.25 -> 17
    expect(result.score).toBe(17);
    expect(result.risk_level).toBe('critical');
  });

  // 5. risk level: 41-60 = at_risk
  it('should classify score 41-60 as at_risk', () => {
    const result = csService.calculateHealthScore(50, 50, 50, 50);
    // 50*0.25 + 50*0.30 + 50*0.20 + 50*0.25 = 12.5 + 15 + 10 + 12.5 = 50
    expect(result.score).toBe(50);
    expect(result.risk_level).toBe('at_risk');
  });

  // 6. risk level: 61-80 = watch
  it('should classify score 61-80 as watch', () => {
    const result = csService.calculateHealthScore(70, 70, 70, 70);
    // 70*0.25 + 70*0.30 + 70*0.20 + 70*0.25 = 17.5 + 21 + 14 + 17.5 = 70
    expect(result.score).toBe(70);
    expect(result.risk_level).toBe('watch');
  });

  // 7. risk level: 81-100 = healthy
  it('should classify score 81-100 as healthy', () => {
    const result = csService.calculateHealthScore(90, 95, 85, 90);
    // 90*0.25 + 95*0.30 + 85*0.20 + 90*0.25 = 22.5 + 28.5 + 17 + 22.5 = 90.5 -> 91
    expect(result.score).toBe(91);
    expect(result.risk_level).toBe('healthy');
  });

  // ========================
  // ONBOARDING
  // ========================

  // 8. getOnboarding returns milestones
  it('should get onboarding milestones for a district', async () => {
    const milestones = [
      { id: 'ms-1', school_district_id: 'sd-1', milestone_name: 'Kickoff', milestone_order: 1, status: 'completed' },
      { id: 'ms-2', school_district_id: 'sd-1', milestone_name: 'Training', milestone_order: 2, status: 'in_progress' },
      { id: 'ms-3', school_district_id: 'sd-1', milestone_name: 'Go-live', milestone_order: 3, status: 'pending' }
    ];

    mockQuery.mockResolvedValueOnce({ rows: milestones });

    const result = await csService.getOnboardingMilestones('sd-1');

    expect(result).toHaveLength(3);
    expect(result[0].milestone_name).toBe('Kickoff');
    expect(result[0].status).toBe('completed');
    expect(result[2].status).toBe('pending');
    expect(mockQuery.mock.calls[0][1]).toEqual(['sd-1']);
  });

  // 9. updateMilestone completion
  it('should update an onboarding milestone', async () => {
    const updated = {
      id: 'ms-2', school_district_id: 'sd-1', milestone_name: 'Training',
      milestone_order: 2, status: 'completed', completed_at: '2026-02-08T12:00:00Z'
    };

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await csService.updateOnboardingMilestone('ms-2', {
      status: 'completed',
      completed_at: '2026-02-08T12:00:00Z'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('completed');
    expect(result.completed_at).toBe('2026-02-08T12:00:00Z');
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE onboarding_milestones SET');
  });

  // ========================
  // SUPPORT TICKETS
  // ========================

  // 10. getTickets returns list
  it('should get support tickets with pagination', async () => {
    const t1 = createSupportTicket();
    const t2 = createSupportTicket({ id: 'ticket-uuid-2', subject: 'Content not loading', priority: 'medium' });

    mockQuery
      .mockResolvedValueOnce({ rows: [t1, t2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await csService.getSupportTickets();

    expect(result.tickets).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.tickets[0].subject).toBe('Login issues');
  });

  // 11. createTicket with SLA calculation
  it('should create a support ticket with SLA fields', async () => {
    const ticket = createSupportTicket({
      sla_response_due: '2026-02-09T12:00:00Z',
      sla_resolution_due: '2026-02-10T12:00:00Z'
    });

    mockQuery.mockResolvedValueOnce({ rows: [ticket] });

    const result = await csService.createSupportTicket({
      school_district_id: 'sd-1',
      subject: 'Login issues',
      description: 'Teachers unable to login',
      priority: 'high',
      tier: 'L1',
      assigned_to: 'jim',
      sla_response_due: '2026-02-09T12:00:00Z',
      sla_resolution_due: '2026-02-10T12:00:00Z'
    });

    expect(result.id).toBe('ticket-uuid-1');
    expect(result.subject).toBe('Login issues');
    expect(result.priority).toBe('high');
    expect(result.sla_response_due).toBe('2026-02-09T12:00:00Z');
    expect(result.sla_resolution_due).toBe('2026-02-10T12:00:00Z');
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO support_tickets');
  });

  // 12. updateTicket status
  it('should update support ticket status', async () => {
    const updated = createSupportTicket({
      status: 'resolved',
      resolved_at: '2026-02-08T15:00:00Z',
      resolution: 'Reset password and cleared cache'
    });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await csService.updateSupportTicket('ticket-uuid-1', {
      status: 'resolved',
      resolved_at: '2026-02-08T15:00:00Z',
      resolution: 'Reset password and cleared cache'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('resolved');
    expect(result.resolution).toBe('Reset password and cleared cache');
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE support_tickets SET');
  });

  // ========================
  // RENEWALS
  // ========================

  // 13. getRenewals (within 90 days)
  it('should get upcoming renewals within 90 days', async () => {
    // Use a renewal date 15 days from now to get 'urgent' urgency or fewer
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 25);
    const renewalDateStr = futureDate.toISOString().split('T')[0];

    const renewal = createHealthScore({
      renewal_date: renewalDateStr,
      school_district_name: 'IPS',
      contract_value: 50000
    });

    mockQuery.mockResolvedValueOnce({ rows: [renewal] });

    const result = await csService.getRenewals({ days: 90 });

    expect(result).toHaveLength(1);
    expect(result[0].days_until_renewal).toBeDefined();
    expect(result[0].urgency).toBeDefined();
    // 25 days from now should be 'urgent' (<=30)
    expect(result[0].urgency).toBe('urgent');
    expect(mockQuery.mock.calls[0][1]).toEqual([90]);
  });

  // 14. expansion opportunity detection
  it('should detect expansion opportunities in health data', async () => {
    const expandable = createHealthScore({
      expansion_opportunity: true,
      expansion_notes: 'District interested in adding 3 more schools',
      overall_score: 92
    });

    mockQuery
      .mockResolvedValueOnce({ rows: [expandable] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await csService.getCustomerHealth();

    expect(result.customers).toHaveLength(1);
    expect(result.customers[0].expansion_opportunity).toBe(true);
    expect(result.customers[0].expansion_notes).toBe('District interested in adding 3 more schools');
  });
});
