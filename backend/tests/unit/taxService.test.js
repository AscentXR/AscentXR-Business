const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createTaxEvent, createDeduction } = require('../fixtures/testData');

describe('Tax Service', () => {
  const taxService = require('../../services/taxService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // TAX EVENTS
  // ========================

  // 1. getTaxEvents returns list
  it('should get tax events ordered by due date', async () => {
    const e1 = createTaxEvent();
    const e2 = createTaxEvent({ id: 'tax-uuid-2', title: 'State Filing', event_type: 'annual_filing', due_date: '2026-04-15', state: 'IN' });

    mockQuery.mockResolvedValueOnce({ rows: [e1, e2] });

    const result = await taxService.getTaxEvents();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Q1 Estimated Tax');
    expect(result[1].event_type).toBe('annual_filing');
    expect(mockQuery.mock.calls[0][0]).toContain('ORDER BY due_date ASC');
  });

  // 2. getTaxEvents with filters
  it('should filter tax events by status and state', async () => {
    const e1 = createTaxEvent({ status: 'completed', state: 'IN' });

    mockQuery.mockResolvedValueOnce({ rows: [e1] });

    const result = await taxService.getTaxEvents({ status: 'completed', state: 'IN' });

    expect(result).toHaveLength(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['completed', 'IN']);
  });

  // 3. getTaxEventById
  it('should get a tax event by id', async () => {
    const event = createTaxEvent();

    mockQuery.mockResolvedValueOnce({ rows: [event] });

    const result = await taxService.getTaxEventById('tax-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('tax-uuid-1');
    expect(result.title).toBe('Q1 Estimated Tax');
    expect(mockQuery.mock.calls[0][1]).toEqual(['tax-uuid-1']);
  });

  // 4. getTaxEventById returns null for missing
  it('should return null for non-existent tax event', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await taxService.getTaxEventById('missing');

    expect(result).toBeNull();
  });

  // 5. createTaxEvent
  it('should create a tax event', async () => {
    const event = createTaxEvent();

    mockQuery.mockResolvedValueOnce({ rows: [event] });

    const result = await taxService.createTaxEvent({
      title: 'Q1 Estimated Tax',
      event_type: 'quarterly_estimate',
      due_date: '2026-04-15',
      amount: 5000,
      status: 'upcoming',
      state: 'federal'
    });

    expect(result.id).toBe('tax-uuid-1');
    expect(result.title).toBe('Q1 Estimated Tax');
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO tax_events');
  });

  // 6. updateTaxEvent
  it('should update a tax event', async () => {
    const updated = createTaxEvent({ status: 'completed', completed_at: '2026-04-14T12:00:00Z' });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await taxService.updateTaxEvent('tax-uuid-1', {
      status: 'completed',
      completed_at: '2026-04-14T12:00:00Z'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('completed');
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE tax_events SET');
  });

  // 7. updateTaxEvent returns null for empty data
  it('should return null when updating with no allowed fields', async () => {
    const result = await taxService.updateTaxEvent('tax-uuid-1', { forbidden_field: 'value' });

    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  // 8. deleteTaxEvent
  it('should delete a tax event', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'tax-uuid-1' }] });

    const result = await taxService.deleteTaxEvent('tax-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('tax-uuid-1');
    expect(mockQuery.mock.calls[0][0]).toContain('DELETE FROM tax_events');
  });

  // ========================
  // TAX DEDUCTIONS
  // ========================

  // 9. getDeductions
  it('should get tax deductions with filters', async () => {
    const d1 = createDeduction();
    const d2 = createDeduction({ id: 'deduction-uuid-2', category: 'office', amount: 500, is_r_and_d: false });

    mockQuery.mockResolvedValueOnce({ rows: [d1, d2] });

    const result = await taxService.getDeductions({ tax_year: '2026' });

    expect(result).toHaveLength(2);
    expect(result[0].is_r_and_d).toBe(true);
    expect(mockQuery.mock.calls[0][1]).toEqual([2026]);
  });

  // 10. createDeduction
  it('should create a tax deduction', async () => {
    const deduction = createDeduction();

    mockQuery.mockResolvedValueOnce({ rows: [deduction] });

    const result = await taxService.createDeduction({
      expense_id: 'exp-uuid-1',
      category: 'software',
      description: 'Unity Pro License',
      amount: 1800,
      tax_year: 2026,
      is_r_and_d: true,
      r_and_d_notes: 'XR development tool'
    });

    expect(result.id).toBe('deduction-uuid-1');
    expect(result.is_r_and_d).toBe(true);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO tax_deductions');
  });

  // ========================
  // TAX SUMMARY
  // ========================

  // 11. getSummary aggregation
  it('should get tax summary with aggregated data', async () => {
    const events = [createTaxEvent()];
    const deductionsByCategory = [
      { category: 'software', count: '3', total: '5400' },
      { category: 'office', count: '2', total: '1200' }
    ];
    const rdDeductions = { r_and_d_total: '4200', r_and_d_count: '2' };
    const expenseSummary = { deductible_expenses: '8500' };

    // getSummary fires 4 queries via Promise.all
    mockQuery
      .mockResolvedValueOnce({ rows: events })
      .mockResolvedValueOnce({ rows: deductionsByCategory })
      .mockResolvedValueOnce({ rows: [rdDeductions] })
      .mockResolvedValueOnce({ rows: [expenseSummary] });

    const result = await taxService.getSummary({ tax_year: 2026 });

    expect(result.tax_year).toBe(2026);
    expect(result.upcoming_events).toHaveLength(1);
    expect(result.deductions_by_category).toHaveLength(2);
    expect(result.total_deductions).toBe(6600);
    expect(result.r_and_d_total).toBe(4200);
    expect(result.r_and_d_count).toBe(2);
    expect(result.deductible_expenses).toBe(8500);
    // estimated_savings = totalDeductions * 0.25 = 6600 * 0.25 = 1650
    expect(result.estimated_savings).toBe(1650);
  });
});
