import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { walletIdFromBech32m } from '@penumbra-zone/bech32m/penumbrawalletid';
import { LocalStorageState, LocalStorageVersion } from './types';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export interface Migration {
  wallets: {
    [LocalStorageVersion.V1]: (old: LocalStorageState['wallets']) => LocalStorageState['wallets'];
  };
}

export const v1Migrations: Migration = {
  wallets: {
    [LocalStorageVersion.V1]: old =>
      old.map(({ fullViewingKey, id, label, custody }) => {
        const fvk = new FullViewingKey(fullViewingKeyFromBech32m(fullViewingKey));
        const walletId = new WalletId(walletIdFromBech32m(id));
        return {
          fullViewingKey: fvk.toJsonString(),
          id: walletId.toJsonString(),
          label,
          custody,
        };
      }),
  },
};
