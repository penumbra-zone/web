import { ExtensionStorage } from './generic';
import { STORAGE_VERSION } from '../config/constants';
import { Account } from '../types/accounts';

export interface LocalStorageState {
  hashedPassword: string | undefined;
  accounts: Account[];
}

export const localDefaults: LocalStorageState = {
  hashedPassword: undefined,
  accounts: [],
};

// TODO: Document. Storage that is long lived.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  STORAGE_VERSION,
);
