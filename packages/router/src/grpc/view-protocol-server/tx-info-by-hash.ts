import {
  TransactionInfoByHashRequest,
  TransactionInfoByHashResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { AnyMessage } from '@bufbuild/protobuf';

export const isTxInfoByHashRequest = (req: AnyMessage): req is TransactionInfoByHashRequest => {
  return req.getType().typeName === TransactionInfoByHashRequest.typeName;
};

export const handleTxInfoByHashReq = async (
  req: TransactionInfoByHashRequest,
  services: ServicesInterface,
): Promise<TransactionInfoByHashResponse> => {
  const { indexedDb } = await services.getWalletServices();
  if (!req.id) throw new Error('Missing transaction ID in request');

  const txInfo = await indexedDb.getTransaction(new NoteSource({ inner: req.id.hash }));
  if (!txInfo) return new TransactionInfoByHashResponse();

  return new TransactionInfoByHashResponse({ txInfo });
};
