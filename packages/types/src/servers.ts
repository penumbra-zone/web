import { ScanBlockResult } from './state-commitment-tree.js';
import { CompactBlock } from '@penumbra-zone/protobuf/penumbra/core/component/compact_block/v1/compact_block_pb';
import { MerkleRoot } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

export interface ViewServerInterface {
  scanBlock(compactBlock: CompactBlock, skipTrialDecrypt: boolean): Promise<boolean>;

  scanGenesisChunk(
    start: bigint,
    partialCompactBlock: CompactBlock,
    skipTrialDecrypt: boolean,
  ): Promise<void>;

  genesisAdvice(fullCompactBlock: CompactBlock): Promise<boolean>;

  getWitnessData(plan: TransactionPlan): Promise<WitnessData>;

  flushUpdates(): ScanBlockResult;

  resetTreeToStored(): Promise<void>;

  getSctRoot(): MerkleRoot;

  isControlledAddress(address: Address): boolean;
}
