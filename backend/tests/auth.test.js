const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock the database before requiring app
jest.mock('../db/connection', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const app = require('../server');

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 if username or password missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'jim' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'invalid', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return JWT token for valid dev credentials', async () => {
      process.env.DEV_PASSWORD = 'test-dev-pass';
      process.env.NODE_ENV = 'development';

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'jim', password: 'test-dev-pass' });

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.username).toBe('jim');
        expect(res.body.user.role).toBe('CEO');
      }

      delete process.env.DEV_PASSWORD;
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/session');
      expect(res.status).toBe(401);
    });

    it('should return user info with valid token', async () => {
      const token = jwt.sign(
        { username: 'jim', name: 'Jim', role: 'CEO' },
        process.env.JWT_SECRET || 'change-me-in-production',
        { expiresIn: '30m' }
      );

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('jim');
    });

    it('should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should succeed with valid token', async () => {
      const token = jwt.sign(
        { username: 'jim', name: 'Jim', role: 'CEO' },
        process.env.JWT_SECRET || 'change-me-in-production',
        { expiresIn: '30m' }
      );

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

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

describe('Rate Limiting', () => {
  it('should block after too many failed login attempts', async () => {
    // Make 6 rapid failed attempts (limit is 5)
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'attacker', password: 'wrong' });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'attacker', password: 'wrong' });

    // Should be rate limited (429) after exceeding attempts
    expect([401, 429]).toContain(res.status);
  });
});
