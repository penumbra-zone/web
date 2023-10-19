import {
  AddressByIndexRequest,
  AddressByIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { getAddressByIndex } from 'penumbra-wasm-ts';
import { localExtStorage } from 'penumbra-storage';
import { ViewReqMessage } from './router';

export const isAddressRequest = (req: ViewReqMessage): req is AddressByIndexRequest => {
  return req.getType().typeName === AddressByIndexRequest.typeName;
};

export const handleAddressReq = async (
  req: AddressByIndexRequest,
): Promise<AddressByIndexResponse> => {
  const wallets = await localExtStorage.get('wallets');
  const address = getAddressByIndex(wallets[0]!.fullViewingKey, req.addressIndex?.account ?? 0);
  return new AddressByIndexResponse({ address });
};
