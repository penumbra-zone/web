import { ScanBlockResult } from './state-commitment-tree';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1/compact_block_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

export interface ViewServerInterface {
  fullViewingKey: string;
  scanBlock(compactBlock: CompactBlock): Promise<boolean>;
  flushUpdates(): ScanBlockResult;
  resetTreeToStored(): Promise<void>;
  getSctRoot(): MerkleRoot;
  canDecrypt(commitment: Uint8Array, encrypted: Uint8Array, ephemeralKey?: Uint8Array): boolean;
  forgetCommitment(commitment: Uint8Array): void;
  dontScanBlock(height: bigint): void;
}
