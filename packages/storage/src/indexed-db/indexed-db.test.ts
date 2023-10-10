import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IndexedDb } from './index';

import { base64ToUint8Array } from 'penumbra-types';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { TableUpdateNotifier } from './updater';

const denomMetadataA = new DenomMetadata({
  symbol: 'usdc',
  penumbraAssetId: new AssetId({ altBaseDenom: 'usdc', inner: base64ToUint8Array('dXNkYw==') }),
});

const denomMetadataB = new DenomMetadata({
  symbol: 'dai',
  penumbraAssetId: new AssetId({ altBaseDenom: 'dai', inner: base64ToUint8Array('ZGFp') }),
});

describe('IndexedDb', () => {
  beforeEach(() => {
    new IDBFactory(); // wipes indexDB state
  });

  const testInitialProps = {
    chainId: 'test',
    accountAddr: 'penumbra123xyz',
    dbVersion: 1,
  };

  describe('initializing', () => {
    it('sets up as expected in initialize()', async () => {
      const db = await IndexedDb.initialize(testInitialProps);
      await expect(db.getLastBlockSynced()).resolves.not.toThrow();
    });

    // TODO: after https://github.com/penumbra-zone/web/issues/30 is resolved, re-enable test
    it.skip('different chain ids result in different databases', async () => {
      const testnetDb = await IndexedDb.initialize(testInitialProps);
      const mainnetDb = await IndexedDb.initialize({ ...testInitialProps, chainId: 'mainnet' });

      await testnetDb.saveAssetsMetadata(denomMetadataA);
      await mainnetDb.saveAssetsMetadata(denomMetadataB);

      expect(await testnetDb.getAssetsMetadata(denomMetadataA.penumbraAssetId!.inner)).toBe(
        denomMetadataA,
      );
      expect(await mainnetDb.getAssetsMetadata(denomMetadataB.penumbraAssetId!.inner)).toBe(
        denomMetadataB,
      );
    });

    it('same version uses same db', async () => {
      const dbA = await IndexedDb.initialize(testInitialProps);
      await dbA.saveAssetsMetadata(denomMetadataA);

      const dbB = await IndexedDb.initialize(testInitialProps);
      expect((await dbB.getAssetsMetadata(denomMetadataA.penumbraAssetId!.inner))?.name).toBe(
        denomMetadataA.name,
      );
    });
  });

  describe('Updater', () => {
    it('emits events on update', async () => {
      const mockNotifier = vi.fn();

      const props = {
        ...testInitialProps,
        updateNotifiers: [
          {
            table: 'spendable_notes',
            handler: (value, key) => {
              mockNotifier(value, key);
              return Promise.resolve();
            },
          } satisfies TableUpdateNotifier,
        ],
      };

      const db = await IndexedDb.initialize(props);
      await db.saveSpendableNote(newNote);

      expect(mockNotifier).toHaveBeenCalledOnce();
      const [value, key] = mockNotifier.mock.lastCall as [
        NewNoteRecord,
        NewNoteRecord['noteCommitment']['inner'],
      ];
      expect(value).toBe(newNote);
      expect(key).toBe(newNote.noteCommitment.inner);
    });

    it('does not call function if not subscribed', async () => {
      const mockNotifier = vi.fn();

      const props = {
        ...testInitialProps,
        updateNotifiers: [
          {
            table: 'tree_last_position',
            handler: (value, key) => {
              mockNotifier(value, key);
              return Promise.resolve();
            },
          } satisfies TableUpdateNotifier,
        ],
      };

      const db = await IndexedDb.initialize(props);
      await db.saveSpendableNote(newNote);

      expect(mockNotifier).not.toHaveBeenCalled();
    });
  });

  // TODO: Write tests for each asset
});

const newNote = {
  addressIndex: { account: 3, randomizer: 'AAAAAAAAAAAAAAAA' },
  note: {
    address: {
      inner:
        'w9zZkLDfn+o/7Q5NOZZCq3hYyKO+KNxYmTKlgatLiMQw3Nq9wi…PEd/M1D80DONRVx+BtM+YsutOpoqnNXpS80b2k07srFp9ZI4=',
    },
    rseed: 'UaMbR7oJoc5WnL9cQ6f5AEmIsRvfiKnU/qK8qTnFx88=',
    value: {
      amount: { hi: '54', lo: '3875820019684212736' },
      assetId: {
        inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
      },
    },
  },
  noteCommitment: { inner: '/rajT2GvdTtpYzezvZIFOSV+UPsr0MhrIdlO5iDq7QI=' },
  nullifier: { inner: 'mV03wioP0x1qkGwGP0EMAlNRuPFMisv6MpCL5mAq4QE=' },
  position: '4305',
  source: {
    inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
  },
};
