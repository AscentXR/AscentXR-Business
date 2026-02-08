import { describe, it, expect, vi, beforeEach } from 'vitest';

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

  it('registers request interceptor for JWT token', async () => {
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

  it('request interceptor attaches token from localStorage', async () => {
    let interceptorFn: any;
    vi.doMock('axios', () => ({
      default: {
        create: vi.fn().mockReturnValue({
          interceptors: {
            request: {
              use: vi.fn((fn: any) => { interceptorFn = fn; }),
            },
            response: { use: vi.fn() },
          },
        }),
      },
    }));

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token');

    await import('../../api/client');

    const config = { headers: {} as any };
    const result = interceptorFn(config);

    expect(result.headers.Authorization).toBe('Bearer test-token');
    getItemSpy.mockRestore();
  });
});
