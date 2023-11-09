import {
  StatusRequest,
  StatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';

export const isStatusRequest = (msg: ViewReqMessage): msg is StatusRequest => {
  return msg.getType().typeName === StatusRequest.typeName;
};

export const handleStatusRequest = async (
  _: StatusRequest,
  services: ServicesInterface,
): Promise<StatusResponse> => {
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();
  const lastBlockSynced = await indexedDb.getLastBlockSynced();
  return new StatusResponse({
    catchingUp: lastBlockSynced === latestBlockHeight,
    syncHeight: lastBlockSynced!,
  });
};
