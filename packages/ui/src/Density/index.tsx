import { ReactNode } from 'react';
import { Density as TDensity } from '../types/Density';
import { DensityContext } from '../utils/DensityContext';

export interface DensityProps {
  children?: ReactNode;
  density: TDensity;
}

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
 * Instead, you can simply wrap the entire `<Table />` with `<Density density='sparse' />`
 * or `<Density density='compact' />`, and it will set a density context value for all
 * descendant components:
 *
 * ```tsx
 * <Density density='compact'>
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
 * Components that support density variants are recognizable because the use the
 * `useDensity()` hook, and then style their elements based on the value they
 * receive from that hook:
 *
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
 *
 * In some specific situations, you may want to make sure that a given component
 * that supports density variants always is rendered at a specific density. For
 * example, let's say you have an icon-only button as the `startAdornment` for a
 * `<TextInput />`, and you want to make sure that icon-only button always
 * renders as `compact` density. In that case, simply wrap the button in
 * `<Density density='compact' />`. Then, it will always be compact, even if there's a
 * higher-up `<Density density='sparse' />`:
 *
 * ```tsx
 * <TextInput
 *   // ...
 *   startAdornment={
 *     <Density density='compact'>
 *       <Button iconOnly icon={Search}>Search</Button>
 *     </Density>
 *   }
 * />
 * ```
 */
export const Density = ({ children, density }: DensityProps) => (
  <DensityContext.Provider value={density}>{children}</DensityContext.Provider>
);
