import { createContext, useContext } from 'react';

/**
 * The density for a given layout. Generally, `sparse` is the correct size
 * choice (and is thus the default for any components that use the
 * `useDensity()` hook). But you can use `compact` for layouts containing a lot
 * of data that should be presented in a denser layout.
 *
 * See `<DensityContext />`
 */
export type Density = 'compact' | 'sparse';

/**
 * This context is used internally by the `<Density />` component and the
 * `useDensity()` hook. It is not intended for external use. Consumers wishing
 * to use density variants should use either the `<Density />` component or the
 * `useDensity()` hook.
 */
export const DensityContext = createContext<Density>('sparse');

/**
 * Returns the `Density` value to use for the component using this hook, by
 * grabbing the value from `DensityContext`.
 *
 * @example
 * ```tsx
 * const SomeStyledComponent = styled.div<{ $density: Density }>`
 *   padding: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
 * `
 *
 * const MyComponent = () => {
 *   const density = useDensity();
 *
 *   return <SomeStyledComponent $density={density} />
 * }
 * ```
 */
export const useDensity = (): Density => useContext(DensityContext);
