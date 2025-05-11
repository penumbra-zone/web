import { useCallback, useEffect, useMemo, useState } from 'react';
import { theme } from '@penumbra-zone/ui/theme';
import { useDebounce } from '@/shared/utils/use-debounce';

const breakpoints = theme.breakpoint;
export type Viewport = keyof typeof breakpoints;

/**
 * A client-only component that returns the viewport type
 */
export const useViewport = (): Viewport => {
  const [width, setWidth] = useState<number>(breakpoints.lg);
  const debouncedWidth = useDebounce(width, 250);

  const resize = useCallback(() => {
    setWidth(document.body.clientWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  return useMemo(() => {
    if (debouncedWidth < breakpoints.tablet) {
      return 'mobile';
    }
    if (debouncedWidth < breakpoints.desktop) {
      return 'tablet';
    }
    if (debouncedWidth < breakpoints.lg) {
      return 'desktop';
    }
    if (debouncedWidth < breakpoints.xl) {
      return 'lg';
    }
    return 'xl';
  }, [debouncedWidth]);
};
