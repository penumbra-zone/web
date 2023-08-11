import { AllSlices } from './index';
import { diff } from 'deep-object-diff';
import {
  isLocalKey,
  localExtStorage,
  LocalStorageState,
  LocalStorageValue,
} from '../storage/local';
import {
  isSessionKey,
  sessionExtStorage,
  SessionStorageState,
  SessionStorageValue,
} from '../storage/session';

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

export const restorePersistedState = async (): Promise<SessionStorageState & LocalStorageState> => {
  // should be a loop?
  return {
    password: await sessionExtStorage.get('password'),
  };
};
