import type { ElementType } from 'react';
import cn from 'clsx';

export interface SkeletonProps {
  as?: ElementType;
}

/**
 * Shimmering skeleton loader. By default, takes the full space of its parent.
 */
export const Skeleton = ({ as: Component = 'div' }: SkeletonProps) => {
  return (
    <Component
      className={cn(
        'relative w-full h-full bg-other-tonal-fill5 rounded-xs overflow-hidden',
        'before:content-[""] before:w-full before:h-full before:rounded-xs before:absolute before:top-1/2 before:left-1/2',
        'before:animate-shimmer before:-translate-x-1/2 before:-translate-y-1/2',
        'before:bg-linear-to-r before:from-transparent before:via-other-tonal-fill5 before:to-transparent',
      )}
    />
  );
};
