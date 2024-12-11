import { ReactNode } from 'react';
import { Density as TDensity, DensityContext } from '../utils/density';

type DensityType = {
  [K in TDensity]: Record<K, true> & Partial<Record<Exclude<TDensity, K>, never>>;
}[TDensity];

type DensityPropType =
  | (DensityType & { variant?: never })
  | (Partial<Record<TDensity, never>> & {
      /** dynamic density variant as a string: `'sparse' | 'compact' | 'slim'` */
      variant?: TDensity;
    });

export type DensityProps = DensityPropType & {
  children?: ReactNode;
};

/**
 * Use the `<Density />` component to set the density for all descendants in the
 * component tree that support density variants.
 *
 * In Penumbra UI, density is never set as a prop directly on a component.
 * Instead, it's set indirectly via a React context, so that entire regions of a
 * UI can have a matching density.
 *
 * For example, imagine you have a `<Table />` (which supports density
 * variants), which contain a bunch of `<ValueViewComponent />`s (which also
 * support density variants). You may also have other components in the table
 * which contain nested components with density variants. If we used a `density`
 * prop, you'd need to set that prop on every single component in that tree.
 *
 * Instead, you can simply wrap the entire `<Table />` with `<Density sparse />`,
 * `<Density medium />` or `<Density compact />`, and it will set a density context value
 * for all descendant components:
 *
 * ```tsx
 * <Density compact>
 *   <Table>
 *     <Table.Tbody>
 *       <Table.Tr>
 *         <Table.Td>This will be rendered with compact spacing.</Table.Td>
 *       </Table.Tr>
 *     </Table.Tbody>
 *   </Table>
 * </Density>
 * ```
 *
 * Components that support density variants are recognizable because they use the
 * `useDensity()` hook, and then style their elements based on the value they
 * receive from that hook:
 *
 * ```tsx
 * const MyComponent = () => {
 *   const density = useDensity();
 *
 *   return <div className={density === 'sparse' ? 'p-4' : 'p-1' } />
 * }
 * ```
 *
 * In some specific situations, you may want to make sure that a given component
 * that supports density variants always is rendered at a specific density. For
 * example, let's say you have an icon-only button as the `startAdornment` for a
 * `<TextInput />`, and you want to make sure that icon-only button always
 * renders as `compact` density. In that case, simply wrap the button in
 * `<Density compact />`. Then, it will always be compact, even if there's a
 * higher-up `<Density sparse />`:
 *
 * ```tsx
 * <TextInput
 *   // ...
 *   startAdornment={
 *     <Density compact>
 *       <Button iconOnly icon={Search}>Search</Button>
 *     </Density>
 *   }
 * />
 * ```
 *
 * If you need to change density dynamically, you can use the `variant` property.
 *
 * ```tsx
 * <Density variant={isDense ? 'compact' : 'sparse'} />
 * ```
 */
export const Density = ({ children, sparse, slim, compact, variant }: DensityProps) => {
  const density: TDensity =
    variant ?? (sparse && 'sparse') ?? (compact && 'compact') ?? (slim && 'slim') ?? 'sparse';

  return <DensityContext.Provider value={density}>{children}</DensityContext.Provider>;
};
