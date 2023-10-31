import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32AssetId, fromBaseUnitAmount } from '@penumbra-zone/types';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

interface ValueViewPrpos {
  view: ValueView | undefined;
}

export const ValueViewComponent = ({ view }: ValueViewPrpos) => {
  if (!view) return <></>;

  if (view.valueView.case === 'unknownDenom') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const encodedAssetId = bech32AssetId(value.assetId!);
    return (
      <div className='flex font-mono'>
        <p className='text-[15px] leading-[22px]'>{fromBaseUnitAmount(amount, 1).toFormat()}</p>
        <span className='font-mono text-sm italic text-foreground'>{encodedAssetId}</span>
        <CopyToClipboard
          text={encodedAssetId}
          label={
            <div>
              <CopyIcon className='h-4 w-4 text-muted-foreground hover:opacity-50' />
            </div>
          }
          className='w-4 px-4'
        />
      </div>
    );
  }

  if (view.valueView.case === 'knownDenom') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const display_denom = value.denom?.display ?? '';
    // The first denom unit in the list is the display denom, according to cosmos practice
    const exponent = value.denom?.denomUnits[0]?.exponent ?? 1;
    return (
      <div className='flex font-mono'>
        {fromBaseUnitAmount(amount, exponent).toFormat()} {display_denom}
      </div>
    );
  }

  return <></>;
};
