import { streamToPromise } from './stream.ts';
import { AssetsRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { viewClient } from '../clients/grpc.ts';

export const getAllAssets = () => {
  const req = new AssetsRequest();
  const iterable = viewClient.assets(req);
  return streamToPromise(iterable);
};
