import {
  ValueView,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { AssetIcon } from '../asset-icon';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { fromBaseUnitAmount } from '@penumbra-zone/types/amount';
import { Pill } from '../../../pill';
import { cn } from '../../../../../lib/utils';

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
  size?: 'default' | 'sm';
}

export const ValueViewComponent = ({
  view,
  variant = 'default',
  showDenom = true,
  showValue = true,
  showIcon = true,
  size = 'default',
}: ValueViewProps) => {
  if (!view) return null;

  const renderPill = (formattedAmount: string, symbol: string, metadata?: Metadata) => (
    <Pill variant={variant === 'default' ? 'default' : 'dashed'}>
      <div className='flex min-w-0 items-center gap-1'>
        {showIcon && (
          <div className='-ml-2 mr-1 flex shrink-0 items-center justify-center rounded-full'>
            <AssetIcon metadata={metadata} size={size === 'default' ? 'sm' : 'xs'} />
          </div>
        )}
        {showValue && (
          <span className={cn('-mb-0.5 text-nowrap leading-[15px]', size === 'sm' && 'text-xs')}>
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

  const formatAmount = (amount: Amount, exponent = 0) =>
    fromBaseUnitAmount(amount, exponent)
      .toFormat(6)
      .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');

  if (view.valueView.case === 'knownAssetId' && view.valueView.value.metadata) {
    const { amount = new Amount(), metadata } = view.valueView.value;
    const exponent = getDisplayDenomExponent.optional()(metadata);
    const formattedAmount = formatAmount(amount, exponent);
    const symbol = metadata.symbol || 'Unknown Asset';
    return renderPill(formattedAmount, symbol, metadata);
  }

  if (view.valueView.case === 'unknownAssetId') {
    const { amount = new Amount() } = view.valueView.value;
    const formattedAmount = formatAmount(amount);
    const encodedAssetId = getDisplayDenomFromView(view);
    return renderPill(formattedAmount, encodedAssetId);
  }

  return <></>;
};
