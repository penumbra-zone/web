import { ReactNode, useState } from 'react';
import { IsAnimatingContext } from '../utils/IsAnimatingContext';

export interface IsAnimatingProviderProps {
  /**
   * A function that returns the markup to render, including a framer-motion
   * component. The `props` passed to this function should be spread into the
   * framer-motion component.
   */
  children: (props: {
    onLayoutAnimationStart: VoidFunction;
    onLayoutAnimationComplete: VoidFunction;
  }) => ReactNode;
}

/**
 * Wrap this around a framer-motion component, if you want a descendent in the
 * component tree to be able to use the `useAnimationDeferredValue()` hook.
 *
 * ```tsx
 * <IsAnimatingProvider>
 *   {props => (
 *     <motion.div layout layoutId='someLayoutId' {...props}>
 *       <SomeComponentThatUsesUseAnimationDeferredValue />
 *     </motion.div>
 *   )}
 * </IsAnimatingProvider>
 * ```
 *
 * `<IsAnimatingProvider />` accepts a function as its `children`, which is
 * called with props to pass to the framer-motion component.
 */
export const IsAnimatingProvider = ({ children }: IsAnimatingProviderProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <IsAnimatingContext.Provider value={isAnimating}>
      {children({
        onLayoutAnimationStart: () => setIsAnimating(true),
        onLayoutAnimationComplete: () => setIsAnimating(false),
      })}
    </IsAnimatingContext.Provider>
  );
};
