import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import {
  AssetId,
  EstimatedPrice,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  Position,
  PositionId,
  PositionState,
  TradingPair,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import {
  Epoch,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  AddressIndex,
  IdentityKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import {
  NotesForVotingResponse,
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { assetPatterns, PRICE_RELEVANCE_THRESHOLDS } from '@penumbra-zone/types/assets';
import { IDBPDatabase, openDB, StoreNames } from 'idb';
import { IbdUpdater, IbdUpdates } from './updater';

import { IdbCursorSource } from './stream';

import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { bech32mIdentityKey, identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { bech32mWalletId } from '@penumbra-zone/bech32m/penumbrawalletid';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import '@penumbra-zone/polyfills/ReadableStream[Symbol.asyncIterator]';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import {
  IDB_TABLES,
  IdbConstants,
  IdbUpdate,
  IndexedDbInterface,
  PenumbraDb,
} from '@penumbra-zone/types/indexed-db';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import type {
  ScanBlockResult,
  StateCommitmentTree,
} from '@penumbra-zone/types/state-commitment-tree';
import { sctPosition } from '@penumbra-zone/wasm/tree';
import {
  AuctionId,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';

interface IndexedDbProps {
  dbVersion: number; // Incremented during schema changes
  chainId: string;
  walletId: WalletId;
  registryClient: ChainRegistryClient;
}

export class IndexedDb implements IndexedDbInterface {
  private constructor(
    private readonly db: IDBPDatabase<PenumbraDb>,
    private readonly u: IbdUpdater,
    private readonly c: IdbConstants,
    private readonly chainId: string,
  ) {}

  static async initialize({
    dbVersion,
    walletId,
    chainId,
    registryClient,
  }: IndexedDbProps): Promise<IndexedDb> {
    const bech32Id = bech32mWalletId(walletId);
    const dbName = `viewdata/${chainId}/${bech32Id}`;

    const db = await openDB<PenumbraDb>(dbName, dbVersion, {
      upgrade(db: IDBPDatabase<PenumbraDb>) {
        // delete existing ObjectStores before re-creating them
        // all existing indexed-db data will be deleted when version is increased
        for (const objectStoreName of db.objectStoreNames) {
          db.deleteObjectStore(objectStoreName);
        }

        db.createObjectStore('FULL_SYNC_HEIGHT');
        db.createObjectStore('ASSETS', { keyPath: 'penumbraAssetId.inner' });
        db.createObjectStore('SPENDABLE_NOTES', {
          keyPath: 'noteCommitment.inner',
        }).createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('TRANSACTIONS', { keyPath: 'id.inner' });
        db.createObjectStore('TREE_LAST_POSITION');
        db.createObjectStore('TREE_LAST_FORGOTTEN');
        db.createObjectStore('TREE_COMMITMENTS', { keyPath: 'commitment.inner' });
        // No unique id for given tree hash and hash can be the same for different positions. Using `autoIncrement` to make the item key an incremented index.
        db.createObjectStore('TREE_HASHES', { autoIncrement: true });
        db.createObjectStore('FMD_PARAMETERS');
        db.createObjectStore('APP_PARAMETERS');

        db.createObjectStore('NOTES');
        db.createObjectStore('SWAPS', {
          keyPath: 'swapCommitment.inner',
        }).createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('GAS_PRICES');
        db.createObjectStore('POSITIONS', { keyPath: 'id.inner' });
        db.createObjectStore('EPOCHS', { autoIncrement: true });
        db.createObjectStore('VALIDATOR_INFOS');
        db.createObjectStore('PRICES', {
          keyPath: ['pricedAsset.inner', 'numeraire.inner'],
        }).createIndex('pricedAsset', 'pricedAsset.inner');
        db.createObjectStore('AUCTIONS');
        db.createObjectStore('AUCTION_OUTSTANDING_RESERVES');
        db.createObjectStore('REGISTRY_VERSION');
      },
    });
    const constants = {
      name: dbName,
      version: dbVersion,
      tables: IDB_TABLES,
    } satisfies IdbConstants;

    const instance = new this(db, new IbdUpdater(db), constants, chainId);
    await instance.saveRegistryAssets(registryClient, chainId); // Pre-load asset metadata from registry

    const existing0thEpoch = await instance.getEpochByHeight(0n);
    if (!existing0thEpoch) await instance.addEpoch(0n); // Create first epoch

    // set non-zero gas prices in indexDB since the testnet has not yet enabled gas fees.
    await instance.initGasPrices();

    return instance;
  }

  close(): void {
    this.db.close();
  }

  constants(): IdbConstants {
    return this.c;
  }

  subscribe<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    table: StoreName,
  ): AsyncGenerator<IdbUpdate<DBTypes, StoreName>, void> {
    return this.u.subscribe(table);
  }

  public async getStateCommitmentTree(): Promise<StateCommitmentTree> {
    const lastPosition = await this.db.get('TREE_LAST_POSITION', 'last_position');
    const lastForgotten = await this.db.get('TREE_LAST_FORGOTTEN', 'last_forgotten');
    const hashes = await this.db.getAll('TREE_HASHES');
    const commitments = await this.db.getAll('TREE_COMMITMENTS');

    return {
      last_position: lastPosition ?? { Position: { epoch: 0, block: 0, commitment: 0 } },
      last_forgotten: lastForgotten ?? 0n,
      hashes,
      commitments,
    };
  }

  // All updates must be atomic in order to prevent invalid tree state
  public async saveScanResult(updates: ScanBlockResult): Promise<void> {
    const txs = new IbdUpdates();

    this.addSctUpdates(txs, updates.sctUpdates);
    this.addNewNotes(txs, updates.newNotes);
    await this.addNewSwaps(txs, updates.newSwaps, updates.height);
    txs.add({ table: 'FULL_SYNC_HEIGHT', value: updates.height, key: 'height' });

    await this.u.updateAll(txs);
  }

  async getFullSyncHeight() {
    return this.db.get('FULL_SYNC_HEIGHT', 'height');
  }

  async getSpendableNoteByNullifier(
    nullifier: Nullifier,
  ): Promise<SpendableNoteRecord | undefined> {
    const key = uint8ArrayToBase64(nullifier.inner);
    const json = await this.db.getFromIndex('SPENDABLE_NOTES', 'nullifier', key);
    if (!json) return undefined;
    return SpendableNoteRecord.fromJson(json);
  }

  async getSpendableNoteByCommitment(
    commitment: StateCommitment,
  ): Promise<SpendableNoteRecord | undefined> {
    const key = uint8ArrayToBase64(commitment.inner);
    const json = await this.db.get('SPENDABLE_NOTES', key);
    if (!json) return undefined;
    return SpendableNoteRecord.fromJson(json);
  }

  async saveSpendableNote(note: SpendableNoteRecord) {
    await this.u.update({
      table: 'SPENDABLE_NOTES',
      value: note.toJson() as Jsonified<SpendableNoteRecord>,
    });
  }

  /**
   * Gets metadata by asset ID.
   *
   * If possible, pass an `AssetId` with a populated `inner` property, as that
   * is by far the fastest way to retrieve metadata. However, you can also pass
   * an `AssetId` with either the `altBaseDenom` or `altBech32m` properties
   * populated. In those cases, `getAssetsMetadata` will iterate over every
   * metadata in the `ASSETS` table until it finds a match.
   */
  async getAssetsMetadata(assetId: AssetId): Promise<Metadata | undefined> {
    if (!assetId.inner.length && !assetId.altBaseDenom && !assetId.altBech32m) return undefined;

    if (assetId.inner.length) {
      const key = uint8ArrayToBase64(assetId.inner);
      const json = await this.db.get('ASSETS', key);
      if (!json) return undefined;
      return Metadata.fromJson(json);
    }

    if (assetId.altBaseDenom || assetId.altBech32m) {
      for await (const cursor of this.db.transaction('ASSETS').store) {
        const metadata = Metadata.fromJson(cursor.value);

        if (metadata.base === assetId.altBaseDenom) return metadata;

        if (
          metadata.penumbraAssetId &&
          bech32mAssetId(metadata.penumbraAssetId) === assetId.altBech32m
        ) {
          return metadata;
        }
      }
    }

    return undefined;
  }

  async *iterateAssetsMetadata() {
    yield* new ReadableStream(
      new IdbCursorSource(this.db.transaction('ASSETS').store.openCursor(), Metadata),
    );
  }

  async saveAssetsMetadata(metadata: Metadata) {
    await this.u.update({ table: 'ASSETS', value: metadata.toJson() as Jsonified<Metadata> });
  }

  // creates a local copy of the asset list from registry (https://github.com/prax-wallet/registry)
  async saveRegistryAssets(registryClient: ChainRegistryClient, chainId: string) {
    const { commit } = registryClient.version();
    const lastPosition = await this.db.get('REGISTRY_VERSION', 'commit');

    // Registry version already saved
    if (lastPosition === commit) return;

    const assets = registryClient.get(chainId).getAllAssets();
    const saveLocalMetadata = assets.map(m => this.saveAssetsMetadata(m));
    await Promise.all(saveLocalMetadata);
    await this.u.update({ table: 'REGISTRY_VERSION', key: 'commit', value: commit });
  }

  async *iterateSpendableNotes() {
    yield* new ReadableStream(
      new IdbCursorSource(
        this.db.transaction('SPENDABLE_NOTES').store.openCursor(),
        SpendableNoteRecord,
      ),
    );
  }

  async initGasPrices() {
    const savedGasPrices = await this.getGasPrices();
    // These are arbitrarily set, but can take on any value.
    // The gas prices set here will determine the fees to use Penumbra.
    if (!savedGasPrices) {
      await this.saveGasPrices(
        new GasPrices({
          verificationPrice: 1n,
          executionPrice: 1n,
          blockSpacePrice: 1n,
          compactBlockSpacePrice: 1n,
        }),
      );
    }
  }

  async *iterateTransactions() {
    yield* new ReadableStream(
      new IdbCursorSource(this.db.transaction('TRANSACTIONS').store.openCursor(), TransactionInfo),
    );
  }

  async saveTransaction(
    id: TransactionId,
    height: bigint,
    transaction: Transaction,
  ): Promise<void> {
    const tx = new TransactionInfo({ id, height, transaction });
    await this.u.update({
      table: 'TRANSACTIONS',
      value: tx.toJson() as Jsonified<TransactionInfo>,
    });
  }

  async getTransaction(txId: TransactionId): Promise<TransactionInfo | undefined> {
    const key = uint8ArrayToBase64(txId.inner);
    const jsonRecord = await this.db.get('TRANSACTIONS', key);
    if (!jsonRecord) return undefined;
    return TransactionInfo.fromJson(jsonRecord);
  }

  async getFmdParams(): Promise<FmdParameters | undefined> {
    const json = await this.db.get('FMD_PARAMETERS', 'params');
    if (!json) return undefined;
    return FmdParameters.fromJson(json);
  }

  async saveFmdParams(fmd: FmdParameters): Promise<void> {
    await this.u.update({
      table: 'FMD_PARAMETERS',
      value: fmd.toJson() as Jsonified<FmdParameters>,
      key: 'params',
    });
  }

  async getAppParams(): Promise<AppParameters | undefined> {
    const json = await this.db.get('APP_PARAMETERS', 'params');
    if (!json) return undefined;
    const appParams = AppParameters.fromJson(json);
    if (!appParams.chainId) return undefined;
    return appParams;
  }

  async saveAppParams(app: AppParameters): Promise<void> {
    // chain id shouldn't change
    if (app.chainId !== this.chainId) {
      this.db.close();
      throw new Error(`Mismatched chainId: idb ${this.chainId} but new ${app.chainId}`);
    }
    await this.u.update({
      table: 'APP_PARAMETERS',
      value: app.toJson() as Jsonified<AppParameters>,
      key: 'params',
    });
  }

  async *iterateSwaps() {
    yield* new ReadableStream(
      new IdbCursorSource(this.db.transaction('SWAPS').store.openCursor(), SwapRecord),
    );
  }

  async clear() {
    for (const storeName of Object.values(this.db.objectStoreNames)) {
      await this.db.clear(storeName);
    }
  }

  async getSwapByNullifier(nullifier: Nullifier): Promise<SwapRecord | undefined> {
    const key = uint8ArrayToBase64(nullifier.inner);
    const json = await this.db.getFromIndex('SWAPS', 'nullifier', key);
    if (!json) return undefined;
    return SwapRecord.fromJson(json);
  }

  async saveSwap(swap: SwapRecord) {
    await this.u.update({ table: 'SWAPS', value: swap.toJson() as Jsonified<SwapRecord> });
  }

  async getSwapByCommitment(commitment: StateCommitment): Promise<SwapRecord | undefined> {
    const key = uint8ArrayToBase64(commitment.inner);
    const json = await this.db.get('SWAPS', key);
    if (!json) return undefined;
    return SwapRecord.fromJson(json);
  }

  async getGasPrices(): Promise<GasPrices | undefined> {
    return this.db.get('GAS_PRICES', 'gas_prices');
  }

  async saveGasPrices(value: GasPrices): Promise<void> {
    await this.u.update({ table: 'GAS_PRICES', value, key: 'gas_prices' });
  }

  /**
   * Only 'SpendableNotes' with delegation assets are eligible for voting
   * This function is like a subquery in SQL:
   *  SELECT spendable_notes
   *  WHERE
   *  notes.asset_id IN ( SELECT asset_id FROM assets WHERE denom LIKE '_delegation\\_%' ESCAPE '\\')
   * This means that we must first get a list of only delegation assets, and then use it to filter the notes
   */
  async getNotesForVoting(
    addressIndex: AddressIndex | undefined,
    votableAtHeight: bigint,
  ): Promise<NotesForVotingResponse[]> {
    const delegationAssets = new Map<string, Metadata>();

    for await (const assetCursor of this.db.transaction('ASSETS').store) {
      const denomMetadata = Metadata.fromJson(assetCursor.value);
      if (
        assetPatterns.delegationToken.matches(denomMetadata.display) &&
        denomMetadata.penumbraAssetId
      ) {
        delegationAssets.set(uint8ArrayToHex(denomMetadata.penumbraAssetId.inner), denomMetadata);
      }
    }
    const notesForVoting: NotesForVotingResponse[] = [];

    for await (const noteCursor of this.db.transaction('SPENDABLE_NOTES').store) {
      const note = SpendableNoteRecord.fromJson(noteCursor.value);

      if (
        (addressIndex && !note.addressIndex?.equals(addressIndex)) ??
        !note.note?.value?.assetId?.inner
      ) {
        continue;
      }

      const isDelegationAssetNote = delegationAssets.has(
        uint8ArrayToHex(note.note.value.assetId.inner),
      );

      // Only notes that have not been spent can be used for voting.
      const noteNotSpentAtVoteHeight =
        note.heightSpent === 0n || note.heightSpent > votableAtHeight;

      // Note must be created at a height lower than the height of the vote
      const noteIsCreatedBeforeVote = note.heightCreated < votableAtHeight;

      if (isDelegationAssetNote && noteNotSpentAtVoteHeight && noteIsCreatedBeforeVote) {
        const asset = delegationAssets.get(uint8ArrayToHex(note.note.value.assetId.inner));

        // delegation asset denom consists of prefix 'delegation_' and validator identity key in bech32m encoding
        // For example, in denom 'delegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqqas55kkpyf6lhsqs2w0zar'
        // 'penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar' is  validator identity key.
        const regexResult = assetPatterns.delegationToken.capture(asset?.display ?? '');
        if (!regexResult) throw new Error('expected delegation token identity key not present');

        notesForVoting.push(
          new NotesForVotingResponse({
            noteRecord: note,
            identityKey: identityKeyFromBech32m(regexResult.idKey),
          }),
        );
      }
    }
    return Promise.resolve(notesForVoting);
  }

  async *getOwnedPositionIds(
    positionState: PositionState | undefined,
    tradingPair: TradingPair | undefined,
  ) {
    yield* new ReadableStream({
      start: async cont => {
        let cursor = await this.db.transaction('POSITIONS').store.openCursor();
        while (cursor) {
          const position = Position.fromJson(cursor.value.position);
          if (
            (!positionState || positionState.equals(position.state)) &&
            (!tradingPair || tradingPair.equals(position.phi?.pair))
          )
            cont.enqueue(PositionId.fromJson(cursor.value.id));
          cursor = await cursor.continue();
        }
        cont.close();
      },
    });
  }

  async addPosition(positionId: PositionId, position: Position): Promise<void> {
    const positionRecord = {
      id: positionId.toJson() as Jsonified<PositionId>,
      position: position.toJson() as Jsonified<Position>,
    };
    await this.u.update({ table: 'POSITIONS', value: positionRecord });
  }

  async updatePosition(positionId: PositionId, newState: PositionState): Promise<void> {
    const key = uint8ArrayToBase64(positionId.inner);
    const positionRecord = await this.db.get('POSITIONS', key);

    if (!positionRecord) throw new Error('Position not found when trying to change its state');

    const position = Position.fromJson(positionRecord.position);
    position.state = newState;

    await this.u.update({
      table: 'POSITIONS',
      value: {
        id: positionId.toJson() as Jsonified<PositionId>,
        position: position.toJson() as Jsonified<Position>,
      },
    });
  }

  /**
   * Adds a new epoch with the given start height. Automatically sets the epoch
   * index by finding the previous epoch index, and adding 1n.
   */
  async addEpoch(startHeight: bigint): Promise<void> {
    const cursor = await this.db.transaction('EPOCHS', 'readonly').store.openCursor(null, 'prev');
    const previousEpoch = cursor?.value ? Epoch.fromJson(cursor.value) : undefined;
    const index = previousEpoch?.index !== undefined ? previousEpoch.index + 1n : 0n;

    // avoid saving the same epoch twice
    if (previousEpoch?.startHeight === startHeight) return;

    const newEpoch = {
      startHeight: startHeight.toString(),
      index: index.toString(),
    };

    await this.u.update({
      table: 'EPOCHS',
      value: newEpoch,
    });
  }

  /**
   * Get the epoch that contains the given block height.
   */
  async getEpochByHeight(
    /**
     * The block height to query by. Will return the epoch with the largest
     * start height smaller than `height` -- that is, the epoch that contains
     * this height.
     */
    height: bigint,
  ): Promise<Epoch | undefined> {
    let epoch: Epoch | undefined;

    /**
     * Iterate over epochs and return the one with the largest start height
     * smaller than `height`.
     *
     * Unfortunately, there doesn't appear to be a more efficient way of doing
     * this. We tried using epochs' start heights as their key so that we could
     * use a particular start height as a query bounds, but IndexedDB casts the
     * `bigint` start height to a string, which messes up sorting (the string
     * '11' is greater than the string '100', for example). For now, then, we
     * have to just iterate over all epochs to find the correct starting height.
     */
    for await (const cursor of this.db.transaction('EPOCHS', 'readonly').store) {
      const currentEpoch = Epoch.fromJson(cursor.value);

      if (currentEpoch.startHeight <= height) epoch = currentEpoch;
      else if (currentEpoch.startHeight > height) break;
    }

    return epoch;
  }

  /**
   * Inserts the validator info into the database, or updates an existing
   * validator info if one with the same identity key exists.
   */
  async upsertValidatorInfo(validatorInfo: ValidatorInfo): Promise<void> {
    const identityKeyAsBech32 = bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo));

    await this.u.update({
      table: 'VALIDATOR_INFOS',
      key: identityKeyAsBech32,
      value: validatorInfo.toJson() as Jsonified<ValidatorInfo>,
    });
  }

  /**
   * Iterates over all validator infos in the database.
   */
  async *iterateValidatorInfos() {
    yield* new ReadableStream(
      new IdbCursorSource(this.db.transaction('VALIDATOR_INFOS').store.openCursor(), ValidatorInfo),
    );
  }

  async getValidatorInfo(identityKey: IdentityKey): Promise<ValidatorInfo | undefined> {
    const key = bech32mIdentityKey(identityKey);
    const json = await this.db.get('VALIDATOR_INFOS', key);
    if (!json) return undefined;
    return ValidatorInfo.fromJson(json);
  }

  async updatePrice(
    /**
     * The asset to save the price for in terms of the numeraire.
     */
    pricedAsset: AssetId,
    /**
     * The numeraire is a standard against which to measure the value of the
     * priced asset.
     */
    numeraire: AssetId,
    /**
     * Multiply units of the priced asset by this value to get the value in the
     * numeraire.
     *
     * This is a floating-point number since the price is approximate.
     */
    numerairePerUnit: number,
    /**
     * If set, gives some idea of when the price was estimated.
     */
    asOfHeight: bigint,
  ) {
    const estimatedPrice = new EstimatedPrice({
      pricedAsset,
      numeraire,
      numerairePerUnit,
      asOfHeight,
    });

    await this.u.update({
      table: 'PRICES',
      value: estimatedPrice.toJson() as Jsonified<EstimatedPrice>,
    });
  }

  /**
   * Uses priceRelevanceThreshold to return only actual prices
   * If more than priceRelevanceThreshold blocks have passed since the price was saved, such price is not returned
   * priceRelevanceThreshold depends on the type of assets, for example, for delegation tokens the relevance lasts longer
   */
  async getPricesForAsset(
    assetMetadata: Metadata,
    latestBlockHeight: bigint,
  ): Promise<EstimatedPrice[]> {
    const base64AssetId = uint8ArrayToBase64(getAssetId(assetMetadata).inner);
    const results = await this.db.getAllFromIndex('PRICES', 'pricedAsset', base64AssetId);

    const priceRelevanceThreshold = this.determinePriceRelevanceThresholdForAsset(assetMetadata);
    const minHeight = latestBlockHeight - BigInt(priceRelevanceThreshold);

    return results
      .map(price => EstimatedPrice.fromJson(price))
      .filter(price => price.asOfHeight >= minHeight);
  }

  private determinePriceRelevanceThresholdForAsset(assetMetadata: Metadata): number {
    if (assetPatterns.delegationToken.capture(assetMetadata.display)) {
      return PRICE_RELEVANCE_THRESHOLDS.delegationToken;
    }
    return PRICE_RELEVANCE_THRESHOLDS.default;
  }

  private addSctUpdates(txs: IbdUpdates, sctUpdates: ScanBlockResult['sctUpdates']): void {
    if (sctUpdates.set_position) {
      txs.add({
        table: 'TREE_LAST_POSITION',
        value: sctUpdates.set_position,
        key: 'last_position',
      });
    }

    if (sctUpdates.set_forgotten) {
      txs.add({
        table: 'TREE_LAST_FORGOTTEN',
        value: sctUpdates.set_forgotten,
        key: 'last_forgotten',
      });
    }

    for (const c of sctUpdates.store_commitments) {
      txs.add({ table: 'TREE_COMMITMENTS', value: c });
    }

    for (const h of sctUpdates.store_hashes) {
      txs.add({ table: 'TREE_HASHES', value: h });
    }

    // TODO: What about updates.delete_ranges?
  }

  private addNewNotes(txs: IbdUpdates, notes: SpendableNoteRecord[]): void {
    for (const n of notes) {
      txs.add({ table: 'SPENDABLE_NOTES', value: n.toJson() as Jsonified<SpendableNoteRecord> });
    }
  }

  private async addNewSwaps(
    txs: IbdUpdates,
    swaps: SwapRecord[],
    blockHeight: bigint,
  ): Promise<void> {
    if (!swaps.length) return;

    const epoch =
      (await this.getEpochByHeight(blockHeight)) ?? new Epoch({ startHeight: 0n, index: 0n });

    for (const n of swaps) {
      if (!n.outputData) throw new Error('No output data in swap record');

      // Adds position prefix to swap record. Needed to make swap claims.
      n.outputData.sctPositionPrefix = sctPosition(blockHeight, epoch);

      txs.add({ table: 'SWAPS', value: n.toJson() as Jsonified<SwapRecord> });
    }
  }

  // As more auction types are created, add them to T as a union type.
  async upsertAuction<T extends DutchAuctionDescription>(
    auctionId: AuctionId,
    value: {
      auction?: T;
      noteCommitment?: StateCommitment;
      seqNum?: bigint;
      outstandingReserves?: { input: Value; output: Value };
    },
  ): Promise<void> {
    const key = uint8ArrayToBase64(auctionId.inner);
    const existingRecord = await this.db.get('AUCTIONS', key);
    const auction =
      (value.auction?.toJson() as Jsonified<T> | undefined) ?? existingRecord?.auction;
    const noteCommitment =
      (value.noteCommitment?.toJson() as Jsonified<StateCommitment> | undefined) ??
      existingRecord?.noteCommitment;
    const seqNum = value.seqNum ?? existingRecord?.seqNum;

    await this.u.update({
      table: 'AUCTIONS',
      key,
      value: {
        auction,
        noteCommitment,
        seqNum,
      },
    });
  }

  async getAuction(auctionId: AuctionId): Promise<{
    // Add more auction union types as they are created
    auction?: DutchAuctionDescription;
    noteCommitment?: StateCommitment;
    seqNum?: bigint;
  }> {
    const result = await this.db.get('AUCTIONS', uint8ArrayToBase64(auctionId.inner));

    return {
      auction: result?.auction ? DutchAuctionDescription.fromJson(result.auction) : undefined,
      noteCommitment: result?.noteCommitment
        ? StateCommitment.fromJson(result.noteCommitment)
        : undefined,
      seqNum: result?.seqNum,
    };
  }

  async addAuctionOutstandingReserves(
    auctionId: AuctionId,
    value: { input: Value; output: Value },
  ): Promise<void> {
    await this.db.add(
      'AUCTION_OUTSTANDING_RESERVES',
      {
        input: value.input.toJson() as Jsonified<Value>,
        output: value.output.toJson() as Jsonified<Value>,
      },
      uint8ArrayToBase64(auctionId.inner),
    );
  }

  async deleteAuctionOutstandingReserves(auctionId: AuctionId): Promise<void> {
    await this.db.delete('AUCTION_OUTSTANDING_RESERVES', uint8ArrayToBase64(auctionId.inner));
  }

  async getAuctionOutstandingReserves(
    auctionId: AuctionId,
  ): Promise<{ input: Value; output: Value } | undefined> {
    const result = await this.db.get(
      'AUCTION_OUTSTANDING_RESERVES',
      uint8ArrayToBase64(auctionId.inner),
    );

    if (!result) return undefined;

    return {
      input: Value.fromJson(result.input),
      output: Value.fromJson(result.output),
    };
  }
}
