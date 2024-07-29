import { Address } from '@penumbra-zone/protobuf/types';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

export interface AddressComponentProps {
  address: Address;
  ephemeral?: boolean;
}

/**
 * Displays an address. The address is truncated to the prefix plus 24
 * characters, and rendered in color when it is ephemeral.
 */
export const AddressComponent = ({ address, ephemeral }: AddressComponentProps) => {
  const bech32Addr = bech32mAddress(address);

  return (
    <span className={'font-mono' + (ephemeral ? ' text-rust' : ' text-muted-foreground truncate')}>
      {bech32Addr}
    </span>
  );
};
