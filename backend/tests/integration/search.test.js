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

describe('Search API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('GET /api/search', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/search?q=test');
      expect(res.status).toBe(401);
    });

    it('returns 400 without query parameter', async () => {
      const res = await request(app).get('/api/search').set('Authorization', authHeader);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Query parameter "q" is required');
    });

    it('returns search results', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, title: 'XR Platform', section: 'products' }], rowCount: 1 });
      const res = await request(app).get('/api/search?q=XR').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('handles empty search results', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/search?q=nonexistent').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 403 with invalid token', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Decoding Firebase ID token failed'));
      const res = await request(app).get('/api/search?q=test')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(403);
    });

    it('supports query with special characters', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/search?q=XR%20Platform').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
