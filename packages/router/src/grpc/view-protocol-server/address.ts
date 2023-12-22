import {
  AddressByIndexRequest,
  AddressByIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { getAddressByIndex } from '@penumbra-zone/wasm-ts';
import { AnyMessage } from '@bufbuild/protobuf';
import { ServicesInterface } from '@penumbra-zone/types';

export const isAddressRequest = (req: AnyMessage): req is AddressByIndexRequest => {
  return req.getType().typeName === AddressByIndexRequest.typeName;
};

export const handleAddressReq = async (
  req: AddressByIndexRequest,
  services: ServicesInterface,
): Promise<AddressByIndexResponse> => {
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = getAddressByIndex(fullViewingKey, req.addressIndex?.account ?? 0);
  return new AddressByIndexResponse({ address });
};
