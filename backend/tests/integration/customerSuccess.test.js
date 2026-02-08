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

describe('Customer Success API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  // --- Health Scores ---
  describe('GET /api/customer-success/health', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/customer-success/health');
      expect(res.status).toBe(401);
    });

    it('returns health scores with valid token', async () => {
      // getCustomerHealth makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, score: 85 }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/customer-success/health').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/customer-success/health/:id', () => {
    it('returns 404 when not found', async () => {
      // getCustomerHealthById: 1 query returns empty
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/customer-success/health/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Health score not found');
    });

    it('returns health score by ID', async () => {
      // getCustomerHealthById: 1 main query + 2 parallel queries (milestones + tickets)
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, score: 85, school_district_id: 'sd1' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // milestones
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // tickets
      const res = await request(app).get('/api/customer-success/health/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/customer-success/health/:id', () => {
    it('updates health score', async () => {
      // updateCustomerHealth with usage_score: triggers score recalculation
      // 1) fetch current scores, 2) update with new values
      mockQuery.mockResolvedValueOnce({ rows: [{ usage_score: 80, engagement_score: 80, support_score: 80, adoption_score: 80 }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, usage_score: 90 }], rowCount: 1 });
      const res = await request(app).put('/api/customer-success/health/1')
        .set('Authorization', authHeader)
        .send({ usage_score: 90 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when not found', async () => {
      // updateCustomerHealth: send contract_value (allowed, no score recalc), 1 query returns empty
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/customer-success/health/999')
        .set('Authorization', authHeader)
        .send({ contract_value: 5000 });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/customer-success/health/calculate/:districtId', () => {
    it('recalculates health score', async () => {
      // calculateHealthScore: 1 query for getCustomerHealthByDistrict
      // then recalculateHealth: 1 query to fetch current + 1 query to update
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, school_district_id: 'd1' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, usage_score: 80, engagement_score: 80, support_score: 80, adoption_score: 80 }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, district_id: 'd1', score: 88 }], rowCount: 1 });
      const res = await request(app).post('/api/customer-success/health/calculate/d1')
        .set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Onboarding ---
  describe('GET /api/customer-success/onboarding/:districtId', () => {
    it('returns milestones for district', async () => {
      // getOnboardingMilestones: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, milestone: 'Kickoff' }], rowCount: 1 });
      const res = await request(app).get('/api/customer-success/onboarding/d1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/customer-success/onboarding', () => {
    it('creates onboarding milestone', async () => {
      // createOnboardingMilestone: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, milestone: 'Training' }], rowCount: 1 });
      const res = await request(app).post('/api/customer-success/onboarding')
        .set('Authorization', authHeader)
        .send({ district_id: 'd1', milestone: 'Training' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/customer-success/onboarding/:id', () => {
    it('updates onboarding milestone', async () => {
      // updateOnboardingMilestone: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'completed' }], rowCount: 1 });
      const res = await request(app).put('/api/customer-success/onboarding/1')
        .set('Authorization', authHeader)
        .send({ status: 'completed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when milestone not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/customer-success/onboarding/999')
        .set('Authorization', authHeader)
        .send({ status: 'completed' });
      expect(res.status).toBe(404);
    });
  });

  // --- Tickets ---
  describe('GET /api/customer-success/tickets', () => {
    it('returns ticket list', async () => {
      // getSupportTickets makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, subject: 'Login issue' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/customer-success/tickets').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/customer-success/tickets', () => {
    it('creates ticket', async () => {
      // createSupportTicket: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, subject: 'Bug report' }], rowCount: 1 });
      const res = await request(app).post('/api/customer-success/tickets')
        .set('Authorization', authHeader)
        .send({ subject: 'Bug report', priority: 'high' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/customer-success/tickets/:id', () => {
    it('updates ticket', async () => {
      // updateSupportTicket: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'resolved' }], rowCount: 1 });
      const res = await request(app).put('/api/customer-success/tickets/1')
        .set('Authorization', authHeader)
        .send({ status: 'resolved' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when ticket not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/customer-success/tickets/999')
        .set('Authorization', authHeader)
        .send({ status: 'resolved' });
      expect(res.status).toBe(404);
    });
  });

  // --- Renewals ---
  describe('GET /api/customer-success/renewals', () => {
    it('returns upcoming renewals', async () => {
      // getRenewals: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, district: 'Springfield' }], rowCount: 1 });
      const res = await request(app).get('/api/customer-success/renewals').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
