import { ViewReqMessage } from './router';
import { getEphemeralByIndex } from '@penumbra-zone/wasm-ts';
import {
  EphemeralAddressRequest,
  EphemeralAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';

export const isEphemeralAddrRequest = (msg: ViewReqMessage): msg is EphemeralAddressRequest => {
  return msg.getType().typeName === EphemeralAddressRequest.typeName;
};

export const handleEphemeralAddrReq = async (
  req: EphemeralAddressRequest,
  services: ServicesInterface,
): Promise<EphemeralAddressResponse> => {
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = getEphemeralByIndex(fullViewingKey, req.addressIndex?.account ?? 0);
  return new EphemeralAddressResponse({ address });
};
