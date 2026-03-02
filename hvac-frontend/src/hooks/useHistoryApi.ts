import { useState, useCallback } from 'react';

export interface UseHistoryApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useHistoryApi<T>(): {
  state: UseHistoryApiState<T>;
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<UseHistoryApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { state, execute, reset };
}
