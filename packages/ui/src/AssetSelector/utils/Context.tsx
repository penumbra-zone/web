import { createContext, useContext } from 'react';
import { SelectorValue } from './helpers.ts';

export interface AssetSelectorContextValue {
  onClose: VoidFunction;
  onChange?: (value: SelectorValue) => void;
  value: SelectorValue | undefined;
}

/**
 * Provides helper functions to be consumed from `ListItem` component, only for inner usage.
 * These components must be rendered by the user to provide custom sorting or grouping but
 * the selection logic is standardized by this context.
 */
export const AssetSelectorContext = createContext<AssetSelectorContextValue>(
  {} as AssetSelectorContextValue,
);

export const useAssetsSelector = () => useContext(AssetSelectorContext);
