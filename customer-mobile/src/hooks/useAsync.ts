import { useState, useCallback } from "react";
import type { ApiError } from "../types/api";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
};

export function useAsync<T>(
  fn: () => Promise<T>
): AsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as ApiError });
    }
  }, [fn]);

  return { ...state, execute };
}
