import { VariantProps, cva } from 'class-variance-authority';
import { PropsWithChildren } from 'react';

const variants = cva('rounded-lg border bg-background', {
  variants: {
    spacing: {
      compact: 'p-2',
      default: 'p-4',
    },
  },
  defaultVariants: {
    spacing: 'default',
  },
});

/**
 * A simple black box with rounded corners and a border.
 */
export const Box = ({
  children,
  label,
  spacing,
}: PropsWithChildren<VariantProps<typeof variants> & { label?: string }>) => {
  return (
    <div className={variants({ spacing })}>
      {label && <div className='font-bold text-muted-foreground mb-2'>{label}</div>}
      {children}
    </div>
  );
};
