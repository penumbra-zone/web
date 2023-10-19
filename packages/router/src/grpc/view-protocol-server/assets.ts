import {
  AssetsRequest,
  AssetsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from 'penumbra-types';

export const isAssetsRequest = (msg: ViewReqMessage): msg is AssetsRequest => {
  return msg.getType().typeName === AssetsRequest.typeName;
};

// TODO: Implement filters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleAssetsReq = async function* (
  _: AssetsRequest,
  services: ServicesInterface,
): AsyncIterable<AssetsResponse> {
  const { indexedDb } = await services.getWalletServices();
  const allMetadata = await indexedDb.getAllAssetsMetadata();
  const responses = allMetadata.map(m => new AssetsResponse({ denomMetadata: m }));
  yield* responses;
};
