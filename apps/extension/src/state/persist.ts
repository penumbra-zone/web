import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { AllSlices } from '.';
import { produce } from 'immer';

import { localExtStorage } from '@penumbra-zone/storage/src/chrome/local';
import { LocalStorageState } from '@penumbra-zone/storage/src/chrome/types';
import { sessionExtStorage, SessionStorageState } from '@penumbra-zone/storage/src/chrome/session';
import { StorageItem } from '@penumbra-zone/storage/src/chrome/base';
import { walletsFromJson } from '@penumbra-zone/types/src/wallet';

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
    const passwordKey = await sessionExtStorage.get('passwordKey');
    const wallets = await localExtStorage.get('wallets');
    const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

    set(
      produce((state: AllSlices) => {
        state.password.key = passwordKey;
        state.wallets.all = walletsFromJson(wallets);
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
  if (changes['wallets']) {
    const wallets = changes['wallets'].newValue as
      | StorageItem<LocalStorageState['wallets']>
      | undefined;
    set(
      produce((state: AllSlices) => {
        state.wallets.all = wallets ? walletsFromJson(wallets.value) : [];
      }),
    );
  }

  if (changes['fullSyncHeight']) {
    const stored = changes['fullSyncHeight'].newValue as
      | StorageItem<LocalStorageState['fullSyncHeight']>
      | undefined;
    set(
      produce((state: AllSlices) => {
        state.network.fullSyncHeight = stored?.value ?? 0;
      }),
    );
  }
}

function syncSession(changes: Record<string, chrome.storage.StorageChange>, set: Setter) {
  if (changes['hashedPassword']) {
    const item = changes['hashedPassword'].newValue as
      | StorageItem<SessionStorageState['passwordKey']>
      | undefined;
    set(
      produce((state: AllSlices) => {
        state.password.key = item ? item.value : undefined;
      }),
    );
  }
}

export const customPersist = customPersistImpl as Middleware;
