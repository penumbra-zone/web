import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { compatAddressFromBech32, isCompatAddress } from '@penumbra-zone/bech32m/penumbracompat1';

export const parseIntoAddr = (addrStr: string): Address => {
  if (isCompatAddress(addrStr)) {
    return new Address(compatAddressFromBech32(addrStr));
  }
  return new Address(addressFromBech32m(addrStr));
};
