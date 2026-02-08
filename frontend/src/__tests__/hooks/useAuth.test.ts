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
      user: { username: 'admin', name: 'Admin User', role: 'CEO' as const },
      token: 'mock-token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.user?.username).toBe('admin');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token');
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
      token: null,
      isAuthenticated: false,
      login,
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.login('admin', 'password');
    expect(login).toHaveBeenCalledWith('admin', 'password');
  });

  it('provides logout function', () => {
    const logout = vi.fn();
    const mockValue = {
      user: { username: 'admin', name: 'Admin', role: 'CEO' as const },
      token: 'tok',
      isAuthenticated: true,
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
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
