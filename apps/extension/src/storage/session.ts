import { ExtensionStorage } from './base';

export enum SessionStorageVersion {
  V1 = 'V1',
}

export interface SessionStorageState {
  hashedPassword: string | undefined;
}

export const sessionDefaults: SessionStorageState = {
  hashedPassword: undefined,
};

// Meant to be used for short-term persisted data. Holds data in memory for the duration of a browser session.
export const sessionExtStorage = new ExtensionStorage<SessionStorageState>(
  chrome.storage.session,
  sessionDefaults,
  SessionStorageVersion.V1,
  {},
);
