import { ExtensionStorage } from './base';
import { v1Migrations } from './v1-migration';
import { LocalStorageState, LocalStorageVersion } from './types';

export const localDefaults: LocalStorageState = {
  wallets: [],
  fullSyncHeight: undefined,
  knownSites: [],
  frontendUrl: '',
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V2,
  v1Migrations,
);
