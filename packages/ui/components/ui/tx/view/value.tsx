import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32AssetId, fromBaseUnitAmount } from '@penumbra-zone/types';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/types/src/denom-metadata';

interface ValueViewProps {
  view: ValueView | undefined;
  showDenom?: boolean;
}

export const ValueViewComponent = ({ view, showDenom = true }: ValueViewProps) => {
  if (!view) return <></>;

  if (view.valueView.case === 'unknownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const encodedAssetId = getDisplayDenomFromView(view);
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
    const displayDenom = getDisplayDenomFromView(view);
    const exponent = value.metadata ? getDisplayDenomExponent(value.metadata) : 0;

    return (
      <div className='flex font-mono'>
        {fromBaseUnitAmount(amount, exponent).toFormat()} {showDenom && displayDenom}
      </div>
    );
  }

  return <></>;
};

export const getDisplayDenomFromView = (view: ValueView) => {
  if (view.valueView.case === 'unknownAssetId') {
    if (!view.valueView.value.assetId) throw new Error('no asset id for unknown denom');
    return bech32AssetId(view.valueView.value.assetId);
  }

  if (view.valueView.case === 'knownAssetId') {
    const displayDenom = view.valueView.value.metadata?.display;
    if (displayDenom) return displayDenom;

    const assetId = view.valueView.value.metadata?.penumbraAssetId;
    if (assetId) return bech32AssetId(assetId);

    return 'unknown';
  }

  throw new Error(`unexpected case ${view.valueView.case}`);
};
