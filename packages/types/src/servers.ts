import { ScanBlockResult } from './state-commitment-tree';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  Position,
  PositionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';

export interface ViewServerInterface {
  fullViewingKey: string;
  scanBlock(compactBlock: CompactBlock): Promise<boolean>;
  flushUpdates(): ScanBlockResult;
  resetTreeToStored(): Promise<void>;
  getSctRoot(): MerkleRoot;
  getLpNftMetadata(position: Position, positionState: PositionState): Metadata;
}
