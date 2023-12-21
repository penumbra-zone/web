import {
  IndexByAddressRequest,
  IndexByAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { bech32Address, ServicesInterface } from '@penumbra-zone/types';
import { isControlledAddress } from '@penumbra-zone/wasm-ts/src/address';

export const isIndexByAddressRequest = (req: ViewReqMessage): req is IndexByAddressRequest => {
  return req.getType().typeName === IndexByAddressRequest.typeName;
};

export const handleIndexByAddressReq = async (
  req: IndexByAddressRequest,
  services: ServicesInterface,
): Promise<IndexByAddressResponse> => {
  if (!req.address) throw new Error('no address given in request');

  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = bech32Address(req.address);
  const addressIndex = isControlledAddress(fullViewingKey, address);
  if (!addressIndex) throw new Error('Address is not controlled by view service full viewing key');

  return new IndexByAddressResponse({ addressIndex });
};
