import { ExtensionStorage } from './base';
import { WalletJson } from '../types/wallet';
import { testnetConstants } from 'penumbra-constants';
import { KeyPrintJson } from 'penumbra-crypto-ts';

export enum LocalStorageVersion {
  V1 = 'V1',
}

export interface LocalStorageState {
  wallets: WalletJson[];
  grpcEndpoint: string;
  passwordKeyPrint: KeyPrintJson | undefined;
}

export const localDefaults: LocalStorageState = {
  wallets: [],
  grpcEndpoint: testnetConstants.grpcEndpoint,
  passwordKeyPrint: undefined,
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V1,
  {},
);
