const request = require('supertest');

// Mock the database before requiring app
jest.mock('../db/connection', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

// Mock firebase-admin for auth
const mockVerifyIdToken = jest.fn();
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn().mockReturnValue({}),
  credential: { applicationDefault: jest.fn(), cert: jest.fn() },
  auth: jest.fn(() => ({ verifyIdToken: mockVerifyIdToken }))
}));

const app = require('../server');

describe('Auth API', () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
  });

  describe('GET /api/auth/session', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/session');
      expect(res.status).toBe(401);
    });

    it('should return user info with valid Firebase token', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'test-uid',
        email: 'jim@ascentxr.com',
        name: 'Jim',
        role: 'admin'
      });

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer mock-firebase-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('jim@ascentxr.com');
      expect(res.body.user.uid).toBe('test-uid');
    });

    it('should return 403 with invalid token', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(403);
    });

    it('should return 401 when token is expired', async () => {
      const err = new Error('Token expired');
      err.code = 'auth/id-token-expired';
      mockVerifyIdToken.mockRejectedValue(err);

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer expired-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token expired');
    });

    it('should return 401 when token is revoked', async () => {
      const err = new Error('Token revoked');
      err.code = 'auth/id-token-revoked';
      mockVerifyIdToken.mockRejectedValue(err);

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer revoked-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('revoked');
    });
  });

  describe('POST /api/auth/session/sync', () => {
    it('should sync user to database on login', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'test-uid',
        email: 'jim@ascentxr.com',
        name: 'Jim',
        role: 'admin'
      });

      const db = require('../db/connection');
      db.query.mockResolvedValueOnce({
        rows: [{
          firebase_uid: 'test-uid',
          email: 'jim@ascentxr.com',
          display_name: 'Jim',
          role: 'admin'
        }],
        rowCount: 1
      });

      const res = await request(app)
        .post('/api/auth/session/sync')
        .set('Authorization', 'Bearer mock-firebase-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('jim@ascentxr.com');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should succeed with valid token', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'test-uid',
        email: 'jim@ascentxr.com',
        name: 'Jim',
        role: 'admin'
      });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer mock-firebase-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Health Endpoints', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/health should return ok with version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });
});

describe('Protected Routes', () => {
  it('should return 401 for /api/crm/contacts without token', async () => {
    const res = await request(app).get('/api/crm/contacts');
    expect(res.status).toBe(401);
  });

  it('should return 401 for /api/metrics/financial without token', async () => {
    const res = await request(app).get('/api/metrics/financial');
    expect(res.status).toBe(401);
  });

  it('should return 401 for /api/linkedin/posts without token', async () => {
    const res = await request(app).get('/api/linkedin/posts');
    expect(res.status).toBe(401);
  });

  it('should return 401 for /api/agents/progress without token', async () => {
    const res = await request(app).get('/api/agents/progress');
    expect(res.status).toBe(401);
  });

  it('should return 401 for /api/documents without token', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(401);
  });
});
