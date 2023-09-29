import { ViewServer as WasmViewServer } from '@penumbra-zone/wasm-bundler';
import {
  NctUpdates,
  ScanResult,
  ScanResultSchema,
  StateCommitmentTree,
  ViewServerInterface,
} from 'penumbra-types';
import { validateSchema } from 'penumbra-types/src/validation';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';

interface ViewServerProps {
  fullViewingKey: string;
  epochDuration: bigint;
  getStoredTree: () => Promise<StateCommitmentTree>;
}

export class ViewServer implements ViewServerInterface {
  private constructor(
    private wasmViewServer: WasmViewServer,
    private readonly fullViewingKey: string,
    private readonly epochDuration: bigint,
    private readonly getStoredTree: () => Promise<StateCommitmentTree>,
  ) {}

  static async initialize({
    fullViewingKey,
    epochDuration,
    getStoredTree,
  }: ViewServerProps): Promise<ViewServer> {
    // The constructor is an async fn. Should consider a `new()` function instead of a constructor.
    const vsPromise = new WasmViewServer(
      fullViewingKey,
      epochDuration,
      await getStoredTree(),
    ) as unknown as Promise<WasmViewServer>;
    return new this(await vsPromise, fullViewingKey, epochDuration, getStoredTree);
  }

  // Decrypts blocks with viewing key for notes, swaps, and updates revealed for user
  // Makes update to internal state-commitment-tree as a side effect.
  // Should extract updates and save locally.
  async scanBlock(compactBlock: CompactBlock): Promise<ScanResult> {
    const result = (await this.wasmViewServer.scan_block(compactBlock.toJson())) as ScanResult;
    return validateSchema(ScanResultSchema, result);
  }

  // Resets the state of the wasmViewServer to the one set in storage
  async resetTreeToStored() {
    this.wasmViewServer = new WasmViewServer(
      this.fullViewingKey,
      this.epochDuration,
      await this.getStoredTree(),
    );
  }

  getNctRoot(): string {
    const result = this.wasmViewServer.get_nct_root() as { inner: string };
    return result.inner;
  }

  // As blocks are scanned, the internal wasmViewServer tree is being updated.
  // Passing the locally stored last position/forgotten allows us to see the
  // changes in that tree since that last stored checkpoint.
  async updatesSinceCheckpoint(): Promise<NctUpdates> {
    const { last_position, last_forgotten } = await this.getStoredTree();
    console.log('last_position', last_position);
    const scanResult = this.wasmViewServer.get_updates(last_position, last_forgotten) as ScanResult;
    console.log('scanResult', scanResult);
    return validateSchema(ScanResultSchema, scanResult).nct_updates;
  }
}
