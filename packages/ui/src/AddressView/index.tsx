import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { AddressIcon } from './AddressIcon';
import { Text } from '../Text';
import { useDensity } from '../utils/density';
import { Density } from '../Density';

export interface AddressViewProps {
  addressView: AddressView | undefined;
  copyable?: boolean;
  hideIcon?: boolean;
  truncate?: boolean;
}

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
    <div className={'flex items-center gap-2 text-text-primary'}>
      {!hideIcon && (
        <div className='shrink'>
          <AddressIcon
            address={addressView.addressView.value.address}
            size={density === 'sparse' ? 24 : 16}
          />
        </div>
      )}

      <div className={truncate ? 'max-w-[150px] truncate' : ''}>
        {addressIndex ? (
          <Text variant={density === 'sparse' ? 'strong' : 'small'} truncate={truncate}>
            {isRandomized && 'IBC Deposit Address for '}
            {getAccountLabel(addressIndex.account)}
          </Text>
        ) : (
          <Text variant={density === 'sparse' ? 'strong' : 'small'} truncate={truncate}>
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
