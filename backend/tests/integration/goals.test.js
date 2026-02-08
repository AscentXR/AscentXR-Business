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

describe('Goals API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('GET /api/goals', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/goals');
      expect(res.status).toBe(401);
    });

    it('returns goal list with valid token', async () => {
      // getGoals: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Revenue Target' }], rowCount: 1 });
      const res = await request(app).get('/api/goals').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/goals/tree', () => {
    it('returns OKR tree', async () => {
      // getTree: 1 query
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Revenue Target', goal_type: 'objective', parent_id: null, progress: 50, business_area: 'sales' }], rowCount: 1 });
      const res = await request(app).get('/api/goals/tree').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/goals/:id', () => {
    it('returns 404 when goal not found', async () => {
      // getGoalById: 1 query returns empty
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).get('/api/goals/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Goal not found');
    });

    it('returns goal by ID', async () => {
      // getGoalById: 1 query (non-objective, no children fetch)
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Revenue Target', goal_type: 'key_result' }], rowCount: 1 });
      const res = await request(app).get('/api/goals/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/goals', () => {
    it('returns 400 with missing fields', async () => {
      const res = await request(app).post('/api/goals')
        .set('Authorization', authHeader)
        .send({ title: 'Revenue Target' });
      expect(res.status).toBe(400);
    });

    it('creates goal with valid data', async () => {
      const goal = { title: 'Revenue Target', goal_type: 'objective' };
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ...goal }], rowCount: 1 });
      const res = await request(app).post('/api/goals')
        .set('Authorization', authHeader)
        .send(goal);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('updates goal', async () => {
      // updateGoal: 1 update query, result has no parent_id so no rollup
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, progress: 75, parent_id: null }], rowCount: 1 });
      const res = await request(app).put('/api/goals/1')
        .set('Authorization', authHeader)
        .send({ progress: 75 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when goal not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).put('/api/goals/999')
        .set('Authorization', authHeader)
        .send({ progress: 75 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('deletes goal', async () => {
      // deleteGoal: 1 query, result has no parent_id so no rollup
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }], rowCount: 1 });
      const res = await request(app).delete('/api/goals/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
