import { NctUpdates, ScanResult } from './state-commitment-tree';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';

export interface ViewServerInterface {
  scanBlock(compactBlock: CompactBlock): ScanResult;
  updatesSinceCheckpoint(): Promise<NctUpdates>;
  resetTreeToStored(): Promise<void>;
  getNctRoot(): string;
}
