import { beforeEach, describe, expect, test } from 'vitest';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { walletIdFromBech32m } from '@penumbra-zone/bech32m/penumbrawalletid';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';

import { migrate } from './0_1';

const mockFrontendUrl = new URL('https://penumbra.site.example.com/some/path');
const mockGrpcEndpoint = new URL('https://grpc.penumbra.site.example.net/some/path');

const v1Storage = {
  storageVersion: 1,
  // wallets is the only field that needs to be migrated
  wallets: [
    {
      fullViewingKey:
        'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
      walletId: 'penumbrawalletid15r7q7qsf3hhsgj0g530n7ng9acdacmmx9ajknjz38dyt90u9gcgsmjre75',
      label: 'Mock',
      custody: { encryptedSeedPhrase: { nonce: '', cipherText: '' } },
    },
  ],

  // these fields should not be modified by the migration
  knownSites: [{ origin: mockFrontendUrl.origin, choice: 'Approved', date: Date.now() }],
  frontendUrl: mockFrontendUrl.href,
  grpcEndpoint: mockGrpcEndpoint.href,
  passwordKeyPrint: undefined,
  fullSyncHeight: 12,
};

const v2FullViewingKey = new FullViewingKey(
  fullViewingKeyFromBech32m(v1Storage.wallets[0]!.fullViewingKey),
);
const v2WalletId = new WalletId(walletIdFromBech32m(v1Storage.wallets[0]!.walletId));

const v2Storage = {
  ...v1Storage,
  storageVersion: 2,
  wallets: [
    {
      fullViewingKey: v2FullViewingKey.toJsonString(),
      id: v2WalletId.toJsonString(),
      label: 'Mock',
      custody: { encryptedSeedPhrase: { nonce: '', cipherText: '' } },
    },
  ],
};

const v0_V1Storage = Object.fromEntries(
  Object.entries(v1Storage)
    .filter(([key]) => key !== 'storageVersion')
    .map(([key, value]) => [key, { version: 'V1', value }]),
);

const v0_V2Storage = Object.fromEntries(
  Object.entries(v2Storage)
    .filter(([key]) => key !== 'storageVersion')
    .map(([key, value]) => [key, { version: 'V2', value }]),
);

const v0_mixedStorage_v2wallets = Object.fromEntries(
  Object.entries(v2Storage)
    .filter(([key]) => key !== 'storageVersion')
    .map(([key, value]) => [key, { version: key !== 'wallets' ? 'V1' : 'V2', value }]),
);

const v0_mixedStorage_v1wallets = Object.fromEntries(
  Object.entries(v1Storage)
    .filter(([key]) => key !== 'storageVersion')
    .map(([key, value]) => [key, { version: key === 'wallets' ? 'V1' : 'V2', value }]),
);

describe('migrate local storage v0 to v1 or v2', () => {
  beforeEach(async () => {
    await chrome.storage.local.clear();
  });

  test('should migrate uniform v0_V1 to v1', async () => {
    await chrome.storage.local.set(v0_V1Storage);
    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBeUndefined();

    await migrate();

    const migrated = await chrome.storage.local.get();
    expect(migrated).toMatchObject(v1Storage);
  });

  test('should migrate uniform v0_V2 to v2', async () => {
    await chrome.storage.local.set(v0_V2Storage);
    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBeUndefined();

    await migrate();

    const migrated = await chrome.storage.local.get();
    expect(migrated).toMatchObject(v2Storage);
  });

  test('should migrate mixed v0_V1 and v0_V2 to v1 if wallet is V1', async () => {
    await chrome.storage.local.set(v0_mixedStorage_v1wallets);
    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBeUndefined();

    await migrate();

    const migrated = await chrome.storage.local.get();
    expect(migrated).toMatchObject(v1Storage);
  });

  test('should migrate mixed v0_V1 and v0_V2 to v2 if wallet is V2', async () => {
    await chrome.storage.local.set(v0_mixedStorage_v2wallets);
    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBeUndefined();

    await migrate();

    const migrated = await chrome.storage.local.get();
    expect(migrated).toMatchObject(v2Storage);
  });

  test('should not migrate v1 storage', async () => {
    await chrome.storage.local.set(v1Storage);

    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBe(1);

    await migrate();

    await expect(chrome.storage.local.get()).resolves.toMatchObject(v1Storage);
  });

  test('should not migrate v2 storage', async () => {
    await chrome.storage.local.set(v2Storage);

    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBe(2);

    await migrate();

    await expect(chrome.storage.local.get()).resolves.toMatchObject(v2Storage);
  });
});
