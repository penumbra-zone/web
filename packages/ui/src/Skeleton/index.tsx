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
        'relative w-full h-full bg-other-tonalFill5 overflow-hidden',
        'before:content-[""] before:w-full before:h-full before:absolute before:top-1/2 before:left-1/2',
        'before:animate-shimmer before:-translate-x-1/2 before:-translate-y-1/2',
        'before:bg-gradient-to-r before:from-transparent before:via-other-tonalFill5 before:to-transparent',
        circular ? 'rounded-full' : 'rounded-xs',
      )}
    />
  );
};
