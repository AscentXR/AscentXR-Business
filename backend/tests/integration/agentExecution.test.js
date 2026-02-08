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

describe('Agent Execution API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('POST /api/agents/execute', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/agents/execute');
      expect(res.status).toBe(401);
    });

    it('returns 400 with missing fields', async () => {
      const res = await request(app).post('/api/agents/execute')
        .set('Authorization', authHeader)
        .send({ agent_id: 'sdr' });
      expect(res.status).toBe(400);
    });

    it('creates and queues task', async () => {
      const task = { agent_id: 'sdr', title: 'Generate leads', prompt: 'Find 10 leads' };
      // createTask: 1 INSERT query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ...task, status: 'queued' }], rowCount: 1 });
      const res = await request(app).post('/api/agents/execute')
        .set('Authorization', authHeader)
        .send(task);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/agents/tasks', () => {
    it('returns task list', async () => {
      // getTasks makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Generate leads' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/agents/tasks').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/agents/tasks/:id', () => {
    it('returns task by ID', async () => {
      // getTask: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Generate leads' }], rowCount: 1 });
      const res = await request(app).get('/api/agents/tasks/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when task not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/agents/tasks/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/agents/tasks/:id/review', () => {
    it('returns 400 with invalid action', async () => {
      const res = await request(app).put('/api/agents/tasks/1/review')
        .set('Authorization', authHeader)
        .send({ action: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('reviews task with valid action', async () => {
      // reviewTask with notes: 1 getTask query + 1 UPDATE query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, result: 'Some result', status: 'review' }], rowCount: 1 }); // getTask
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'approved' }], rowCount: 1 }); // UPDATE
      const res = await request(app).put('/api/agents/tasks/1/review')
        .set('Authorization', authHeader)
        .send({ action: 'approved', feedback: 'Looks good' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
