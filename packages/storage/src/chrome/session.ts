import { ExtensionStorage } from './base';
import { KeyJson } from '@penumbra-zone/crypto-web/encryption';

export enum SessionStorageVersion {
  V1 = 'V1',
}

export interface SessionStorageState {
  passwordKey: KeyJson | undefined;
}

export const sessionDefaults: SessionStorageState = {
  passwordKey: undefined,
};

// Meant to be used for short-term persisted data. Holds data in memory for the duration of a browser session.
export const sessionExtStorage = new ExtensionStorage<SessionStorageState>(
  chrome.storage.session,
  sessionDefaults,
  SessionStorageVersion.V1,
  {},
);
