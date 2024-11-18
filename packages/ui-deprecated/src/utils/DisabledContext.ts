import { createContext } from 'react';

/**
 * Used by `<FormField />` to set its `children` as `disabled`, so that
 * consumers of `<FormField />` don't need to set `disabled` on _both_
 * `<FormField />` and the child component(s).
 */
export const DisabledContext = createContext<boolean>(false);
