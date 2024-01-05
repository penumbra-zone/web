import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import {
  SpendableNoteRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IdbUpdate, PenumbraDb } from '@penumbra-zone/types';
import { describe, expect, it } from 'vitest';
import { IndexedDb } from './index';
import {
  denomMetadataA,
  denomMetadataB,
  denomMetadataC,
  emptyScanResult,
  newNote,
  scanResultWithNewSwaps,
  scanResultWithSctUpdates,
  transactionInfo,
} from './indexed-db.test-data';
import { CommitmentSource_Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

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

    it('increasing version should re-create object stores', async () => {
      const version1Props = generateInitialProps();
      const dbA = await IndexedDb.initialize(version1Props);
      await dbA.saveAssetsMetadata(denomMetadataA);

      const version2Props = {
        chainId: 'test',
        accountAddr: 'penumbra123xyz',
        dbVersion: 2,
        walletId: `walletid${Math.random()}`,
      };

      const dbB = await IndexedDb.initialize(version2Props);
      expect((await dbB.getAssetsMetadata(denomMetadataA.penumbraAssetId!))?.name).toBeUndefined();
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

  describe('last block', () => {
    it('should be able to set/get', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveScanResult(emptyScanResult);
      const savedLastBlock = await db.getLastBlockSynced();

      expect(emptyScanResult.height === savedLastBlock).toBeTruthy();
    });
  });

  describe('spendable notes', () => {
    it('should be able to set/get note by nullifier', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveSpendableNote(newNote);
      const savedSpendableNote = await db.getNoteByNullifier(newNote.nullifier!);

      expect(newNote.equals(savedSpendableNote)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveSpendableNote(newNote);
      const savedSpendableNotes = await db.getAllNotes();

      expect(savedSpendableNotes.length === 1).toBeTruthy();
      expect(newNote.equals(savedSpendableNotes[0])).toBeTruthy();
    });

    it('should be able to set/get by commitment', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveSpendableNote(newNote);
      const noteByCommitment = await db.getNoteByCommitment(newNote.noteCommitment!);

      expect(newNote.equals(noteByCommitment)).toBeTruthy();
    });

    it('should return undefined by commitment', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      const noteByCommitment = await db.getNoteByCommitment(newNote.noteCommitment!);

      expect(noteByCommitment).toBeUndefined();
    });
  });

  describe('state commitment tree', () => {
    it('should be able to set/get', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveScanResult(scanResultWithSctUpdates);

      const stateCommitmentTree = await db.getStateCommitmentTree();

      expect(stateCommitmentTree.hashes.length == 1).toBeTruthy();
      expect(stateCommitmentTree.commitments.length == 1).toBeTruthy();
      expect(stateCommitmentTree.last_forgotten === 12n).toBeTruthy();
      expect(stateCommitmentTree.last_position).toBeTruthy();
    });
  });

  describe('assets', () => {
    it('should be able to set/get by id', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(denomMetadataC);
      const savedDenomMetadata = await db.getAssetsMetadata(denomMetadataC.penumbraAssetId!);

      expect(denomMetadataC.equals(savedDenomMetadata)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(denomMetadataA);
      await db.saveAssetsMetadata(denomMetadataB);
      await db.saveAssetsMetadata(denomMetadataC);

      const savedAssets = await db.getAllAssetsMetadata();

      expect(savedAssets.length === 3).toBeTruthy();
    });
  });

  describe('transactions', () => {
    it('should be able to set/get by note source', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveTransactionInfo(transactionInfo);

      const savedTransaction = await db.getTransaction(
        new CommitmentSource_Transaction({ id: transactionInfo.id!.inner }),
      );

      expect(transactionInfo.equals(savedTransaction)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveTransactionInfo(transactionInfo);
      const savedTransactions = await db.getAllTransactions();

      expect(savedTransactions.length === 1).toBeTruthy();
      expect(transactionInfo.equals(savedTransactions[0])).toBeTruthy();
    });
  });

  describe('swaps', () => {
    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveScanResult(scanResultWithNewSwaps);
      const savedSwaps = await db.getAllSwaps();

      expect(savedSwaps.length === 1).toBeTruthy();
      expect(savedSwaps[0]!.equals(scanResultWithNewSwaps.newSwaps[0])).toBeTruthy();
    });

    it('should be able to set/get by nullifier', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveScanResult(scanResultWithNewSwaps);
      const swapByNullifier = await db.getSwapByNullifier(
        scanResultWithNewSwaps.newSwaps[0]!.nullifier!,
      );

      expect(swapByNullifier!.equals(scanResultWithNewSwaps.newSwaps[0])).toBeTruthy();
    });

    it('should be able to set/get by commitment', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveScanResult(scanResultWithNewSwaps);
      const swapByCommitment = await db.getSwapByCommitment(
        scanResultWithNewSwaps.newSwaps[0]!.swapCommitment!,
      );

      expect(swapByCommitment!.equals(scanResultWithNewSwaps.newSwaps[0])).toBeTruthy();
    });
  });

  describe('gas prices', () => {
    it('should be able to set/get', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      const gasPrices = new GasPrices({
        blockSpacePrice: 0n,
        compactBlockSpacePrice: 0n,
        verificationPrice: 0n,
        executionPrice: 0n,
      });
      await db.saveGasPrices(gasPrices);
      const savedPrices = await db.getGasPrices();

      expect(gasPrices.equals(savedPrices)).toBeTruthy();
    });
  });
});
