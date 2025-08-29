import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage cleanup functions and prevent memory leaks
 */
export function useCleanup() {
  const cleanupFunctions = useRef<Set<() => void>>(new Set());
  const isMounted = useRef(true);

  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.add(cleanup);
    
    return () => {
      cleanupFunctions.current.delete(cleanup);
    };
  }, []);

  const executeCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    cleanupFunctions.current.clear();
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      executeCleanup();
    };
  }, [executeCleanup]);

  return {
    registerCleanup,
    executeCleanup,
    isMounted: () => isMounted.current
  };
}

/**
 * Hook to manage AbortController for cancellable operations
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { registerCleanup } = useCleanup();

  const getController = useCallback(() => {
    // Abort previous controller if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    abortControllerRef.current = new AbortController();
    
    // Register cleanup
    registerCleanup(() => {
      abortControllerRef.current?.abort();
    });

    return abortControllerRef.current;
  }, [registerCleanup]);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    getController,
    abort,
    signal: abortControllerRef.current?.signal
  };
}

/**
 * Hook to manage timeouts with automatic cleanup
 */
export function useTimeout() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const { registerCleanup } = useCleanup();

  const setTimeout = useCallback((
    callback: () => void,
    delay: number
  ): (() => void) => {
    const timeout = global.setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      callback();
    }, delay);

    timeoutsRef.current.add(timeout);

    // Register cleanup
    const cleanup = () => {
      global.clearTimeout(timeout);
      timeoutsRef.current.delete(timeout);
    };
    
    registerCleanup(cleanup);

    return cleanup;
  }, [registerCleanup]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(timeout => {
      global.clearTimeout(timeout);
    });
    timeoutsRef.current.clear();
  }, []);

  useEffect(() => {
    return clearAll;
  }, [clearAll]);

  return {
    setTimeout,
    clearAll
  };
}

/**
 * Hook to manage intervals with automatic cleanup
 */
export function useInterval() {
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const { registerCleanup } = useCleanup();

  const setInterval = useCallback((
    callback: () => void,
    delay: number
  ): (() => void) => {
    const interval = global.setInterval(callback, delay);
    intervalsRef.current.add(interval);

    // Register cleanup
    const cleanup = () => {
      global.clearInterval(interval);
      intervalsRef.current.delete(interval);
    };
    
    registerCleanup(cleanup);

    return cleanup;
  }, [registerCleanup]);

  const clearAll = useCallback(() => {
    intervalsRef.current.forEach(interval => {
      global.clearInterval(interval);
    });
    intervalsRef.current.clear();
  }, []);

  useEffect(() => {
    return clearAll;
  }, [clearAll]);

  return {
    setInterval,
    clearAll
  };
}

/**
 * Hook to manage event listeners with automatic cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = window,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);
  const { registerCleanup } = useCleanup();

  // Update ref when handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    const cleanup = () => {
      element.removeEventListener(eventName, eventListener, options);
    };

    registerCleanup(cleanup);

    return cleanup;
  }, [eventName, element, options, registerCleanup]);
}

/**
 * Hook to manage subscriptions with automatic cleanup
 */
export function useSubscription<T>() {
  const subscriptionsRef = useRef<Set<() => void>>(new Set());
  const { registerCleanup } = useCleanup();

  const subscribe = useCallback((
    unsubscribe: () => void
  ): void => {
    subscriptionsRef.current.add(unsubscribe);
    registerCleanup(unsubscribe);
  }, [registerCleanup]);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during unsubscribe:', error);
      }
    });
    subscriptionsRef.current.clear();
  }, []);

  useEffect(() => {
    return unsubscribeAll;
  }, [unsubscribeAll]);

  return {
    subscribe,
    unsubscribeAll
  };
}