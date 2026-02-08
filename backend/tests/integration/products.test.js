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

describe('Products API', () => {
  beforeEach(() => { mockQuery.mockReset(); });

  describe('GET /api/products', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
    });

    it('returns product list with valid token', async () => {
      // getProducts makes 2 queries: data + count
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'XR Platform' }], rowCount: 1 });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      const res = await request(app).get('/api/products').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.status).toBe(401);
    });

    it('returns 404 when product not found', async () => {
      // getProductById: 2 queries via Promise.all (product + features)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // product
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // features
      const res = await request(app).get('/api/products/999').set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/products', () => {
    it('returns 400 with missing fields', async () => {
      const res = await request(app).post('/api/products')
        .set('Authorization', authHeader)
        .send({ name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('creates product with valid data', async () => {
      const product = { name: 'XR Platform', category: 'software', pricing_model: 'subscription', base_price: 999 };
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, ...product }], rowCount: 1 });
      const res = await request(app).post('/api/products')
        .set('Authorization', authHeader)
        .send(product);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates product with valid data', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated' }], rowCount: 1 });
      const res = await request(app).put('/api/products/1')
        .set('Authorization', authHeader)
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes product', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      const res = await request(app).delete('/api/products/1').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
