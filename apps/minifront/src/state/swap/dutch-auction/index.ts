import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AllSlices, SliceCreator, useStore } from '../..';
import { planBuildBroadcast } from '../../helpers';
import { assembleScheduleRequest } from './assemble-schedule-request';
import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { sendSimulateTradeRequest } from '../helpers';
import { fromBaseUnitAmount, isZero, multiplyAmountByNumber } from '@penumbra-zone/types/amount';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { errorToast } from '@penumbra-zone/ui/lib/toast/presets';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { AuctionInfo, getAuctionInfos } from '../../../fetchers/auction-infos';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';

/**
 * Multipliers to use with the output of the swap simulation, to determine
 * reasonable maximum and minimimum outputs for the auction.
 */
const MAX_OUTPUT_ESTIMATE_MULTIPLIER = 2;
const MIN_OUTPUT_ESTIMATE_MULTIPLIER = 0.5;

/**
 * Penumbra core's built-in limit for an auction's output.
 *
 * @see https://github.com/penumbra-zone/web/issues/1224#issuecomment-2164419140
 */
export const OUTPUT_LIMIT = 2 ** 52 - 1;

export type Filter = 'active' | 'upcoming' | 'all';

interface Actions {
  setMinOutput: (minOutput: string) => void;
  setMaxOutput: (maxOutput: string) => void;
  onSubmit: () => Promise<void>;
  endAuction: (auctionId: AuctionId) => Promise<void>;
  withdraw: (auctionId: AuctionId, currentSeqNum: bigint) => Promise<void>;
  reset: VoidFunction;
  setFilter: (filter: Filter) => void;
  estimate: () => Promise<void>;
}

interface State {
  minOutput: string;
  maxOutput: string;
  txInProgress: boolean;
  auctionInfos: ZQueryState<AuctionInfo[], Parameters<typeof getAuctionInfos>>;
  filter: Filter;
  estimateLoading: boolean;
  estimatedOutput?: Amount;
}

export const { auctionInfos, useAuctionInfos, useRevalidateAuctionInfos } = createZQuery({
  name: 'auctionInfos',
  fetch: getAuctionInfos,
  stream: () => {
    // Keep track of which auction IDs have appeared in this stream, so that we
    // can discard any auctions from a previous stream once this stream has
    // finished.
    const auctionIdsToKeep = new Set<string>();

    return {
      onValue: (prevState: AuctionInfo[] | undefined = [], auctionInfo: AuctionInfo) => {
        auctionIdsToKeep.add(bech32mAuctionId(auctionInfo.id));

        const existingIndex = prevState.findIndex(({ id }) => id.equals(auctionInfo.id));

        // Update existing auctions in place, rather than appending duplicates.
        if (existingIndex >= 0) return prevState.toSpliced(existingIndex, 1, auctionInfo);
        else return [...prevState, auctionInfo];
      },

      onEnd: (prevState = []) =>
        // Discard any auctions from a previous stream.
        prevState.filter(auctionInfo => auctionIdsToKeep.has(bech32mAuctionId(auctionInfo.id))),
    };
  },
  getUseStore: () => useStore,
  set: setter => {
    const newState = setter(useStore.getState().swap.dutchAuction.auctionInfos);
    useStore.setState(state => {
      state.swap.dutchAuction.auctionInfos = newState;
    });
  },
  get: state => state.swap.dutchAuction.auctionInfos,
});

export type DutchAuctionSlice = Actions & State;

const INITIAL_STATE: State = {
  minOutput: '1',
  maxOutput: '1000',
  txInProgress: false,
  auctionInfos,
  filter: 'active',
  estimateLoading: false,
  estimatedOutput: undefined,
};

const getSmallestPossibleAmountAboveZero = (metadata?: Metadata): number =>
  metadata ? 1 / 10 ** getDisplayDenomExponent(metadata) : 0;

export const createDutchAuctionSlice = (): SliceCreator<DutchAuctionSlice> => (set, get) => ({
  ...INITIAL_STATE,
  setMinOutput: minOutput => {
    set(({ swap }) => {
      const minMinOutput = getSmallestPossibleAmountAboveZero(get().swap.assetOut);
      const exponent = getDisplayDenomExponent.optional()(get().swap.assetOut) ?? 0;
      const minOutputAsBaseUnit = Number(minOutput) * 10 ** exponent;
      const outputLimitAsDisplayUnit = (OUTPUT_LIMIT / 10 ** exponent).toString();

      if (minOutputAsBaseUnit > OUTPUT_LIMIT) {
        swap.dutchAuction.minOutput = outputLimitAsDisplayUnit;
      } else if (Number(minOutput) > 0) {
        swap.dutchAuction.minOutput = minOutput;
      } else {
        swap.dutchAuction.minOutput = minMinOutput.toString();
      }

      swap.dutchAuction.estimatedOutput = undefined;
    });
  },
  setMaxOutput: maxOutput => {
    set(({ swap }) => {
      const minMaxOutput = getSmallestPossibleAmountAboveZero(get().swap.assetOut);
      const exponent = getDisplayDenomExponent.optional()(get().swap.assetOut) ?? 0;
      const maxOutputAsBaseUnit = Number(maxOutput) * 10 ** exponent;
      const outputLimitAsDisplayUnit = (OUTPUT_LIMIT / 10 ** exponent).toString();

      if (maxOutputAsBaseUnit > OUTPUT_LIMIT) {
        swap.dutchAuction.maxOutput = outputLimitAsDisplayUnit;
      } else if (Number(maxOutput) > 0) {
        swap.dutchAuction.maxOutput = maxOutput;
      } else {
        swap.dutchAuction.maxOutput = minMaxOutput.toString();
      }

      swap.dutchAuction.estimatedOutput = undefined;
    });
  },

  onSubmit: async () => {
    set(({ swap }) => {
      swap.dutchAuction.txInProgress = true;
    });

    try {
      const req = await assembleScheduleRequest({
        ...get().swap.dutchAuction,
        amount: get().swap.amount,
        assetIn: get().swap.assetIn,
        assetOut: get().swap.assetOut,
        duration: get().swap.duration,
      });
      await planBuildBroadcast('dutchAuctionSchedule', req);

      get().swap.setAmount('');
      get().swap.dutchAuction.auctionInfos.revalidate();
    } finally {
      set(state => {
        state.swap.dutchAuction.txInProgress = false;
      });
    }
  },

  endAuction: async auctionId => {
    const req = new TransactionPlannerRequest({ dutchAuctionEndActions: [{ auctionId }] });
    await planBuildBroadcast('dutchAuctionEnd', req);
    get().swap.dutchAuction.auctionInfos.revalidate();
  },

  withdraw: async (auctionId, currentSeqNum) => {
    const req = new TransactionPlannerRequest({
      dutchAuctionWithdrawActions: [{ auctionId, seq: currentSeqNum + 1n }],
    });
    await planBuildBroadcast('dutchAuctionWithdraw', req);
    get().swap.dutchAuction.auctionInfos.revalidate();
  },

  reset: () =>
    set(({ swap }) => {
      swap.dutchAuction = {
        ...swap.dutchAuction,
        ...INITIAL_STATE,

        // preserve loaded auctions and filter:
        auctionInfos: swap.dutchAuction.auctionInfos,
        filter: swap.dutchAuction.filter,
      };
    }),

  setFilter: filter => {
    set(({ swap }) => {
      swap.dutchAuction.filter = filter;
    });
  },

  estimate: async () => {
    try {
      set(({ swap }) => {
        swap.dutchAuction.estimateLoading = true;
      });

      const res = await sendSimulateTradeRequest(get().swap);
      const estimatedOutputAmount = res.output?.output?.amount;

      if (estimatedOutputAmount) {
        const assetOut = get().swap.assetOut;
        const exponent = getDisplayDenomExponent(assetOut);

        set(({ swap }) => {
          swap.dutchAuction.estimatedOutput = estimatedOutputAmount;
        });

        if (!isZero(estimatedOutputAmount)) {
          set(({ swap }) => {
            swap.dutchAuction.maxOutput = fromBaseUnitAmount(
              multiplyAmountByNumber(estimatedOutputAmount, MAX_OUTPUT_ESTIMATE_MULTIPLIER),
              exponent,
            ).toString();
            swap.dutchAuction.minOutput = fromBaseUnitAmount(
              multiplyAmountByNumber(estimatedOutputAmount, MIN_OUTPUT_ESTIMATE_MULTIPLIER),
              exponent,
            ).toString();
          });
        }
      }
    } catch (e) {
      errorToast(e, 'Error estimating swap').render();
    } finally {
      set(({ swap }) => {
        swap.dutchAuction.estimateLoading = false;
      });
    }
  },
});

export const dutchAuctionSubmitButtonDisabledSelector = (state: AllSlices) =>
  state.swap.duration !== 'instant' &&
  (Number(state.swap.dutchAuction.minOutput) >= Number(state.swap.dutchAuction.maxOutput) ||
    state.swap.dutchAuction.txInProgress);
