import { VariantProps, cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { PropsWithChildren, ReactNode } from 'react';

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
  layoutId,
}: PropsWithChildren<VariantProps<typeof variants> & { label?: ReactNode; layoutId?: string }>) => {
  return (
    <motion.div
      layout={layoutId ? true : false}
      layoutId={layoutId}
      className={variants({ spacing, state })}
    >
      {label && (
        <motion.div layout layoutId={`${layoutId}.label`}>
          <div className='mb-2 font-bold'>{label}</div>
        </motion.div>
      )}
      <motion.div layout className='origin-top' initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}>
        {children}
      </motion.div>
    </motion.div>
  );
};
