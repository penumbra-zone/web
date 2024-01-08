import { GasPricesRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { viewClient } from '../clients/grpc';

export const getGasPrices = () => {
  const req = new GasPricesRequest();
  return viewClient.gasPrices(req).then(res => res.gasPrices);
};
