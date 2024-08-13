import { useContext } from 'react';
import { Density } from '../../types/Density';
import { DensityContext } from '../../utils/DensityContext';

/**
 * Returns the `Density` value to use for the component using this hook, by
 * grabbing the value from `DensityContext`.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const density = useDensity();
 *   return <SomeStyledComponent $density={density} />
 * }
 * ```
 */
export const useDensity = (): Density => useContext(DensityContext);
