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

describe('Notifications API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('GET /api/notifications', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });

    it('returns notification list', async () => {
      // getNotifications makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, message: 'New lead' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/notifications').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('returns unread count', async () => {
      // getUnreadCount: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 });
      const res = await request(app).get('/api/notifications/unread-count').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('marks all notifications as read', async () => {
      // markAllAsRead: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 3 });
      const res = await request(app).put('/api/notifications/read-all').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('marks notification as read', async () => {
      // markAsRead: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, is_read: true }], rowCount: 1 });
      const res = await request(app).put('/api/notifications/1/read').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when notification not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/notifications/999/read').set('Authorization', authHeader);
      expect(res.status).toBe(404);
    });
  });
});
