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

describe('Brand API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('GET /api/brand', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/brand');
      expect(res.status).toBe(401);
    });

    it('returns brand assets list', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Logo', asset_type: 'image' }], rowCount: 1 });
      const res = await request(app).get('/api/brand').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/brand', () => {
    it('creates brand asset', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Brand Colors' }], rowCount: 1 });
      const res = await request(app).post('/api/brand')
        .set('Authorization', authHeader)
        .send({ name: 'Brand Colors', asset_type: 'color_palette' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/brand/:id', () => {
    it('updates brand asset', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated Logo' }], rowCount: 1 });
      const res = await request(app).put('/api/brand/1')
        .set('Authorization', authHeader)
        .send({ name: 'Updated Logo' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when brand asset not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/brand/999')
        .set('Authorization', authHeader)
        .send({ name: 'Updated Logo' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/brand/:id', () => {
    it('deletes brand asset', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      const res = await request(app).delete('/api/brand/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
