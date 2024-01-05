import { hexToUint8Array } from '@penumbra-zone/types';
import { viewClient } from '../clients/grpc';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';

export const getTxInfoByHash = async (hash: string): Promise<TransactionInfo> => {
  const res = await viewClient.transactionInfoByHash({
    id: new TransactionId({ inner: hexToUint8Array(hash) }),
  });

  const txInfo = res.txInfo;
  if (!txInfo) throw new Error('Transaction info not found');

  return txInfo;
};
