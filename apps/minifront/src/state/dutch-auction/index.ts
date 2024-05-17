import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SliceCreator } from '..';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { planBuildBroadcast } from '../helpers';
import { assembleScheduleRequest } from './assemble-schedule-request';
import { DurationOption } from './constants';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { viewClient } from '../../clients';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';

interface AuctionInfo {
  id: AuctionId;
  auction: DutchAuction;
}

export interface DutchAuctionSlice {
  balancesResponses: BalancesResponse[];
  setBalancesResponses: (balancesResponses: BalancesResponse[]) => void;
  assetIn?: BalancesResponse;
  setAssetIn: (assetIn: BalancesResponse) => void;
  assetOut?: Metadata;
  setAssetOut: (assetOut: Metadata) => void;
  amount: string;
  setAmount: (amount: string) => void;
  duration: DurationOption;
  setDuration: (duration: DurationOption) => void;
  minOutput: string;
  setMinOutput: (minOutput: string) => void;
  maxOutput: string;
  setMaxOutput: (maxOutput: string) => void;
  onSubmit: () => Promise<void>;
  txInProgress: boolean;
  auctionInfos: AuctionInfo[];
  loadAuctionInfos: (queryLatestState?: boolean) => Promise<void>;
  loadAuctionInfosAbortController?: AbortController;
  loadMetadata: (assetId?: AssetId) => Promise<void>;
  metadataByAssetId: Record<string, Metadata>;
  endAuction: (auctionId: AuctionId) => Promise<void>;
  withdraw: (auctionId: AuctionId, currentSeqNum: bigint) => Promise<void>;
}

export const createDutchAuctionSlice = (): SliceCreator<DutchAuctionSlice> => (set, get) => ({
  balancesResponses: [],
  setBalancesResponses: balancesResponses => {
    set(state => {
      state.dutchAuction.balancesResponses = balancesResponses;
    });
  },

  assetIn: undefined,
  setAssetIn: assetIn => {
    set(state => {
      state.dutchAuction.assetIn = assetIn;
    });
  },

  assetOut: undefined,
  setAssetOut: assetOut => {
    set(state => {
      state.dutchAuction.assetOut = assetOut;
    });
  },

  amount: '',
  setAmount: amount => {
    set(state => {
      state.dutchAuction.amount = amount;
    });
  },

  duration: '10min',
  setDuration: duration => {
    set(state => {
      state.dutchAuction.duration = duration;
    });
  },

  minOutput: '1',
  setMinOutput: minOutput => {
    set(state => {
      state.dutchAuction.minOutput = minOutput;
    });
  },
  maxOutput: '1000',
  setMaxOutput: maxOutput => {
    set(state => {
      state.dutchAuction.maxOutput = maxOutput;
    });
  },

  onSubmit: async () => {
    set(state => {
      state.dutchAuction.txInProgress = true;
    });

    try {
      const req = await assembleScheduleRequest(get().dutchAuction);
      await planBuildBroadcast('dutchAuctionSchedule', req);

      get().dutchAuction.setAmount('');
      void get().dutchAuction.loadAuctionInfos();
    } finally {
      set(state => {
        state.dutchAuction.txInProgress = false;
      });
    }
  },

  txInProgress: false,

  auctionInfos: [],
  loadAuctionInfos: async (queryLatestState = false) => {
    get().dutchAuction.loadAuctionInfosAbortController?.abort();
    const newAbortController = new AbortController();

    set(state => {
      state.dutchAuction.auctionInfos = [];
      state.dutchAuction.loadAuctionInfosAbortController = newAbortController;
    });

    /** @todo: Sort by... something? */
    for await (const response of viewClient.auctions(
      { queryLatestState, includeInactive: true },
      { signal: newAbortController.signal },
    )) {
      if (newAbortController.signal.aborted) return;
      if (!response.auction || !response.id) continue;

      const auction = DutchAuction.fromBinary(response.auction.value);
      const auctions = [...get().dutchAuction.auctionInfos, { id: response.id, auction }];

      void get().dutchAuction.loadMetadata(auction.description?.input?.assetId);
      void get().dutchAuction.loadMetadata(auction.description?.outputId);

      set(state => {
        state.dutchAuction.auctionInfos = auctions;
      });
    }
  },

  loadMetadata: async assetId => {
    if (!assetId) return;

    const { denomMetadata } = await viewClient.assetMetadataById({ assetId });

    if (denomMetadata) {
      set(state => {
        state.dutchAuction.metadataByAssetId[bech32mAssetId(assetId)] = denomMetadata;
      });
    }
  },

  metadataByAssetId: {},

  endAuction: async auctionId => {
    const req = new TransactionPlannerRequest({ dutchAuctionEndActions: [{ auctionId }] });
    await planBuildBroadcast('dutchAuctionEnd', req);
    void get().dutchAuction.loadAuctionInfos();
  },

  withdraw: async (auctionId, currentSeqNum) => {
    const req = new TransactionPlannerRequest({
      dutchAuctionWithdrawActions: [{ auctionId, seq: currentSeqNum + 1n }],
    });
    await planBuildBroadcast('dutchAuctionWithdraw', req);
    void get().dutchAuction.loadAuctionInfos();
  },
});
