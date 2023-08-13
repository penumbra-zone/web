import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { AllSlices } from './index';
import { sessionExtStorage } from '../storage/session';
import { localExtStorage } from '../storage/local';
import { produce } from 'immer';

type Middleware = <
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
    const encryptedSeedPhrase = await localExtStorage.get('encryptedSeedPhrase');

    set(
      produce((state: AllSlices) => {
        state.accounts.hashedPassword = hashedPassword;
        state.accounts.encryptedSeedPhrase = encryptedSeedPhrase;
      }),
    );
  })();

  return f(set, get, store);
};

export const customPersist = customPersistImpl as Middleware;
