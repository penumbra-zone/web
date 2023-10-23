import {
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { viewClient } from '../clients';

export const isBroadcastRequest = (msg: ViewReqMessage): msg is BroadcastTransactionRequest => {
  return msg.getType().typeName === BroadcastTransactionRequest.typeName;
};

export const handleBroadcastReq = async (
  req: BroadcastTransactionRequest,
): Promise<BroadcastTransactionResponse> => viewClient.broadcastTransaction(req);
