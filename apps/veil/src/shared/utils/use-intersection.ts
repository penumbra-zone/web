import { useEffect, RefObject } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  once?: boolean;
  isIntersectingCallback?: boolean;
}

export function useIntersection(
  ref: RefObject<Element>,
  callback: (isIntersecting: boolean) => void,
  { once, ...options }: IntersectionOptions = {},
): void {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    if (ref.current) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (options.isIntersectingCallback) {
              callback(entry.isIntersecting);
            } else if (entry.isIntersecting) {
              callback(true);

              if (once && observer) {
                observer.disconnect();
                observer = null;
              }
            }
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0,
          ...options,
        },
      );

      observer.observe(ref.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }, [ref, callback, options, once]);
}
