import { VariantProps, cva } from 'class-variance-authority';
import { PropsWithChildren, ReactNode } from 'react';

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
  headerContent,
}: PropsWithChildren<
  VariantProps<typeof variants> & { label?: string; headerContent?: ReactNode }
>) => {
  return (
    <div className={variants({ spacing, state })}>
      <div className='mb-4 flex items-center justify-between'>
        {label && <div className='grow font-bold'>{label}</div>}
        <div className='grow-0'>{headerContent}</div>
      </div>

      {children}
    </div>
  );
};
