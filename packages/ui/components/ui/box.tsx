import { VariantProps, cva } from 'class-variance-authority';
import { PropsWithChildren } from 'react';

const variants = cva('rounded-lg border bg-background', {
  variants: {
    spacing: {
      /** Useful for e.g., wrapping around a transparent `<Input />`. */
      compact: 'p-2',
      /** Default, roomier spacing. */
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
      {label && <div className='mb-2 font-bold text-muted-foreground'>{label}</div>}
      {children}
    </div>
  );
};
