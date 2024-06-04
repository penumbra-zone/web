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
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { useMemo } from 'react';
import {
  ValueView,
  ValueView_KnownAssetId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

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
  const maxAmountAsString = maxAmount ? joinLoHiAmount(maxAmount).toString() : undefined;

  const balanceOut = useMemo(() => {
    const matchedBalance = balancesResponses.find(balance => {
      const balanceViewMetadata = (balance.balanceView?.valueView.value as ValueView_KnownAssetId)
        .metadata;
      return (
        balance.accountAddress?.equals(assetIn?.accountAddress) &&
        assetOut?.equals(balanceViewMetadata)
      );
    })?.balanceView;
    return (
      matchedBalance ??
      new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 0n,
            }),
            metadata: assetOut,
          },
        },
      })
    );
  }, [assetOut, balancesResponses, assetIn]);

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
          }}
        />

        <div className='flex gap-4 sm:contents'>
          {assetIn && (
            <div className='ml-auto hidden h-full flex-col justify-end self-end sm:flex'>
              <span className='mr-2 block whitespace-nowrap text-xs text-muted-foreground'>
                Account {getAddressIndex(assetIn.accountAddress).account}
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
            {assetOut && <BalanceValueView valueView={balanceOut} />}
          </div>
        </div>
      </div>
    </Box>
  );
};
