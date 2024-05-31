import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { WalletIcon } from 'lucide-react';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getSymbolFromValueView,
} from '@penumbra-zone/getters/value-view';
import { formatAmount } from '@penumbra-zone/types/amount';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/**
 * Renders a `ValueView` as a balance with a wallet icon.
 */
export const BalanceValueView = ({ valueView }: { valueView: ValueView }) => {
  const exponent = getDisplayDenomExponentFromValueView.optional()(valueView);
  const symbol = getSymbolFromValueView.optional()(valueView);
  const amount = getAmount.optional()(valueView) ?? new Amount({ hi: 0n, lo: 0n });
  const formattedAmount = formatAmount({ amount, exponent, commas: true });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className='flex items-center justify-center gap-1 truncate'>
          <WalletIcon className='size-3 text-muted-foreground' />

          <span className='text-xs text-muted-foreground'>{formattedAmount}</span>
        </TooltipTrigger>

        <TooltipContent>Your balance {symbol && <>of {symbol}</>}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
