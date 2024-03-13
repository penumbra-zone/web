import { ViewServer as WasmViewServer } from '../wasm';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1/compact_block_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  Position,
  PositionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { JsonObject, JsonValue } from '@bufbuild/protobuf';
import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  ScanBlockResult,
  SctUpdatesSchema,
  StateCommitmentTree,
} from '@penumbra-zone/types/src/state-commitment-tree';
import type { IdbConstants } from '@penumbra-zone/types/src/indexed-db';
import type { ViewServerInterface } from '@penumbra-zone/types/src/servers';
import { validateSchema } from '@penumbra-zone/types/src/validation';

interface ViewServerProps {
  fullViewingKey: string;
  epochDuration: bigint;
  getStoredTree: () => Promise<StateCommitmentTree>;
  idbConstants: IdbConstants;
}

export class ViewServer implements ViewServerInterface {
  private constructor(
    private wasmViewServer: WasmViewServer,
    public readonly fullViewingKey: string,
    private readonly epochDuration: bigint,
    private readonly getStoredTree: () => Promise<StateCommitmentTree>,
    private readonly idbConstants: IdbConstants,
  ) {}

  static async initialize({
    fullViewingKey,
    epochDuration,
    getStoredTree,
    idbConstants,
  }: ViewServerProps): Promise<ViewServer> {
    const wvs = await WasmViewServer.new(
      fullViewingKey,
      epochDuration,
      await getStoredTree(),
      idbConstants,
    );
    return new this(wvs, fullViewingKey, epochDuration, getStoredTree, idbConstants);
  }

  // Decrypts blocks with viewing key for notes, swaps, and updates revealed for user
  // Makes update to internal state-commitment-tree as a side effect.
  // Should extract updates via this.flushUpdates().
  async scanBlock(compactBlock: CompactBlock): Promise<boolean> {
    const res = compactBlock.toJson();
    return this.wasmViewServer.scan_block(res);
  }

  // Resets the state of the wasmViewServer to the one set in storage
  async resetTreeToStored() {
    this.wasmViewServer = await WasmViewServer.new(
      this.fullViewingKey,
      this.epochDuration,
      await this.getStoredTree(),
      this.idbConstants,
    );
  }

  getSctRoot(): MerkleRoot {
    const raw = this.wasmViewServer.get_sct_root() as JsonValue;
    const res = MerkleRoot.fromJson(raw);
    return res;
  }

  // As blocks are scanned, the internal wasmViewServer tree is being updated.
  // Flush updates clears the state and returns all the updates since the last checkpoint.
  flushUpdates(): ScanBlockResult {
    const raw = this.wasmViewServer.flush_updates() as JsonValue;
    const { height, sct_updates, new_notes, new_swaps } = raw as {
      height?: string | number | bigint | undefined;
      sct_updates?: JsonObject | undefined;
      new_notes?: JsonValue[] | undefined;
      new_swaps?: JsonValue[] | undefined;
    };
    const wasmJson = {
      new_notes: (new_notes ?? []).map(n => JSON.stringify(n)),
      new_swaps: (new_swaps ?? []).map(s => JSON.stringify(s)),
    };
    return {
      height: BigInt(height ?? false),
      sctUpdates: validateSchema(SctUpdatesSchema, sct_updates),
      newNotes: wasmJson.new_notes.map(n => SpendableNoteRecord.fromJsonString(n)),
      newSwaps: wasmJson.new_swaps.map(s => SwapRecord.fromJsonString(s)),
    };
  }

  getLpNftMetadata(position: Position, positionState: PositionState): Metadata {
    const result = this.wasmViewServer.get_lpnft_asset(
      position.toJson(),
      positionState.toJson(),
    ) as JsonValue;
    return Metadata.fromJsonString(JSON.stringify(result));
  }
}
