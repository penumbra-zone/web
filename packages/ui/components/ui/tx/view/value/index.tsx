import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { CopyToClipboard } from '../../../copy-to-clipboard';
import { AssetIcon } from '../asset-icon';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { fromBaseUnitAmount } from '@penumbra-zone/types/amount';
import { Pill } from '../../../pill';

interface ValueViewProps {
  view: ValueView | undefined;
  /**
   * When rendering an equivalent value, use the `equivalent` variant to
   * visually distinguish it as an equivalent value.
   */
  variant?: 'default' | 'equivalent';
  showDenom?: boolean;
  showValue?: boolean;
  showIcon?: boolean;
}

export const ValueViewComponent = ({
  view,
  variant = 'default',
  showDenom = true,
  showValue = true,
  showIcon = true,
}: ValueViewProps) => {
  if (!view) return <></>;

  if (view.valueView.case === 'knownAssetId' && view.valueView.value.metadata) {
    const value = view.valueView.value;
    const metadata = view.valueView.value.metadata;
    const amount = value.amount ?? new Amount();
    const exponent = getDisplayDenomExponent.optional()(metadata);
    // The regex trims trailing zeros which toFormat adds in
    const formattedAmount = fromBaseUnitAmount(amount, exponent)
      .toFormat(6)
      .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
    const symbol = metadata.symbol || 'Unknown Asset';

    return (
      <Pill variant={variant === 'default' ? 'default' : 'dashed'}>
        <div className='flex min-w-0 items-center gap-1'>
          {showIcon && (
            <div className='-ml-2 mr-1 flex size-6 shrink-0 items-center justify-center rounded-full'>
              <AssetIcon metadata={metadata} />
            </div>
          )}
          {showValue && (
            <span className='-mb-0.5 text-nowrap leading-[15px]'>
              {variant === 'equivalent' && <>~ </>}
              {formattedAmount}
            </span>
          )}
          {showDenom && (
            <span className='truncate font-mono text-xs text-muted-foreground'>{symbol}</span>
          )}
        </div>
      </Pill>
    );
  }

  if (view.valueView.case === 'unknownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const encodedAssetId = getDisplayDenomFromView(view);
    return (
      <div className='flex font-mono'>
        <p className='-mb-0.5 truncate text-[15px] leading-[22px]'>
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
