import { ExtensionStorage } from './generic';
import { AllSlices } from '../state';
import { STORAGE_VERSION } from '../config/constants';

export type SessionStorageState = Pick<AllSlices, 'password'>;

const defaults: SessionStorageState = {
  password: undefined,
};

export type SessionStorageValue = SessionStorageState[keyof SessionStorageState];

export const isSessionKey = (key: string): key is keyof SessionStorageState => {
  return key in defaults;
};

export const sessionExtStorage = new ExtensionStorage<SessionStorageState>(
  chrome.storage.session,
  defaults,
  STORAGE_VERSION,
);
