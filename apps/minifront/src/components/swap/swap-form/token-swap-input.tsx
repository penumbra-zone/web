import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Box } from '@penumbra-zone/ui/components/ui/box';
import BalanceSelector from '../../shared/balance-selector';
import { ArrowRight } from 'lucide-react';
import { AssetSelector } from '../../shared/asset-selector';
import { BalanceValueView } from '@penumbra-zone/ui/components/ui/balance-value-view';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/balances-response';
import { amountMoreThanBalance } from '../../../state/send';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';

const isValidAmount = (amount: string, assetIn?: BalancesResponse) =>
  Number(amount) >= 0 && (!assetIn || !amountMoreThanBalance(assetIn, amount));

const tokenSwapInputSelector = (state: AllSlices) => ({
  swappableAssets: state.swap.swappableAssets,
  assetIn: state.swap.assetIn,
  setAssetIn: state.swap.setAssetIn,
  assetOut: state.swap.assetOut,
  setAssetOut: state.swap.setAssetOut,
  amount: state.swap.amount,
  setAmount: state.swap.setAmount,
  balancesResponses: state.swap.balancesResponses,
});

/**
 * Exposes a UI with three interactive elements: an asset selector for the user
 * to choose which asset to swap _from_, an asset selector for the user to
 * choose which asset to swap _to_, and a text field for the user to enter an
 * amount.
 */
export const TokenSwapInput = () => {
  const {
    swappableAssets,
    amount,
    setAmount,
    assetIn,
    setAssetIn,
    assetOut,
    setAssetOut,
    balancesResponses,
  } = useStoreShallow(tokenSwapInputSelector);
  const maxAmount = getAmount.optional()(assetIn);
  let maxAmountAsString: string | undefined;
  if (maxAmount) maxAmountAsString = joinLoHiAmount(maxAmount).toString();

  return (
    <Box label='Trade'>
      <div className='flex flex-col items-start gap-4 sm:flex-row'>
        <div className='flex grow flex-col items-start gap-2'>
          <Input
            value={amount}
            type='number'
            inputMode='decimal'
            variant='transparent'
            placeholder='Enter an amount...'
            max={maxAmountAsString}
            step='any'
            className={'font-bold leading-10 md:h-8 md:text-xl xl:h-10 xl:text-3xl'}
            onChange={e => {
              if (!isValidAmount(e.target.value, assetIn)) return;
              setAmount(e.target.value);
            }}
          />
          {assetIn?.balanceView && <BalanceValueView valueView={assetIn.balanceView} />}
        </div>

        <div className='flex items-center justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <BalanceSelector value={assetIn} onChange={setAssetIn} balances={balancesResponses} />
          </div>

          <ArrowRight size={16} className='text-muted-foreground' />

          <div className='flex flex-col items-end gap-1'>
            <AssetSelector assets={swappableAssets} value={assetOut} onChange={setAssetOut} />
          </div>
        </div>
      </div>
    </Box>
  );
};
