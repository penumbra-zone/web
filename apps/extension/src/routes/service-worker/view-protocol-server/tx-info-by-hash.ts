import { ViewReqMessage } from './helpers/generic';
import {
  TransactionInfoByHashRequest,
  TransactionInfoByHashResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { services } from '../../../service-worker';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

export const isTxInfoByHashRequest = (req: ViewReqMessage): req is TransactionInfoByHashRequest => {
  return req.getType().typeName === TransactionInfoByHashRequest.typeName;
};

export const handleTxInfoByHashReq = async (
  req: TransactionInfoByHashRequest,
): Promise<TransactionInfoByHashResponse> => {
  const { indexedDb } = await services.getWalletServices();
  if (!req.id) return new TransactionInfoByHashResponse();

  const txInfo = await indexedDb.getTransaction(new NoteSource({ inner: req.id.hash }));
  if (!txInfo) return new TransactionInfoByHashResponse();

  return new TransactionInfoByHashResponse({ txInfo });
};
