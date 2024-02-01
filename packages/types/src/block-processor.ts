import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';

export interface BlockProcessorInterface {
  sync(): Promise<void>;
  stop(r?: string): void;
  getTransactionInfo(hash: TransactionId): Promise<TransactionInfo>;
}
