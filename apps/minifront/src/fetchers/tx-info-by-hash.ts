import { ViewService } from '@penumbra-zone/protobuf';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb.js';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { hexToUint8Array } from '@penumbra-zone/types/hex';
import { penumbra } from '../prax';

export const getTxInfoByHash = async (hash: string): Promise<TransactionInfo> => {
  const res = await penumbra.service(ViewService).transactionInfoByHash({
    id: new TransactionId({ inner: hexToUint8Array(hash) }),
  });

  const txInfo = res.txInfo;
  if (!txInfo) {
    throw new Error('Transaction info not found');
  }

  return txInfo;
};
