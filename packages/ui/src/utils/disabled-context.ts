import { createContext, useContext } from 'react';

/**
 * Used by `<FormField />` to set its `children` as `disabled`, so that
 * consumers of `<FormField />` don't need to set `disabled` on _both_
 * `<FormField />` and the child component(s).
 */
export const DisabledContext = createContext<boolean>(false);

/**
 * Internal use only.
 *
 * Returns the passed-in `disabled` prop if it's `true`, or the value from
 * `DisabledContext` otherwise.
 *
 * Used by input components to determine whether they should be `disabled`, even
 * when their `disabled` prop is not explicitly set. This is useful for
 * `<FormField />`s which will set this context on behalf of their `children`.
 *
 * @example
 * ```tsx
 * const MyInputComponent = ({ disabled }: { disabled?: boolean }) => {
 *   // Note the lack of `const` -- we're reassigning the value of `disabled`.
 *   disabled = useDisabled(disabled);
 *
 *   return <input type="text" disabled={disabled} />
 * }
 * ```
 *
 * In the above example, consumers can then use `<MyInputComponent />` inside an
 * `<FormField />` without having to explicitly set `disabled` on both:
 *
 * @example
 * ```tsx
 * <FormField label="Some field" disabled>
 *   <MyInputComponent /> -- will be disabled because the `<FormField />` is
 * </FormField>
 * ```
 */
export const useDisabled = (disabledProp?: boolean): boolean => {
  const disabledContext = useContext(DisabledContext);

  return !!disabledProp || disabledContext;
};
