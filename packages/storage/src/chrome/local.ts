import { ExtensionStorage } from './base';
import { KeyPrintJson } from '@penumbra-zone/crypto-web';
import { WalletJson } from '@penumbra-zone/types';

export enum LocalStorageVersion {
  V1 = 'V1',
}

export type LocalStorageState = Partial<{
  wallets: WalletJson[];
  grpcEndpoint: string;
  passwordKeyPrint: KeyPrintJson;
  fullSyncHeight: number;
  connectedSites: Record<string, boolean>;
}>;

// this will be injected by webpack build, but we don't have access to the
// declaration in `apps/extension/prax.d.ts` because we are in an independent
// package. we should probably move the localExtStorage declaration into the
// extension app.
declare const DEFAULT_GRPC_URL: string;
declare const MINIFRONT_URL: string;

export const localDefaults: LocalStorageState = {
  grpcEndpoint: DEFAULT_GRPC_URL,
  connectedSites: { [MINIFRONT_URL]: true },
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V1,
  {},
);
