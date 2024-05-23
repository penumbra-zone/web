import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Box } from '@penumbra-zone/ui/components/ui/box';
import BalanceSelector from '../../shared/balance-selector';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ArrowRight } from 'lucide-react';
import { AssetSelector } from '../../shared/asset-selector';
import { BalanceValueView } from '@penumbra-zone/ui/components/ui/balance-value-view';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { groupByAsset } from '../../../fetchers/balances/by-asset';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/balances-response';
import { amountMoreThanBalance } from '../../../state/send';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';

const findMatchingBalance = (
  metadata: Metadata | undefined,
  balances: BalancesResponse[],
): ValueView | undefined => {
  if (!metadata?.penumbraAssetId) return undefined;

  const match = balances.reduce(groupByAsset, []).find(v => {
    if (v.valueView.case !== 'knownAssetId') return false;
    return v.valueView.value.metadata?.penumbraAssetId?.equals(metadata.penumbraAssetId);
  });

  if (!match) {
    return new ValueView({
      valueView: { case: 'knownAssetId', value: { metadata, amount: new Amount() } },
    });
  }

  return match;
};

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
  const balanceOfAssetOut = findMatchingBalance(assetOut, balancesResponses);
  const maxAmount = getAmount.optional()(assetIn);
  let maxAmountAsString: string | undefined;
  if (maxAmount) maxAmountAsString = joinLoHiAmount(maxAmount).toString();

  return (
    <Box label='Amount to swap'>
      <Input
        value={amount}
        type='number'
        inputMode='decimal'
        variant='transparent'
        placeholder='Enter an amount...'
        max={maxAmountAsString}
        step='any'
        className={
          'font-bold leading-10 md:h-8 md:w-[calc(100%-80px)] md:text-xl xl:h-10 xl:w-[calc(100%-160px)] xl:text-3xl'
        }
        onChange={e => {
          if (!isValidAmount(e.target.value, assetIn)) return;
          setAmount(e.target.value);
        }}
      />

      <div className='mt-4 flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <BalanceSelector value={assetIn} onChange={setAssetIn} balances={balancesResponses} />
          {assetIn?.balanceView && <BalanceValueView valueView={assetIn.balanceView} />}
        </div>

        <ArrowRight />

        <div className='flex flex-col items-end gap-1'>
          <AssetSelector assets={swappableAssets} value={assetOut} onChange={setAssetOut} />
          {balanceOfAssetOut && <BalanceValueView valueView={balanceOfAssetOut} />}
        </div>
      </div>
    </Box>
  );
};
