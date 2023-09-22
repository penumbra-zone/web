import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-teal/80 bg-teal',
        gradient:
          'background-size-200 bg-button-gradient transition-all duration-500 hover:bg-right-center',
        secondary:
          'before:border-mask before:background-size-200 relative before:absolute before:inset-0 before:rounded-lg before:bg-button-gradient before:p-[1px] before:transition-all before:duration-500 before:content-[""] before:hover:bg-right-center',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'rounded-none border-b border-border-secondary bg-background font-body font-bold text-muted-foreground hover:opacity-50',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-muted-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 md:h-11',
        sm: 'h-[22px]',
        lg: 'h-11',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
