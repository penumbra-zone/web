import { useContext } from 'react';
import { Density } from '../../types/Density';
import { DensityContext } from '../../DensityContext';

/**
 * Returns the appropriate `Density` value to use for the component using this
 * hook. If you pass it a defined `Density` value, it will return that.
 * Otherwise, it will grab the `Density` value from `DensityContext`, which is
 * `sparse` by default if no `DensityContext.Provider` exists higher in the
 * component tree.
 *
 * @example
 * ```tsx
 * const MyComponent = ({ density }: { density?: Density }) => {
 *   density = useDensity(density); // Note the lack of `const` — we're reassigning `density`.
 *
 *   return <SomeStyledComponent $density={density} />
 * }
 * ```
 */
export const useDensity = (
  /**
   * The `density` prop passed into the component using this hook. If passed, it
   * will override whatever value `<DensityContext />` provides.
   */
  density?: Density,
): Density => {
  const densityFromContext = useContext(DensityContext);

  if (density) {
    return density;
  }

  return densityFromContext;
};
