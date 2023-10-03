import { ExtensionStorage } from './base';
import { testnetConstants } from 'penumbra-constants';
import { KeyPrintJson } from 'penumbra-crypto-ts';
import { WalletJson } from 'penumbra-types';

export enum LocalStorageVersion {
  V1 = 'V1',
}

export interface LocalStorageState {
  wallets: WalletJson[];
  grpcEndpoint: string;
  passwordKeyPrint: KeyPrintJson | undefined;
  lastBlockSynced: number;
}

export const localDefaults: LocalStorageState = {
  wallets: [],
  grpcEndpoint: testnetConstants.grpcEndpoint,
  passwordKeyPrint: undefined,
  lastBlockSynced: 0,
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V1,
  {},
);
