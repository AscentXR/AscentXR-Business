const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const token = jwt.sign({ username: 'jim', name: 'Jim', role: 'CEO' }, JWT_SECRET, { expiresIn: '30m' });
const authHeader = `Bearer ${token}`;

describe('Taxes API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  // --- Events ---
  describe('GET /api/taxes/events', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/taxes/events');
      expect(res.status).toBe(401);
    });

    it('returns tax events list', async () => {
      // getTaxEvents: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Q1 Filing' }], rowCount: 1 });
      const res = await request(app).get('/api/taxes/events').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/taxes/events', () => {
    it('creates tax event', async () => {
      // createTaxEvent: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Quarterly Filing' }], rowCount: 1 });
      const res = await request(app).post('/api/taxes/events')
        .set('Authorization', authHeader)
        .send({ title: 'Quarterly Filing', due_date: '2026-04-15' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/taxes/events/:id', () => {
    it('updates tax event', async () => {
      // updateTaxEvent: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'filed' }], rowCount: 1 });
      const res = await request(app).put('/api/taxes/events/1')
        .set('Authorization', authHeader)
        .send({ status: 'filed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when event not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/taxes/events/999')
        .set('Authorization', authHeader)
        .send({ status: 'filed' });
      expect(res.status).toBe(404);
    });
  });

  // --- Deductions ---
  describe('GET /api/taxes/deductions', () => {
    it('returns deductions list', async () => {
      // getDeductions: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, description: 'R&D Credit' }], rowCount: 1 });
      const res = await request(app).get('/api/taxes/deductions').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/taxes/deductions', () => {
    it('creates deduction', async () => {
      // createDeduction: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, description: 'Equipment' }], rowCount: 1 });
      const res = await request(app).post('/api/taxes/deductions')
        .set('Authorization', authHeader)
        .send({ description: 'Equipment', amount: 5000, category: 'business' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Summary ---
  describe('GET /api/taxes/summary', () => {
    it('returns tax summary', async () => {
      // getSummary makes 4 queries via Promise.all: events, deductions, rdDeductions, expenseSummary
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Q1 Filing' }], rowCount: 1 }); // events
      mockQuery.mockResolvedValueOnce({ rows: [{ category: 'business', count: '1', total: '5000' }], rowCount: 1 }); // deductions
      mockQuery.mockResolvedValueOnce({ rows: [{ r_and_d_total: '2000', r_and_d_count: '1' }], rowCount: 1 }); // rdDeductions
      mockQuery.mockResolvedValueOnce({ rows: [{ deductible_expenses: '3000' }], rowCount: 1 }); // expenseSummary
      const res = await request(app).get('/api/taxes/summary').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
