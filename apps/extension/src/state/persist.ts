import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { AllSlices } from './index';
import { sessionExtStorage } from '../storage/session';
import { localExtStorage } from '../storage/local';
import { produce } from 'immer';

export type Middleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

type Persist = (f: StateCreator<AllSlices>) => StateCreator<AllSlices>;

export const customPersistImpl: Persist = (f) => (set, get, store) => {
  void (async function () {
    const hashedPassword = await sessionExtStorage.get('hashedPassword');
    const accounts = await localExtStorage.get('accounts');

    set(
      produce((state: AllSlices) => {
        state.password.hashedPassword = hashedPassword;
        state.accounts.all = accounts;
      }),
    );
  })();

  return f(set, get, store);
};

export const customPersist = customPersistImpl as Middleware;
