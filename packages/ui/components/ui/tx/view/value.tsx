import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32AssetId, fromBaseUnitAmount } from '@penumbra-zone/types';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/types/src/denom-metadata';

interface ValueViewProps {
  view: ValueView | undefined;
}

export const ValueViewComponent = ({ view }: ValueViewProps) => {
  if (!view) return <></>;

  if (view.valueView.case === 'unknownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const encodedAssetId = bech32AssetId(value.assetId!);
    return (
      <div className='flex font-mono'>
        <p className='text-[15px] leading-[22px]'>{fromBaseUnitAmount(amount, 0).toFormat()}</p>
        <span className='font-mono text-sm italic text-foreground'>{encodedAssetId}</span>
        <CopyToClipboard
          text={encodedAssetId}
          label={
            <div>
              <CopyIcon className='size-4 text-muted-foreground hover:opacity-50' />
            </div>
          }
          className='w-4 px-4'
        />
      </div>
    );
  }

  if (view.valueView.case === 'knownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const display_denom = value.metadata?.display ?? '';
    const exponent = value.metadata ? getDisplayDenomExponent(value.metadata) : 0;

    return (
      <div className='flex font-mono'>
        {fromBaseUnitAmount(amount, exponent).toFormat()} {display_denom}
      </div>
    );
  }

  return <></>;
};
