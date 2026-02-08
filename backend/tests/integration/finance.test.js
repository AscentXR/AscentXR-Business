const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

// Mock firebase-admin for auth
const mockVerifyIdToken = jest.fn().mockResolvedValue({
  uid: 'test-uid',
  email: 'jim@ascentxr.com',
  name: 'Jim',
  role: 'admin'
});
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn().mockReturnValue({}),
  credential: { applicationDefault: jest.fn(), cert: jest.fn() },
  auth: jest.fn(() => ({ verifyIdToken: mockVerifyIdToken }))
}));

const request = require('supertest');
const app = require('../../server');

const authHeader = 'Bearer mock-firebase-token';

describe('Finance API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  // --- Invoices ---
  describe('GET /api/finance/invoices', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/finance/invoices');
      expect(res.status).toBe(401);
    });

    it('returns invoice list with valid token', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, invoice_number: 'INV-001' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/finance/invoices').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/finance/invoices/:id', () => {
    it('returns 404 when invoice not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/finance/invoices/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Invoice not found');
    });
  });

  describe('POST /api/finance/invoices', () => {
    it('returns 400 with missing fields', async () => {
      const res = await request(app).post('/api/finance/invoices')
        .set('Authorization', authHeader)
        .send({ invoice_number: 'INV-001' });
      expect(res.status).toBe(400);
    });

    it('creates invoice with valid data', async () => {
      const invoice = { invoice_number: 'INV-001', due_date: '2026-03-01', total: 5000 };
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ...invoice }], rowCount: 1 });
      const res = await request(app).post('/api/finance/invoices')
        .set('Authorization', authHeader)
        .send(invoice);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/finance/invoices/:id', () => {
    it('updates invoice', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'paid' }], rowCount: 1 });
      const res = await request(app).put('/api/finance/invoices/1')
        .set('Authorization', authHeader)
        .send({ status: 'paid' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when invoice not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/finance/invoices/999')
        .set('Authorization', authHeader)
        .send({ status: 'paid' });
      expect(res.status).toBe(404);
    });
  });

  // --- Expenses ---
  describe('GET /api/finance/expenses', () => {
    it('returns expense list', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, description: 'Office rent' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/finance/expenses').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/finance/expenses', () => {
    it('returns 400 with missing fields', async () => {
      const res = await request(app).post('/api/finance/expenses')
        .set('Authorization', authHeader)
        .send({ description: 'Rent' });
      expect(res.status).toBe(400);
    });

    it('creates expense with valid data', async () => {
      const expense = { description: 'Office rent', amount: 2000, category: 'operations' };
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ...expense }], rowCount: 1 });
      const res = await request(app).post('/api/finance/expenses')
        .set('Authorization', authHeader)
        .send(expense);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/finance/expenses/:id', () => {
    it('returns 404 when expense not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/finance/expenses/999')
        .set('Authorization', authHeader)
        .send({ amount: 2500 });
      expect(res.status).toBe(404);
    });
  });

  // --- Budgets ---
  describe('GET /api/finance/budgets', () => {
    it('returns budget list', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, period: 'Q1-2026' }], rowCount: 1 });
      const res = await request(app).get('/api/finance/budgets').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/finance/budgets', () => {
    it('creates budget', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, period: 'Q1-2026' }], rowCount: 1 });
      const res = await request(app).post('/api/finance/budgets')
        .set('Authorization', authHeader)
        .send({ period: 'Q1-2026', total: 50000 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Summary ---
  describe('GET /api/finance/summary', () => {
    it('returns financial summary', async () => {
      // getSummary uses Promise.all with 4 queries: revenue, expenses, budgets, outstanding
      mockQuery.mockResolvedValueOnce({ rows: [{ total_revenue: '100000', paid_count: '5' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ total_expenses: '40000', expense_count: '10' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ total_allocated: '80000', total_spent: '35000' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ outstanding: '20000' }], rowCount: 1 });
      const res = await request(app).get('/api/finance/summary').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
