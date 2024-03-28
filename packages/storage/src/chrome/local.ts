import { ExtensionStorage } from './base';
import { KeyPrintJson } from '@penumbra-zone/crypto-web/src/encryption';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import type { WalletJson } from '@penumbra-zone/types/src/wallet';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32ToFullViewingKey } from '@penumbra-zone/bech32/src/full-viewing-key';
import { bech32ToWalletId } from '@penumbra-zone/bech32/src/wallet-id';

export enum LocalStorageVersion {
  V1 = 'V1',
  V2 = 'V2',
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

interface Migration {
  wallets: {
    [LocalStorageVersion.V1]: (old: LocalStorageState['wallets']) => LocalStorageState['wallets'];
  };
}

const migrations: Migration = {
  wallets: {
    [LocalStorageVersion.V1]: old =>
      old.map(({ fullViewingKey, id, label, custody }) => {
        const fvk = new FullViewingKey({
          inner: bech32ToFullViewingKey(fullViewingKey),
        });
        const walletId = new WalletId({
          inner: bech32ToWalletId(id),
        });
        return {
          fullViewingKey: fvk.toJsonString(),
          id: walletId.toJsonString(),
          label,
          custody,
        };
      }),
  },
};

// Meant to be used for long-term persisted data. It is cleared when the extension is removed.
export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  localDefaults,
  LocalStorageVersion.V2,
  migrations,
);
