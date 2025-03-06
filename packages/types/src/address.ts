import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

export const parseIntoAddr = (addrStr: string): Address => {
  return new Address(addressFromBech32m(addrStr));
};
