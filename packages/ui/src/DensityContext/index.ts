import { createContext } from 'react';
import { Density } from '../types/Density';

/**
 * Use this context to set the density of all descendent components in the
 * component tree. This is useful for, e.g., wrapping an entire `<Table />` that
 * will have multiple descendent components that each have `density` variants.
 */
export const DensityContext = createContext<Density>('sparse');
