import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { WalletIcon } from './icons/wallet';
import { getAmount, getDisplayDenomExponentFromValueView } from '@penumbra-zone/getters/value-view';
import { formatAmount } from '@penumbra-zone/types/amount';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { cn } from '../../lib/utils';

/**
 * Renders a `ValueView` as a balance with a wallet icon.
 * Optionally can pass an `onClick` method that gets called when clicked.
 */
export const BalanceValueView = ({
  valueView,
  error,
  onClick,
}: {
  valueView: ValueView;
  error?: boolean;
  onClick?: (valueView: ValueView) => void;
}) => {
  const exponent = getDisplayDenomExponentFromValueView.optional()(valueView);
  const amount = getAmount.optional()(valueView) ?? new Amount({ hi: 0n, lo: 0n });
  const formattedAmount = formatAmount({ amount, exponent, commas: true });

  return (
    <div
      className={cn(
        'flex items-start gap-1 truncate select-none text-muted-foreground hover:text-white transition-all',
        error && 'text-red-400',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick ? () => onClick(valueView) : undefined}
      role={onClick ? 'button' : undefined}
    >
      <WalletIcon className='size-5' />
      <span className='mt-1 text-xs'>{formattedAmount}</span>
    </div>
  );
};
