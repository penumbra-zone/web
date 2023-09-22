import { ExtensionStorage } from './base';
import { Wallet } from '../types/wallet';
import { testnetConstants } from 'penumbra-constants';
import { Base64Str } from 'penumbra-types';

export enum LocalStorageVersion {
  V1 = 'V1',
}

export interface LocalStorageState {
  wallets: Wallet[];
  passwordSalt: Base64Str | undefined;
  grpcEndpoint: string;
}

export const localDefaults: LocalStorageState = {
  passwordSalt: undefined,
  wallets: [],
  grpcEndpoint: testnetConstants.grpcEndpoint,
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V1,
  {},
);
