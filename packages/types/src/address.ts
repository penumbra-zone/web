import { Address, AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { compatAddressFromBech32, isCompatAddress } from '@penumbra-zone/bech32m/penumbracompat1';
import { hexToUint8Array } from './hex.js';

export const parseIntoAddr = (addrStr: string): Address => {
  if (isCompatAddress(addrStr)) {
    return new Address(compatAddressFromBech32(addrStr));
  }
  return new Address(addressFromBech32m(addrStr));
};

// First 12 bytes of SHA-256('lqt')
const LQT_RANDOMIZER = hexToUint8Array('46c31be31ea4ae13bb68cfaa');

/** Create the LQT Address Index for a given account. */
export const lqtAddressIndex = (account: number): AddressIndex => {
  return new AddressIndex({ account, randomizer: LQT_RANDOMIZER });
};

/** Check if an address index is the LQT address index. */
export const isLqtAddressIndex = (index: AddressIndex): boolean => {
  if (index.randomizer.length !== LQT_RANDOMIZER.length) {
    return false;
  }
  for (let i = 0; i < LQT_RANDOMIZER.length; ++i) {
    if (index.randomizer[i] !== LQT_RANDOMIZER[i]) {
      return false;
    }
  }
  return true;
};
