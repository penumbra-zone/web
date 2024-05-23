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

/**
 * Exposes a UI with three interactive elements: an asset selector for the user
 * to choose which asset to swap _from_, an asset selector for the user to
 * choose which asset to swap _to_, and a text field for the user to enter an
 * amount.
 */
export const TokenSwapInput = ({
  assets = [],
  balances = [],
  amount,
  onChangeAmount,
  assetIn,
  onChangeAssetIn,
  assetOut,
  onChangeAssetOut,
  label,
}: {
  assets?: Metadata[];
  balances?: BalancesResponse[];
  amount: string;
  onChangeAmount: (amount: string) => void;
  assetIn?: BalancesResponse;
  onChangeAssetIn: (assetIn: BalancesResponse) => void;
  assetOut?: Metadata;
  onChangeAssetOut: (assetOut: Metadata) => void;
  label: string;
}) => {
  const balanceOfAssetOut = findMatchingBalance(assetOut, balances);
  const maxAmount = getAmount.optional()(assetIn);
  let maxAmountAsString: string | undefined;
  if (maxAmount) maxAmountAsString = joinLoHiAmount(maxAmount).toString();

  return (
    <Box label={label}>
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
          onChangeAmount(e.target.value);
        }}
      />

      <div className='mt-4 flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <BalanceSelector value={assetIn} onChange={onChangeAssetIn} balances={balances} />
          {assetIn?.balanceView && <BalanceValueView valueView={assetIn.balanceView} />}
        </div>

        <ArrowRight />

        <div className='flex flex-col items-end gap-1'>
          <AssetSelector assets={assets} value={assetOut} onChange={onChangeAssetOut} />
          {balanceOfAssetOut && <BalanceValueView valueView={balanceOfAssetOut} />}
        </div>
      </div>
    </Box>
  );
};
