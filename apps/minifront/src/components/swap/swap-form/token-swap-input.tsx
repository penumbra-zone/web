import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BalanceValueView } from '@repo/ui/components/ui/balance-value-view';
import { Box } from '@repo/ui/components/ui/box';
import { CandlestickPlot } from '@repo/ui/components/ui/candlestick-plot';
import { Input } from '@repo/ui/components/ui/input';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import {
  getAmount,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBlockDate } from '../../../fetchers/block-date';
import { AllSlices } from '../../../state';
import { amountMoreThanBalance } from '../../../state/send';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AssetSelector } from '../../shared/asset-selector';
import BalanceSelector from '../../shared/balance-selector';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { useStatus } from '../../../state/status';
import { hasStakingToken } from '../../../fetchers/staking-token';

const isValidAmount = (amount: string, assetIn?: BalancesResponse) =>
  Number(amount) >= 0 && (!assetIn || !amountMoreThanBalance(assetIn, amount));

const getKnownZeroValueView = (metadata?: Metadata) => {
  return new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: { amount: new Amount({ lo: 0n }), metadata },
    },
  });
};

const assetOutBalanceSelector = ({ swap: { balancesResponses, assetIn, assetOut } }: AllSlices) => {
  if (!assetIn || !assetOut) return getKnownZeroValueView();

  const match = balancesResponses.find(balance => {
    const balanceViewMetadata = getMetadataFromBalancesResponse(balance);

    return (
      balance.accountAddress?.equals(assetIn.accountAddress) && assetOut.equals(balanceViewMetadata)
    );
  });
  const matchedBalance = getBalanceView.optional()(match);
  return matchedBalance ?? getKnownZeroValueView(assetOut);
};

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
  assetOutBalance: assetOutBalanceSelector(state),
  hasStakingTokenMeta: state.swap.stakingAssetMetadata,
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
    assetOutBalance,
    hasStakingTokenMeta,
  } = useStoreShallow(tokenSwapInputSelector);
  // State to manage privacy warning display
  const [showNonNativeFeeWarning, setshowNonNativeFeeWarning] = useState(false);

  // Check if the user has native staking tokens
  const stakingToken = hasStakingToken(balancesResponses, hasStakingTokenMeta);

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
            setshowNonNativeFeeWarning(Number(e.target.value) > 0 && !stakingToken);
          }}
        />
        <div className='flex gap-4 sm:contents'>
          {assetIn && (
            <div className='ml-auto hidden h-full flex-col justify-end self-end sm:flex'>
              <span className='mr-2 block whitespace-nowrap text-xs text-muted-foreground'>
                Account #{getAddressIndex(assetIn.accountAddress).account}
              </span>
            </div>
          )}

          <div className='flex h-full flex-col gap-2'>
            <BalanceSelector value={assetIn} onChange={setAssetIn} balances={balancesResponses} />
            {assetIn?.balanceView && (
              <BalanceValueView valueView={assetIn.balanceView} onClick={setInputToBalanceMax} />
            )}
          </div>

          <div className='flex flex-col gap-2 pt-2'>
            <ArrowRight size={16} className='text-muted-foreground' />
          </div>

          <div className='flex h-full flex-col gap-2'>
            <AssetSelector assets={swappableAssets} value={assetOut} onChange={setAssetOut} />
            {assetOut && <BalanceValueView valueView={assetOutBalance} />}
          </div>
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
      {showNonNativeFeeWarning && (
        <>
          <div className='h-4'></div> {/* This div adds an empty line */}
          <div className='rounded border border-yellow-500 bg-gray-800 p-4 text-yellow-500'>
            <strong>Privacy Warning:</strong>
            <span className='block'>
              Using non-native tokens for transaction fees may pose a privacy risk. It is
              recommended to use the native token (UM) for better privacy and security.
            </span>
          </div>
        </>
      )}
    </Box>
  );
};
