import {
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { tendermintClient } from '../clients';
import { encodeTx } from '@penumbra-zone/wasm-ts';

export const isBroadcastRequest = (msg: ViewReqMessage): msg is BroadcastTransactionRequest => {
  return msg.getType().typeName === BroadcastTransactionRequest.typeName;
};

export const handleBroadcastReq = async (
  req: BroadcastTransactionRequest,
): Promise<BroadcastTransactionResponse> => {
  if (!req.transaction) throw new Error('No transaction provided in request');

  const encodedTx = encodeTx(req.transaction);

  // "Sync" method waits for the tx to pass/fail CheckTx
  const { hash } = await tendermintClient.broadcastTxSync({ params: encodedTx });
  await sleep(6000); // TODO: implement sync detection. Should see if the tx has been synced and stored. Can check via nullifiers.
  return new BroadcastTransactionResponse({ id: { hash } });
};

// Temp function
const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
