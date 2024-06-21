import { BalanceValueView } from '@repo/ui/components/ui/balance-value-view';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Box } from '@repo/ui/components/ui/box';
import { CandlestickPlot } from '@repo/ui/components/ui/candlestick-plot';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import {
  getAmount,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { getBlockDate } from '../../../fetchers/block-date';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { AssetSelector } from '../../shared/selectors/asset-selector';
import BalanceSelector from '../../shared/selectors/balance-selector';
import { useStatus } from '../../../state/status';
import { zeroValueView } from '../../../utils/zero-value-view';
import { isValidAmount } from '../../../state/helpers';
import { NonNativeFeeWarning } from '../../shared/non-native-fee-warning';
import { NumberInput } from '../../shared/number-input';
import { useBalancesResponses, useAssets } from '../../../state/shared';
import { FadeIn } from '@repo/ui/components/ui/fade-in';
import { swappableAssetsSelector, swappableBalancesResponsesSelector } from '../helpers';

const getAssetOutBalance = (
  balancesResponses: BalancesResponse[] = [],
  assetIn?: BalancesResponse,
  assetOut?: Metadata,
) => {
  if (!assetIn || !assetOut) return zeroValueView();

  const match = balancesResponses.find(balance => {
    const balanceViewMetadata = getMetadataFromBalancesResponse(balance);

    return (
      getAddressIndex(balance.accountAddress).equals(getAddressIndex(assetIn.accountAddress)) &&
      assetOut.equals(balanceViewMetadata)
    );
  });
  const matchedBalance = getBalanceView.optional()(match);
  return matchedBalance ?? zeroValueView(assetOut);
};

const tokenSwapInputSelector = (state: AllSlices) => ({
  assetIn: state.swap.assetIn,
  setAssetIn: state.swap.setAssetIn,
  assetOut: state.swap.assetOut,
  setAssetOut: state.swap.setAssetOut,
  amount: state.swap.amount,
  setAmount: state.swap.setAmount,
  priceHistory: state.swap.priceHistory,
});

/**
 * Exposes a UI with three interactive elements: an asset selector for the user
 * to choose which asset to swap _from_, an asset selector for the user to
 * choose which asset to swap _to_, and a text field for the user to enter an
 * amount.
 */
export const TokenSwapInput = () => {
  const status = useStatus();
  const latestKnownBlockHeight = status.data?.latestKnownBlockHeight ?? 0n;
  const balancesResponses = useBalancesResponses({ select: swappableBalancesResponsesSelector });
  const swappableAssets = useAssets({ select: swappableAssetsSelector });
  const { amount, setAmount, assetIn, setAssetIn, assetOut, setAssetOut, priceHistory } =
    useStoreShallow(tokenSwapInputSelector);
  const assetOutBalance = getAssetOutBalance(balancesResponses.data, assetIn, assetOut);

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
      <div className='flex flex-col items-stretch gap-4 sm:flex-row'>
        <NumberInput
          value={amount}
          inputMode='decimal'
          variant='transparent'
          placeholder='Enter an amount...'
          max={maxAmountAsString}
          step='any'
          className={'font-bold leading-10 md:h-8 md:text-xl xl:h-10 xl:text-3xl'}
          onChange={e => {
            setAmount(e.target.value);
          }}
        />
        <div className='flex gap-4'>
          {assetIn && (
            <div className='ml-auto hidden h-full flex-col justify-end self-end sm:flex'>
              <span className='mr-2 block whitespace-nowrap text-xs text-muted-foreground'>
                Account #{getAddressIndex(assetIn.accountAddress).account}
              </span>
            </div>
          )}

          <FadeIn condition={!!balancesResponses.error || !!swappableAssets.error}>
            <div className='flex gap-4 text-red'>
              {balancesResponses.error instanceof Error && balancesResponses.error.toString()}
              {swappableAssets.error instanceof Error && swappableAssets.error.toString()}
            </div>
          </FadeIn>

          <FadeIn condition={!!balancesResponses.data && !!swappableAssets.data}>
            <div className='flex gap-4'>
              <div className='flex h-full flex-col gap-2'>
                {balancesResponses.data && (
                  <BalanceSelector
                    value={assetIn}
                    assets={swappableAssets.data}
                    balances={balancesResponses.data}
                    onChange={setAssetIn}
                  />
                )}
                {assetIn?.balanceView && (
                  <BalanceValueView
                    error={!isValidAmount(amount, assetIn)}
                    valueView={assetIn.balanceView}
                    onClick={setInputToBalanceMax}
                  />
                )}
              </div>

              <div className='size-4 pt-2'>
                <ArrowRight size={16} className='text-muted-foreground' />
              </div>

              <div className='flex h-full flex-col gap-2'>
                {swappableAssets.data && (
                  <AssetSelector
                    assets={swappableAssets.data}
                    value={assetOut}
                    onChange={setAssetOut}
                  />
                )}

                {assetOut && <BalanceValueView valueView={assetOutBalance} />}
              </div>
            </div>
          </FadeIn>
        </div>
        {priceHistory.startMetadata && priceHistory.endMetadata && priceHistory.candles.length ? (
          <CandlestickPlot
            className='h-[480px] w-full bg-charcoal'
            candles={priceHistory.candles}
            startMetadata={priceHistory.startMetadata}
            endMetadata={priceHistory.endMetadata}
            latestKnownBlockHeight={Number(latestKnownBlockHeight)}
            getBlockDate={getBlockDate}
          />
        ) : null}
      </div>

      <NonNativeFeeWarning
        balancesResponses={balancesResponses.data}
        amount={Number(amount)}
        wrap={children => (
          <>
            {/* This div adds an empty line */} <div className='h-4' />
            {children}
          </>
        )}
      />
    </Box>
  );
};
