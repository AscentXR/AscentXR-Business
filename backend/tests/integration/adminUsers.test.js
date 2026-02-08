const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

// Mock firebase-admin for auth
const mockVerifyIdToken = jest.fn();
const mockCreateUser = jest.fn();
const mockSetCustomUserClaims = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockGetUser = jest.fn();
const mockGeneratePasswordResetLink = jest.fn();
const mockRevokeRefreshTokens = jest.fn();

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn().mockReturnValue({}),
  credential: { applicationDefault: jest.fn(), cert: jest.fn() },
  auth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
    createUser: mockCreateUser,
    setCustomUserClaims: mockSetCustomUserClaims,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    getUser: mockGetUser,
    generatePasswordResetLink: mockGeneratePasswordResetLink,
    revokeRefreshTokens: mockRevokeRefreshTokens
  }))
}));

const request = require('supertest');
const app = require('../../server');

const adminToken = 'Bearer mock-admin-token';
const viewerToken = 'Bearer mock-viewer-token';

describe('Admin Users API', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockVerifyIdToken.mockReset();
    mockCreateUser.mockReset();
    mockSetCustomUserClaims.mockReset();
    mockRevokeRefreshTokens.mockReset();
  });

  function setAdminAuth() {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'admin-uid',
      email: 'admin@ascentxr.com',
      name: 'Admin',
      role: 'admin'
    });
  }

  function setViewerAuth() {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'viewer-uid',
      email: 'viewer@ascentxr.com',
      name: 'Viewer',
      role: 'viewer'
    });
  }

  describe('GET /api/admin/users', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('returns 403 for viewer role', async () => {
      setViewerAuth();
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', viewerToken);
      expect(res.status).toBe(403);
    });

    it('returns user list for admin', async () => {
      setAdminAuth();
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '1', firebase_uid: 'uid-1', email: 'user1@test.com', display_name: 'User 1', role: 'admin', is_enabled: true },
          { id: '2', firebase_uid: 'uid-2', email: 'user2@test.com', display_name: 'User 2', role: 'viewer', is_enabled: true }
        ],
        rowCount: 2
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/admin/users', () => {
    it('returns 403 for viewer role', async () => {
      setViewerAuth();
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', viewerToken)
        .send({ email: 'new@test.com', password: 'pass123' });
      expect(res.status).toBe(403);
    });

    it('returns 400 without email or password', async () => {
      setAdminAuth();
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', adminToken)
        .send({ email: 'new@test.com' });
      expect(res.status).toBe(400);
    });

    it('creates user for admin', async () => {
      setAdminAuth();
      mockCreateUser.mockResolvedValue({ uid: 'new-uid' });
      mockSetCustomUserClaims.mockResolvedValue();
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: '3', firebase_uid: 'new-uid', email: 'new@test.com', display_name: 'New User', role: 'viewer' }],
        rowCount: 1
      });

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', adminToken)
        .send({ email: 'new@test.com', displayName: 'New User', password: 'pass123', role: 'viewer' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@test.com' }));
    });
  });

  describe('PUT /api/admin/users/:uid', () => {
    it('updates user role for admin', async () => {
      setAdminAuth();
      mockSetCustomUserClaims.mockResolvedValue();
      mockRevokeRefreshTokens.mockResolvedValue();
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: '1', firebase_uid: 'target-uid', role: 'admin' }],
        rowCount: 1
      });

      const res = await request(app)
        .put('/api/admin/users/target-uid')
        .set('Authorization', adminToken)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/admin/users/:uid', () => {
    it('deletes user for admin', async () => {
      setAdminAuth();
      mockDeleteUser.mockResolvedValue();
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: '1', firebase_uid: 'target-uid' }],
        rowCount: 1
      });

      const res = await request(app)
        .delete('/api/admin/users/target-uid')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
