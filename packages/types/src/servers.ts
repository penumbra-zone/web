import { ScanResult, SctUpdates } from './state-commitment-tree';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

export interface ViewServerInterface {
  scanBlock(compactBlock: CompactBlock): Promise<ScanResult>;
  flushUpdates(): SctUpdates;
  resetTreeToStored(): Promise<void>;
  getNctRoot(): MerkleRoot;
}
