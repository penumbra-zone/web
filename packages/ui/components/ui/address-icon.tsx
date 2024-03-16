import { Identicon } from './identicon';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32Address } from '@penumbra-zone/bech32';

interface AddressIconProps {
  address: Address;
  size: number;
}

/**
 * A simple component to display a consistently styled icon for a given address.
 */
export const AddressIcon = ({ address, size }: AddressIconProps) => (
  <Identicon
    uniqueIdentifier={bech32Address(address)}
    size={size}
    className='rounded-full'
    type='gradient'
  />
);
