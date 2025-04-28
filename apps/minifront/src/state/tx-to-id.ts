import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';

/**
 * Hashes the transaction and returns the transaction id using sha256
 */
export const txToId = async (tx: PartialMessage<Transaction>) => {
  const txBytes = new Transaction(tx).toBinary();
  const digest = await crypto.subtle.digest('SHA-256', txBytes);
  return new TransactionId({ inner: new Uint8Array(digest) });
};
