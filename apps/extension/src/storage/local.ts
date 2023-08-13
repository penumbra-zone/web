import { ExtensionStorage } from './generic';
import { STORAGE_VERSION } from '../config/constants';

export interface LocalStorageState {
  encryptedSeedPhrase: string | undefined;
}

export const localDefaults: LocalStorageState = {
  encryptedSeedPhrase: undefined,
};

export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  STORAGE_VERSION,
);
