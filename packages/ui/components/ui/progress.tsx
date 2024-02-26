'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const progressVariants = cva('', {
  variants: {
    status: {
      'in-progress': 'bg-sand',
      done: 'bg-teal',
    },
    background: {
      black: 'bg-black',
      stone: 'bg-stone-800',
    },
  },
});

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  size?: 'lg' | 'sm';
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, status, background = 'black', size = 'lg', ...props }, ref) => {
    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative z-0',
          size === 'lg' && 'h-3',
          size === 'sm' && 'h-1',
          'w-full overflow-hidden rounded-lg',
          progressVariants({ background }),
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 rounded-lg transition-all z-20',
            progressVariants({ status }),
          )}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
