import { AddressIcon } from '../address/address-icon';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { CopyToClipboardIconButton } from '../copy-to-clipboard/copy-to-clipboard-icon-button';
import { AddressComponent } from '../address/address-component';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

interface AddressViewProps {
  view: AddressView | undefined;
  copyable?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({ view, copyable }: AddressViewProps) => {
  if (!view?.addressView.value?.address) {
    return;
  }

  const encodedAddress = bech32mAddress(view.addressView.value.address);

  const accountIndex =
    view.addressView.case === 'decoded' ? view.addressView.value.index?.account : undefined;
  const isOneTimeAddress =
    view.addressView.case === 'decoded'
      ? !view.addressView.value.index?.randomizer.every(v => v === 0) // Randomized (and thus, a one-time address) if the randomizer is not all zeros.
      : undefined;
  const isCopyable = isOneTimeAddress ? false : (copyable ?? true);

  const accountIndexLabel = accountIndex === 0 ? 'Main Account' : `Sub-Account #${accountIndex}`;
  const addressIndexLabel = isOneTimeAddress
    ? `IBC Deposit Address for ${accountIndexLabel}`
    : accountIndexLabel;

  return (
    <div className='flex items-center gap-2 overflow-hidden'>
      {accountIndex !== undefined ? (
        <>
          <div className='shrink-0'>
            <AddressIcon address={view.addressView.value.address} size={14} />
          </div>
          <span className='break-keep font-bold'>{addressIndexLabel}</span>
        </>
      ) : (
        <AddressComponent address={view.addressView.value.address} />
      )}

      {isCopyable && <CopyToClipboardIconButton text={encodedAddress} />}
    </div>
  );
};
