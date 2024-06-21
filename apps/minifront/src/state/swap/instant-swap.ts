import { AllSlices, SliceCreator } from '..';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { isValidAmount, planBuildBroadcast } from '../helpers';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BigNumber } from 'bignumber.js';
import { getAddressByIndex } from '../../fetchers/address';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { errorToast } from '@repo/ui/lib/toast/presets';
import {
  SwapExecution,
  SwapExecution_Trace,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { viewClient } from '../../clients';
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
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { SwapSlice } from '.';
import { sendSimulateTradeRequest } from './helpers';

const getMetadataByAssetId = async (
  traces: SwapExecution_Trace[] = [],
): Promise<Record<string, Metadata>> => {
  const map: Record<string, Metadata> = {};

  const promises = traces.flatMap(trace =>
    trace.value.map(async value => {
      if (!value.assetId || map[bech32mAssetId(value.assetId)]) return;

      const { denomMetadata } = await viewClient.assetMetadataById({ assetId: value.assetId });

      if (denomMetadata) {
        map[bech32mAssetId(value.assetId)] = denomMetadata;
      }
    }),
  );

  await Promise.all(promises);

  return map;
};

export interface SimulateSwapResult {
  output: ValueView;
  unfilled: ValueView;
  priceImpact: number | undefined;
  traces?: SwapExecution_Trace[];
  metadataByAssetId: Record<string, Metadata>;
}

interface Actions {
  initiateSwapTx: () => Promise<void>;
  simulateSwap: () => Promise<void>;
  reset: VoidFunction;
}

interface State {
  txInProgress: boolean;
  simulateSwapResult?: SimulateSwapResult;
  simulateSwapLoading: boolean;
}

export type InstantSwapSlice = Actions & State;

const INITIAL_STATE: State = {
  txInProgress: false,
  simulateSwapLoading: false,
  simulateSwapResult: undefined,
};

export const createInstantSwapSlice = (): SliceCreator<InstantSwapSlice> => (set, get) => {
  return {
    ...INITIAL_STATE,
    simulateSwap: async () => {
      try {
        set(({ swap }) => {
          swap.instantSwap.simulateSwapLoading = true;
        });

        const res = await sendSimulateTradeRequest(get().swap);

        const output = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: res.output?.output?.amount,
              metadata: get().swap.assetOut,
            },
          },
        });

        const unfilled = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: res.unfilled?.amount,
              metadata: getMetadata(get().swap.assetIn?.balanceView),
            },
          },
        });

        const metadataByAssetId = await getMetadataByAssetId(res.output?.traces);

        set(({ swap }) => {
          swap.instantSwap.simulateSwapResult = {
            output,
            unfilled,
            priceImpact: calculatePriceImpact(res.output),
            traces: res.output?.traces,
            metadataByAssetId,
          };
        });
      } catch (e) {
        errorToast(e, 'Error estimating swap').render();
      } finally {
        set(({ swap }) => {
          swap.instantSwap.simulateSwapLoading = false;
        });
      }
    },
    initiateSwapTx: async () => {
      set(state => {
        state.swap.instantSwap.txInProgress = true;
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
          state.swap.instantSwap.txInProgress = false;
        });
      }
    },
    reset: () => {
      set(state => {
        state.swap.instantSwap = {
          ...state.swap.instantSwap,
          ...INITIAL_STATE,
        };
      });
    },
  };
};

const assembleSwapRequest = async ({
  assetIn,
  amount,
  assetOut,
}: Pick<SwapSlice, 'assetIn' | 'assetOut' | 'amount'>) => {
  if (!assetIn) throw new Error('`assetIn` is undefined');
  if (!assetOut) throw new Error('`assetOut` is undefined');
  if (!isValidAmount(amount, assetIn)) throw new Error('Invalid amount');

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

export const instantSwapSubmitButtonDisabledSelector = (state: AllSlices) =>
  state.swap.duration === 'instant' && state.swap.instantSwap.txInProgress;
