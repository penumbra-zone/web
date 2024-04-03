import { ExtensionStorage } from './base';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { v1Migrations } from './v1-migration';
import { LocalStorageState, LocalStorageVersion } from './types';

// this will be injected by webpack build, but we don't have access to the
// declaration in `apps/extension/prax.d.ts` because we are in an independent
// package. we should probably move the localExtStorage declaration into the
// extension app.
declare const MINIFRONT_URL: string;

export const localDefaults: LocalStorageState = {
  wallets: [],
  fullSyncHeight: 0,
  knownSites: [{ origin: MINIFRONT_URL, choice: UserChoice.Approved, date: Date.now() }],
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V2,
  v1Migrations,
);
