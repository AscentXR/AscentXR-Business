import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOn = vi.fn();
const mockOff = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('socket.io-client', () => ({
  io: vi.fn().mockReturnValue({
    on: (...args: any[]) => mockOn(...args),
    off: (...args: any[]) => mockOff(...args),
    disconnect: (...args: any[]) => mockDisconnect(...args),
    connected: false,
  }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { uid: 'test-uid', email: 'admin@ascentxr.com', name: 'Admin', role: 'admin' },
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { useWebSocket } from '../../hooks/useWebSocket';

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.connected).toBe(false);
  });

  it('creates socket connection when token exists', async () => {
    const { io } = await import('socket.io-client');
    renderHook(() => useWebSocket());
    await waitFor(() => {
      expect(io).toHaveBeenCalled();
    });
  });

  it('provides subscribe function', () => {
    const { result } = renderHook(() => useWebSocket());
    expect(typeof result.current.subscribe).toBe('function');
  });

  it('subscribe returns unsubscribe function', () => {
    const { result } = renderHook(() => useWebSocket());
    const handler = vi.fn();
    const unsubscribe = result.current.subscribe('test-event', handler);
    expect(typeof unsubscribe).toBe('function');
  });
});
