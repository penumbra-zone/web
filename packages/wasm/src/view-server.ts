import { ViewServer as WasmViewServer } from '@penumbra-zone/wasm-bundler';
import {
  IdbConstants,
  InnerBase64Schema,
  parseScanResult,
  ScanResult,
  ScanResultSchema,
  StateCommitmentTree,
  ViewServerInterface,
  WasmDenomMetadataSchema,
} from '@penumbra-zone/types';
import { validateSchema } from '@penumbra-zone/types/src/validation';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { z } from 'zod';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  Position,
  PositionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';

interface ViewServerProps {
  fullViewingKey: string;
  epochDuration: bigint;
  getStoredTree: () => Promise<StateCommitmentTree>;
  idbConstants: IdbConstants;
}

export class ViewServer implements ViewServerInterface {
  private constructor(
    private wasmViewServer: WasmViewServer,
    private readonly fullViewingKey: string,
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
    const res = await this.wasmViewServer.scan_block(compactBlock.toJson());
    return validateSchema(z.boolean(), res);
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
    const raw = validateSchema(InnerBase64Schema, this.wasmViewServer.get_sct_root());
    return MerkleRoot.fromJson(raw);
  }

  // As blocks are scanned, the internal wasmViewServer tree is being updated.
  // Flush updates clears the state and returns all the updates since the last checkpoint.
  flushUpdates(): ScanResult {
    const raw = validateSchema(ScanResultSchema, this.wasmViewServer.flush_updates());
    return parseScanResult(raw);
  }

  getLpNftDenom(position: Position, positionState: PositionState): DenomMetadata {
    const result = validateSchema(
      WasmDenomMetadataSchema,
      this.wasmViewServer.get_lpnft_asset(position.toJson(), positionState.toJson()),
    );
    return DenomMetadata.fromJsonString(JSON.stringify(result));
  }
}
