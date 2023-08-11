import { ExtensionStorage } from './generic';
import { AllSlices } from '../state';

export type SessionStorageState = Pick<AllSlices, 'fishes'>;

const defaults: SessionStorageState = {
  fishes: 0,
};

export type SessionStorageValue = SessionStorageState[keyof SessionStorageState];

export const isSessionKey = (key: string): key is keyof SessionStorageState => {
  return key in defaults;
};

export const sessionExtStorage = new ExtensionStorage<SessionStorageState>(
  chrome.storage.session,
  defaults,
);
