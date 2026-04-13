import { useState, useCallback } from 'react';
import type { LoadingState } from '../types';

interface UseLoadingStateReturn {
  state: LoadingState;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  setLoading: () => void;
  setSuccess: () => void;
  setError: () => void;
  reset: () => void;
}

export function useLoadingState(initial: LoadingState = 'idle'): UseLoadingStateReturn {
  const [state, setState] = useState<LoadingState>(initial);

  const setLoading = useCallback(() => setState('loading'), []);
  const setSuccess = useCallback(() => setState('success'), []);
  const setError = useCallback(() => setState('error'), []);
  const reset = useCallback(() => setState('idle'), []);

  return {
    state,
    isLoading: state === 'loading',
    isError: state === 'error',
    isSuccess: state === 'success',
    setLoading,
    setSuccess,
    setError,
    reset,
  };
}
