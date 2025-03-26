import { PartialMessage } from '@bufbuild/protobuf';
import {
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { txToId } from '../model/tx-to-id';

export const broadcastTransaction = async (
  req: PartialMessage<BroadcastTransactionRequest>,
  onStatusUpdate: (status?: BroadcastTransactionResponse['status']) => void,
): Promise<{ txHash: string; detectionHeight?: bigint }> => {
  const { awaitDetection, transaction } = req;
  if (!transaction) {
    throw new Error('no transaction');
  }
  const txId = await txToId(transaction);
  const txHash = uint8ArrayToHex(txId.inner);
  onStatusUpdate(undefined);
  for await (const { status } of penumbra.service(ViewService).broadcastTransaction({
    awaitDetection,
    transaction,
  })) {
    if (!txId.equals(status.value?.id)) {
      throw new Error('unexpected transaction id');
    }
    onStatusUpdate(status);
    switch (status.case) {
      case 'broadcastSuccess':
        if (!awaitDetection) {
          return { txHash, detectionHeight: undefined };
        }
        break;
      case 'confirmed':
        return { txHash, detectionHeight: status.value.detectionHeight };
      default:
        console.warn(`unknown broadcastTransaction status: ${status.case}`);
    }
  }
  // TODO: detail broadcastSuccess status
  throw new Error('did not broadcast transaction');
};
