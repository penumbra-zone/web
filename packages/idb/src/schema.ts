import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import {
  EstimatedPrice,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import {
  Position,
  PositionId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { Epoch } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import {
  FmdParameters,
  Note,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import {
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Jsonified } from '@penumbra-zone/types/jsonified';
import { DBSchema } from 'idb';
import { StoreCommitment, StoredPosition, StoreHash } from './state-commitment-tree';

export interface PenumbraSchema extends DBSchema {
  FULL_SYNC_HEIGHT: {
    key: 'height';
    value: bigint;
  };
  TREE_LAST_POSITION: {
    key: 'last_position';
    value: StoredPosition;
  };
  TREE_LAST_FORGOTTEN: {
    key: 'last_forgotten';
    value: bigint;
  };
  TREE_HASHES: {
    key: number; // autoincrement
    value: StoreHash;
  };
  TREE_COMMITMENTS: {
    key: StoreCommitment['commitment']['inner']; // base64
    value: StoreCommitment;
  };
  APP_PARAMETERS: {
    key: 'params';
    value: Jsonified<AppParameters>;
  };
  FMD_PARAMETERS: {
    key: 'params';
    value: Jsonified<FmdParameters>;
  };
  TRANSACTIONS: {
    key: string; // base64 TransactionInfo['id']['inner'];
    value: Jsonified<TransactionInfo>; // TransactionInfo with undefined view and perspective
  };
  REGISTRY_VERSION: {
    key: 'commit';
    value: string;
  };
  // ======= Json serialized values =======
  // Allows wasm crate to directly deserialize
  ASSETS: {
    key: Jsonified<Required<Metadata>['penumbraAssetId']['inner']>; // base64
    value: Jsonified<Metadata>;
  };
  SPENDABLE_NOTES: {
    key: Jsonified<Required<SpendableNoteRecord>['noteCommitment']['inner']>; // base64
    value: Jsonified<SpendableNoteRecord>;
    indexes: {
      nullifier: Jsonified<Required<SpendableNoteRecord>['nullifier']['inner']>; // base64
    };
  };

  /**
   * Store for advice for future spendable notes
   * Used in wasm crate to process swap and swap claim
   *
   * This emphasizes the difference between Rust view service data storage and extension view service data storage.
   * In the relational model (Rust view service), each 'SPENDABLE_NOTES' must have a corresponding record
   * in the 'NOTES' table ('note_commitment' is used as a foreign key).
   * Therefore, in Rust view service, the 'NOTES' table stores both notes that do not yet have an associated
   * record in the 'SPENDABLE_NOTES' table (we call them advices)
   * and notes that already have an associated record in 'SPENDABLE_NOTES'.
   *
   * In indexed-db (extension view service), we store advices separately in the 'ADVICE_NOTES' table,
   * and store spendable notes along with nested notes in the 'SPENDABLE_NOTES' table.
   *
   * This table is never written or queried by TypeScript.
   */
  ADVICE_NOTES: {
    // key is not part of the stored object
    key: Jsonified<StateCommitment['inner']>; // base64
    value: Jsonified<Note>;
  };
  SWAPS: {
    key: Jsonified<Required<SwapRecord>['swapCommitment']['inner']>; // base64
    value: Jsonified<SwapRecord>;
    indexes: {
      nullifier: Jsonified<Required<SwapRecord>['nullifier']['inner']>; // base64
    };
  };
  GAS_PRICES: {
    key: 'gas_prices';
    value: Jsonified<GasPrices>;
  };
  POSITIONS: {
    key: string; // base64 PositionRecord['id']['inner'];
    value: PositionRecord;
  };
  EPOCHS: {
    key: number; // auto-increment
    value: Jsonified<Epoch>;
  };
  VALIDATOR_INFOS: {
    key: string; // bech32-encoded validator identity key
    value: Jsonified<ValidatorInfo>;
  };
  PRICES: {
    key: [
      Jsonified<Required<EstimatedPrice>['pricedAsset']['inner']>,
      Jsonified<Required<EstimatedPrice>['numeraire']['inner']>,
    ]; // composite key
    value: Jsonified<EstimatedPrice>;
    indexes: {
      pricedAsset: Jsonified<Required<EstimatedPrice>['pricedAsset']['inner']>;
    };
  };
  AUCTIONS: {
    key: string; // base64 AuctionId
    value: {
      noteCommitment?: Jsonified<StateCommitment>;
      // Add more types to `auction` as more auction types are created
      auction?: Jsonified<DutchAuctionDescription>;
      /**
       * For Dutch auctions:
       * `0n`: auction is active
       * `1n`: auction has ended
       * `2n`+: the user has withdrawn funds from the auction
       */
      seqNum?: bigint;
    };
  };
  /**
   * Only populated when BOTH a) the user has ended an auction, and b) the
   * user has not yet withdrawn funds from it.
   */
  AUCTION_OUTSTANDING_RESERVES: {
    key: string; // base64 AuctionId
    value: {
      input: Jsonified<Value>;
      output: Jsonified<Value>;
    };
  };
} // need to store PositionId and Position in the same table

export interface PositionRecord {
  id: Jsonified<PositionId>; // PositionId (must be JsonValue because ['id']['inner'] is a key )
  position: Jsonified<Position>; // Position
}
