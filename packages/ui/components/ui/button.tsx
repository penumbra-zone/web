import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg px-4 font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-teal/80 bg-teal',
        gradient:
          'background-size-200 bg-button-gradient transition-all duration-500 hover:bg-right',
        secondary:
          'before:border-mask before:background-size-200 relative before:absolute before:inset-0 before:rounded-lg before:bg-button-gradient before:p-px before:transition-all before:duration-500 before:content-[""] before:hover:bg-right',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        destructiveSecondary:
          'before:border-mask before:background-size-200 relative text-destructive before:absolute before:inset-0 before:rounded-lg before:bg-destructive before:p-px before:transition-all before:duration-500 before:content-[""] hover:text-white before:hover:bg-right',
        outline:
          'rounded-none border-b border-border-secondary bg-background font-body font-bold text-muted-foreground hover:opacity-50',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-muted-foreground underline-offset-4 hover:underline',
        onLight: 'bg-stone-700 text-white hover:bg-stone-600 focus:ring-2 focus:ring-gray-400',
      },
      size: {
        default: 'h-9 md:h-11',
        sm: 'h-[22px] text-xs font-normal',
        md: 'h-9',
        lg: 'h-11',
        icon: 'size-10',
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
  /**
   * Merges its props onto its immediate child.
   *
   * @see https://www.radix-ui.com/primitives/docs/utilities/slot#slot
   */
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
