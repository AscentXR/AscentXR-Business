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

describe('Legal API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  // --- Contracts ---
  describe('GET /api/legal/contracts', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/legal/contracts');
      expect(res.status).toBe(401);
    });

    it('returns contract list', async () => {
      // getContracts makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'NDA' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/legal/contracts').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/legal/contracts', () => {
    it('creates contract', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'MSA' }], rowCount: 1 });
      const res = await request(app).post('/api/legal/contracts')
        .set('Authorization', authHeader)
        .send({ title: 'MSA', party: 'Acme Corp', type: 'service_agreement' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/legal/contracts/:id', () => {
    it('updates contract', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'signed' }], rowCount: 1 });
      const res = await request(app).put('/api/legal/contracts/1')
        .set('Authorization', authHeader)
        .send({ status: 'signed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when contract not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/legal/contracts/999')
        .set('Authorization', authHeader)
        .send({ status: 'signed' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/legal/contracts (with status filter)', () => {
    it('filters contracts by status', async () => {
      // getContracts makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'NDA', status: 'active' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/legal/contracts?status=active').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Compliance ---
  describe('GET /api/legal/compliance', () => {
    it('returns compliance items', async () => {
      // getComplianceItems makes 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, framework: 'FERPA' }], rowCount: 1 });
      const res = await request(app).get('/api/legal/compliance').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/legal/compliance', () => {
    it('creates compliance item', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, framework: 'COPPA' }], rowCount: 1 });
      const res = await request(app).post('/api/legal/compliance')
        .set('Authorization', authHeader)
        .send({ framework: 'COPPA', requirement: 'Data protection' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/legal/compliance/:id', () => {
    it('updates compliance item', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'compliant' }], rowCount: 1 });
      const res = await request(app).put('/api/legal/compliance/1')
        .set('Authorization', authHeader)
        .send({ status: 'compliant' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when compliance item not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/legal/compliance/999')
        .set('Authorization', authHeader)
        .send({ status: 'compliant' });
      expect(res.status).toBe(404);
    });
  });
});
