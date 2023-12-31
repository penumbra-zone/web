import { hexToUint8Array } from '@penumbra-zone/types';
import { viewClient } from '../clients/grpc';
import { Id } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export const getTxInfoByHash = async (hash: string): Promise<TransactionInfo> => {
  const res = await viewClient.transactionInfoByHash({
    id: new Id({ hash: hexToUint8Array(hash) }),
  });

  const txInfo = res.txInfo;
  if (!txInfo) throw new Error('Transaction info not found');

  return txInfo;
};
