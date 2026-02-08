import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useContext, createElement } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';

function createWrapper(contextValue: any) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(AuthContext.Provider, { value: contextValue }, children);
  };
}

describe('useAuth', () => {
  it('returns context value when within AuthProvider', () => {
    const mockValue = {
      user: { uid: 'test-uid', email: 'admin@ascentxr.com', name: 'Admin User', role: 'admin' as const },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.user?.email).toBe('admin@ascentxr.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('provides login function', () => {
    const login = vi.fn();
    const mockValue = {
      user: null,
      isAuthenticated: false,
      loading: false,
      login,
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.login('admin@test.com', 'password');
    expect(login).toHaveBeenCalledWith('admin@test.com', 'password');
  });

  it('provides logout function', () => {
    const logout = vi.fn();
    const mockValue = {
      user: { uid: 'test-uid', email: 'admin@ascentxr.com', name: 'Admin', role: 'admin' as const },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout,
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.logout();
    expect(logout).toHaveBeenCalled();
  });

  it('reflects unauthenticated state', () => {
    const mockValue = {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('exposes loading state', () => {
    const mockValue = {
      user: null,
      isAuthenticated: false,
      loading: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.loading).toBe(true);
  });
});
