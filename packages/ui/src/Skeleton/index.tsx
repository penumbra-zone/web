import type { ElementType } from 'react';
import cn from 'clsx';

export interface SkeletonProps {
  as?: ElementType;
  circular?: boolean;
}

/**
 * Shimmering skeleton loader. By default, takes the full space of its parent.
 */
export const Skeleton = ({ as: Component = 'div', circular }: SkeletonProps) => {
  return (
    <Component
      className={cn(
        'relative h-full w-full overflow-hidden bg-other-tonal-fill5',
        'before:absolute before:top-1/2 before:left-1/2 before:h-full before:w-full before:content-[""]',
        'before:-translate-x-1/2 before:-translate-y-1/2 before:animate-shimmer',
        'before:bg-linear-to-r before:from-transparent before:via-other-tonal-fill5 before:to-transparent',
        circular ? 'rounded-full' : 'rounded-xs',
      )}
    />
  );
};
