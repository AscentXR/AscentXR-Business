import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase config module
vi.mock('../../config/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('mock-firebase-token'),
    },
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates an axios instance with baseURL /api', async () => {
    const mockCreate = vi.fn().mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });

    vi.doMock('axios', () => ({ default: { create: mockCreate } }));

    await import('../../api/client');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('registers request interceptor for Firebase token', async () => {
    const requestUse = vi.fn();
    vi.doMock('axios', () => ({
      default: {
        create: vi.fn().mockReturnValue({
          interceptors: {
            request: { use: requestUse },
            response: { use: vi.fn() },
          },
        }),
      },
    }));

    await import('../../api/client');
    expect(requestUse).toHaveBeenCalledTimes(1);
  });

  it('registers response interceptor for 401 handling', async () => {
    const responseUse = vi.fn();
    vi.doMock('axios', () => ({
      default: {
        create: vi.fn().mockReturnValue({
          interceptors: {
            request: { use: vi.fn() },
            response: { use: responseUse },
          },
        }),
      },
    }));

    await import('../../api/client');
    expect(responseUse).toHaveBeenCalledTimes(1);
  });
});
