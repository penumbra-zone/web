import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { AllSlices } from './index';
import { sessionExtStorage, SessionStorageState } from '../storage/session';
import { localExtStorage, LocalStorageState } from '../storage/local';
import { produce } from 'immer';
import { StorageItem } from '../storage/base';

export type Middleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

type Persist = (f: StateCreator<AllSlices>) => StateCreator<AllSlices>;

type Setter = (
  partial: (state: AllSlices) => Partial<AllSlices> | AllSlices,
  replace?: boolean | undefined,
) => void;

export const customPersistImpl: Persist = f => (set, get, store) => {
  void (async function () {
    // Part 1: Get storage values and sync them to store
    const hashedPassword = await sessionExtStorage.get('hashedPassword');
    const wallets = await localExtStorage.get('wallets');
    const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

    set(
      produce((state: AllSlices) => {
        state.password.hashedPassword = hashedPassword;
        state.wallets.all = wallets;
        state.network.grpcEndpoint = grpcEndpoint;
      }),
    );

    // Part 2: when chrome.storage changes sync select fields to store
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') syncLocal(changes, set);
      if (area === 'session') syncSession(changes, set);
    });
  })();

  return f(set, get, store);
};

function syncLocal(changes: Record<string, chrome.storage.StorageChange>, set: Setter) {
  if (changes['accounts']) {
    const item = changes['accounts'].newValue as
      | StorageItem<LocalStorageState['wallets']>
      | undefined;
    set(
      produce((state: AllSlices) => {
        state.wallets.all = item ? item.value : [];
      }),
    );
  }
}

function syncSession(changes: Record<string, chrome.storage.StorageChange>, set: Setter) {
  if (changes['hashedPassword']) {
    const item = changes['hashedPassword'].newValue as
      | StorageItem<SessionStorageState['hashedPassword']>
      | undefined;
    set(
      produce((state: AllSlices) => {
        state.password.hashedPassword = item ? item.value : undefined;
      }),
    );
  }
}

export const customPersist = customPersistImpl as Middleware;
