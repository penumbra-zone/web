import { useCallback, useRef } from 'react';

/**
 * Creates a function that fires only once in a given time frame.
 *
 * This hook adapts the function for React since the framework tends
 * to reset function's inner state on each re-render.
 */
export function useThrottle<T extends (...args: unknown[]) => void>(func: T, limit: number) {
  const lastCall = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= limit) {
        lastCall.current = now;
        func(...args);
      }
    },
    [func, limit],
  );
}
