import {
  Address,
  Note as NoteProto,
  StateCommitment,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';
import {
  SpendableNoteRecord as NoteRecordProto,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { PartialFields, ProtoOverride } from './override-utils';

export interface StoredTree {
  last_position: StoredPosition | undefined;
  last_forgotten: Uint8Array | undefined;
  hashes: StoreHash[];
  commitments: StoreCommitment[];
}

export interface ScanResult {
  height: number;
  nct_updates: NctUpdates;
  new_notes: SpendableNoteRecord[];
  new_swaps: SwapRecord[];
}

export type SpendableNoteRecord = PartialFields<NoteRecordProto, 'heightSpent'> & {
  note: Note;
};

export type Note = ProtoOverride<
  NoteProto,
  {
    value: Required<Value>;
    address: Address;
    xyz: number;
  }
>;

export interface NctUpdates {
  set_position?: StoredPosition;
  set_forgotten?: number;
  store_commitments: StoreCommitment[];
  store_hashes: StoreHash[];
  delete_ranges: DeleteRange[];
}

interface DeleteRange {
  below_height: number;
  positions: Range<Position>;
}

interface Range<Idx> {
  start: Idx;
  end: Idx;
}

export type StoredPosition = Position | 'Full';

export interface Position {
  epoch: number;
  block: number;
  commitment: number;
}

export interface StoreHash {
  position: Position;
  height: number;
  hash: Uint8Array;
  essential: boolean;
}

export interface StoreCommitment {
  position: Position;
  commitment: StateCommitment;
}
