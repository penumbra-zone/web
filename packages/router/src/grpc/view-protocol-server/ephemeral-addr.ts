import { ViewReqMessage } from './router';
import { getEphemeralByIndex } from '@penumbra-zone/wasm-ts';
import {
  EphemeralAddressRequest,
  EphemeralAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { localExtStorage } from '@penumbra-zone/storage';

export const isEphemeralAddrRequest = (msg: ViewReqMessage): msg is EphemeralAddressRequest => {
  return msg.getType().typeName === EphemeralAddressRequest.typeName;
};

export const handleEphemeralAddrReq = async (
  req: EphemeralAddressRequest,
): Promise<EphemeralAddressResponse> => {
  const wallets = await localExtStorage.get('wallets');
  const address = getEphemeralByIndex(wallets[0]!.fullViewingKey, req.addressIndex?.account ?? 0);
  return new EphemeralAddressResponse({ address });
};
