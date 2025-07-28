import { ViewServer as WasmViewServer } from '../wasm/index.js';
import { CompactBlock } from '@penumbra-zone/protobuf/penumbra/core/component/compact_block/v1/compact_block_pb';
import { MerkleRoot } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { SpendableNoteRecord, SwapRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  ScanBlockResult,
  SctUpdatesSchema,
  StateCommitmentTree,
} from '@penumbra-zone/types/state-commitment-tree';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import type { ViewServerInterface } from '@penumbra-zone/types/servers';
import { Address, FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { SctFrontierResponse } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import {
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

const position_u64 = (pos: { epoch: number; block: number; commitment: number }) => {
  // eslint-disable-next-line no-bitwise -- yes, bitwise!
  const epoch = BigInt(pos.epoch) << 32n;
  // eslint-disable-next-line no-bitwise -- yes, bitwise!
  const block = BigInt(pos.block) << 16n;
  const commitment = BigInt(pos.commitment);
  // eslint-disable-next-line no-bitwise -- yes, bitwise!
  return epoch & block & commitment;
};

declare global {
  // eslint-disable-next-line no-var -- TODO: explain
  var __DEV__: boolean | undefined;
}

interface BaseViewServerProps {
  fullViewingKey: FullViewingKey;
  getStoredTree: () => Promise<StateCommitmentTree>;
  idbConstants: IdbConstants;
}

interface SnapshotViewServerProps extends BaseViewServerProps {
  compact_frontier: SctFrontierResponse;
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
  }: BaseViewServerProps): Promise<ViewServer> {
    const storedTree = await getStoredTree();
    const positionNumber =
      storedTree.last_position !== 'Full'
        ? position_u64(storedTree.last_position.Position)
        : undefined;
    const wvs = await WasmViewServer.new(
      fullViewingKey.toBinary(),
      positionNumber,
      storedTree.last_forgotten,
      storedTree.hashes,
      storedTree.commitments,
      idbConstants,
    );
    return new this(wvs, fullViewingKey, getStoredTree, idbConstants);
  }

  static async initialize_from_snapshot({
    fullViewingKey,
    getStoredTree,
    idbConstants,
    compact_frontier,
  }: SnapshotViewServerProps): Promise<ViewServer> {
    const wvs = await WasmViewServer.new_snapshot(
      fullViewingKey.toBinary(),
      idbConstants,
      compact_frontier.compactFrontier,
    );

    return new this(wvs, fullViewingKey, getStoredTree, idbConstants);
  }

  async getWitnessData(plan: TransactionPlan): Promise<WitnessData> {
    const bytes = await this.wasmViewServer.get_witness_data(plan.toBinary());
    return WitnessData.fromBinary(bytes);
  }

  // Trial decrypts a chunk of state payloads in the genesis block.
  async scanGenesisChunk(
    start: bigint,
    partialCompactBlock: CompactBlock,
    skipTrialDecrypt: boolean,
  ) {
    const res = partialCompactBlock.toBinary();
    return this.wasmViewServer.scan_genesis_chunk(start, res, skipTrialDecrypt);
  }

  // Processes accumulated genesis notes by constructing the state commitment tree (SCT).
  async genesisAdvice(fullCompactBlock: CompactBlock) {
    const res = fullCompactBlock.toBinary();
    return this.wasmViewServer.genesis_advice(res);
  }

  // Decrypts blocks with viewing key for notes, swaps, and updates revealed for user
  // Makes update to internal state-commitment-tree as a side effect.
  // Should extract updates via this.flushUpdates().
  async scanBlock(compactBlock: CompactBlock, skipTrialDecrypt: boolean): Promise<boolean> {
    const block = compactBlock.toBinary();
    return this.wasmViewServer.scan_block(block, skipTrialDecrypt);
  }

  // Resets the state of the wasmViewServer to the one set in storage
  async resetTreeToStored() {
    const storedTree = await this.getStoredTree();
    const positionNumber =
      storedTree.last_position !== 'Full'
        ? position_u64(storedTree.last_position.Position)
        : undefined;
    this.wasmViewServer = await WasmViewServer.new(
      this.fullViewingKey.toBinary(),
      positionNumber,
      storedTree.last_forgotten,
      storedTree.hashes,
      storedTree.commitments,
      this.idbConstants,
    );
  }

  getSctRoot(): MerkleRoot {
    const bytes = this.wasmViewServer.get_sct_root();
    return MerkleRoot.fromBinary(bytes);
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
      newNotes: (new_notes ?? []).map(n => SpendableNoteRecord.fromJson(n)),
      newSwaps: (new_swaps ?? []).map(s => SwapRecord.fromJson(s)),
    };
  }

  isControlledAddress(address: Address): boolean {
    const bytes = this.wasmViewServer.is_controlled_address(address.toBinary());
    return bytes;
  }
}
