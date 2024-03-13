import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';
import { AssetsRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { viewClient } from '../clients';

export const getAllAssets = () => {
  const req = new AssetsRequest();
  const iterable = viewClient.assets(req);
  return Array.fromAsync(iterable);
};
