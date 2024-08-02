import { AddressIcon } from './AddressIcon';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb.js';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import styled from 'styled-components';
import { Text } from '../Text';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { Shrink0 } from '../utils/Shrink0';

const Root = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

export interface AddressViewProps {
  addressView: AddressView | undefined;
  copyable?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({ addressView, copyable = true }: AddressViewProps) => {
  if (!addressView?.addressView.value?.address) {
    return null;
  }

  const accountIndex =
    addressView.addressView.case === 'decoded'
      ? addressView.addressView.value.index?.account
      : undefined;
  const isOneTimeAddress =
    addressView.addressView.case === 'decoded'
      ? !addressView.addressView.value.index?.randomizer.every(v => v === 0) // Randomized (and thus, a one-time address) if the randomizer is not all zeros.
      : undefined;

  const addressIndexLabel = isOneTimeAddress ? 'IBC Deposit Address for Account #' : 'Account #';

  copyable = isOneTimeAddress ? false : copyable;

  const encodedAddress = bech32mAddress(addressView.addressView.value.address);

  return (
    <Root>
      <Shrink0>
        <AddressIcon address={addressView.addressView.value.address} size={24} />
      </Shrink0>

      {accountIndex === undefined ? (
        <Text technical truncate>
          {encodedAddress}
        </Text>
      ) : (
        <Text strong truncate>
          {addressIndexLabel}
          {accountIndex}
        </Text>
      )}

      {copyable && (
        <Shrink0>
          <CopyToClipboardButton text={encodedAddress} />
        </Shrink0>
      )}
    </Root>
  );
};
