import { StateCreator } from 'zustand';
import { BearSlice, FishSlice } from './accounts';
import { restorePersistedState, storeDiffInChromeStorage } from './persist';

export type AllSlices = BearSlice & FishSlice;

type Persist = (f: StateCreator<AllSlices>, name?: string) => StateCreator<AllSlices>;

// TODO: Code comment needed
export const customPersist: Persist = (f) => (set, get, store) => {
  const newSet: typeof set = (...a) => {
    const prevState = get();
    set(...a);
    const newState = get();
    storeDiffInChromeStorage(newState, prevState);
  };
  store.setState = newSet;

  restorePersistedState()
    .then((persistedState) => {
      set(persistedState);
    })
    .catch(console.error);

  return f(newSet, get, store);
};
