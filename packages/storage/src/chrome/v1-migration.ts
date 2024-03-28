import { bech32ToFullViewingKey } from '@penumbra-zone/bech32/src/full-viewing-key';
import { bech32ToWalletId } from '@penumbra-zone/bech32/src/wallet-id';
import { LocalStorageState, LocalStorageVersion } from '@penumbra-zone/types/src/local-storage';

export interface Migration {
  wallets: {
    [LocalStorageVersion.V1]: (old: LocalStorageState['wallets']) => LocalStorageState['wallets'];
  };
}

export const v1Migrations: Migration = {
  wallets: {
    [LocalStorageVersion.V1]: old =>
      old.map(({ fullViewingKey, id, label, custody }) => {
        const fvk = bech32ToFullViewingKey(fullViewingKey);
        const walletId = bech32ToWalletId(id);
        return {
          fullViewingKey: fvk.toJsonString(),
          id: walletId.toJsonString(),
          label,
          custody,
        };
      }),
  },
};
