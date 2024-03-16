import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32Address } from '@penumbra-zone/bech32';

interface AddressComponentProps {
  address: Address;
  ephemeral?: boolean;
}

/**
 * Displays an address. The address is truncated to the prefix plus 24
 * characters, and rendered in color when it is ephemeral.
 */
export const AddressComponent = ({ address, ephemeral }: AddressComponentProps) => {
  const bech32Addr = bech32Address(address);

  return (
    <span
      className={'font-mono' + (ephemeral ? ' text-[#8D5728]' : ' text-muted-foreground truncate')}
    >
      {bech32Addr}
    </span>
  );
};
