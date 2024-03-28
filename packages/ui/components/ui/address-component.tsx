import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32Address } from '@penumbra-zone/bech32/src/address';
import { cn } from '../../lib/utils';

interface AddressComponentProps {
  address: Address;
  ephemeral?: boolean;
  ephemeralClassName?: string;
}

/**
 * Displays an address. The address is truncated to the prefix plus 24
 * characters, and rendered in color when it is ephemeral.
 */
export const AddressComponent = ({
  address,
  ephemeral,
  ephemeralClassName = 'text-rust',
}: AddressComponentProps) => {
  const bech32Addr = bech32Address(address);

  return (
    <div className={cn('font-mono', 'truncate w-0 min-w-full', ephemeral && ephemeralClassName)}>
      {bech32Addr}
    </div>
  );
};
