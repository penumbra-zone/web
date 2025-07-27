import cn from 'clsx';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { AddressIcon } from './AddressIcon';
import { Text } from '../Text';
import { TextVariant } from '../Text/types';
import { useDensity, Density as DensityType } from '../utils/density';
import { isLqtAddressIndex } from '@penumbra-zone/types/address';
import { Density } from '../Density';

const textVariantByDensity = (density: DensityType): TextVariant => {
  if (density === 'slim') {
    return 'detail';
  }
  if (density === 'compact') {
    return 'small';
  }
  return 'strong';
};

export interface AddressViewProps {
  addressView: AddressView | undefined;
  copyable?: boolean;
  hideIcon?: boolean;
  truncate?: boolean;
  /** If true, takes the `altBech32m` field from the address and renders it as-is */
  external?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({
  addressView,
  copyable = true,
  hideIcon,
  truncate = false,
  external = false,
}: AddressViewProps) => {
  const density = useDensity();
  const address = addressView?.addressView.value?.address;

  if (!address) {
    return null;
  }

  const addressIndex = getAddressIndex.optional(addressView);

  // A randomized index has nonzero randomizer bytes
  const isLqt = addressIndex && isLqtAddressIndex(addressIndex);
  const isRandomized = !isLqt && addressIndex?.randomizer.some(v => v);

  let indexLabel = '';
  if (addressIndex) {
    indexLabel =
      addressIndex.account === 0 ? 'Main Account' : `Sub-Account ${addressIndex.account}`;
  }

  const randomizedLabel = isRandomized ? 'IBC Deposit Address for' : '';
  const lqtLabel = isLqt ? 'My Tournament Address for' : '';
  const accountLabel = `${randomizedLabel}${lqtLabel} ${indexLabel}`;

  // Treat addresses whose `inner` component is missing or incorrect length as external
  const autoExternal = !address.inner || address.inner.length !== 80;
  const encodedAddress = (external || autoExternal) ? address.altBech32m : bech32mAddress(address);

  return (
    <div className={'flex items-center gap-2 text-text-primary'}>
      {!hideIcon && !(external || autoExternal) && (
        <div className='shrink'>
          <AddressIcon address={address} size={density === 'sparse' ? 24 : 16} />
        </div>
      )}

      <div
        className={cn('flex items-center', truncate && 'max-w-[150px] truncate')}
        title={addressIndex ? accountLabel : encodedAddress}
      >
        {addressIndex ? (
          <Text variant={textVariantByDensity(density)} truncate={truncate}>
            {accountLabel}
          </Text>
        ) : (
          <Text variant={textVariantByDensity(density)} truncate={truncate}>
            {encodedAddress}
          </Text>
        )}
      </div>

      {copyable && !isRandomized && (
        <div className='shrink'>
          <Density variant={density === 'sparse' ? 'compact' : 'slim'}>
            <CopyToClipboardButton text={encodedAddress} />
          </Density>
        </div>
      )}
    </div>
  );
};
