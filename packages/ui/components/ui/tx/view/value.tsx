import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { fromBaseUnitAmount } from '@penumbra-zone/types';
import { getDisplayDenomExponent, getDisplayDenomFromView } from '@penumbra-zone/getters';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { AssetIcon } from './asset-icon';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { cn } from '../../../../lib/utils';

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
    // The regex trims trailing zeros which toFormat adds in
    const formattedAmount = fromBaseUnitAmount(amount, exponent)
      .toFormat(6)
      .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
    const symbol = metadata.symbol || 'Unknown Asset';

    return (
      <div
        className={cn(
          'inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-light-brown py-1 pl-1 pr-3 text-sm hover:bg-brown',
          showIcon && 'pl-1',
          !showIcon && 'pl-3',
        )}
      >
        {showIcon && (
          <div className='mr-1 flex size-6 items-center justify-center rounded-full'>
            <AssetIcon metadata={metadata} />
          </div>
        )}
        {showValue && <span className='leading-[15px]'>{formattedAmount}</span>}
        {showDenom && (
          <span className='truncate font-mono text-xs text-muted-foreground'>{symbol}</span>
        )}
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
            )
              .toFormat(6)
              .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
