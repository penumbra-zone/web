import * as React from 'react';

import { cn } from '@ui/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  valid?: boolean | undefined;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ valid, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          ' bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          valid === undefined ? 'border-neutral-700' : valid ? 'border-b-teal' : 'border-red-400',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
