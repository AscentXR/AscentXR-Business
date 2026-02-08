import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useApi } from '../../hooks/useApi';

describe('useApi', () => {
  it('starts with loading state', () => {
    const fetcher = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useApi(fetcher, []));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('resolves data on success', async () => {
    const mockData = { items: ['a', 'b'] };
    const fetcher = vi.fn().mockResolvedValue({ data: { data: mockData } });
    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('extracts API error message from response', async () => {
    const fetcher = vi.fn().mockRejectedValue({
      response: { data: { error: 'Unauthorized' } },
    });
    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unauthorized');
  });

  it('provides refetch function', async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({ data: { data: { count: callCount } } });
    });

    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ count: 1 });

    // Trigger refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 2 });
    });
  });
});
