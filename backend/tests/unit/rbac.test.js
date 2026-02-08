jest.mock('../../db/connection', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn().mockReturnValue({}),
  credential: { applicationDefault: jest.fn(), cert: jest.fn() },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'jim@ascentxr.com',
      name: 'Jim',
      role: 'admin'
    })
  }))
}));

const { readOnlyForViewers, requireRole } = require('../../middleware/rbac');

describe('RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { method: 'GET', user: { uid: 'test', email: 'test@test.com', role: 'admin' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('readOnlyForViewers', () => {
    it('allows GET requests for viewers', () => {
      req.user.role = 'viewer';
      req.method = 'GET';
      readOnlyForViewers(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('blocks POST requests for viewers', () => {
      req.user.role = 'viewer';
      req.method = 'POST';
      readOnlyForViewers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('blocks PUT requests for viewers', () => {
      req.user.role = 'viewer';
      req.method = 'PUT';
      readOnlyForViewers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('blocks DELETE requests for viewers', () => {
      req.user.role = 'viewer';
      req.method = 'DELETE';
      readOnlyForViewers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('blocks PATCH requests for viewers', () => {
      req.user.role = 'viewer';
      req.method = 'PATCH';
      readOnlyForViewers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows all methods for admin', () => {
      req.user.role = 'admin';
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(method => {
        req.method = method;
        next.mockClear();
        readOnlyForViewers(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });

    it('allows requests with no user (auth middleware handles that)', () => {
      req.user = null;
      req.method = 'POST';
      readOnlyForViewers(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('allows admin when admin is required', () => {
      req.user.role = 'admin';
      const middleware = requireRole('admin');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('blocks viewer when admin is required', () => {
      req.user.role = 'viewer';
      const middleware = requireRole('admin');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows admin when viewer is required', () => {
      req.user.role = 'admin';
      const middleware = requireRole('viewer');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows viewer when viewer is required', () => {
      req.user.role = 'viewer';
      const middleware = requireRole('viewer');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
