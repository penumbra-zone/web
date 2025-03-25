import { AppParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import type { AppParameters } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import {
  AssetIdSchema,
  EstimatedPriceSchema,
  MetadataSchema,
  ValueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type {
  AssetId,
  EstimatedPrice,
  Metadata,
  Value,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  PositionSchema,
  PositionIdSchema,
  PositionState,
  TradingPair,
  PositionId,
  Position,
  PositionStateSchema,
  TradingPairSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { GasPricesSchema } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import type { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import {
  Epoch,
  EpochSchema,
  Nullifier,
} from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { FmdParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import type { FmdParameters } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  AddressIndexSchema,
  IdentityKey,
  WalletId,
  AddressIndex,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionIdSchema } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import type { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { StateCommitmentSchema } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import type { StateCommitment } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';

import {
  NotesForVotingResponseSchema,
  SpendableNoteRecordSchema,
  SwapRecordSchema,
  TransactionInfoSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import type {
  NotesForVotingResponse,
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { assetPatterns, PRICE_RELEVANCE_THRESHOLDS } from '@penumbra-zone/types/assets';
import { IDBPDatabase, openDB, StoreNames } from 'idb';
import { IbdUpdater, IbdUpdates } from './updater.js';

import { IdbCursorSource } from './stream.js';

import { ValidatorInfoSchema } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import type { ValidatorInfo } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

import {
  Transaction,
  TransactionPerspectiveSchema,
  TransactionSummarySchema,
  TransactionViewSchema,
  TransactionPerspective,
  TransactionSummary,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { bech32mIdentityKey, identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { bech32mWalletId } from '@penumbra-zone/bech32m/penumbrawalletid';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { base64ToUint8Array, uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
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
  DutchAuctionDescriptionSchema,
  DutchAuctionDescription,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import type { ChainRegistryClient } from '@penumbra-labs/registry';
import { create, equals, fromJson, toJson } from '@bufbuild/protobuf';
import { getAmountFromRecord } from '@penumbra-zone/getters/spendable-note-record';
import { isZero } from '@penumbra-zone/types/amount';
import { IDB_VERSION } from './config.js';
import { addLoHi } from '@penumbra-zone/types/lo-hi';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import type { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { typeRegistry } from '@penumbra-zone/protobuf';

const assertBytes = (v?: Uint8Array, expect?: number, name = 'value'): v is Uint8Array => {
  if (expect !== undefined && v?.length !== expect) {
    throw new Error(`Expected ${name} of ${expect} bytes, but got ${v?.length} bytes`);
  } else if (expect === undefined && !v?.length) {
    throw new Error(`Expected ${name} to be non-empty, but got ${v?.length} bytes`);
  }
  return true;
};

// yes these are all 32 bytes
const assertAssetId = (assetId?: AssetId): assetId is AssetId =>
  assertBytes(assetId?.inner, 32, 'AssetId');
const assertAuctionId = (auctionId?: AuctionId): auctionId is AuctionId =>
  assertBytes(auctionId?.inner, 32, 'AuctionId');
const assertCommitment = (commitment?: StateCommitment): commitment is StateCommitment =>
  assertBytes(commitment?.inner, 32, 'StateCommitment');
const assertNullifier = (nullifier?: Nullifier): nullifier is Nullifier =>
  assertBytes(nullifier?.inner, 32, 'Nullifier');
const assertTransactionId = (txId?: TransactionId): txId is TransactionId =>
  assertBytes(txId?.inner, 32, 'TransactionId');
const assertPositionId = (positionId?: PositionId): positionId is PositionId =>
  assertBytes(positionId?.inner, 32, 'PositionId');

interface IndexedDbProps {
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
    readonly stakingTokenAssetId: AssetId,
  ) {}

  static async initialize({
    walletId,
    chainId,
    registryClient,
  }: IndexedDbProps): Promise<IndexedDb> {
    const bech32Id = bech32mWalletId(walletId);
    const idbName = `viewdata/${chainId}/${bech32Id}`;

    const db = await openDB<PenumbraDb>(idbName, IDB_VERSION, {
      upgrade(db: IDBPDatabase<PenumbraDb>) {
        // delete existing ObjectStores before re-creating them
        // all existing indexed-db data will be deleted when version is increased
        for (const objectStoreName of db.objectStoreNames) {
          db.deleteObjectStore(objectStoreName);
        }

        db.createObjectStore('FULL_SYNC_HEIGHT');
        db.createObjectStore('ASSETS', { keyPath: 'penumbraAssetId.inner' });
        const spendableNoteStore = db.createObjectStore('SPENDABLE_NOTES', {
          keyPath: 'noteCommitment.inner',
        });
        spendableNoteStore.createIndex('nullifier', 'nullifier.inner');
        spendableNoteStore.createIndex('assetId', 'note.value.assetId.inner');
        db.createObjectStore('TRANSACTIONS', { keyPath: 'id.inner' }).createIndex(
          'height',
          'height',
        );
        db.createObjectStore('TRANSACTION_INFO', { keyPath: 'id.inner' });
        db.createObjectStore('TREE_LAST_POSITION');
        db.createObjectStore('TREE_LAST_FORGOTTEN');
        db.createObjectStore('TREE_COMMITMENTS', { keyPath: 'commitment.inner' });
        // No unique id for given tree hash and hash can be the same for different positions. Using `autoIncrement` to make the item key an incremented index.
        db.createObjectStore('TREE_HASHES', { autoIncrement: true });
        db.createObjectStore('FMD_PARAMETERS');
        db.createObjectStore('APP_PARAMETERS');

        db.createObjectStore('ADVICE_NOTES');
        db.createObjectStore('SWAPS', {
          keyPath: 'swapCommitment.inner',
        }).createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('GAS_PRICES', { keyPath: 'assetId.inner' });
        db.createObjectStore('POSITIONS', { keyPath: 'id.inner' });
        db.createObjectStore('EPOCHS', { autoIncrement: true });
        db.createObjectStore('VALIDATOR_INFOS');
        db.createObjectStore('PRICES', {
          keyPath: ['pricedAsset.inner', 'numeraire.inner'],
        }).createIndex('pricedAsset', 'pricedAsset.inner');
        db.createObjectStore('AUCTIONS');
        db.createObjectStore('AUCTION_OUTSTANDING_RESERVES');
        db.createObjectStore('REGISTRY_VERSION');
        db.createObjectStore('LQT_HISTORICAL_VOTES', {
          keyPath: 'id',
        }).createIndex('epoch', 'epoch');
      },
    });
    const constants = {
      name: idbName,
      version: IDB_VERSION,
      tables: IDB_TABLES,
    } satisfies IdbConstants;

    const { stakingAssetId } = registryClient.bundled.globals();
    const instance = new this(
      db,
      new IbdUpdater(db),
      constants,
      chainId,
      create(AssetIdSchema, stakingAssetId),
    );
    await instance.saveRegistryAssets(registryClient, chainId); // Pre-load asset metadata from registry

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
    assertNullifier(nullifier);
    const key = uint8ArrayToBase64(nullifier.inner);
    const json = await this.db.getFromIndex('SPENDABLE_NOTES', 'nullifier', key);
    if (!json) {
      return undefined;
    }
    return fromJson(SpendableNoteRecordSchema, json);
  }

  async getSpendableNoteByCommitment(
    commitment: StateCommitment,
  ): Promise<SpendableNoteRecord | undefined> {
    assertCommitment(commitment);
    const key = uint8ArrayToBase64(commitment.inner);
    const json = await this.db.get('SPENDABLE_NOTES', key);
    if (!json) {
      return undefined;
    }
    return fromJson(SpendableNoteRecordSchema, json);
  }

  async saveSpendableNote(note: SpendableNoteRecord & { noteCommitment: StateCommitment }) {
    assertCommitment(note.noteCommitment);
    await this.u.update({
      table: 'SPENDABLE_NOTES',
      value: toJson(
        SpendableNoteRecordSchema,
        create(SpendableNoteRecordSchema, note),
      ) as Jsonified<SpendableNoteRecord>,
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
    if (!assetId.inner.length && !assetId.altBaseDenom && !assetId.altBech32m) {
      return undefined;
    }

    if (assetId.inner.length) {
      const key = uint8ArrayToBase64(assetId.inner);
      const json = await this.db.get('ASSETS', key);
      if (!json) {
        return undefined;
      }
      return fromJson(MetadataSchema, json);
    }

    if (assetId.altBaseDenom || assetId.altBech32m) {
      for await (const cursor of this.db.transaction('ASSETS').store) {
        const metadata = fromJson(MetadataSchema, cursor.value);

        if (metadata.base === assetId.altBaseDenom) {
          return metadata;
        }

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
      new IdbCursorSource(this.db.transaction('ASSETS').store.openCursor(), MetadataSchema),
    );
  }

  async saveAssetsMetadata(metadata: Metadata) {
    assertAssetId(metadata.penumbraAssetId);
    await this.u.update({
      table: 'ASSETS',
      value: toJson(MetadataSchema, create(MetadataSchema, metadata)) as Jsonified<Metadata>,
    });
  }

  // creates a local copy of the asset list from registry (https://github.com/prax-wallet/registry)
  async saveRegistryAssets(registryClient: ChainRegistryClient, chainId: string) {
    try {
      const registry = await registryClient.remote.get(chainId);
      const remoteVersion = await registry.version();
      const localVersion = await this.db.get('REGISTRY_VERSION', 'commit');

      // Registry version already saved
      if (localVersion === remoteVersion) {
        return;
      }

      const assets = registry.getAllAssets();
      const saveLocalMetadata = assets.map(m =>
        this.saveAssetsMetadata({ ...m, penumbraAssetId: getAssetId(m) }),
      );
      await Promise.all(saveLocalMetadata);
      await this.u.update({ table: 'REGISTRY_VERSION', key: 'commit', value: remoteVersion });
    } catch (error) {
      console.error('Failed pre-population of assets from the registry', error);
    }
  }

  async *iterateSpendableNotes() {
    yield* new ReadableStream(
      new IdbCursorSource(
        this.db.transaction('SPENDABLE_NOTES').store.openCursor(),
        SpendableNoteRecordSchema,
      ),
    );
  }

  async *iterateTransactions() {
    yield* new ReadableStream(
      new IdbCursorSource(
        this.db.transaction('TRANSACTIONS').store.index('height').openCursor(),
        TransactionInfoSchema,
      ),
    );
  }

  async getTransactionInfo(id: TransactionId): Promise<
    | {
        id: TransactionId;
        perspective: TransactionPerspective;
        view: TransactionView;
        summary?: TransactionSummary;
      }
    | undefined
  > {
    const existingData = await this.db.get('TRANSACTION_INFO', uint8ArrayToBase64(id.inner));
    if (!existingData) {
      return undefined;
    }

    return {
      id: fromJson(TransactionIdSchema, existingData.id, { registry: typeRegistry }),
      perspective: fromJson(TransactionPerspectiveSchema, existingData.perspective, {
        registry: typeRegistry,
      }),
      view: fromJson(TransactionViewSchema, existingData.view, { registry: typeRegistry }),
      summary: existingData.summary
        ? fromJson(TransactionSummarySchema, existingData.summary, { registry: typeRegistry })
        : undefined,
    };
  }

  async saveTransactionInfo(
    id: TransactionId,
    txp: TransactionPerspective,
    txv: TransactionView,
    summary: TransactionSummary,
  ): Promise<void> {
    assertTransactionId(id);
    const value = {
      id: toJson(TransactionIdSchema, id, { registry: typeRegistry }) as Jsonified<TransactionId>,
      perspective: toJson(TransactionPerspectiveSchema, txp, {
        registry: typeRegistry,
      }) as Jsonified<TransactionPerspective>,
      view: toJson(TransactionViewSchema, txv, {
        registry: typeRegistry,
      }) as Jsonified<TransactionView>,
      summary: toJson(TransactionSummarySchema, summary, {
        registry: typeRegistry,
      }) as Jsonified<TransactionSummary>,
    };

    await this.u.update({
      table: 'TRANSACTION_INFO',
      value,
    });
  }

  async saveTransaction(
    id: TransactionId,
    height: bigint,
    transaction: Transaction,
  ): Promise<void> {
    assertTransactionId(id);
    const tx = create(TransactionInfoSchema, { id, height, transaction });
    await this.u.update({
      table: 'TRANSACTIONS',
      value: toJson(TransactionInfoSchema, tx, {
        registry: typeRegistry,
      }) as Jsonified<TransactionInfo>,
    });
  }

  /**
   * Retrieves liquidity tournament votes and rewards for a given epoch.
   */
  async getLQTHistoricalVotes(epoch: bigint): Promise<
    {
      TransactionId: TransactionId;
      AssetMetadata: Metadata;
      VoteValue: Value;
      RewardValue: Amount | undefined;
      id: string | undefined;
    }[]
  > {
    const tournamentVotes = await this.db.getAllFromIndex(
      'LQT_HISTORICAL_VOTES',
      'epoch',
      epoch.toString(),
    );

    return tournamentVotes.map(tournamentVote => ({
      TransactionId: fromJson(TransactionIdSchema, tournamentVote.TransactionId, {
        registry: typeRegistry,
      }),
      AssetMetadata: fromJson(MetadataSchema, tournamentVote.AssetMetadata, {
        registry: typeRegistry,
      }),
      VoteValue: fromJson(ValueSchema, tournamentVote.VoteValue, { registry: typeRegistry }),
      RewardValue: tournamentVote.RewardValue
        ? fromJson(AmountSchema, tournamentVote.RewardValue, { registry: typeRegistry })
        : undefined,
      id: tournamentVote.id,
    }));
  }

  /**
   * Saves historical liquidity tournament votes and rewards for a given epoch.
   */
  async saveLQTHistoricalVote(
    epoch: bigint,
    transactionId: TransactionId,
    assetMetadata: Metadata,
    voteValue: Value,
    rewardValue?: Amount,
    id?: string,
  ): Promise<void> {
    assertTransactionId(transactionId);

    // This is a unique identifier to force unique primary keys. If the field isn't provided,
    // a random one is generated and used to store an object.
    const uniquePrimaryKey = id ?? crypto.randomUUID();

    const tournamentVote = {
      epoch: epoch.toString(),
      TransactionId: toJson(TransactionIdSchema, transactionId, {
        registry: typeRegistry,
      }) as Jsonified<TransactionId>,
      AssetMetadata: toJson(MetadataSchema, assetMetadata, {
        registry: typeRegistry,
      }) as Jsonified<Metadata>,
      VoteValue: toJson(ValueSchema, voteValue, { registry: typeRegistry }) as Jsonified<Value>,
      RewardValue: rewardValue
        ? (toJson(AmountSchema, rewardValue, { registry: typeRegistry }) as Jsonified<Amount>)
        : null,
      id: uniquePrimaryKey,
    };

    await this.u.update({
      table: 'LQT_HISTORICAL_VOTES',
      value: tournamentVote,
    });
  }

  async getTransaction(txId: TransactionId): Promise<TransactionInfo | undefined> {
    assertTransactionId(txId);
    const key = uint8ArrayToBase64(txId.inner);
    const jsonRecord = await this.db.get('TRANSACTIONS', key);
    if (!jsonRecord) {
      return undefined;
    }
    return fromJson(TransactionInfoSchema, jsonRecord, { registry: typeRegistry });
  }

  async getFmdParams(): Promise<FmdParameters | undefined> {
    const json = await this.db.get('FMD_PARAMETERS', 'params');
    if (!json) {
      return undefined;
    }
    return fromJson(FmdParametersSchema, json);
  }

  async saveFmdParams(fmd: FmdParameters): Promise<void> {
    await this.u.update({
      table: 'FMD_PARAMETERS',
      value: toJson(FmdParametersSchema, fmd, {
        registry: typeRegistry,
      }) as Jsonified<FmdParameters>,
      key: 'params',
    });
  }

  async getAppParams(): Promise<AppParameters | undefined> {
    const json = await this.db.get('APP_PARAMETERS', 'params');
    if (!json) {
      return undefined;
    }
    const appParams = fromJson(AppParametersSchema, json);
    if (!appParams.chainId) {
      return undefined;
    }
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
      value: toJson(AppParametersSchema, app, {
        registry: typeRegistry,
      }) as Jsonified<AppParameters>,
      key: 'params',
    });
  }

  async *iterateSwaps() {
    yield* new ReadableStream(
      new IdbCursorSource(this.db.transaction('SWAPS').store.openCursor(), SwapRecordSchema),
    );
  }

  async clear() {
    for (const storeName of Object.values(this.db.objectStoreNames)) {
      await this.db.clear(storeName);
    }
  }

  async getSwapByNullifier(nullifier: Nullifier): Promise<SwapRecord | undefined> {
    assertNullifier(nullifier);
    const key = uint8ArrayToBase64(nullifier.inner);
    const json = await this.db.getFromIndex('SWAPS', 'nullifier', key);
    if (!json) {
      return undefined;
    }
    return fromJson(SwapRecordSchema, json);
  }

  async saveSwap(swap: SwapRecord & { swapCommitment: StateCommitment }) {
    assertCommitment(swap.swapCommitment);
    await this.u.update({
      table: 'SWAPS',
      value: toJson(SwapRecordSchema, create(SwapRecordSchema, swap), {
        registry: typeRegistry,
      }) as Jsonified<SwapRecord>,
    });
  }

  async getSwapByCommitment(commitment: StateCommitment): Promise<SwapRecord | undefined> {
    assertCommitment(commitment);
    const key = uint8ArrayToBase64(commitment.inner);
    const json = await this.db.get('SWAPS', key);
    if (!json) {
      return undefined;
    }
    return fromJson(SwapRecordSchema, json);
  }

  async getNativeGasPrices(): Promise<GasPrices | undefined> {
    assertAssetId(this.stakingTokenAssetId);
    const jsonGasPrices = await this.db.get(
      'GAS_PRICES',
      uint8ArrayToBase64(this.stakingTokenAssetId.inner),
    );
    if (!jsonGasPrices) {
      return undefined;
    }
    return fromJson(GasPricesSchema, jsonGasPrices);
  }

  async getAltGasPrices(): Promise<GasPrices[]> {
    const allGasPrices = await this.db.getAll('GAS_PRICES');
    const usdcPriorityAssetId = 'drPksQaBNYwSOzgfkGOEdrd4kEDkeALeh58Ps+7cjQs=';

    // Retrieve gas prices from the database and prioritize USDC as the preferred asset.
    return allGasPrices
      .map(gp => fromJson(GasPricesSchema, gp))
      .filter(
        gp => gp.assetId?.inner && !equals(AssetIdSchema, gp.assetId, this.stakingTokenAssetId),
      )
      .sort((a, b) => {
        const assetA = a.assetId?.inner ? uint8ArrayToBase64(a.assetId.inner) : '';
        const assetB = b.assetId?.inner ? uint8ArrayToBase64(b.assetId.inner) : '';

        if (assetA === usdcPriorityAssetId) {
          return -1;
        }
        if (assetB === usdcPriorityAssetId) {
          return 1;
        }
        return 0;
      });
  }

  async saveGasPrices(value: GasPrices): Promise<void> {
    await this.u.update({
      table: 'GAS_PRICES',
      value: toJson(GasPricesSchema, create(GasPricesSchema, value), {
        registry: typeRegistry,
      }) as Jsonified<GasPrices>,
    });
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
      const denomMetadata = fromJson(MetadataSchema, assetCursor.value);
      if (
        assetPatterns.delegationToken.matches(denomMetadata.display) &&
        denomMetadata.penumbraAssetId
      ) {
        delegationAssets.set(uint8ArrayToHex(denomMetadata.penumbraAssetId.inner), denomMetadata);
      }
    }
    const notesForVoting: NotesForVotingResponse[] = [];

    for await (const noteCursor of this.db.transaction('SPENDABLE_NOTES').store) {
      const note = fromJson(SpendableNoteRecordSchema, noteCursor.value);

      if (
        (addressIndex &&
          note.addressIndex &&
          !equals(AddressIndexSchema, note.addressIndex, addressIndex)) ??
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
        if (!regexResult) {
          throw new Error('expected delegation token identity key not present');
        }

        notesForVoting.push(
          create(NotesForVotingResponseSchema, {
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
    subaccount: AddressIndex | undefined,
  ) {
    yield* new ReadableStream({
      start: async cont => {
        let cursor = await this.db.transaction('POSITIONS').store.openCursor();
        while (cursor) {
          const position = fromJson(PositionSchema, cursor.value.position);
          if (
            (!positionState ||
              (position.state && equals(PositionStateSchema, positionState, position.state))) &&
            (!tradingPair ||
              (position.phi?.pair && equals(TradingPairSchema, tradingPair, position.phi.pair))) &&
            (!subaccount ||
              (cursor.value.subaccount &&
                equals(
                  AddressIndexSchema,
                  subaccount,
                  fromJson(AddressIndexSchema, cursor.value.subaccount),
                )))
          ) {
            cont.enqueue(fromJson(PositionIdSchema, cursor.value.id));
          }
          cursor = await cursor.continue();
        }
        cont.close();
      },
    });
  }

  async addPosition(
    positionId: PositionId,
    position: Position,
    subaccount?: AddressIndex,
  ): Promise<void> {
    assertPositionId(positionId);
    const positionRecord = {
      id: toJson(PositionIdSchema, positionId, { registry: typeRegistry }) as Jsonified<PositionId>,
      position: toJson(PositionSchema, position, { registry: typeRegistry }) as Jsonified<Position>,
      subaccount:
        subaccount &&
        (toJson(AddressIndexSchema, subaccount, {
          registry: typeRegistry,
        }) as Jsonified<AddressIndex>),
    };
    await this.u.update({ table: 'POSITIONS', value: positionRecord });
  }

  async updatePosition(
    positionId: PositionId,
    newState: PositionState,
    subaccount?: AddressIndex,
  ): Promise<void> {
    assertPositionId(positionId);
    const key = uint8ArrayToBase64(positionId.inner);
    const positionRecord = await this.db.get('POSITIONS', key);

    if (!positionRecord) {
      throw new Error('Position not found when trying to change its state');
    }

    const position = fromJson(PositionSchema, positionRecord.position);
    position.state = newState;

    await this.u.update({
      table: 'POSITIONS',
      value: {
        id: toJson(PositionIdSchema, positionId, {
          registry: typeRegistry,
        }) as Jsonified<PositionId>,
        position: toJson(PositionSchema, position, {
          registry: typeRegistry,
        }) as Jsonified<Position>,
        subaccount: subaccount
          ? (toJson(AddressIndexSchema, subaccount, {
              registry: typeRegistry,
            }) as Jsonified<AddressIndex>)
          : undefined,
      },
    });
  }

  /**
   * Adds a new epoch with the given start height. Automatically sets the epoch
   * index by finding the previous epoch index, and adding 1n.
   */
  async addEpoch(startHeight: bigint): Promise<void> {
    const cursor = await this.db.transaction('EPOCHS', 'readonly').store.openCursor(null, 'prev');
    const previousEpoch = cursor?.value ? fromJson(EpochSchema, cursor.value) : undefined;
    const index = previousEpoch?.index !== undefined ? previousEpoch.index + 1n : 0n;

    // avoid saving the same epoch twice
    if (previousEpoch?.startHeight === startHeight) {
      return;
    }

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
      const currentEpoch = fromJson(EpochSchema, cursor.value);

      if (currentEpoch.startHeight <= height) {
        epoch = currentEpoch;
      } else if (currentEpoch.startHeight > height) {
        break;
      }
    }

    return epoch;
  }

  /**
   * Get the block height for the correspinding epoch index.
   */
  async getBlockHeightByEpoch(epoch_index: bigint): Promise<Epoch | undefined> {
    let epoch: Epoch | undefined;

    // Iterate over epochs and return the one with the matching epoch index.
    for await (const cursor of this.db.transaction('EPOCHS', 'readonly').store) {
      const currentEpoch = fromJson(EpochSchema, cursor.value);
      if (currentEpoch.index === epoch_index) {
        epoch = currentEpoch;
        break;
      }
    }

    return epoch;
  }

  /**
   * Inserts the validator info into the database, or updates an existing
   * validator info if one with the same identity key exists.
   */
  async upsertValidatorInfo(validatorInfo: ValidatorInfo): Promise<void> {
    // bech32m conversion asserts length
    const identityKeyAsBech32 = bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo));

    await this.u.update({
      table: 'VALIDATOR_INFOS',
      key: identityKeyAsBech32,
      value: toJson(ValidatorInfoSchema, validatorInfo, {
        registry: typeRegistry,
      }) as Jsonified<ValidatorInfo>,
    });
  }

  /**
   * Iterates over all validator infos in the database.
   */
  async *iterateValidatorInfos() {
    yield* new ReadableStream(
      new IdbCursorSource(
        this.db.transaction('VALIDATOR_INFOS').store.openCursor(),
        ValidatorInfoSchema,
      ),
    );
  }

  async clearValidatorInfos() {
    await this.db.clear('VALIDATOR_INFOS');
  }

  async getValidatorInfo(identityKey: IdentityKey): Promise<ValidatorInfo | undefined> {
    // bech32m conversion asserts length
    const key = bech32mIdentityKey(identityKey);
    const json = await this.db.get('VALIDATOR_INFOS', key);
    if (!json) {
      return undefined;
    }
    return fromJson(ValidatorInfoSchema, json);
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
    assertAssetId(pricedAsset);
    assertAssetId(numeraire);
    const estimatedPrice = create(EstimatedPriceSchema, {
      pricedAsset,
      numeraire,
      numerairePerUnit,
      asOfHeight,
    });

    await this.u.update({
      table: 'PRICES',
      value: toJson(EstimatedPriceSchema, estimatedPrice, {
        registry: typeRegistry,
      }) as Jsonified<EstimatedPrice>,
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
    epochDuration: bigint,
  ): Promise<EstimatedPrice[]> {
    const base64AssetId = uint8ArrayToBase64(getAssetId(assetMetadata).inner);
    const results = await this.db.getAllFromIndex('PRICES', 'pricedAsset', base64AssetId);

    const priceRelevanceThreshold = this.determinePriceRelevanceThresholdForAsset(
      assetMetadata,
      epochDuration,
    );
    const minHeight = latestBlockHeight - priceRelevanceThreshold;

    return results
      .map(price => fromJson(EstimatedPriceSchema, price))
      .filter(price => price.asOfHeight >= minHeight);
  }

  async clearSwapBasedPrices(): Promise<void> {
    const tx = this.db.transaction('PRICES', 'readwrite');
    const store = tx.objectStore('PRICES');

    let cursor = await store.openCursor();
    while (cursor) {
      const price = fromJson(EstimatedPriceSchema, cursor.value);
      if (!price.numeraire || !equals(AssetIdSchema, price.numeraire, this.stakingTokenAssetId)) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  private determinePriceRelevanceThresholdForAsset(
    assetMetadata: Metadata,
    epochDuration: bigint,
  ): bigint {
    if (assetPatterns.delegationToken.capture(assetMetadata.display)) {
      return epochDuration;
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
      assertCommitment(
        create(StateCommitmentSchema, { inner: base64ToUint8Array(c.commitment.inner) }),
      );
      txs.add({ table: 'TREE_COMMITMENTS', value: c });
    }

    for (const h of sctUpdates.store_hashes) {
      assertBytes(h.hash, 32);
      txs.add({ table: 'TREE_HASHES', value: h });
    }

    // TODO: What about updates.delete_ranges?
  }

  private addNewNotes(txs: IbdUpdates, notes: SpendableNoteRecord[]): void {
    for (const n of notes) {
      assertCommitment(n.noteCommitment);
      txs.add({
        table: 'SPENDABLE_NOTES',
        value: toJson(SpendableNoteRecordSchema, n, {
          registry: typeRegistry,
        }) as Jsonified<SpendableNoteRecord>,
      });
    }
  }

  private async addNewSwaps(
    txs: IbdUpdates,
    swaps: SwapRecord[],
    blockHeight: bigint,
  ): Promise<void> {
    if (!swaps.length) {
      return;
    }

    const epoch =
      (await this.getEpochByHeight(blockHeight)) ??
      create(EpochSchema, { startHeight: 0n, index: 0n });

    for (const n of swaps) {
      if (!n.outputData) {
        throw new Error('No output data in swap record');
      }

      // Adds position prefix to swap record. Needed to make swap claims.
      n.outputData.sctPositionPrefix = sctPosition(blockHeight, epoch);

      assertCommitment(n.swapCommitment);
      txs.add({
        table: 'SWAPS',
        value: toJson(SwapRecordSchema, n, { registry: typeRegistry }) as Jsonified<SwapRecord>,
      });
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
    assertAuctionId(auctionId);
    const key = uint8ArrayToBase64(auctionId.inner);
    const existingRecord = await this.db.get('AUCTIONS', key);
    const auction = value.auction
      ? (toJson(DutchAuctionDescriptionSchema, value.auction, {
          registry: typeRegistry,
        }) as Jsonified<DutchAuctionDescription>)
      : existingRecord?.auction;
    const noteCommitment = value.noteCommitment
      ? (toJson(StateCommitmentSchema, value.noteCommitment, {
          registry: typeRegistry,
        }) as Jsonified<StateCommitment>)
      : existingRecord?.noteCommitment;
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
    assertAuctionId(auctionId);
    const result = await this.db.get('AUCTIONS', uint8ArrayToBase64(auctionId.inner));

    return {
      auction: result?.auction
        ? fromJson(DutchAuctionDescriptionSchema, result.auction)
        : undefined,
      noteCommitment: result?.noteCommitment
        ? fromJson(StateCommitmentSchema, result.noteCommitment)
        : undefined,
      seqNum: result?.seqNum,
    };
  }

  async addAuctionOutstandingReserves(
    auctionId: AuctionId,
    value: { input: Value; output: Value },
  ): Promise<void> {
    assertAuctionId(auctionId);
    await this.db.add(
      'AUCTION_OUTSTANDING_RESERVES',
      {
        input: toJson(ValueSchema, value.input, { registry: typeRegistry }) as Jsonified<Value>,
        output: toJson(ValueSchema, value.output, { registry: typeRegistry }) as Jsonified<Value>,
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
    assertAuctionId(auctionId);
    const result = await this.db.get(
      'AUCTION_OUTSTANDING_RESERVES',
      uint8ArrayToBase64(auctionId.inner),
    );

    if (!result) {
      return undefined;
    }

    return {
      input: fromJson(ValueSchema, result.input),
      output: fromJson(ValueSchema, result.output),
    };
  }

  async hasTokenBalance(accountIndex: number, assetId: AssetId): Promise<boolean> {
    assertAssetId(assetId);
    const spendableNotes = await this.db.getAllFromIndex(
      'SPENDABLE_NOTES',
      'assetId',
      uint8ArrayToBase64(assetId.inner),
    );

    return spendableNotes.some(note => {
      const spendableNote = fromJson(SpendableNoteRecordSchema, note);

      // randomizer should be ignored
      return (
        spendableNote.heightSpent === 0n &&
        !isZero(getAmountFromRecord(spendableNote)) &&
        spendableNote.addressIndex?.account === accountIndex
      );
    });
  }

  async totalNoteBalance(accountIndex: number, assetId: AssetId): Promise<Amount> {
    assertAssetId(assetId);
    const spendableNotes = await this.db.getAllFromIndex(
      'SPENDABLE_NOTES',
      'assetId',
      uint8ArrayToBase64(assetId.inner),
    );

    return spendableNotes
      .map(json => fromJson(SpendableNoteRecordSchema, json))
      .filter(note => {
        return (
          note.heightSpent === 0n &&
          !isZero(getAmountFromRecord(note)) &&
          // randomizer should be ignored
          note.addressIndex?.account === accountIndex
        );
      })
      .reduce(
        (acc, curr) => {
          if (curr.note?.value?.amount) {
            const noteAmount = curr.note.value.amount;
            const newAmount = addLoHi(
              { lo: acc.lo, hi: acc.hi },
              { lo: BigInt(noteAmount.lo), hi: BigInt(noteAmount.hi) },
            );
            return create(AmountSchema, newAmount);
          } else {
            return acc;
          }
        },
        create(AmountSchema, { hi: 0n, lo: 0n }),
      );
  }

  async getPosition(positionId: PositionId): Promise<Position | undefined> {
    assertPositionId(positionId);
    const position = await this.db.get('POSITIONS', uint8ArrayToBase64(positionId.inner));

    if (!position) {
      return undefined;
    }

    return fromJson(PositionSchema, position.position);
  }
}
