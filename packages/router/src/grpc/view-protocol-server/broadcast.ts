import {
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { tendermintClient } from '../clients';
import { encodeTx } from '@penumbra-zone/wasm-ts';
import { ServicesInterface } from '@penumbra-zone/types';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

export const isBroadcastRequest = (msg: ViewReqMessage): msg is BroadcastTransactionRequest => {
  return msg.getType().typeName === BroadcastTransactionRequest.typeName;
};

export const handleBroadcastReq = async (
  req: BroadcastTransactionRequest,
  services: ServicesInterface,
): Promise<BroadcastTransactionResponse> => {
  if (!req.transaction) throw new Error('No transaction provided in request');

  const encodedTx = encodeTx(req.transaction);

  // "Sync" method waits for the tx to pass/fail CheckTx
  const { hash } = await tendermintClient.broadcastTxSync({ params: encodedTx });
  await sleep(6000); // TODO: implement sync detection. Should see if the tx has been synced and stored. Can check via nullifiers.

  // Wait until our DB encounters a new note with this hash
  if (req.awaitDetection) {
    const { indexedDb } = await services.getWalletServices();
    const subscription = indexedDb.subscribe('SPENDABLE_NOTES');
    for await (const update of subscription) {
      const note = SpendableNoteRecord.fromJson(update.value);
      if (note.source?.equals(new NoteSource({ inner: hash }))) break;
    }
  }

  return new BroadcastTransactionResponse({ id: { hash } });
};

// Temp function
const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
