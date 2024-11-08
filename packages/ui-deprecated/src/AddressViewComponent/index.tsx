import { AddressIcon } from './AddressIcon';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { styled } from 'styled-components';
import { Text } from '../Text';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { Shrink0 } from '../utils/Shrink0';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';

const Root = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

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
    <Root>
      {!hideIcon && (
        <Shrink0>
          <AddressIcon address={addressView.addressView.value.address} size={24} />
        </Shrink0>
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
        <Shrink0>
          <CopyToClipboardButton text={encodedAddress} />
        </Shrink0>
      )}
    </Root>
  );
};
