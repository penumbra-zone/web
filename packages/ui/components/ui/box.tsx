import { cva, VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/utils';

const variants = cva('rounded-lg border bg-background', {
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
    overflow: {
      xHidden: 'overflow-x-hidden',
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
  overflow,
  layout,
  layoutId,
  headerContent,
}: PropsWithChildren<
  VariantProps<typeof variants> & {
    label?: ReactNode;
    layout?: boolean;
    layoutId?: string;
    headerContent?: ReactNode;
  }
>) => {
  return (
    <motion.div
      layout={layout ?? !!layoutId}
      layoutId={layoutId}
      className={cn('flex flex-col gap-4', variants({ spacing, state, overflow }))}
    >
      {(label ?? headerContent) && (
        <div className='flex items-center justify-between'>
          {label && (
            <motion.div layout layoutId={layoutId ? `${layoutId}.label` : undefined}>
              <div className='grow font-bold'>{label}</div>
            </motion.div>
          )}
          {headerContent && (
            <motion.div layout className='grow-0'>
              {headerContent}
            </motion.div>
          )}
        </div>
      )}

      {children && (
        <motion.div layout className='origin-top' animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};
