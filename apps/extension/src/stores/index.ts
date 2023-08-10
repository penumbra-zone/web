import { create, StateCreator, StoreMutatorIdentifier } from 'zustand';
import { BearSlice, createBearSlice, createFishSlice, FishSlice } from './accounts';
import { restorePersistedState, storeDiffInChromeStorage } from './storage';

export type AllSlices = BearSlice & FishSlice;

export type SliceCreator<SliceInterface> = StateCreator<AllSlices, [], [], SliceInterface>;

type Logger = <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<AllSlices, Mps, Mcs>,
  name?: string,
) => StateCreator<AllSlices, Mps, Mcs>;

type LoggerImpl = (f: StateCreator<AllSlices>, name?: string) => StateCreator<AllSlices>;

const loggerImpl: LoggerImpl = (f) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    const prevState = get();
    set(...a);
    const newState = get();
    storeDiffInChromeStorage(newState, prevState);
  };
  store.setState = loggedSet;

  restorePersistedState()
    .then((persistedState) => {
      set(persistedState);
    })
    .catch(console.error);

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger;

export const useStore = create<AllSlices>()(
  logger((setState, getState, store) => ({
    ...createBearSlice(setState, getState, store),
    ...createFishSlice(setState, getState, store),
  })),
);

// useStore.subscribe(storeDiffInChromeStorage);
