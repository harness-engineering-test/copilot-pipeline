import { renderHook, act } from '@testing-library/react-native';
import { useLoadingState } from '../../src/hooks/useLoadingState';

describe('useLoadingState', () => {
  it('initializes with idle state by default', () => {
    const { result } = renderHook(() => useLoadingState());
    expect(result.current.state).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('accepts a custom initial state', () => {
    const { result } = renderHook(() => useLoadingState('loading'));
    expect(result.current.state).toBe('loading');
    expect(result.current.isLoading).toBe(true);
  });

  it('transitions to loading state', () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => {
      result.current.setLoading();
    });
    expect(result.current.state).toBe('loading');
    expect(result.current.isLoading).toBe(true);
  });

  it('transitions to success state', () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => {
      result.current.setSuccess();
    });
    expect(result.current.state).toBe('success');
    expect(result.current.isSuccess).toBe(true);
  });

  it('transitions to error state', () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => {
      result.current.setError();
    });
    expect(result.current.state).toBe('error');
    expect(result.current.isError).toBe(true);
  });

  it('resets to idle state', () => {
    const { result } = renderHook(() => useLoadingState('error'));
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toBe('idle');
  });
});
