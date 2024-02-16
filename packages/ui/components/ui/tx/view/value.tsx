import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  fromBaseUnitAmount,
  getDisplayDenomExponent,
  getDisplayDenomFromView,
} from '@penumbra-zone/types';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { AssetIcon } from './asset-icon';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

interface ValueViewProps {
  view: ValueView | undefined;
  showDenom?: boolean;
  showValue?: boolean;
  showIcon?: boolean;
  showEquivalent?: boolean;
}

export const ValueViewComponent = ({
  view,
  showDenom = true,
  showValue = true,
  showIcon = true,
  showEquivalent = true,
}: ValueViewProps) => {
  if (!view) return <></>;

  if (view.valueView.case === 'knownAssetId' && view.valueView.value.metadata) {
    const value = view.valueView.value;
    const metadata = view.valueView.value.metadata;
    const amount = value.amount ?? new Amount();
    const exponent = getDisplayDenomExponent(metadata);
    const formattedAmount = fromBaseUnitAmount(amount, exponent).toFormat();
    const symbol = metadata.symbol || 'Unknown Asset';

    return (
      <div className='flex items-center text-base font-bold'>
        {showIcon && <AssetIcon metadata={metadata} />}
        {showValue && <span className='ml-1'>{formattedAmount}</span>}
        {showDenom && <span className='ml-1'>{symbol}</span>}
        {
          // TODO: this will need refinement once we actually hand out
          // equivalent values to the frontend. it would be nice to have
          // another parameter that controls whether the valueview should
          // fill width or not (with value to the left, equiv values to the right)
        }
        {showEquivalent &&
          value.equivalentValues.map((equivalentValue, index) => {
            const exponent = getDisplayDenomExponent(equivalentValue.numeraire);
            const formattedEquivalent = fromBaseUnitAmount(
              equivalentValue.equivalentAmount ?? new Amount(),
              exponent,
            ).toFormat();
            const symbol = equivalentValue.numeraire?.symbol || 'Unknown Asset';
            return (
              <div key={index} className='flex'>
                <AssetIcon metadata={equivalentValue.numeraire} />
                <span>{formattedEquivalent}</span>
                <span>{symbol}</span>
              </div>
            );
          })}
      </div>
    );
  }

  if (view.valueView.case === 'unknownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const encodedAssetId = getDisplayDenomFromView(view);
    return (
      <div className='flex font-mono'>
        <p className='truncate text-[15px] leading-[22px]'>
          {fromBaseUnitAmount(amount, 0).toFormat()}
        </p>
        <span className='truncate font-mono text-sm italic text-foreground'>{encodedAssetId}</span>
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

  return <></>;
};
