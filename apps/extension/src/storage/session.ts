import { ExtensionStorage } from './generic';
import { AllSlices } from '../state';
import { STORAGE_VERSION } from '../config/constants';

export type SessionStorageState = Pick<AllSlices, 'hashedPassword'>;

export const sessionDefaults: SessionStorageState = {
  hashedPassword: undefined,
};

export type SessionStorageValue = SessionStorageState[keyof SessionStorageState];

export const isSessionKey = (key: string): key is keyof SessionStorageState => {
  return key in sessionDefaults;
};

export const sessionExtStorage = new ExtensionStorage<SessionStorageState>(
  chrome.storage.session,
  sessionDefaults,
  STORAGE_VERSION,
);
