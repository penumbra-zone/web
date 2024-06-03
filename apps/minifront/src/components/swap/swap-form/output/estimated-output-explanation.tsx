import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { formatAmount } from '@penumbra-zone/types/amount';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { getSymbolFromValueView } from '@penumbra-zone/getters/value-view';

const estimatedOutputExplanationSelector = (state: AllSlices) => ({
  estimatedOutput: state.swap.dutchAuction.estimatedOutput,
  amount: state.swap.amount,
  assetIn: state.swap.assetIn,
  assetOut: state.swap.assetOut,
});

export const EstimatedOutputExplanation = () => {
  const { amount, assetIn, estimatedOutput, assetOut } = useStoreShallow(
    estimatedOutputExplanationSelector,
  );

  if (!estimatedOutput) return null;
  const formattedAmount = formatAmount({
    amount: estimatedOutput,
    exponent: getDisplayDenomExponent.optional()(assetOut),
  });
  const asssetInSymbol = getSymbolFromValueView.optional()(assetIn?.balanceView);

  return (
    <div className='text-xs text-muted-foreground'>
      Based on the current estimated market price of {formattedAmount} {assetOut?.symbol} for{' '}
      {amount} {asssetInSymbol}.
    </div>
  );
};
