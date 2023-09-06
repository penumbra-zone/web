import { ViewServer as WasmViewServer } from '@penumbra-zone/wasm-bundler';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb';
import { ScanResult, StoredTree, ViewServerInterface } from 'penumbra-types';

interface ViewServerProps {
  fullViewingKey: string;
  epochDuration: bigint;
  getStoredTree: () => Promise<StoredTree>;
}

export class ViewServer implements ViewServerInterface {
  private readonly fullViewingKey: string;
  private readonly epochDuration: bigint;
  private readonly getStoredTree: () => Promise<StoredTree>;

  constructor({ fullViewingKey, epochDuration, getStoredTree }: ViewServerProps) {
    this.fullViewingKey = fullViewingKey;
    this.epochDuration = epochDuration;
    this.getStoredTree = getStoredTree;
  }

  // Decrypts blocks with viewing key for notes, swaps, and updates revealed for user
  async scanBlock(compactBlock: CompactBlock): Promise<ScanResult> {
    const viewServer = await this.getViewServer();
    return viewServer.scan_block_without_updates(compactBlock.toJson()) as ScanResult;
  }

  // As the stored tree is being updated, it's important to always grab a new view server
  // instance to reflect the latest synced data
  private async getViewServer(): Promise<WasmViewServer> {
    const storedTree = await this.getStoredTree();
    return new WasmViewServer(this.fullViewingKey, this.epochDuration, storedTree);
  }
}
