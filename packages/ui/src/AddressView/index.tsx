import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { AddressIcon } from './AddressIcon';
import { Text } from '../Text';

export interface AddressViewProps {
  addressView: AddressView | undefined;
  copyable?: boolean;
  hideIcon?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({
  addressView,
  copyable = true,
  hideIcon,
}: AddressViewProps) => {
  if (!addressView?.addressView.value?.address) {
    return null;
  }

  const addressIndex = getAddressIndex.optional(addressView);

  // a randomized index has nonzero randomizer bytes
  const isRandomized = addressIndex?.randomizer.some(v => v);

  const encodedAddress = bech32mAddress(addressView.addressView.value.address);

  return (
    <div className='flex items-center gap-2 text-text-primary'>
      {!hideIcon && (
        <div className='shrink'>
          <AddressIcon address={addressView.addressView.value.address} size={24} />
        </div>
      )}

      {addressIndex ? (
        <Text strong truncate>
          {isRandomized && 'IBC Deposit Address for '}
          {`Sub-Account #${addressIndex.account}`}
        </Text>
      ) : (
        <Text technical truncate>
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
