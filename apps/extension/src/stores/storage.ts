import { AllSlices } from './index';
import { diff } from 'deep-object-diff';

// explain
type NonFunctionKeys<T> = {
  [P in keyof T]: T[P] extends (...args: unknown[]) => unknown ? never : P;
}[keyof T];

type NonFuncKey = NonFunctionKeys<AllSlices>;

const storeForSession = ['fishes'] as NonFuncKey[];

const storeLongTerm = ['bears'] as NonFuncKey[];

export const storeDiffInChromeStorage = (newState: AllSlices, prevState: AllSlices) => {
  void (async function () {
    const changes = diff(prevState, newState) as Partial<AllSlices>;
    for (const [key, val] of Object.entries(changes)) {
      if (storeForSession.includes(key as NonFuncKey)) {
        await chrome.storage.session.set({ [key]: val });
      } else if (storeLongTerm.includes(key as NonFuncKey)) {
        await chrome.storage.local.set({ [key]: val });
      }
    }
  })();
};

export const restorePersistedState = async (): Promise<Partial<AllSlices>> => {
  const sessionStorage = await chrome.storage.session.get(storeForSession);
  const longTermStorage = await chrome.storage.local.get(storeLongTerm);
  return {
    ...sessionStorage,
    ...longTermStorage,
  };
};
