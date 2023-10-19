import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';

export interface BlockProcessorInterface {
  syncBlocks(): Promise<void>;
  autoRetrySync(): Promise<void>;
  storeNewTransactions(blockHeight: bigint, newNotes: SpendableNoteRecord[]): Promise<void>;
  markNotesSpent(nullifiers: Nullifier[], blockHeight: bigint): Promise<void>;
  saveSyncProgress(): Promise<void>;
  stopSync(): void;
}
