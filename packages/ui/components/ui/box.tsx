import { VariantProps, cva } from 'class-variance-authority';
import { PropsWithChildren } from 'react';

const variants = cva('overflow-hidden rounded-lg border bg-background', {
  variants: {
    spacing: {
      /** Useful for e.g., wrapping around a transparent `<Input />`. */
      compact: 'p-2',
      /** Default, roomier spacing. */
      default: 'p-4',
    },
    state: {
      default: '',
      error: 'border-red',
    },
  },
  defaultVariants: {
    spacing: 'default',
    state: 'default',
  },
});

/**
 * A simple black box with rounded corners and a border.
 */
export const Box = ({
  children,
  label,
  spacing,
  state,
}: PropsWithChildren<VariantProps<typeof variants> & { label?: string }>) => {
  return (
    <div className={variants({ spacing, state })}>
      {label && <div className='mb-2 font-bold'>{label}</div>}
      {children}
    </div>
  );
};
