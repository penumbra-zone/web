import { ViewServer as WasmViewServer } from '../wasm/index.js';
import {
  CompactBlock,
  CompactBlockSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/compact_block/v1/compact_block_pb';
import { MerkleRootSchema } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import type { MerkleRoot } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import { JsonObject, JsonValue, fromBinary, fromJson, toBinary } from '@bufbuild/protobuf';
import {
  SpendableNoteRecordSchema,
  SwapRecordSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  ScanBlockResult,
  SctUpdatesSchema,
  StateCommitmentTree,
} from '@penumbra-zone/types/state-commitment-tree';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import type { ViewServerInterface } from '@penumbra-zone/types/servers';
import {
  Address,
  FullViewingKey,
  FullViewingKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { isControlledAddress } from './address.js';

declare global {
  // eslint-disable-next-line no-var -- TODO: explain
  var __DEV__: boolean | undefined;
}

interface ViewServerProps {
  fullViewingKey: FullViewingKey;
  getStoredTree: () => Promise<StateCommitmentTree>;
  idbConstants: IdbConstants;
}

interface FlushResult {
  height?: string | number | bigint;
  sct_updates?: JsonObject;
  new_notes?: JsonValue[];
  new_swaps?: JsonValue[];
}

export class ViewServer implements ViewServerInterface {
  private constructor(
    private wasmViewServer: WasmViewServer,
    public readonly fullViewingKey: FullViewingKey,
    private readonly getStoredTree: () => Promise<StateCommitmentTree>,
    private readonly idbConstants: IdbConstants,
  ) {}

  static async initialize({
    fullViewingKey,
    getStoredTree,
    idbConstants,
  }: ViewServerProps): Promise<ViewServer> {
    const wvs = await WasmViewServer.new(
      toBinary(FullViewingKeySchema, fullViewingKey),
      await getStoredTree(),
      idbConstants,
    );
    return new this(wvs, fullViewingKey, getStoredTree, idbConstants);
  }

  // Decrypts blocks with viewing key for notes, swaps, and updates revealed for user
  // Makes update to internal state-commitment-tree as a side effect.
  // Should extract updates via this.flushUpdates().
  async scanBlock(compactBlock: CompactBlock, skipTrialDecrypt: boolean): Promise<boolean> {
    const res = toBinary(CompactBlockSchema, compactBlock);
    return this.wasmViewServer.scan_block(res, skipTrialDecrypt);
  }

  // Resets the state of the wasmViewServer to the one set in storage
  async resetTreeToStored() {
    this.wasmViewServer = await WasmViewServer.new(
      toBinary(FullViewingKeySchema, this.fullViewingKey),
      await this.getStoredTree(),
      this.idbConstants,
    );
  }

  getSctRoot(): MerkleRoot {
    const bytes = this.wasmViewServer.get_sct_root();
    return fromBinary(MerkleRootSchema, bytes);
  }

  // As blocks are scanned, the internal wasmViewServer tree is being updated.
  // Flush updates clears the state and returns all the updates since the last checkpoint.
  flushUpdates(): ScanBlockResult {
    const result = this.wasmViewServer.flush_updates() as FlushResult;
    const { height, sct_updates, new_notes, new_swaps } = result;
    return {
      height: BigInt(height ?? 0),
      sctUpdates: globalThis.__DEV__
        ? SctUpdatesSchema.parse(sct_updates)
        : (sct_updates as unknown as ScanBlockResult['sctUpdates']),
      newNotes: (new_notes ?? []).map(n => fromJson(SpendableNoteRecordSchema, n)),
      newSwaps: (new_swaps ?? []).map(s => fromJson(SwapRecordSchema, s)),
    };
  }

  isControlledAddress(address: Address): boolean {
    return isControlledAddress(this.fullViewingKey, address);
  }
}
