const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createInvoice, createExpense, createBudget } = require('../fixtures/testData');

describe('Finance Service', () => {
  const financeService = require('../../services/financeService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // INVOICES
  // ========================

  // 1. getInvoices returns list
  it('should get invoices and return list with total', async () => {
    const inv1 = createInvoice();
    const inv2 = createInvoice({ id: 'inv-uuid-2', invoice_number: 'INV-202602-002', total: 50000 });

    mockQuery
      .mockResolvedValueOnce({ rows: [inv1, inv2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await financeService.getInvoices({ page: 1, limit: 50 });

    expect(result.invoices).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.invoices[0].invoice_number).toBe('INV-202602-001');
  });

  // 2. getInvoices with status filter
  it('should filter invoices by status', async () => {
    const paidInvoice = createInvoice({ status: 'paid', paid_amount: 25000 });

    mockQuery
      .mockResolvedValueOnce({ rows: [paidInvoice] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await financeService.getInvoices({ status: 'paid' });

    expect(result.invoices).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.invoices[0].status).toBe('paid');
    // Verify status param was passed
    const firstCallParams = mockQuery.mock.calls[0][1];
    expect(firstCallParams).toContain('paid');
  });

  // 3. createInvoice generates invoice number
  it('should generate invoice number when not provided', async () => {
    // generateInvoiceNumber query: find last invoice number for this month
    mockQuery.mockResolvedValueOnce({ rows: [{ invoice_number: 'INV-202602-003' }] });

    // createInvoice INSERT query
    const newInvoice = createInvoice({ invoice_number: 'INV-202602-004' });
    mockQuery.mockResolvedValueOnce({ rows: [newInvoice] });

    const result = await financeService.createInvoice({
      school_district_id: 'sd-1',
      subtotal: 25000,
      total: 25000,
      due_date: '2026-03-01',
      line_items: [{ description: 'Custom Experience', quantity: 1, unit_price: 25000, total: 25000 }]
    });

    expect(result.invoice_number).toBe('INV-202602-004');
    // First call should be the generateInvoiceNumber query
    expect(mockQuery.mock.calls[0][0]).toContain('SELECT invoice_number FROM invoices');
  });

  // 4. createInvoice calculates total
  it('should create invoice with calculated total', async () => {
    const invoice = createInvoice({ subtotal: 25000, tax_rate: 7, tax_amount: 1750, total: 26750 });

    // generateInvoiceNumber
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // INSERT
    mockQuery.mockResolvedValueOnce({ rows: [invoice] });

    const result = await financeService.createInvoice({
      school_district_id: 'sd-1',
      subtotal: 25000,
      tax_rate: 7,
      tax_amount: 1750,
      total: 26750,
      due_date: '2026-03-01',
      line_items: [{ description: 'Custom Experience', quantity: 1, unit_price: 25000, total: 25000 }]
    });

    expect(result.subtotal).toBe(25000);
    expect(result.tax_amount).toBe(1750);
    expect(result.total).toBe(26750);
  });

  // 5. updateInvoice status to paid
  it('should update invoice status to paid', async () => {
    const updated = createInvoice({ status: 'paid', paid_amount: 25000, paid_date: '2026-02-15', payment_method: 'bank_transfer' });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await financeService.updateInvoice('inv-uuid-1', {
      status: 'paid',
      paid_amount: 25000,
      paid_date: '2026-02-15',
      payment_method: 'bank_transfer'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('paid');
    expect(result.paid_amount).toBe(25000);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE invoices SET');
  });

  // ========================
  // EXPENSES
  // ========================

  // 6. getExpenses returns list
  it('should get expenses and return list with total', async () => {
    const exp1 = createExpense();
    const exp2 = createExpense({ id: 'exp-uuid-2', description: 'AWS Hosting', amount: 150, category: 'technology' });

    mockQuery
      .mockResolvedValueOnce({ rows: [exp1, exp2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await financeService.getExpenses({ page: 1, limit: 50 });

    expect(result.expenses).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  // 7. getExpenses with category filter
  it('should filter expenses by category', async () => {
    const expense = createExpense({ category: 'technology' });

    mockQuery
      .mockResolvedValueOnce({ rows: [expense] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await financeService.getExpenses({ category: 'technology' });

    expect(result.expenses).toHaveLength(1);
    expect(result.total).toBe(1);
    const firstCallParams = mockQuery.mock.calls[0][1];
    expect(firstCallParams).toContain('technology');
  });

  // 8. createExpense
  it('should create an expense', async () => {
    const expense = createExpense();

    mockQuery.mockResolvedValueOnce({ rows: [expense] });

    const result = await financeService.createExpense({
      description: 'LinkedIn Premium',
      amount: 59.99,
      category: 'marketing',
      vendor: 'LinkedIn',
      expense_date: '2026-02-01',
      is_tax_deductible: true,
      status: 'approved'
    });

    expect(result.id).toBe('exp-uuid-1');
    expect(result.description).toBe('LinkedIn Premium');
    expect(result.amount).toBe(59.99);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO expenses');
  });

  // ========================
  // BUDGETS
  // ========================

  // 9. getBudgets returns list
  it('should get budgets', async () => {
    const budget1 = createBudget();
    const budget2 = createBudget({ id: 'budget-uuid-2', category: 'technology', allocated: 10000, spent: 3000 });

    mockQuery.mockResolvedValueOnce({ rows: [budget1, budget2] });

    const result = await financeService.getBudgets();

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('marketing');
    expect(result[1].category).toBe('technology');
  });

  // 10. createBudget
  it('should create a budget', async () => {
    const budget = createBudget();

    mockQuery.mockResolvedValueOnce({ rows: [budget] });

    const result = await financeService.createBudget({
      category: 'marketing',
      period: 'Q1_2026',
      allocated: 15000,
      spent: 5000
    });

    expect(result.id).toBe('budget-uuid-1');
    expect(result.category).toBe('marketing');
    expect(result.allocated).toBe(15000);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO budgets');
  });

  // 11. updateBudget spent tracking
  it('should update budget spent tracking', async () => {
    const updated = createBudget({ spent: 8000 });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await financeService.updateBudget('budget-uuid-1', {
      spent: 8000
    });

    expect(result).not.toBeNull();
    expect(result.spent).toBe(8000);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE budgets SET');
  });

  // ========================
  // SUMMARY
  // ========================

  // 12. getSummary aggregates correctly
  it('should aggregate financial summary correctly', async () => {
    // Revenue from paid invoices
    mockQuery.mockResolvedValueOnce({ rows: [{ total_revenue: '75000', paid_count: '3' }] });
    // Total expenses
    mockQuery.mockResolvedValueOnce({ rows: [{ total_expenses: '12000', expense_count: '8' }] });
    // Budget utilization
    mockQuery.mockResolvedValueOnce({ rows: [{ total_allocated: '40000', total_spent: '12000' }] });
    // Outstanding invoices
    mockQuery.mockResolvedValueOnce({ rows: [{ outstanding: '50000' }] });

    const result = await financeService.getSummary();

    expect(result.total_revenue).toBe(75000);
    expect(result.paid_invoice_count).toBe(3);
    expect(result.total_expenses).toBe(12000);
    expect(result.expense_count).toBe(8);
    expect(result.net_income).toBe(63000); // 75000 - 12000
    expect(result.outstanding_amount).toBe(50000);
    expect(result.budget_allocated).toBe(40000);
    expect(result.budget_spent).toBe(12000);
    expect(result.budget_utilization).toBe(30); // (12000/40000)*100 = 30
  });
});
