import { AllSlices } from './index';
import { diff } from 'deep-object-diff';
import { isLocalKey, localExtStorage, LocalStorageValue } from '../storage/local';
import { isSessionKey, sessionExtStorage, SessionStorageValue } from '../storage/session';

export const storeDiffInChromeStorage = (newState: AllSlices, prevState: AllSlices) => {
  void (async function () {
    const changes = diff(prevState, newState) as Partial<AllSlices>;
    for (const [key, val] of Object.entries(changes)) {
      if (isSessionKey(key)) {
        await sessionExtStorage.set(key, val as SessionStorageValue);
      } else if (isLocalKey(key)) {
        await localExtStorage.set(key, val as LocalStorageValue);
      }
    }
  })();
};

export const restorePersistedState = async (): Promise<Partial<AllSlices>> => {
  // should be a loop
  return {
    bears: await localExtStorage.get('bears'),
    fishes: await sessionExtStorage.get('fishes'),
  };
};
