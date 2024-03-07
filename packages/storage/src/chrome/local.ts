import { ExtensionStorage } from './base';
import { KeyPrintJson } from '@penumbra-zone/crypto-web';
import { WalletJson } from '@penumbra-zone/types';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

export enum LocalStorageVersion {
  V1 = 'V1',
}

export interface OriginRecord {
  origin: string;
  choice: UserChoice;
  date: number;
}

export interface LocalStorageState {
  wallets: WalletJson[];
  grpcEndpoint: string;
  passwordKeyPrint?: KeyPrintJson;
  fullSyncHeight: number;
  knownSites: OriginRecord[];
}

// this will be injected by webpack build, but we don't have access to the
// declaration in `apps/extension/prax.d.ts` because we are in an independent
// package. we should probably move the localExtStorage declaration into the
// extension app.
declare const DEFAULT_GRPC_URL: string;
declare const MINIFRONT_URL: string;

export const localDefaults: LocalStorageState = {
  wallets: [],
  grpcEndpoint: DEFAULT_GRPC_URL,
  fullSyncHeight: 0,
  knownSites: [{ origin: MINIFRONT_URL, choice: UserChoice.Approved, date: Date.now() }],
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V1,
  {},
);
