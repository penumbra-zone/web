import { AnimatePresence, motion } from 'framer-motion';
import { ComponentProps, PropsWithChildren } from 'react';

const MOTION_DIV_PROPS: ComponentProps<typeof motion.div> = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const FadeIn = ({ condition, children }: PropsWithChildren<{ condition: boolean }>) => (
  <AnimatePresence>
    {condition && <motion.div {...MOTION_DIV_PROPS}>{children}</motion.div>}
  </AnimatePresence>
);
