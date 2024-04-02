import { beforeEach, describe, expect, test } from 'vitest';
import { MockStorageArea } from './test-utils/mock';
import { ExtensionStorage } from './base';
import { v1Migrations } from './v1-migration';
import { localDefaults } from './local';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32ToWalletId } from '@penumbra-zone/bech32/src/wallet-id';
import { bech32ToFullViewingKey } from '@penumbra-zone/bech32/src/full-viewing-key';
import { LocalStorageState, LocalStorageVersion } from './types';

describe('migrate walletId and fullViewingKey from bech32 string to json stringified', () => {
  const storageArea = new MockStorageArea();
  let v1ExtStorage: ExtensionStorage<LocalStorageState>;
  let v2ExtStorage: ExtensionStorage<LocalStorageState>;
  const bech32FVK =
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09';
  const bech32WalletId =
    'penumbrawalletid15r7q7qsf3hhsgj0g530n7ng9acdacmmx9ajknjz38dyt90u9gcgsmjre75';

  beforeEach(() => {
    v1ExtStorage = new ExtensionStorage<LocalStorageState>(
      storageArea,
      localDefaults,
      LocalStorageVersion.V1,
      {},
    );

    v2ExtStorage = new ExtensionStorage<LocalStorageState>(
      storageArea,
      localDefaults,
      LocalStorageVersion.V2,
      v1Migrations,
    );
  });

  test('should successfully migrate from V1 to V2', async () => {
    await v1ExtStorage.set('wallets', [
      {
        fullViewingKey: bech32FVK,
        label: 'Wallet 1',
        id: bech32WalletId,
        custody: { encryptedSeedPhrase: { nonce: '', cipherText: '' } },
      },
    ]);
    const v1Wallets = await v1ExtStorage.get('wallets');
    expect(v1Wallets[0]?.id === bech32WalletId).toBeTruthy();
    expect(v1Wallets[0]?.fullViewingKey === bech32FVK).toBeTruthy();

    const v2Wallets = await v2ExtStorage.get('wallets');
    expect(WalletId.fromJsonString(v2Wallets[0]?.id ?? '').inner).toEqual(
      bech32ToWalletId(bech32WalletId).inner,
    );
    expect(FullViewingKey.fromJsonString(v2Wallets[0]?.fullViewingKey ?? '').inner).toEqual(
      bech32ToFullViewingKey(bech32FVK).inner,
    );
  });

  test('should not migrate if its not needed', async () => {
    await v2ExtStorage.set('wallets', [
      {
        fullViewingKey: bech32ToFullViewingKey(bech32FVK).toJsonString(),
        label: 'Wallet 1',
        id: bech32ToWalletId(bech32WalletId).toJsonString(),
        custody: { encryptedSeedPhrase: { nonce: '', cipherText: '' } },
      },
    ]);

    const v2Wallets = await v2ExtStorage.get('wallets');
    expect(WalletId.fromJsonString(v2Wallets[0]?.id ?? '').inner).toEqual(
      bech32ToWalletId(bech32WalletId).inner,
    );
    expect(FullViewingKey.fromJsonString(v2Wallets[0]?.fullViewingKey ?? '').inner).toEqual(
      bech32ToFullViewingKey(bech32FVK).inner,
    );
  });
});
