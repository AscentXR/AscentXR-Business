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

describe('Team API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('GET /api/team', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/team');
      expect(res.status).toBe(401);
    });

    it('returns team member list', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Jim', role: 'CEO' }], rowCount: 1 });
      const res = await request(app).get('/api/team').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/team/:id', () => {
    it('returns 404 when member not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/team/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Team member not found');
    });
  });

  describe('POST /api/team', () => {
    it('creates team member', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 2, name: 'Nick', role: 'CTO' }], rowCount: 1 });
      const res = await request(app).post('/api/team')
        .set('Authorization', authHeader)
        .send({ name: 'Nick', role: 'CTO', type: 'human' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/team/:id', () => {
    it('updates team member', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'active' }], rowCount: 1 });
      const res = await request(app).put('/api/team/1')
        .set('Authorization', authHeader)
        .send({ status: 'active' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when member not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/team/999')
        .set('Authorization', authHeader)
        .send({ status: 'active' });
      expect(res.status).toBe(404);
    });
  });
});
