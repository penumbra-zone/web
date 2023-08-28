import { ExtensionStorage } from './base';
import { Account } from '../types/accounts';

export enum LocalStorageVersion {
  V1 = 'V1',
}

export interface LocalStorageState {
  hashedPassword: string | undefined;
  accounts: Account[];
  isInitialized: boolean;
}

export const localDefaults: LocalStorageState = {
  hashedPassword: undefined,
  accounts: [],
  isInitialized: false,
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V1,
  {},
);
