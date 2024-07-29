import { ScanBlockResult } from './state-commitment-tree.js';
import { CompactBlock, MerkleRoot } from '@penumbra-zone/protobuf/types';

export interface ViewServerInterface {
  scanBlock(compactBlock: CompactBlock): Promise<boolean>;
  flushUpdates(): ScanBlockResult;
  resetTreeToStored(): Promise<void>;
  getSctRoot(): MerkleRoot;
}
