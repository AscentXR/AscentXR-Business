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

describe('Marketing API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  // --- Campaigns ---
  describe('GET /api/marketing/campaigns', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/marketing/campaigns');
      expect(res.status).toBe(401);
    });

    it('returns campaign list', async () => {
      // getCampaigns makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Q1 Launch' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/marketing/campaigns').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/marketing/campaigns', () => {
    it('creates campaign', async () => {
      // createCampaign: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Q1 Launch' }], rowCount: 1 });
      const res = await request(app).post('/api/marketing/campaigns')
        .set('Authorization', authHeader)
        .send({ name: 'Q1 Launch', channel: 'linkedin' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/marketing/campaigns/:id', () => {
    it('updates campaign', async () => {
      // updateCampaign: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'active' }], rowCount: 1 });
      const res = await request(app).put('/api/marketing/campaigns/1')
        .set('Authorization', authHeader)
        .send({ status: 'active' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when campaign not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/marketing/campaigns/999')
        .set('Authorization', authHeader)
        .send({ status: 'active' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/marketing/campaigns (with filter)', () => {
    it('filters campaigns by channel', async () => {
      // getCampaigns makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'LinkedIn Push', channel: 'linkedin' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/marketing/campaigns?channel=linkedin').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Calendar ---
  describe('GET /api/marketing/calendar', () => {
    it('returns calendar items', async () => {
      // getContentCalendar makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Blog Post' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/marketing/calendar').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/marketing/calendar', () => {
    it('creates calendar item', async () => {
      // createContentItem: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Webinar' }], rowCount: 1 });
      const res = await request(app).post('/api/marketing/calendar')
        .set('Authorization', authHeader)
        .send({ title: 'Webinar', scheduled_date: '2026-03-01' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/marketing/calendar/:id', () => {
    it('updates calendar item', async () => {
      // updateContentItem: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'published' }], rowCount: 1 });
      const res = await request(app).put('/api/marketing/calendar/1')
        .set('Authorization', authHeader)
        .send({ status: 'published' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/marketing/calendar/:id', () => {
    it('deletes calendar item', async () => {
      // deleteContentItem: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      const res = await request(app).delete('/api/marketing/calendar/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
