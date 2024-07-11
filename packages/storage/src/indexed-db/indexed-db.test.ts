import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import {
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDb } from './index.js';
import {
  delegationMetadataA,
  delegationMetadataB,
  emptyScanResult,
  epoch1,
  epoch2,
  epoch3,
  metadataA,
  metadataB,
  metadataC,
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
  transaction,
  transactionId,
} from './indexed-db.test-data.js';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb.js';
import {
  AddressIndex,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import {
  PositionId,
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import {
  AssetId,
  EstimatedPrice,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import type { IdbUpdate, PenumbraDb } from '@penumbra-zone/types/indexed-db';
import {
  AuctionId,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb.js';
import { ChainRegistryClient } from '@penumbra-labs/registry';

describe('IndexedDb', () => {
  // uses different wallet ids so no collisions take place
  const registryClient = new ChainRegistryClient();
  const chainId = 'penumbra-testnet-deimos-6';
  const generateInitialProps = () => ({
    chainId,
    walletId: new WalletId({
      inner: Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
    }),
    registryClient,
  });

  describe('initializing', () => {
    it('sets up as expected in initialize()', async () => {
      const db = await IndexedDb.initialize(generateInitialProps());
      await expect(db.getFullSyncHeight()).resolves.not.toThrow();
    });

    it('different chain ids result in different databases', async () => {
      const testnetDb = await IndexedDb.initialize(generateInitialProps());
      const mainnetDb = await IndexedDb.initialize({
        ...generateInitialProps(),
        chainId: 'penumbra-testnet-deimos-7',
      });

      await testnetDb.saveAssetsMetadata(metadataA);
      await mainnetDb.saveAssetsMetadata(metadataB);

      expect(await testnetDb.getAssetsMetadata(metadataA.penumbraAssetId!)).toEqual(metadataA);
      expect(await mainnetDb.getAssetsMetadata(metadataB.penumbraAssetId!)).toEqual(metadataB);
    });

    it('same version uses same db', async () => {
      const props = generateInitialProps();
      const dbA = await IndexedDb.initialize(props);
      await dbA.saveAssetsMetadata(metadataA);

      const dbB = await IndexedDb.initialize(props);
      expect((await dbB.getAssetsMetadata(metadataA.penumbraAssetId!))?.name).toBe(metadataA.name);
    });

    // TODO: Do not skip this test after vitest has been updated to v2.0.0.
    // use vi.mock to override the IDB_VERSION value (vi.mock is not available in browser mode for vitest 1.6.0).
    it.skip('increasing version should re-create object stores', async () => {
      const version1Props = generateInitialProps();
      const dbA = await IndexedDb.initialize(version1Props);
      await dbA.saveAssetsMetadata(metadataA);
      dbA.close();

      const version2Props = {
        chainId,
        walletId: version1Props.walletId,
        registryClient: new ChainRegistryClient(),
      };
      const dbB = await IndexedDb.initialize(version2Props);
      expect((await dbB.getAssetsMetadata(metadataA.penumbraAssetId!))?.name).toBeUndefined();
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

      const notes: SpendableNoteRecord[] = [];
      for await (const note of db.iterateSpendableNotes()) {
        notes.push(note);
      }
      expect(notes.length).toBe(1);

      await db.saveAssetsMetadata(metadataA);

      const assets: Metadata[] = [];
      for await (const asset of db.iterateAssetsMetadata()) {
        assets.push(asset);
      }
      const registryLength = registryClient.get(chainId).getAllAssets().length;
      expect(assets.length).toBe(registryLength + 1);

      await db.saveTransaction(transactionId, 1000n, transaction);
      const txs: TransactionInfo[] = [];
      for await (const tx of db.iterateTransactions()) {
        txs.push(tx);
      }
      expect(txs.length).toBe(1);

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
      expect(await db.getFullSyncHeight()).toBe(1000n);

      await db.clear();

      const notesAfterClear: SpendableNoteRecord[] = [];
      for await (const note of db.iterateSpendableNotes()) {
        notesAfterClear.push(note);
      }
      expect(notesAfterClear.length).toBe(0);

      const assetsAfterClear: Metadata[] = [];
      for await (const asset of db.iterateAssetsMetadata()) {
        assetsAfterClear.push(asset);
      }
      expect(assetsAfterClear.length).toBe(0);

      const txsAfterClean: TransactionInfo[] = [];
      for await (const tx of db.iterateTransactions()) {
        txsAfterClean.push(tx);
      }
      expect(txsAfterClean.length).toBe(0);
      expect(await db.getFullSyncHeight()).toBeUndefined();
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
      const savedLastBlock = await db.getFullSyncHeight();

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

      const notes: SpendableNoteRecord[] = [];
      for await (const note of db.iterateSpendableNotes()) {
        notes.push(note);
      }
      expect(notes.length === 1).toBeTruthy();
      expect(newNote.equals(notes[0])).toBeTruthy();
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

      expect(stateCommitmentTree.hashes.length === 1).toBeTruthy();
      expect(stateCommitmentTree.commitments.length === 1).toBeTruthy();
      expect(stateCommitmentTree.last_forgotten === 12n).toBeTruthy();
      expect(stateCommitmentTree.last_position).toBeTruthy();
    });
  });

  describe('assets', () => {
    it('should be pre-loaded with hardcoded assets', async () => {
      const propsWithAssets = {
        chainId,
        walletId: new WalletId({
          inner: Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
        }),
        registryClient: new ChainRegistryClient(),
      };
      const db = await IndexedDb.initialize(propsWithAssets);

      const savedAssets: Metadata[] = [];
      for await (const asset of db.iterateAssetsMetadata()) {
        savedAssets.push(asset);
      }

      const registryLength = registryClient.get(chainId).getAllAssets().length;
      expect(savedAssets.length === registryLength).toBeTruthy();
    });

    it('should be able to set/get by id', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(metadataC);
      const savedDenomMetadata = await db.getAssetsMetadata(metadataC.penumbraAssetId!);

      expect(metadataC.equals(savedDenomMetadata)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(metadataA);
      await db.saveAssetsMetadata(metadataB);
      await db.saveAssetsMetadata(metadataC);

      const savedAssets: Metadata[] = [];
      for await (const asset of db.iterateAssetsMetadata()) {
        savedAssets.push(asset);
      }
      const registryLength = registryClient.get(chainId).getAllAssets().length;
      expect(savedAssets.length === registryLength + 3).toBeTruthy();
    });
  });

  describe('transactions', () => {
    it('should be able to set/get by note source', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.saveTransaction(transactionId, 1000n, transaction);

      const savedTransaction = await db.getTransaction(transactionId);
      expect(transaction.equals(savedTransaction?.transaction)).toBeTruthy();
    });

    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveTransaction(transactionId, 1000n, transaction);
      const savedTransactions: TransactionInfo[] = [];
      for await (const tx of db.iterateTransactions()) {
        savedTransactions.push(tx);
      }
      expect(savedTransactions.length === 1).toBeTruthy();
      expect(transaction.equals(savedTransactions[0]?.transaction)).toBeTruthy();
    });
  });

  describe('swaps', () => {
    it('should be able to set/get all', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveScanResult(scanResultWithNewSwaps);
      const savedSwaps: SwapRecord[] = [];
      for await (const swap of db.iterateSwaps()) {
        savedSwaps.push(swap);
      }
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
        assetId: db.stakingTokenAssetId,
        blockSpacePrice: 0n,
        compactBlockSpacePrice: 0n,
        verificationPrice: 0n,
        executionPrice: 0n,
      });
      await db.saveGasPrices(gasPrices);
      const savedPrices = await db.getNativeGasPrices();

      expect(gasPrices.equals(savedPrices)).toBeTruthy();
    });
  });

  describe('notes for voting', () => {
    // 'noteWithDelegationAssetA' and 'noteWithDelegationAssetB' can be votable at height 222,
    // but 'noteWithGmAsset' should not be used for voting since 'Gm' is not a delegation asset.
    it('should be able to get all notes for voting', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(delegationMetadataA);
      await db.saveAssetsMetadata(delegationMetadataB);

      await db.saveAssetsMetadata(metadataB);

      await db.saveSpendableNote(noteWithDelegationAssetA);
      await db.saveSpendableNote(noteWithDelegationAssetB);

      await db.saveSpendableNote(noteWithGmAsset);

      const notesForVoting = await db.getNotesForVoting(undefined, 222n);

      expect(notesForVoting.length).toBe(2);
    });

    // 'noteWithDelegationAssetB' has a creation height of 53 and cannot be votable at height 50
    it('votable_at_height parameter should screen out noteWithDelegationAssetB', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(delegationMetadataA);
      await db.saveAssetsMetadata(delegationMetadataB);

      await db.saveSpendableNote(noteWithDelegationAssetA);
      await db.saveSpendableNote(noteWithDelegationAssetB);

      const notesForVoting = await db.getNotesForVoting(undefined, 50n);

      expect(notesForVoting.length).toBe(1);
    });

    // For all notes addressIndex=0, so we should get an empty list
    it('addressIndex parameter should screen out all notes', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });

      await db.saveAssetsMetadata(delegationMetadataA);
      await db.saveAssetsMetadata(delegationMetadataB);

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
        ownedPositions.push(positionId as PositionId);
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

    it('should get all position ids', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.addPosition(positionIdGnPenumbraSell, positionGnPenumbraSell);
      await db.addPosition(positionIdGmGnSell, positionGmGnSell);

      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(undefined, undefined)) {
        ownedPositions.push(positionId as PositionId);
      }
      expect(ownedPositions.length).toBe(3);
    });

    it('should get all position with given position state', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.addPosition(positionIdGnPenumbraSell, positionGnPenumbraSell);
      await db.addPosition(positionIdGmGnSell, positionGmGnSell);

      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(
        new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
        undefined,
      )) {
        ownedPositions.push(positionId as PositionId);
      }
      expect(ownedPositions.length).toBe(1);
    });

    it('should get all position with given trading pair', async () => {
      const db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.addPosition(positionIdGmPenumbraBuy, positionGmPenumbraBuy);
      await db.addPosition(positionIdGnPenumbraSell, positionGnPenumbraSell);
      await db.addPosition(positionIdGmGnSell, positionGmGnSell);

      const ownedPositions: PositionId[] = [];
      for await (const positionId of db.getOwnedPositionIds(undefined, tradingPairGmGn)) {
        ownedPositions.push(positionId as PositionId);
      }
      expect(ownedPositions.length).toBe(1);
    });
  });

  describe('epochs', () => {
    let db: IndexedDb;

    beforeEach(async () => {
      db = await IndexedDb.initialize({ ...generateInitialProps() });
    });

    it('prepopulates the 0th epoch', async () => {
      const epoch = await db.getEpochByHeight(0n);
      expect(epoch?.index).toBe(0n);
      expect(epoch?.startHeight).toBe(0n);
    });

    describe('addEpoch', () => {
      beforeEach(async () => {
        await db.addEpoch(epoch1.startHeight);
        await db.addEpoch(epoch2.startHeight);
        await db.addEpoch(epoch3.startHeight);
      });

      it('auto-increments the epoch index', async () => {
        const [result1, result2, result3] = await Promise.all([
          db.getEpochByHeight(150n),
          db.getEpochByHeight(250n),
          db.getEpochByHeight(350n),
        ]);

        expect(result1?.index).toBe(1n);
        expect(result2?.index).toBe(2n);
        expect(result3?.index).toBe(3n);
      });

      it('should not save the epoch with the same startHeight twice', async () => {
        await db.addEpoch(epoch3.startHeight);

        const result = await db.getEpochByHeight(350n);
        expect(result?.index).toBe(3n);
      });
    });

    describe('getEpochByHeight', () => {
      beforeEach(async () => {
        await db.addEpoch(epoch1.startHeight);
        await db.addEpoch(epoch2.startHeight);
        await db.addEpoch(epoch3.startHeight);
      });

      it('returns the epoch containing the given block height', async () => {
        const [result1, result2, result3] = await Promise.all([
          db.getEpochByHeight(150n),
          db.getEpochByHeight(250n),
          db.getEpochByHeight(350n),
        ]);

        expect(result1?.toJson()).toEqual(epoch1.toJson());
        expect(result2?.toJson()).toEqual(epoch2.toJson());
        expect(result3?.toJson()).toEqual(epoch3.toJson());
      });
    });
  });

  describe('prices', () => {
    let db: IndexedDb;

    const numeraireAssetId = new AssetId({ inner: new Uint8Array([5, 6, 7, 8]) });

    const stakingAssetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });
    beforeEach(async () => {
      db = await IndexedDb.initialize({ ...generateInitialProps() });
      await db.updatePrice(delegationMetadataA.penumbraAssetId!, stakingAssetId, 1.23, 50n);
      await db.updatePrice(metadataA.penumbraAssetId!, numeraireAssetId, 22.15, 40n);
    });

    it('saves and gets a price in the database', async () => {
      // This effectively tests both the save and the get, since we saved via
      // `updatePrice()` in the `beforeEach` above.
      await expect(db.getPricesForAsset(delegationMetadataA, 50n, 719n)).resolves.toEqual([
        new EstimatedPrice({
          pricedAsset: delegationMetadataA.penumbraAssetId!,
          numeraire: stakingAssetId,
          numerairePerUnit: 1.23,
          asOfHeight: 50n,
        }),
      ]);
    });

    it('should not return too old price', async () => {
      await expect(db.getPricesForAsset(metadataA, 241n, 719n)).resolves.toEqual([]);
    });

    it('different types of assets should have different price relevance thresholds', async () => {
      await expect(db.getPricesForAsset(metadataA, 241n, 719n)).resolves.toEqual([]);
      await expect(db.getPricesForAsset(delegationMetadataA, 241n, 719n)).resolves.toEqual([
        new EstimatedPrice({
          pricedAsset: delegationMetadataA.penumbraAssetId!,
          numeraire: stakingAssetId,
          numerairePerUnit: 1.23,
          asOfHeight: 50n,
        }),
      ]);
    });

    it('should delete only prices with a numeraires different from the staking token', async () => {
      await db.clearSwapBasedPrices();
      await expect(db.getPricesForAsset(metadataA, 50n, 719n)).resolves.toEqual([]);
    });
  });

  describe('upsertAuction()', () => {
    let db: IndexedDb;

    beforeEach(async () => {
      db = await IndexedDb.initialize({ ...generateInitialProps() });
    });

    it('inserts an auction', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const auction = new DutchAuctionDescription({ startHeight: 1234n });
      await db.upsertAuction(auctionId, { auction });

      const fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toEqual({
        auction,
      });
    });

    it('inserts a note commitment', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const noteCommitment = new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) });
      await db.upsertAuction(auctionId, { noteCommitment });

      const fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toEqual({
        noteCommitment,
      });
    });

    it('inserts both an auction and a note commitment', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const auction = new DutchAuctionDescription({ startHeight: 1234n });
      const noteCommitment = new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) });
      await db.upsertAuction(auctionId, { auction, noteCommitment });

      const fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toEqual({
        auction,
        noteCommitment,
      });
    });

    it('inserts an auction and sequence number, and then updates with a note commitment when given the same auction ID', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const auction = new DutchAuctionDescription({ startHeight: 1234n });
      const seqNum = 0n;
      await db.upsertAuction(auctionId, { auction, seqNum });

      let fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toBeTruthy();

      const noteCommitment = new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) });
      await db.upsertAuction(auctionId, { noteCommitment });

      fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toBeTruthy();

      expect(fetchedAuction).toEqual({
        auction,
        noteCommitment,
        seqNum,
      });
    });

    it('inserts a note commitment and then updates with an auction and sequence number when given the same auction ID', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const noteCommitment = new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) });
      await db.upsertAuction(auctionId, { noteCommitment });

      let fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toBeTruthy();

      const auction = new DutchAuctionDescription({ startHeight: 1234n });
      const seqNum = 0n;
      await db.upsertAuction(auctionId, { auction, seqNum });

      fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toBeTruthy();

      expect(fetchedAuction).toEqual({
        auction,
        noteCommitment,
        seqNum,
      });
    });

    it('inserts all data, and then updates with a sequence number when given the same auction ID', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const auction = new DutchAuctionDescription({ startHeight: 1234n });
      const noteCommitment = new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) });
      await db.upsertAuction(auctionId, { auction, noteCommitment, seqNum: 0n });

      let fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toBeTruthy();

      await db.upsertAuction(auctionId, { seqNum: 1n });

      fetchedAuction = await db.getAuction(auctionId);
      expect(fetchedAuction).toBeTruthy();

      expect(fetchedAuction).toEqual({
        auction,
        noteCommitment,
        seqNum: 1n,
      });
    });
  });

  describe('addAuctionOutstandingReserves()', () => {
    let db: IndexedDb;

    beforeEach(async () => {
      db = await IndexedDb.initialize({ ...generateInitialProps() });
    });

    it('saves the outstanding reserves', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const input = new Value({
        amount: { hi: 0n, lo: 1n },
        assetId: { inner: new Uint8Array([1, 1, 1, 1]) },
      });
      const output = new Value({
        amount: { hi: 0n, lo: 2n },
        assetId: { inner: new Uint8Array([2, 2, 2, 2]) },
      });
      await db.addAuctionOutstandingReserves(auctionId, { input, output });

      await expect(db.getAuctionOutstandingReserves(auctionId)).resolves.toEqual({ input, output });
    });
  });

  describe('deleteAuctionOutstandingReserves()', () => {
    let db: IndexedDb;

    beforeEach(async () => {
      db = await IndexedDb.initialize({ ...generateInitialProps() });
    });

    it('deletes the reserves', async () => {
      const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const input = new Value({
        amount: { hi: 0n, lo: 1n },
        assetId: { inner: new Uint8Array([1, 1, 1, 1]) },
      });
      const output = new Value({
        amount: { hi: 0n, lo: 2n },
        assetId: { inner: new Uint8Array([2, 2, 2, 2]) },
      });
      await db.addAuctionOutstandingReserves(auctionId, { input, output });

      // Make sure this test is actually deleting an existing record
      await expect(db.getAuctionOutstandingReserves(auctionId)).resolves.toBeTruthy();

      await db.deleteAuctionOutstandingReserves(auctionId);

      await expect(db.getAuctionOutstandingReserves(auctionId)).resolves.toBeUndefined();
    });
  });
});
