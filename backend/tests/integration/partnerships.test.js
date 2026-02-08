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

describe('Partnerships API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  // --- Partners ---
  describe('GET /api/partnerships', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/partnerships');
      expect(res.status).toBe(401);
    });

    it('returns partner list', async () => {
      // getPartners makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Meta' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/partnerships').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/partnerships/:id', () => {
    it('returns 404 when partner not found', async () => {
      // getPartnerById: 2 queries via Promise.all (partner + deals)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // partner
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // deals
      const res = await request(app).get('/api/partnerships/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Partner not found');
    });
  });

  describe('POST /api/partnerships', () => {
    it('creates partner', async () => {
      // createPartner: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Google' }], rowCount: 1 });
      const res = await request(app).post('/api/partnerships')
        .set('Authorization', authHeader)
        .send({ name: 'Google', type: 'technology' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/partnerships/:id', () => {
    it('updates partner', async () => {
      // updatePartner: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'active' }], rowCount: 1 });
      const res = await request(app).put('/api/partnerships/1')
        .set('Authorization', authHeader)
        .send({ status: 'active' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Deals ---
  describe('GET /api/partnerships/deals', () => {
    it('returns deal list', async () => {
      // getDeals: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Integration Deal' }], rowCount: 1 });
      const res = await request(app).get('/api/partnerships/deals').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/partnerships/deals', () => {
    it('creates deal', async () => {
      // createDeal with partner_id and no commission_amount: calls calculateCommission (1 query) + 1 INSERT query
      mockQuery.mockResolvedValueOnce({ rows: [{ commission_rate: 10, commission_type: 'percentage' }], rowCount: 1 }); // calculateCommission
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'New Deal' }], rowCount: 1 }); // INSERT
      const res = await request(app).post('/api/partnerships/deals')
        .set('Authorization', authHeader)
        .send({ title: 'New Deal', partner_id: 1, deal_value: 10000 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/partnerships/deals/:id', () => {
    it('updates deal', async () => {
      // updateDeal: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'closed' }], rowCount: 1 });
      const res = await request(app).put('/api/partnerships/deals/1')
        .set('Authorization', authHeader)
        .send({ status: 'closed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
