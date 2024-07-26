import { ReactNode } from 'react';
import { Density as TDensity } from '../types/Density';
import { DensityContext } from '../DensityContext';

export type DensityProps<SelectedDensity extends TDensity> = {
  children?: ReactNode;
} & (SelectedDensity extends 'sparse'
  ? { sparse: true; compact?: never }
  : { compact: true; sparse?: never });

export const Density = <SelectedDensity extends TDensity>({
  children,
  sparse,
}: DensityProps<SelectedDensity>) => (
  <DensityContext.Provider value={sparse ? 'sparse' : 'compact'}>
    {children}
  </DensityContext.Provider>
);
