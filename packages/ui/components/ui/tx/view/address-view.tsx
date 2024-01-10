import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32Address, shortenAddress } from '@penumbra-zone/types';
import { CopyIcon } from '@radix-ui/react-icons';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { Identicon } from '../../identicon';

interface AddressViewProps {
  view: AddressView | undefined;
  copyable?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({ view, copyable = true }: AddressViewProps) => {
  if (!view?.addressView.value?.address) return <></>;

  const encoded = bech32Address(view.addressView.value.address);
  const display = shortenAddress(encoded);

  const accountIndex =
    view.addressView.case === 'visible' ? view.addressView.value.index?.account : undefined;
  const isOneTimeAddress =
    view.addressView.case === 'visible'
      ? !view.addressView.value.index?.randomizer.every(v => v === 0) // Randomized (and thus, a one-time address) if the randomizer is not all zeros.
      : undefined;

  copyable = isOneTimeAddress ? false : copyable;

  return (
    <div className='flex'>
      {accountIndex !== undefined ? (
        <div className='flex items-baseline gap-2'>
          <Identicon name={encoded} size={14} className='rounded-full' type='gradient' />
          {isOneTimeAddress ? (
            <span className='font-bold'>One-time Address for Account #{accountIndex}</span>
          ) : (
            <span className='font-bold'>Account #{accountIndex}</span>
          )}
        </div>
      ) : (
        <div className='font-mono text-sm italic text-foreground'>{display}</div>
      )}
      {copyable && (
        <CopyToClipboard
          text={encoded}
          label={
            <div data-testid='AddressView__CopyIcon'>
              <CopyIcon className='h-4 w-4 text-muted-foreground hover:opacity-50' />
            </div>
          }
          className='w-4 px-4'
        />
      )}
    </div>
  );
};
