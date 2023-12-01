import {
  IndexByAddressRequest,
  IndexByAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { localExtStorage } from '@penumbra-zone/storage';
import { bech32Address } from '@penumbra-zone/types';
import { isControlledAddress } from '@penumbra-zone/wasm-ts/src/address';

export const isIndexByAddressRequest = (req: ViewReqMessage): req is IndexByAddressRequest => {
  return req.getType().typeName === IndexByAddressRequest.typeName;
};

export const handleIndexByAddressReq = async (
  req: IndexByAddressRequest,
): Promise<IndexByAddressResponse> => {
  const wallets = await localExtStorage.get('wallets');
  if (!req.address) throw new Error('no address given in request');

  const address = bech32Address(req.address);
  const addressIndex = isControlledAddress(wallets[0]!.fullViewingKey, address);

  return addressIndex ? new IndexByAddressResponse({ addressIndex }) : new IndexByAddressResponse();
};
