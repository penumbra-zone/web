import {
  Address,
  AddressView,
  AddressView_Opaque,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32Address, shortenAddress } from '@penumbra-zone/types';
import { Identicon } from '../../identicon';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { CopyIcon } from '@radix-ui/react-icons';

interface AddressViewProps {
  view?: AddressView | undefined;
  address?: Address | undefined;
  copyable?: boolean;
  short_form?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({ view, address, copyable, short_form }: AddressViewProps) => {
  copyable = copyable ?? true;
  short_form = short_form ?? true;

  // TODO: is this a good pattern, or should we have a way to promote the address to a view outside
  // of a component?
  if (!view) {
    if (address) {
      const av = new AddressView({
        addressView: {
          case: 'opaque',
          value: new AddressView_Opaque({
            address: address,
          }),
        },
      });
      return <AddressViewComponent view={av} copyable={copyable} short_form={short_form} />;
    } else {
      return <></>;
    }
  }

  address = view.addressView.value?.address;
  if (!address) {
    return <></>;
  }

  const encoded = bech32Address(address);
  const display = short_form ? shortenAddress(encoded) : encoded;

  let account_index: number | undefined;
  let randomized: boolean | undefined;
  if (view.addressView.case === 'visible') {
    account_index = view.addressView.value.index?.account;
    // Randomized if the randomizer is not all zeros.
    randomized = !view.addressView.value.index?.randomizer.every(v => v === 0);
  }

  return (
    <div className='flex'>
      {account_index !== undefined ? (
        <div className='flex items-baseline gap-2'>
          <Identicon name={encoded} size={14} className='rounded-full' />
          <span className='font-bold'>Account #{account_index}</span>
          {randomized ? <span className='font-bold'> (randomized)</span> : null}
        </div>
      ) : (
        <div className='font-mono text-sm italic text-foreground'>{display}</div>
      )}
      {copyable ? (
        <CopyToClipboard
          text={encoded}
          label={
            <div>
              <CopyIcon className='h-4 w-4 text-muted-foreground hover:opacity-50' />
            </div>
          }
          className='w-4 px-4'
        />
      ) : null}
    </div>
  );
};
