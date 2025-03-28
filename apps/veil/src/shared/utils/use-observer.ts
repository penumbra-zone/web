import { useEffect, useRef } from 'react';
import { useThrottle } from '@/shared/utils/use-throttle';

/** A hook that fires the callback when observed element (on the bottom of the page) is in the view */
export const useObserver = (disabled: boolean, cb: VoidFunction) => {
  const observerEl = useRef<HTMLDivElement | null>(null);
  const throttledFunction = useThrottle(cb, 400);

  useEffect(() => {
    const ref = observerEl.current;
    if (ref) {
      const observer = new IntersectionObserver(
        entries => {
          const [entry] = entries;
          if (entry?.isIntersecting && !disabled) {
            throttledFunction();
          }
        },
        {
          root: null,
          rootMargin: '20px',
          threshold: 1.0,
        },
      );
      observer.observe(ref);

      return () => {
        observer.unobserve(ref);
      };
    }
    return () => {};
  }, [disabled, throttledFunction]);

  return {
    observerEl,
  };
};
