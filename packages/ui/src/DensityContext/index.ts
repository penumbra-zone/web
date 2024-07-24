import { createContext } from 'react';
import { Density } from '../types/Density';

/**
 * Use this context to set the density of all descendent components in the
 * component tree. This is useful for, e.g., wrapping an entire `<Table />` that
 * will have multiple descendent components that each take a `density` prop.
 *
 * Note that components whose `density` props are manually set will override
 * whatever the context value is.
 */
export const DensityContext = createContext<Density>('sparse');
