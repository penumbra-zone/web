'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const progressVariants = cva('', {
  variants: {
    variant: {
      'in-progress': 'bg-sand',
      done: 'bg-teal',
    },
  },
  defaultVariants: {
    variant: 'in-progress',
  },
});

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  size?: 'lg' | 'sm';
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, variant, size = 'lg', ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative',
        size === 'lg' && 'h-3',
        size === 'sm' && 'h-1',
        'w-full overflow-hidden rounded-lg bg-background',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 rounded-lg transition-all',
          progressVariants({ variant }),
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
