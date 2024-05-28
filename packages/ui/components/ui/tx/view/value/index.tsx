import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { formatAmount } from '@penumbra-zone/types/amount';
import { ValueComponent } from './value';

interface ValueViewProps {
  view: ValueView | undefined;
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

  if (view.valueView.case === 'knownAssetId' && view.valueView.value.metadata) {
    const { amount = new Amount(), metadata } = view.valueView.value;
    const exponent = getDisplayDenomExponent.optional()(metadata);
    const formattedAmount = formatAmount(amount, exponent);
    const symbol = metadata.symbol || 'Unknown Asset';
    return (
      <ValueComponent
        formattedAmount={formattedAmount}
        symbol={symbol}
        metadata={metadata}
        variant={variant}
        showIcon={showIcon}
        showValue={showValue}
        showDenom={showDenom}
        size={size}
      />
    );
  }

  if (view.valueView.case === 'unknownAssetId') {
    const { amount = new Amount() } = view.valueView.value;
    const formattedAmount = formatAmount(amount);
    const encodedAssetId = getDisplayDenomFromView(view);
    return (
      <ValueComponent
        formattedAmount={formattedAmount}
        symbol={encodedAssetId}
        variant={variant}
        showIcon={showIcon}
        showValue={showValue}
        showDenom={showDenom}
        size={size}
      />
    );
  }

  return <></>;
};
