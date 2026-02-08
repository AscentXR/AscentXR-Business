import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { useNotifications } from '../../hooks/useNotifications';

function createWrapper(contextValue: any) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(NotificationContext.Provider, { value: contextValue }, children);
  };
}

describe('useNotifications', () => {
  it('returns context value when within NotificationProvider', () => {
    const mockValue = {
      notifications: [{ id: 'n1', title: 'Test', type: 'alert', severity: 'high', section: 'sales', is_read: false, created_at: '2026-02-07' }],
      unreadCount: 3,
      loading: false,
      markRead: vi.fn(),
      markAllRead: vi.fn(),
      refetch: vi.fn(),
    };

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.unreadCount).toBe(3);
    expect(result.current.notifications).toHaveLength(1);
  });

  it('throws when used outside NotificationProvider', () => {
    expect(() => {
      renderHook(() => useNotifications());
    }).toThrow('useNotifications must be used within a NotificationProvider');
  });

  it('provides markRead function', () => {
    const markRead = vi.fn();
    const mockValue = {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markRead,
      markAllRead: vi.fn(),
      refetch: vi.fn(),
    };

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.markRead('n1');
    expect(markRead).toHaveBeenCalledWith('n1');
  });

  it('provides markAllRead function', () => {
    const markAllRead = vi.fn();
    const mockValue = {
      notifications: [],
      unreadCount: 5,
      loading: false,
      markRead: vi.fn(),
      markAllRead,
      refetch: vi.fn(),
    };

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.markAllRead();
    expect(markAllRead).toHaveBeenCalled();
  });
});
