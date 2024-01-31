import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import {
  SpendableNoteRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IdbUpdate, PenumbraDb } from '@penumbra-zone/types';
import { describe, expect, it } from 'vitest';
import { IndexedDb } from './index';
import {
  delegationDenomMetadataA,
  delegationDenomMetadataB,
  denomMetadataA,
  denomMetadataB,
  denomMetadataC,
  emptyScanResult,
  newNote,
  noteWithDelegationAssetA,
  noteWithDelegationAssetB,
  noteWithGmAsset,
  positionGmGnSell,
  positionGmPenumbraBuy,
  positionGnPenumbraSell,
  positionIdGmGnSell,
  positionIdGmPenumbraBuy,
  positionIdGnPenumbraSell,
  scanResultWithNewSwaps,
  scanResultWithSctUpdates,
  tradingPairGmGn,
  transactionInfo,
} from './indexed-db.test-data';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  PositionId,
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';

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
      expect((await db.getAllSpendableNotes()).length).toBe(1);

      await db.saveAssetsMetadata(denomMetadataA);
      expect((await db.getAllAssetsMetadata()).length).toBe(1);

      await db.saveTransactionInfo(
        TransactionInfo.fromJson({
          height: '1000',
          id: {
            inner: 'tx-hash',
          },
        }),
      );
      expect((await db.getAllTransactionInfo()).length).toBe(1);

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
      expect((await db.getAllSpendableNotes()).length).toBe(0);
      expect((await db.getAllAssetsMetadata()).length).toBe(0);
      expect((await db.getAllTransactionInfo()).length).toBe(0);
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
      const savedSpendableNote = await db.getSpendableNoteByNullifier(newNote.nullifier!);

      expect(newNote.equals(savedSpendableNote)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveSpendableNote(newNote);
      const savedSpendableNotes = await db.getAllSpendableNotes();

      expect(savedSpendableNotes.length === 1).toBeTruthy();
      expect(newNote.equals(savedSpendableNotes[0])).toBeTruthy();
    });

    it('should be able to set/get by commitment', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveSpendableNote(newNote);
      const noteByCommitment = await db.getSpendableNoteByCommitment(newNote.noteCommitment!);

      expect(newNote.equals(noteByCommitment)).toBeTruthy();
    });

    it('should return undefined by commitment', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      const noteByCommitment = await db.getSpendableNoteByCommitment(newNote.noteCommitment!);

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

      const savedTransaction = await db.getTransactionInfo(
        new TransactionId({ inner: transactionInfo.id!.inner }),
      );

      expect(transactionInfo.equals(savedTransaction)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveTransactionInfo(transactionInfo);
      const savedTransactions = await db.getAllTransactionInfo();

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

  describe('notes for voting', () => {
    // 'noteWithDelegationAssetA' and 'noteWithDelegationAssetB' can be votable at height 222,
    // but 'noteWithGmAsset' should not be used for voting since 'Gm' is not a delegation asset.
    it('should be able to get all notes for voting', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(delegationDenomMetadataA);
      await db.saveAssetsMetadata(delegationDenomMetadataB);

      await db.saveAssetsMetadata(denomMetadataB);

      await db.saveSpendableNote(noteWithDelegationAssetA);
      await db.saveSpendableNote(noteWithDelegationAssetB);

      await db.saveSpendableNote(noteWithGmAsset);

      const notesForVoting = await db.getNotesForVoting(undefined, 222n);

      expect(notesForVoting.length).toBe(2);
    });

    // 'noteWithDelegationAssetB' has a creation height of 53 and cannot be votable at height 50
    it('votable_at_height parameter should screen out noteWithDelegationAssetB', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(delegationDenomMetadataA);
      await db.saveAssetsMetadata(delegationDenomMetadataB);

      await db.saveSpendableNote(noteWithDelegationAssetA);
      await db.saveSpendableNote(noteWithDelegationAssetB);

      const notesForVoting = await db.getNotesForVoting(undefined, 50n);

      expect(notesForVoting.length).toBe(1);
    });

    // For all notes addressIndex=0, so we should get an empty list
    it('addressIndex parameter should screen out all notes', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(delegationDenomMetadataA);
      await db.saveAssetsMetadata(delegationDenomMetadataB);

      await db.saveSpendableNote(noteWithDelegationAssetA);
      await db.saveSpendableNote(noteWithDelegationAssetB);

      const notesForVoting = await db.getNotesForVoting(new AddressIndex({ account: 2 }), 222n);

      expect(notesForVoting.length === 0).toBeTruthy();
    });
  });

  describe('positions', () => {
    it('position should be added and their state should change', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.updatePosition(
        positionIdGmPenumbraBuy,
        new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
      );
      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(undefined, undefined)) {
        ownedPositions.push(positionId);
      }
      expect(ownedPositions.length).toBe(1);
      expect(ownedPositions[0]?.equals(positionIdGmPenumbraBuy)).toBeTruthy();
    });

    it('attempt to change state of a non-existent position should throw an error', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await expect(
        db.updatePosition(
          positionIdGmPenumbraBuy,
          new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
        ),
      ).rejects.toThrow('Position not found when trying to change its state');
    });

    it('should get all records if no filters are specified', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.addPosition(positionIdGnPenumbraSell, positionGnPenumbraSell);
      await db.addPosition(positionIdGmGnSell, positionGmGnSell);

      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(undefined, undefined)) {
        ownedPositions.push(positionId);
      }
      expect(ownedPositions.length).toBe(3);
    });

    it('should only receive records for one trading pair', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.addPosition(positionIdGnPenumbraSell, positionGnPenumbraSell);
      await db.addPosition(positionIdGmGnSell, positionGmGnSell);

      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(undefined, tradingPairGmGn)) {
        ownedPositions.push(positionId);
      }
      expect(ownedPositions.length).toBe(1);
      expect(ownedPositions[0]?.equals(positionIdGmGnSell)).toBeTruthy();
    });

    it('should only receive records for one state', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.addPosition(positionIdGnPenumbraSell, positionGnPenumbraSell);
      await db.addPosition(positionIdGmGnSell, positionGmGnSell);

      await db.updatePosition(
        positionIdGmGnSell,
        new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
      );

      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(
        new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
        undefined,
      )) {
        ownedPositions.push(positionId);
      }
      expect(ownedPositions.length).toBe(1);
      expect(ownedPositions[0]?.equals(positionIdGmGnSell)).toBeTruthy();
    });
  });
});
