import { AnimatePresence, motion } from 'framer-motion';
import { ComponentProps, PropsWithChildren } from 'react';

/**
 * Use a constant for props, since they'll never change.
 */
const MOTION_DIV_PROPS: ComponentProps<typeof motion.div> = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * A simple wrapper around other elements that fades them in when they are
 * rendered.
 *
 * Note that this wraps those elements in a `<div />`, so any (e.g., flex box)
 * styling should be applied to elements _inside_ of `<FadeIn />`.
 *
 * @example
 * ```tsx
 * <FadeIn condition={shouldShowButtons}>
 *   <div className="flex items-center gap-2">
 *     <Button1 />
 *     <Button2 />
 *     <Button3 />
 *   </div>
 * </FadeIn>
 * ```
 */
export const FadeIn = ({ condition, children }: PropsWithChildren<{ condition: boolean }>) => (
  <AnimatePresence>
    {condition && <motion.div {...MOTION_DIV_PROPS}>{children}</motion.div>}
  </AnimatePresence>
);
