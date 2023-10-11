import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IndexedDb } from './index';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { base64ToUint8Array } from 'penumbra-types';
import { TableUpdateNotifier } from './updater';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

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
    walletId: 'walletid99897',
  };

  describe('initializing', () => {
    it('sets up as expected in initialize()', async () => {
      const db = await IndexedDb.initialize(testInitialProps);
      await expect(db.getLastBlockSynced()).resolves.not.toThrow();
    });

    it('different chain ids result in different databases', async () => {
      const testnetDb = await IndexedDb.initialize(testInitialProps);
      const mainnetDb = await IndexedDb.initialize({ ...testInitialProps, chainId: 'mainnet' });

      await testnetDb.saveAssetsMetadata(denomMetadataA);
      await mainnetDb.saveAssetsMetadata(denomMetadataB);

      expect(await testnetDb.getAssetsMetadata(denomMetadataA.penumbraAssetId!)).toEqual(
        denomMetadataA,
      );
      expect(await mainnetDb.getAssetsMetadata(denomMetadataB.penumbraAssetId!)).toEqual(
        denomMetadataB,
      );
    });

    it('same version uses same db', async () => {
      const dbA = await IndexedDb.initialize(testInitialProps);
      await dbA.saveAssetsMetadata(denomMetadataA);

      const dbB = await IndexedDb.initialize(testInitialProps);
      expect((await dbB.getAssetsMetadata(denomMetadataA.penumbraAssetId!))?.name).toBe(
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
            table: 'SPENDABLE_NOTES',
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
        SpendableNoteRecord,
        StateCommitment['inner'],
      ];
      expect(value).toBe(newNote);
      expect(key).toBe(newNote.noteCommitment!.inner);
    });

    it('does not call function if not subscribed', async () => {
      const mockNotifier = vi.fn();

      const props = {
        ...testInitialProps,
        updateNotifiers: [
          {
            table: 'TREE_LAST_POSITION',
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

const newNote = SpendableNoteRecord.fromJson({
  noteCommitment: {
    inner: 'pXS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
  },
  note: {
    value: {
      amount: {
        lo: '12000000',
      },
      assetId: {
        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
      },
    },
    rseed: 'h04XyitXpY1Q77M+vSzPauf4ZPx9NNRBAuUcVqP6pWo=',
    address: {
      inner:
        '874bHlYDfy3mT57v2bXQWm3SJ7g8LI3cZFKob8J8CfrP2aqVGo6ESrpGScI4t/B2/KgkjhzmAasx8GM1ejNz0J153vD8MBVM9FUZFACzSCg=',
    },
  },
  addressIndex: {
    account: 12,
    randomizer: 'AAAAAAAAAAAAAAAA',
  },
  nullifier: {
    inner: 'fv/wPZDA5L96Woc+Ry2s7u9IrwNxTFjSDYInZj3lRA8=',
  },
  heightCreated: '7197',
  position: '42986962944',
  source: {
    inner: '3CBS08dM9eLHH45Z9loZciZ9RaG9x1fc26Qnv0lQlto=',
  },
});
