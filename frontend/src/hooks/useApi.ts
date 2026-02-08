import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  fetcher: () => Promise<{ data: { data: any } }>,
  deps: any[] = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetcher();
      let result = response.data.data;
      // Many endpoints wrap arrays as { items: [], total } — auto-unwrap
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        const keys = Object.keys(result);
        const arrayKey = keys.find((k) => Array.isArray((result as any)[k]));
        if (arrayKey) result = (result as any)[arrayKey];
      }
      setState({ data: result, loading: false, error: null });
    } catch (err: any) {
      const rawError = err.response?.data?.error;
      const errorMsg =
        typeof rawError === 'string'
          ? rawError
          : rawError?.message || err.message || 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMsg,
      });
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
