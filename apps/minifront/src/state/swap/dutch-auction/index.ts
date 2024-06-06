import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SliceCreator, useStore } from '../..';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { planBuildBroadcast } from '../../helpers';
import { assembleScheduleRequest } from './assemble-schedule-request';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { viewClient } from '../../../clients';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { sendSimulateTradeRequest } from '../helpers';
import { fromBaseUnitAmount, multiplyAmountByNumber } from '@penumbra-zone/types/amount';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { errorToast } from '@penumbra-zone/ui/lib/toast/presets';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { getAuctionInfos } from '../../../fetchers/auction-infos';

/**
 * Multipliers to use with the output of the swap simulation, to determine
 * reasonable maximum and minimimum outputs for the auction.
 */
const MAX_OUTPUT_ESTIMATE_MULTIPLIER = 2;
const MIN_OUTPUT_ESTIMATE_MULTIPLIER = 0.5;

export interface AuctionInfo {
  id: AuctionId;
  auction: DutchAuction;
}

export type Filter = 'active' | 'upcoming' | 'all';

interface Actions {
  setMinOutput: (minOutput: string) => void;
  setMaxOutput: (maxOutput: string) => void;
  onSubmit: () => Promise<void>;
  loadMetadata: (assetId?: AssetId) => Promise<void>;
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
  auctionInfos: ZQueryState<AuctionInfo[]>;
  loadAuctionInfosAbortController?: AbortController;
  metadataByAssetId: Record<string, Metadata>;
  filter: Filter;
  estimateLoading: boolean;
  estimatedOutput?: Amount;
}

export const { auctionInfos, useAuctionInfos, useRevalidateAuctionInfos } = createZQuery({
  name: 'auctionInfos',
  fetch: getAuctionInfos,
  stream: true,
  getUseStore: () => useStore,
  set: newValue => {
    useStore.setState(state => {
      state.swap.dutchAuction.auctionInfos = newValue;
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
  metadataByAssetId: {},
  filter: 'active',
  estimateLoading: false,
  estimatedOutput: undefined,
};

export const createDutchAuctionSlice = (): SliceCreator<DutchAuctionSlice> => (set, get) => ({
  ...INITIAL_STATE,
  setMinOutput: minOutput => {
    set(({ swap }) => {
      swap.dutchAuction.minOutput = minOutput;
      swap.dutchAuction.estimatedOutput = undefined;
    });
  },
  setMaxOutput: maxOutput => {
    set(({ swap }) => {
      swap.dutchAuction.maxOutput = maxOutput;
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

  loadMetadata: async assetId => {
    if (!assetId || get().swap.dutchAuction.metadataByAssetId[bech32mAssetId(assetId)]) return;

    const { denomMetadata } = await viewClient.assetMetadataById({ assetId });

    if (denomMetadata) {
      set(({ swap }) => {
        swap.dutchAuction.metadataByAssetId[bech32mAssetId(assetId)] = denomMetadata;
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

        // preserve loaded auctions and metadata:
        auctionInfos: swap.dutchAuction.auctionInfos,
        metadataByAssetId: swap.dutchAuction.metadataByAssetId,

        // preserve filter:
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
          swap.dutchAuction.maxOutput = fromBaseUnitAmount(
            multiplyAmountByNumber(estimatedOutputAmount, MAX_OUTPUT_ESTIMATE_MULTIPLIER),
            exponent,
          ).toString();
          swap.dutchAuction.minOutput = fromBaseUnitAmount(
            multiplyAmountByNumber(estimatedOutputAmount, MIN_OUTPUT_ESTIMATE_MULTIPLIER),
            exponent,
          ).toString();
          swap.dutchAuction.estimatedOutput = estimatedOutputAmount;
        });
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
