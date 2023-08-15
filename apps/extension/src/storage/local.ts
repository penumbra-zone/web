import { ExtensionStorage, StorageVersion } from './base';
import { Account } from '../types/accounts';

export interface LocalStorageState {
  hashedPassword: string | undefined;
  accounts: Account[];
}

export const localDefaults: LocalStorageState = {
  hashedPassword: undefined,
  accounts: [],
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  StorageVersion.V1,
);
