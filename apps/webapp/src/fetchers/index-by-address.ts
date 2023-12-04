import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32ToUint8Array } from '@penumbra-zone/types';

export const getIndexByAddress = async (address: string): Promise<AddressIndex> => {
  const { viewClient } = await import('../clients/grpc');

  const res = await viewClient.indexByAddress({
    address: new Address({
      inner: bech32ToUint8Array(address),
    }),
  });

  return res.addressIndex ?? new AddressIndex();
};
