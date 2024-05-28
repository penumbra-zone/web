import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SliceCreator } from '../..';
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
  loadAuctionInfos: (queryLatestState?: boolean) => Promise<void>;
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
  auctionInfos: AuctionInfo[];
  loadAuctionInfosAbortController?: AbortController;
  metadataByAssetId: Record<string, Metadata>;
  filter: Filter;
  estimateLoading: boolean;
  estimatedOutput?: Amount;
}

export type DutchAuctionSlice = Actions & State;

const INITIAL_STATE: State = {
  minOutput: '1',
  maxOutput: '1000',
  txInProgress: false,
  auctionInfos: [],
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
      void get().swap.dutchAuction.loadAuctionInfos();
    } finally {
      set(state => {
        state.swap.dutchAuction.txInProgress = false;
      });
    }
  },

  loadAuctionInfos: async (queryLatestState = false) => {
    get().swap.dutchAuction.loadAuctionInfosAbortController?.abort();
    const newAbortController = new AbortController();

    set(({ swap }) => {
      swap.dutchAuction.auctionInfos = [];
      swap.dutchAuction.loadAuctionInfosAbortController = newAbortController;
    });

    for await (const response of viewClient.auctions(
      { queryLatestState, includeInactive: true },
      /**
       * Weirdly, just passing the newAbortController.signal here doesn't seem to
       * have any effect, despite the ConnectRPC docs saying that it should
       * work. I still left this line in, though, since it seems right and
       * perhaps will be fixed in a later ConnectRPC release. But in the
       * meantime, returning early from the `for` loop below fixes this issue.
       *
       * @see https://connectrpc.com/docs/web/cancellation-and-timeouts/
       */
      { signal: newAbortController.signal },
    )) {
      if (newAbortController.signal.aborted) return;
      if (!response.auction || !response.id) continue;

      const auction = DutchAuction.fromBinary(response.auction.value);
      const auctions = [...get().swap.dutchAuction.auctionInfos, { id: response.id, auction }];

      void get().swap.dutchAuction.loadMetadata(auction.description?.input?.assetId);
      void get().swap.dutchAuction.loadMetadata(auction.description?.outputId);

      set(state => {
        state.swap.dutchAuction.auctionInfos = auctions;
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
    void get().swap.dutchAuction.loadAuctionInfos();
  },

  withdraw: async (auctionId, currentSeqNum) => {
    const req = new TransactionPlannerRequest({
      dutchAuctionWithdrawActions: [{ auctionId, seq: currentSeqNum + 1n }],
    });
    await planBuildBroadcast('dutchAuctionWithdraw', req);
    void get().swap.dutchAuction.loadAuctionInfos();
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
