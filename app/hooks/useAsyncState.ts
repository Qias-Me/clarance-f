import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncStateOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsyncState<T = any>(
  initialData: T | null = null,
  options: UseAsyncStateOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    if (!isMountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    retryCountRef.current = 0;

    const attemptExecution = async (): Promise<void> => {
      try {
        const result = await asyncFunction();
        
        if (isMountedRef.current) {
          setState({ data: result, loading: false, error: null });
          options.onSuccess?.(result);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (options.retryCount && retryCountRef.current < options.retryCount) {
          retryCountRef.current++;
          const delay = options.retryDelay || 1000 * retryCountRef.current;
          
          setTimeout(() => {
            if (isMountedRef.current) {
              attemptExecution();
            }
          }, delay);
        } else {
          if (isMountedRef.current) {
            setState(prev => ({ ...prev, loading: false, error: err }));
            options.onError?.(err);
          }
        }
      }
    };

    await attemptExecution();
  }, [options]);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
    retryCountRef.current = 0;
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    isIdle: !state.loading && !state.error && !state.data,
    isSuccess: !state.loading && !state.error && state.data !== null
  };
}