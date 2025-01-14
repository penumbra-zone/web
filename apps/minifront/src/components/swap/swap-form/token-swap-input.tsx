import { BalanceValueView } from '@penumbra-zone/ui-deprecated/components/ui/balance-value-view';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Box } from '@penumbra-zone/ui-deprecated/components/ui/box';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount, getBalanceView } from '@penumbra-zone/getters/balances-response';
import { ArrowRight } from 'lucide-react';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { AssetSelector } from '../../shared/selectors/asset-selector';
import BalanceSelector from '../../shared/selectors/balance-selector';
import { zeroValueView } from '../../../utils/zero-value-view';
import { isValidAmount } from '../../../state/helpers';
import { NumberInput } from '../../shared/number-input';
import { useAssets, useBalancesResponses } from '../../../state/shared';
import { getBalanceByMatchingMetadataAndAddressIndex } from '../../../state/swap/getters';
import {
  swappableAssetsSelector,
  swappableBalancesResponsesSelector,
} from '../../../state/swap/helpers';
import { TokenInputError } from './token-input-error.tsx';

const getAssetOutBalance = (
  balancesResponses: BalancesResponse[] = [],
  assetIn?: BalancesResponse,
  assetOut?: Metadata,
) => {
  if (!assetIn || !assetOut) {
    return zeroValueView();
  }

  const match = getBalanceByMatchingMetadataAndAddressIndex(
    balancesResponses,
    getAddressIndex(assetIn.accountAddress),
    assetOut,
  );
  const matchedBalance = getBalanceView.optional(match);
  return matchedBalance ?? zeroValueView(assetOut);
};

const tokenSwapInputSelector = (state: AllSlices) => ({
  assetIn: state.swap.assetIn,
  setAssetIn: state.swap.setAssetIn,
  assetOut: state.swap.assetOut,
  setAssetOut: state.swap.setAssetOut,
  amount: state.swap.amount,
  setAmount: state.swap.setAmount,
  reverse: state.swap.reverse,
});

/**
 * Exposes a UI with three interactive elements: an asset selector for the user
 * to choose which asset to swap _from_, an asset selector for the user to
 * choose which asset to swap _to_, and a text field for the user to enter an
 * amount.
 */
export const TokenSwapInput = () => {
  const balancesResponses = useBalancesResponses({ select: swappableBalancesResponsesSelector });
  const swappableAssets = useAssets({ select: swappableAssetsSelector });
  const { amount, setAmount, assetIn, setAssetIn, assetOut, setAssetOut, reverse } =
    useStoreShallow(tokenSwapInputSelector);
  const assetOutBalance = getAssetOutBalance(balancesResponses?.data, assetIn, assetOut);

  const maxAmount = getAmount.optional(assetIn);
  const maxAmountAsString = maxAmount ? joinLoHiAmount(maxAmount).toString() : undefined;
  const assetInAccount = assetIn && getAddressIndex(assetIn.accountAddress).account;

  const setInputToBalanceMax = () => {
    if (assetIn?.balanceView) {
      const formattedAmt = getFormattedAmtFromValueView(assetIn.balanceView);
      setAmount(formattedAmt);
    }
  };

  return (
    <Box label='Trade' layout headerContent={<TokenInputError />}>
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
                {assetInAccount === 0 ? 'Main Account' : `Sub-Account #${assetInAccount}`}
              </span>
            </div>
          )}

          <div className='flex gap-4'>
            <div className='flex h-full flex-col justify-end gap-2'>
              <BalanceSelector
                value={assetIn}
                loading={balancesResponses?.loading}
                assets={swappableAssets?.data}
                balances={balancesResponses?.data}
                onChange={setAssetIn}
              />

              {assetIn?.balanceView && (
                <BalanceValueView
                  error={!isValidAmount(amount, assetIn)}
                  valueView={assetIn.balanceView}
                  onClick={setInputToBalanceMax}
                />
              )}
            </div>

            <button
              type='button'
              className='flex size-8 items-center rounded p-2 transition hover:bg-light-brown disabled:bg-transparent'
              disabled={!assetIn || !assetOut}
              onClick={reverse}
            >
              <ArrowRight size={16} className='text-muted-foreground' />
            </button>

            <div className='flex h-full flex-col justify-end gap-2'>
              <AssetSelector
                loading={swappableAssets?.loading}
                assets={swappableAssets?.data ?? []}
                value={assetOut}
                onChange={setAssetOut}
              />

              {assetOut && <BalanceValueView valueView={assetOutBalance} />}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};
