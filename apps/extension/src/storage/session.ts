import { ExtensionStorage } from './generic';
import { STORAGE_VERSION } from '../config/constants';

export interface SessionStorageState {
  hashedPassword: string | undefined;
}

export const sessionDefaults: SessionStorageState = {
  hashedPassword: undefined,
};

export const sessionExtStorage = new ExtensionStorage<SessionStorageState>(
  chrome.storage.session,
  sessionDefaults,
  STORAGE_VERSION,
);
