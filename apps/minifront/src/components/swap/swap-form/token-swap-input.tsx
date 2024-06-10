import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAmount } from '@penumbra-zone/getters/balances-response';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { BalanceValueView } from '@penumbra-zone/ui/components/ui/balance-value-view';
import { Box } from '@penumbra-zone/ui/components/ui/box';
import { CandlestickPlot } from '@penumbra-zone/ui/components/ui/candlestick-plot';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { getBlockDate } from '../../../fetchers/block-date';
import { AllSlices } from '../../../state';
import { amountMoreThanBalance } from '../../../state/send';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AssetSelector } from '../../shared/asset-selector';
import BalanceSelector from '../../shared/balance-selector';

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
  priceHistory: state.swap.priceHistory,
  latestKnownBlockHeight: state.status.latestKnownBlockHeight,
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
    priceHistory,
    latestKnownBlockHeight = 0n,
  } = useStoreShallow(tokenSwapInputSelector);

  useEffect(() => {
    if (!assetIn || !assetOut) return;
    else return priceHistory.load();
  }, [assetIn, assetOut]);

  useEffect(() => {
    if (!priceHistory.candles.length) return;
    else if (latestKnownBlockHeight % 10n) return;
    else return priceHistory.load();
  }, [priceHistory, latestKnownBlockHeight]);

  const maxAmount = getAmount.optional()(assetIn);
  const maxAmountAsString = maxAmount ? joinLoHiAmount(maxAmount).toString() : undefined;

  const setInputToBalanceMax = () => {
    if (assetIn?.balanceView) {
      const formattedAmt = getFormattedAmtFromValueView(assetIn.balanceView);
      setAmount(formattedAmt);
    }
  };

  return (
    <Box label='Trade' layout>
      <div className='gap-4'>
        <div className='flex flex-col items-start gap-4 sm:flex-row'>
          <div className='flex grow flex-row items-start gap-2'>
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
            {assetIn?.balanceView && (
              <div className='h-6'>
                <BalanceValueView valueView={assetIn.balanceView} onClick={setInputToBalanceMax} />
              </div>
            )}
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
        {priceHistory.startMetadata &&
          priceHistory.endMetadata &&
          !!priceHistory.candles.length && (
            <CandlestickPlot
              className='h-[480px] w-full bg-charcoal'
              candles={priceHistory.candles}
              startMetadata={priceHistory.startMetadata}
              endMetadata={priceHistory.endMetadata}
              latestKnownBlockHeight={Number(latestKnownBlockHeight)}
              getBlockDate={getBlockDate}
            />
          )}
      </div>
    </Box>
  );
};
