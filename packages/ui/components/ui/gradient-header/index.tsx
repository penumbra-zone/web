import { motion } from 'framer-motion';

/**
 * A header with text whose color is a gradient of brand colors.
 */
export const GradientHeader = ({
  children,
  layout,
  layoutId,
}: {
  children: string;
  layout?: boolean;
  layoutId?: string;
}) => (
  <motion.p
    layout={layout ?? !!layoutId}
    className='bg-text-linear bg-clip-text font-headline text-xl font-semibold leading-[30px] text-transparent md:text-2xl md:font-bold md:leading-9'
  >
    {children}
  </motion.p>
);
