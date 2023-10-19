import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import {
  SpendableNoteRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { base64ToUint8Array, IdbUpdate, PenumbraDb } from 'penumbra-types';
import { describe, expect, it } from 'vitest';
import { IndexedDb } from './index';

const denomMetadataA = new DenomMetadata({
  symbol: 'usdc',
  penumbraAssetId: new AssetId({ altBaseDenom: 'usdc', inner: base64ToUint8Array('dXNkYw==') }),
});

const denomMetadataB = new DenomMetadata({
  symbol: 'dai',
  penumbraAssetId: new AssetId({ altBaseDenom: 'dai', inner: base64ToUint8Array('ZGFp') }),
});

describe('IndexedDb', () => {
  // uses different wallet ids so no collisions take place
  const generateInitialProps = () => ({
    chainId: 'test',
    accountAddr: 'penumbra123xyz',
    dbVersion: 1,
    walletId: `walletid${Math.random()}`,
  });

  describe('initializing', () => {
    it('sets up as expected in initialize()', async () => {
      const db = await IndexedDb.initialize(generateInitialProps());
      await expect(db.getLastBlockSynced()).resolves.not.toThrow();
    });

    it('different chain ids result in different databases', async () => {
      const testnetDb = await IndexedDb.initialize(generateInitialProps());
      const mainnetDb = await IndexedDb.initialize({
        ...generateInitialProps(),
        chainId: 'mainnet',
      });

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
      const props = generateInitialProps();
      const dbA = await IndexedDb.initialize(props);
      await dbA.saveAssetsMetadata(denomMetadataA);

      const dbB = await IndexedDb.initialize(props);
      expect((await dbB.getAssetsMetadata(denomMetadataA.penumbraAssetId!))?.name).toBe(
        denomMetadataA.name,
      );
    });
  });

  describe('Updater', () => {
    it('emits events on update', async () => {
      const db = await IndexedDb.initialize(generateInitialProps());
      const subscription = db.subscribe('SPENDABLE_NOTES');

      // Save the new note and wait for the next update in parallel
      const [, resA] = await Promise.all([db.saveSpendableNote(newNote), subscription.next()]);
      const updateA = resA.value as IdbUpdate<PenumbraDb, 'SPENDABLE_NOTES'>;
      expect(SpendableNoteRecord.fromJson(updateA.value)).toEqual(newNote);
      expect(resA.done).toBeFalsy();

      // Try a second time
      const [, resB] = await Promise.all([db.saveSpendableNote(newNote), subscription.next()]);
      const updateB = resB.value as IdbUpdate<PenumbraDb, 'SPENDABLE_NOTES'>;
      expect(SpendableNoteRecord.fromJson(updateB.value)).toEqual(newNote);
      expect(resB.done).toBeFalsy();
    });
  });

  describe('Clear', () => {
    it('object store should be empty after clear', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.saveSpendableNote(newNote);
      expect((await db.getAllNotes()).length).toBe(1);

      await db.saveAssetsMetadata(denomMetadataA);
      expect((await db.getAllAssetsMetadata()).length).toBe(1);

      await db.saveTransactionInfo(
        TransactionInfo.fromJson({
          height: '1000',
          id: {
            hash: 'tx-hash',
          },
        }),
      );
      expect((await db.getAllTransactions()).length).toBe(1);

      const scanResult = {
        height: 1000n,
        sctUpdates: {
          delete_ranges: [],
          set_forgotten: undefined,
          set_position: {
            Position: {
              epoch: 119,
              block: 179,
              commitment: 0,
            },
          },
          store_commitments: [],
          store_hashes: [],
        },
        newNotes: [],
        newSwaps: [],
      };

      await db.saveScanResult(scanResult);
      expect(await db.getLastBlockSynced()).toBe(1000n);

      await db.clear();
      expect((await db.getAllNotes()).length).toBe(0);
      expect((await db.getAllAssetsMetadata()).length).toBe(0);
      expect((await db.getAllTransactions()).length).toBe(0);
      expect(await db.getLastBlockSynced()).toBeUndefined();
    });
  });

  describe('fmd params', () => {
    it('should be able to set/get', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      const fmdParams = new FmdParameters({ asOfBlockHeight: 1n, precisionBits: 0 });
      await db.saveFmdParams(fmdParams);
      const savedParmas = await db.getFmdParams();

      expect(fmdParams.equals(savedParmas)).toBeTruthy();
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
