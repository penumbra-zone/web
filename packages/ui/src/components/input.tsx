import * as React from 'react';

import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const inputVariants = cva(
  'flex h-11 w-full rounded-lg border bg-background px-3 py-2 ring-offset-background [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  {
    variants: {
      variant: {
        default: '',
        success: 'border-teal',
        error: 'border-red-400',
        warn: 'border-yellow-300',
        transparent:
          'h-[22px] rounded-none border-none bg-transparent p-0 placeholder:text-[15px] placeholder:font-bold placeholder:leading-[22px] placeholder:text-light-brown',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
