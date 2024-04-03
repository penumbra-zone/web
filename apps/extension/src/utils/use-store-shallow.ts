import { useShallow } from 'zustand/react/shallow';
import { AllSlices, useStore } from '../state';

/**
 * Like `useStore()`, but checks for shallow equality to prevent unnecessary
 * re-renders if none of the properties returned by `selector` have changed.
 *
 * Calling `useStoreShallow(selector)` is the same as calling
 * `useStore(useShallow(selector))`. But it's so common to use those two
 * together that this function combines both for ease of use.
 *
 * @example
 * ```tsx
 * import { useStoreShallow } from '../utils/use-store-shallow';
 *
 * const myComponentSelector = (state: AllSlices) => ({
 *   prop1: state.mySlice.prop1,
 *   prop2: state.mySlice.prop2,
 * });
 *
 * const MyComponent = () => {
 *   const state = useStoreShallow(myComponentSelector);
 * };
 * ```
 */
export const useStoreShallow = <U>(selector: (state: AllSlices) => U) =>
  useStore(useShallow<AllSlices, U>(selector));
