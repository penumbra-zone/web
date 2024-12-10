import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { AddressIcon } from './AddressIcon';
import { Text } from '../Text';
import { Density, useDensity } from '../utils/density';
import cn from 'clsx';

export interface AddressViewProps {
  addressView: AddressView | undefined;
  copyable?: boolean;
  hideIcon?: boolean;
  truncate?: boolean;
}

export const getIconSize = (density: Density): number => {
  if (density === 'compact') {
    return 16;
  }
  if (density === 'slim') {
    return 12;
  }
  return 24;
};

export const getFont = (density: Density): string => {
  if (density === 'compact') {
    return cn('flex items-center gap-1.5 text-sm text-text-primary');
  }
  if (density === 'slim') {
    return cn('flex items-center gap-1 text-xs text-text-primary');
  }
  return cn('flex items-center gap-2 text-base text-text-primary');
};

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({
  addressView,
  copyable = true,
  hideIcon,
  truncate = false,
}: AddressViewProps) => {
  const density = useDensity();

  if (!addressView?.addressView.value?.address) {
    return null;
  }

  const addressIndex = getAddressIndex.optional(addressView);

  // A randomized index has nonzero randomizer bytes
  const isRandomized = addressIndex?.randomizer.some(v => v);

  const encodedAddress = bech32mAddress(addressView.addressView.value.address);

  // Sub-account selector logic
  const getAccountLabel = (index: number) =>
    index === 0 ? 'Main Account' : `Sub-Account ${index}`;

  return (
    <div className={cn(getFont(density))}>
      {!hideIcon && (
        <div className='shrink'>
          <AddressIcon
            address={addressView.addressView.value.address}
            size={getIconSize(density)}
          />
        </div>
      )}

      {addressIndex ? (
        <Text strong truncate={truncate}>
          {isRandomized && 'IBC Deposit Address for '}
          {getAccountLabel(addressIndex.account)}
        </Text>
      ) : (
        <Text technical truncate={truncate}>
          {encodedAddress}
        </Text>
      )}

      {copyable && !isRandomized && (
        <div className='shrink'>
          <CopyToClipboardButton text={encodedAddress} />
        </div>
      )}
    </div>
  );
};
