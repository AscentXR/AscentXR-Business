const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createNotification } = require('../fixtures/testData');

describe('Notification Service', () => {
  const notificationService = require('../../services/notificationService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // CRUD
  // ========================

  // 1. getNotifications returns list
  it('should get notifications with pagination', async () => {
    const n1 = createNotification();
    const n2 = createNotification({ id: 'notif-uuid-2', type: 'health_drop', severity: 'critical', title: 'Health score dropped' });

    mockQuery
      .mockResolvedValueOnce({ rows: [n1, n2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await notificationService.getNotifications();

    expect(result.notifications).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.notifications[0].type).toBe('renewal_due');
    expect(result.notifications[1].type).toBe('health_drop');
  });

  // 2. getUnreadCount
  it('should get unread notification count', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '7' }] });

    const count = await notificationService.getUnreadCount();

    expect(count).toBe(7);
    expect(mockQuery.mock.calls[0][0]).toContain('is_read = false');
  });

  // 3. markRead
  it('should mark a notification as read', async () => {
    const read = createNotification({ is_read: true, read_at: '2026-02-08T12:00:00Z' });

    mockQuery.mockResolvedValueOnce({ rows: [read] });

    const result = await notificationService.markAsRead('notif-uuid-1');

    expect(result).not.toBeNull();
    expect(result.is_read).toBe(true);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE notifications SET is_read = true');
  });

  // 4. markAllRead
  it('should mark all notifications as read', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 5 });

    const result = await notificationService.markAllAsRead();

    expect(result.updated).toBe(5);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE notifications SET is_read = true');
    expect(mockQuery.mock.calls[0][0]).toContain('WHERE is_read = false');
  });

  // ========================
  // ALERT CHECKING ENGINE
  // ========================

  /**
   * Helper: set up mockQuery to route responses based on SQL content.
   * Since checkAlerts uses Promise.all, queries from different check methods
   * are interleaved. We use mockImplementation to inspect SQL and return
   * the right response.
   */
  function setupCheckAlertsMock(config = {}) {
    const {
      renewalRows = [],       // rows returned by _checkRenewalDue queries
      healthDropRows = [],    // rows returned by _checkHealthDrop query
      slaBreachRows = [],     // rows returned by _checkSLABreach query
      taxDeadlineRows = [],   // rows returned by _checkTaxDeadline queries
      budgetWarningRows = [], // rows returned by _checkBudgetWarning query
      invoiceOverdueRows = [],// rows returned by _checkInvoiceOverdue query
      goalBehindRows = [],    // rows returned by _checkGoalBehind query
    } = config;

    // Track createNotification calls for returning proper notification objects
    let notifCounter = 0;

    mockQuery.mockImplementation((sql, params) => {
      // createNotification INSERT
      if (sql.includes('INSERT INTO notifications')) {
        notifCounter++;
        const notif = createNotification({
          id: `notif-auto-${notifCounter}`,
          type: params[0],
          severity: params[1],
          title: params[2],
          section: params[4]
        });
        return Promise.resolve({ rows: [notif] });
      }

      // _checkRenewalDue: customer_health with renewal_date
      if (sql.includes('renewal_date') && sql.includes('customer_health')) {
        return Promise.resolve({ rows: renewalRows });
      }

      // _checkHealthDrop: overall_score < 50
      if (sql.includes('overall_score < 50')) {
        return Promise.resolve({ rows: healthDropRows });
      }

      // _checkSLABreach: sla_resolution_due < NOW()
      if (sql.includes('sla_resolution_due') && sql.includes('support_tickets')) {
        return Promise.resolve({ rows: slaBreachRows });
      }

      // _checkTaxDeadline: tax_events
      if (sql.includes('tax_events')) {
        return Promise.resolve({ rows: taxDeadlineRows });
      }

      // _checkBudgetWarning: budgets with spent/allocated > 0.8
      if (sql.includes('budgets') && sql.includes('0.8')) {
        return Promise.resolve({ rows: budgetWarningRows });
      }

      // _checkInvoiceOverdue: invoices where due_date < CURRENT_DATE
      if (sql.includes('invoices') && sql.includes('due_date < CURRENT_DATE')) {
        return Promise.resolve({ rows: invoiceOverdueRows });
      }

      // _checkGoalBehind: goals where status NOT IN completed
      if (sql.includes('goals') && sql.includes('goal_type') && sql.includes("NOT IN ('completed')")) {
        return Promise.resolve({ rows: goalBehindRows });
      }

      // Default fallback
      return Promise.resolve({ rows: [] });
    });
  }

  // 5. checkAlerts - renewal in 30 days creates notification
  it('should create notification for renewal due in 30 days', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 25);

    setupCheckAlertsMock({
      renewalRows: [{
        id: 'health-1',
        renewal_date: futureDate.toISOString().split('T')[0],
        contract_value: 50000,
        school_district_name: 'IPS'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    // Renewal in 25 days will match the 30-day, 60-day, and 90-day thresholds
    // (all three queries return the same row since the mock matches on SQL pattern)
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const renewalAlerts = alerts.filter(a => a.type === 'renewal_due');
    expect(renewalAlerts.length).toBeGreaterThanOrEqual(1);
  });

  // 6. checkAlerts - health score < 50 creates notification
  it('should create notification for health score below 50', async () => {
    setupCheckAlertsMock({
      healthDropRows: [{
        id: 'health-low',
        overall_score: 35,
        risk_level: 'critical',
        school_district_name: 'Struggling District'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    const healthAlerts = alerts.filter(a => a.type === 'health_drop');
    expect(healthAlerts).toHaveLength(1);
  });

  // 7. checkAlerts - SLA breach creates notification
  it('should create notification for SLA breach', async () => {
    setupCheckAlertsMock({
      slaBreachRows: [{
        id: 'ticket-breach',
        subject: 'Critical login failure',
        priority: 'urgent',
        sla_resolution_due: '2026-02-01T12:00:00Z',
        school_district_name: 'IPS'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    const slaAlerts = alerts.filter(a => a.type === 'sla_breach');
    expect(slaAlerts).toHaveLength(1);
  });

  // 8. checkAlerts - tax deadline in 7 days
  it('should create notification for tax deadline in 7 days', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    setupCheckAlertsMock({
      taxDeadlineRows: [{
        id: 'tax-1',
        title: 'Q1 Estimated Tax',
        due_date: futureDate.toISOString().split('T')[0],
        amount: 5000,
        event_type: 'quarterly_estimate'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    const taxAlerts = alerts.filter(a => a.type === 'tax_deadline');
    expect(taxAlerts.length).toBeGreaterThanOrEqual(1);
  });

  // 9. checkAlerts - budget > 80% spent
  it('should create notification for budget exceeding 80% utilization', async () => {
    setupCheckAlertsMock({
      budgetWarningRows: [{
        id: 'budget-over',
        category: 'marketing',
        period: 'Q1_2026',
        allocated: '10000',
        spent: '9500'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    const budgetAlerts = alerts.filter(a => a.type === 'budget_warning');
    expect(budgetAlerts).toHaveLength(1);
  });

  // 10. checkAlerts - invoice overdue
  it('should create notification for overdue invoices', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    setupCheckAlertsMock({
      invoiceOverdueRows: [{
        id: 'inv-overdue',
        invoice_number: 'INV-202601-005',
        due_date: pastDate.toISOString().split('T')[0],
        total: '25000',
        status: 'sent',
        school_district_name: 'IPS'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    const invoiceAlerts = alerts.filter(a => a.type === 'invoice_overdue');
    expect(invoiceAlerts).toHaveLength(1);
  });

  // 11. checkAlerts - goal behind schedule
  it('should create notification for goal behind schedule', async () => {
    setupCheckAlertsMock({
      goalBehindRows: [{
        id: 'goal-behind',
        title: 'Build $300K pipeline',
        progress: 10,
        quarter: 'Q1_2026',
        due_date: '2026-03-31',
        goal_type: 'objective',
        business_area: 'sales'
      }]
    });

    const alerts = await notificationService.checkAlerts();

    const goalAlerts = alerts.filter(a => a.type === 'goal_behind');
    expect(goalAlerts).toHaveLength(1);
  });

  // 12. checkAlerts doesn't duplicate existing notifications
  it('should not create duplicate notifications (NOT EXISTS clause prevents them)', async () => {
    // All check queries return empty results (no new alerts needed)
    setupCheckAlertsMock({});

    const alerts = await notificationService.checkAlerts();

    expect(alerts).toHaveLength(0);

    // Verify queries include NOT EXISTS clause to prevent duplicates
    const allCalls = mockQuery.mock.calls;
    // Filter out any non-SELECT queries (shouldn't be any for empty results)
    const selectCalls = allCalls.filter(c => c[0].includes('SELECT') || c[0].includes('FROM'));
    for (const call of selectCalls) {
      expect(call[0]).toContain('NOT EXISTS');
    }
  });
});
