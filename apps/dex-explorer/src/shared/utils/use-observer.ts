import { useEffect, useRef } from 'react';

/** A hook that fires the callback when observed element (on the bottom of the page) is in the view */
export const useObserver = (disabled: boolean, cb: VoidFunction) => {
  const observerEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ref = observerEl.current;
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting && !disabled) {
          cb();
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 1.0,
      },
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [cb, disabled]);

  return {
    observerEl,
  };
};
