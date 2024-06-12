import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueComponent } from './value';
import { getFormattedAmtFromValueView } from '../../../../../lib/format/value-view';

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

  const formattedAmount = getFormattedAmtFromValueView(view, true);

  if (view.valueView.case === 'knownAssetId' && view.valueView.value.metadata) {
    const { metadata } = view.valueView.value;
    const symbol = metadata.symbol || 'Unknown asset';
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
    return (
      <ValueComponent
        formattedAmount={formattedAmount}
        symbol='Unknown asset'
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
