import { ScanBlockResult } from './state-commitment-tree.js';
// import { CompactBlock } from '@penumbra-zone/protobuf/penumbra/core/component/compact_block/v1/compact_block_pb';
import { MerkleRoot } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';

export interface ViewServerInterface {
  scanBlock(compactBlock: Uint8Array, skipTrialDecrypt: boolean): Promise<boolean>;
  decodeBlock(compactBlock: Uint8Array): Promise<void>;
  flushUpdates(): ScanBlockResult;
  resetTreeToStored(): Promise<void>;
  getSctRoot(): MerkleRoot;
}
