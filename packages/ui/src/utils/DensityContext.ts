import { createContext } from 'react';
import { Density } from '../types/Density';

/**
 * This context is used internally by the `<Density />` component and the
 * `useDensity()` hook. It is not intended for external use. Consumers wishing
 * to use density variants should use either the `<Density />` component or the
 * `useDensity()` hook.
 */
export const DensityContext = createContext<Density>('sparse');
