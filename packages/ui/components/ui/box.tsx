import { cva, VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { PropsWithChildren, ReactNode } from 'react';
import { RESOLVED_TAILWIND_CONFIG } from '@penumbra-zone/tailwind-config/resolved-tailwind-config';
import { cn } from '../../lib/utils';

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
      className={cn('flex flex-col gap-4', variants({ spacing, state }))}
      /**
       * Set the border radius via the style prop so it doesn't get distorted by framer-motion.
       *
       * @see https://www.framer.com/motion/layout-animations/##scale-correction
       */
      style={{ borderRadius: RESOLVED_TAILWIND_CONFIG.theme.borderRadius.lg }}
    >
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
      {children && (
        <motion.div layout className='origin-top' animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};
