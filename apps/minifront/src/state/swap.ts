import { AllSlices, SliceCreator } from '.';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { planBuildBroadcast } from './helpers';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BigNumber } from 'bignumber.js';
import { getAddressByIndex } from '../fetchers/address';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { errorToast } from '@penumbra-zone/ui/lib/toast/presets';
import {
  SimulateTradeRequest,
  SwapExecution,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { simulateClient } from '../clients';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { getSwapCommitmentFromTx } from '@penumbra-zone/getters/transaction';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { getAmountFromValue, getAssetIdFromValue } from '@penumbra-zone/getters/value';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { divideAmounts } from '@penumbra-zone/types/amount';
import { amountMoreThanBalance } from './send';

export interface SimulateSwapResult {
  output: ValueView;
  unfilled: ValueView;
  priceImpact: number | undefined;
}

export interface SwapSlice {
  assetIn: BalancesResponse | undefined;
  setAssetIn: (asset: BalancesResponse) => void;
  amount: string;
  setAmount: (amount: string) => void;
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
  initiateSwapTx: () => Promise<void>;
  txInProgress: boolean;
  simulateSwap: () => Promise<void>;
  simulateOutResult: SimulateSwapResult | undefined;
  simulateOutLoading: boolean;
}

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get) => {
  return {
    assetIn: undefined,
    setAssetIn: asset => {
      set(({ swap }) => {
        swap.assetIn = asset;
        swap.simulateOutResult = undefined;
      });
    },
    assetOut: undefined,
    setAssetOut: metadata => {
      set(({ swap }) => {
        swap.assetOut = metadata;
        swap.simulateOutResult = undefined;
      });
    },
    amount: '',
    setAmount: amount => {
      set(({ swap }) => {
        swap.amount = amount;
        swap.simulateOutResult = undefined;
      });
    },
    txInProgress: false,
    simulateOutResult: undefined,
    simulateOutLoading: false,
    simulateSwap: async () => {
      try {
        set(({ swap }) => {
          swap.simulateOutLoading = true;
        });

        const assetIn = get().swap.assetIn;
        const assetOut = get().swap.assetOut;
        if (!assetIn || !assetOut) throw new Error('Both asset in and out need to be set');

        const swapInValue = new Value({
          assetId: getAssetIdFromValueView(assetIn.balanceView),
          amount: toBaseUnit(
            BigNumber(get().swap.amount || 0),
            getDisplayDenomExponentFromValueView(assetIn.balanceView),
          ),
        });
        const req = new SimulateTradeRequest({
          input: swapInValue,
          output: getAssetId(assetOut),
        });
        const res = await simulateClient.simulateTrade(req);

        const output = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: res.output?.output?.amount,
              metadata: assetOut,
            },
          },
        });

        const unfilled = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: res.unfilled?.amount,
              metadata: getMetadata(assetIn.balanceView),
            },
          },
        });

        set(({ swap }) => {
          swap.simulateOutResult = {
            output,
            unfilled,
            priceImpact: calculatePriceImpact(res.output),
          };
        });
      } catch (e) {
        errorToast(e, 'Error estimating swap').render();
      } finally {
        set(({ swap }) => {
          swap.simulateOutLoading = false;
        });
      }
    },
    initiateSwapTx: async () => {
      set(state => {
        state.swap.txInProgress = true;
      });

      try {
        const swapReq = await assembleSwapRequest(get().swap);
        const swapTx = await planBuildBroadcast('swap', swapReq);
        const swapCommitment = getSwapCommitmentFromTx(swapTx);
        await issueSwapClaim(swapCommitment);

        set(state => {
          state.swap.amount = '';
        });
      } finally {
        set(state => {
          state.swap.txInProgress = false;
        });
      }
    },
  };
};

const assembleSwapRequest = async ({ assetIn, amount, assetOut }: SwapSlice) => {
  if (!assetIn) throw new Error('`assetIn` was undefined');

  const addressIndex = getAddressIndex(assetIn.accountAddress);

  return new TransactionPlannerRequest({
    swaps: [
      {
        targetAsset: getAssetId(assetOut),
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponentFromValueView(assetIn.balanceView),
          ),
          assetId: getAssetIdFromValueView(assetIn.balanceView),
        },
        claimAddress: await getAddressByIndex(addressIndex.account),
        // TODO: Calculate this properly in subsequent PR
        //       Asset Id should almost certainly be upenumbra,
        //       may need to indicate native denom in registry
        fee: {
          amount: {
            hi: 0n,
            lo: 0n,
          },
        },
      },
    ],
    source: getAddressIndex(assetIn.accountAddress),
  });
};

// Swap claims don't need authenticationData, so `witnessAndBuild` is used.
// This way it won't trigger a second, unnecessary approval popup.
// @see https://protocol.penumbra.zone/main/zswap/swap.html#claiming-swap-outputs
export const issueSwapClaim = async (swapCommitment: StateCommitment) => {
  const req = new TransactionPlannerRequest({ swapClaims: [{ swapCommitment }] });
  await planBuildBroadcast('swapClaim', req, { skipAuth: true });
};

/*
  Price impact is the change in price as a consequence of the trade's size. In SwapExecution, the \
  first trace in the array is the best execution for the swap. To calculate price impact, take
  the price of the trade and see the % diff off the best execution trace.
 */
const calculatePriceImpact = (swapExec?: SwapExecution): number | undefined => {
  if (!swapExec?.traces.length || !swapExec.output || !swapExec.input) return undefined;

  // Get the price of the estimate for the swap total
  const inputAmount = getAmountFromValue(swapExec.input);
  const outputAmount = getAmountFromValue(swapExec.output);
  const swapEstimatePrice = divideAmounts(outputAmount, inputAmount);

  // Get the price in the best execution trace
  const inputAssetId = getAssetIdFromValue(swapExec.input);
  const outputAssetId = getAssetIdFromValue(swapExec.output);
  const bestTrace = swapExec.traces[0]!;
  const bestInputAmount = getMatchingAmount(bestTrace.value, inputAssetId);
  const bestOutputAmount = getMatchingAmount(bestTrace.value, outputAssetId);
  const bestTraceEstimatedPrice = divideAmounts(bestOutputAmount, bestInputAmount);

  // Difference = (priceB - priceA) / priceA
  const percentDifference = swapEstimatePrice
    .minus(bestTraceEstimatedPrice)
    .div(bestTraceEstimatedPrice);

  return percentDifference.toNumber();
};

const getMatchingAmount = (values: Value[], toMatch: AssetId): Amount => {
  const match = values.find(v => toMatch.equals(v.assetId));
  if (!match?.amount) throw new Error('No match in values array found');

  return match.amount;
};

export const swapValidationErrors = ({ swap }: AllSlices) => {
  return {
    assetInErr: !swap.assetIn,
    assetOutErr: !swap.assetOut,
    amountErr: (swap.assetIn && amountMoreThanBalance(swap.assetIn, swap.amount)) ?? false,
  };
};

export const swapSelector = (state: AllSlices) => state.swap;
