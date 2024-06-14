import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { formatAmount, isZero } from '@penumbra-zone/types/amount';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { getSymbolFromValueView } from '@penumbra-zone/getters/value-view';

const estimatedOutputExplanationSelector = (state: AllSlices) => ({
  estimatedOutput: state.swap.dutchAuction.estimatedOutput,
  amount: state.swap.amount,
  assetIn: state.swap.assetIn,
  assetOut: state.swap.assetOut,
  noLiquidityAvailable:
    state.swap.dutchAuction.estimatedOutput && isZero(state.swap.dutchAuction.estimatedOutput),
});

export const EstimatedOutputExplanation = () => {
  const { amount, assetIn, estimatedOutput, assetOut, noLiquidityAvailable } = useStoreShallow(
    estimatedOutputExplanationSelector,
  );

  if (!estimatedOutput) return null;

  const formattedAmount = formatAmount({
    amount: estimatedOutput,
    exponent: getDisplayDenomExponent.optional()(assetOut),
  });
  const assetInSymbol = getSymbolFromValueView.optional()(assetIn?.balanceView);

  return (
    <div className='text-xs'>
      {noLiquidityAvailable ? (
        <span className='text-muted-foreground'>
          No liquidity is currently available for this swap, so it is impossible to estimate maximum
          and minimum outputs.
        </span>
      ) : (
        <>
          <span className='text-muted-foreground'>
            Based on the current estimated market price of{' '}
          </span>
          {formattedAmount} {assetOut?.symbol} <span className='text-muted-foreground'>for </span>
          {amount} {assetInSymbol}
          <span className='text-muted-foreground'>.</span>
        </>
      )}
    </div>
  );
};
