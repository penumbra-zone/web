/**
 * StoreContext - React context for providing MobX stores to components
 *
 * This provides a clean way to access stores in React components using hooks.
 * It follows React best practices for context usage and provides proper typing.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { RootStore, rootStore } from './root-store';

// Create the context
const StoreContext = createContext<RootStore | null>(null);

// Provider component
interface StoreProviderProps {
  children: ReactNode;
  store?: RootStore;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, store = rootStore }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

// Hook to use the root store
export const useRootStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within a StoreProvider');
  }
  return store;
};

// Hook to use individual stores
export const useBalancesStore = () => {
  const rootStore = useRootStore();
  return rootStore.balancesStore;
};

export const useTransactionsStore = () => {
  const rootStore = useRootStore();
  return rootStore.transactionsStore;
};

export const useAssetsStore = () => {
  const rootStore = useRootStore();
  return rootStore.assetsStore;
};

export const useAppParametersStore = () => {
  const rootStore = useRootStore();
  return rootStore.appParametersStore;
};

export const useTransferStore = () => {
  const rootStore = useRootStore();
  return rootStore.transferStore;
};

export const useDepositStore = () => {
  const rootStore = useRootStore();
  return rootStore.depositStore;
};

export const useWithdrawStore = () => {
  const rootStore = useRootStore();
  return rootStore.withdrawStore;
};

export const useStakingStore = () => {
  const rootStore = useRootStore();
  return rootStore.stakingStore;
};

export const useStatusStore = () => {
  const rootStore = useRootStore();
  return rootStore.statusStore;
};

// Hook for the Penumbra service
export const usePenumbraService = () => {
  const rootStore = useRootStore();
  return rootStore.penumbraService;
};
