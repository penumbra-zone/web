import { beforeEach, describe, expect, test } from 'vitest';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { walletIdFromBech32m } from '@penumbra-zone/bech32m/penumbrawalletid';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';

import { migrate } from './1_2';

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

const expectFullViewingKey = new FullViewingKey(
  fullViewingKeyFromBech32m(v1Storage.wallets[0]!.fullViewingKey),
);
const expectWalletId = new WalletId(walletIdFromBech32m(v1Storage.wallets[0]!.walletId));

const expectV2Storage = {
  ...v1Storage,
  storageVersion: 2,
  wallets: [
    {
      fullViewingKey: expectFullViewingKey.toJsonString(),
      id: expectWalletId.toJsonString(),
      label: 'Mock',
      custody: { encryptedSeedPhrase: { nonce: '', cipherText: '' } },
    },
  ],
};

describe('migrate local storage v1 to v2', () => {
  beforeEach(async () => {
    await chrome.storage.local.clear();
    await chrome.storage.local.set(v1Storage);
  });

  test('should migrate reported storage version', async () => {
    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBe(1);

    await migrate();

    const { storageVersion: migratedStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(migratedStorageVersion).toBe(2);
  });

  test('should migrate wallet bech32m strings to protojson strings', async () => {
    await expect(chrome.storage.local.get('wallets')).resolves.toMatchObject({
      wallets: v1Storage.wallets,
    });

    await migrate();

    const { wallets: v2Wallets } = await chrome.storage.local.get('wallets');

    expect(v2Wallets).toMatchObject(expectV2Storage.wallets);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const walletIdJson = v2Wallets[0].id as string;
    expect(expectWalletId.equals(WalletId.fromJsonString(walletIdJson))).toBeTruthy();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fvkJson = v2Wallets[0].fullViewingKey as string;
    expect(expectFullViewingKey.equals(FullViewingKey.fromJsonString(fvkJson))).toBeTruthy();
  });

  test('should not migrate if unneccessary', async () => {
    await chrome.storage.local.set(expectV2Storage);

    const { storageVersion: initialStorageVersion } =
      await chrome.storage.local.get('storageVersion');
    expect(initialStorageVersion).toBe(2);

    await migrate();

    await expect(chrome.storage.local.get()).resolves.toMatchObject(expectV2Storage);
  });
});
