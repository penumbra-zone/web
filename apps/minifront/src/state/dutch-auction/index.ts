import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SliceCreator } from '..';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { planBuildBroadcast } from '../helpers';
import { assembleRequest } from './assemble-request';
import { DurationOption } from './constants';
import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { viewClient } from '../../clients';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';

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
  auctions: DutchAuction[];
  loadAuctions: () => Promise<void>;
  loadMetadata: (assetId?: AssetId) => Promise<void>;
  metadataByAssetId: Record<string, Metadata>;
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
      const req = await assembleRequest(get().dutchAuction);
      await planBuildBroadcast('dutchAuctionSchedule', req);

      get().dutchAuction.setAmount('');
    } finally {
      set(state => {
        state.dutchAuction.txInProgress = false;
      });
    }
  },

  txInProgress: false,

  auctions: [],
  loadAuctions: async () => {
    set(state => {
      state.dutchAuction.auctions = [];
    });

    for await (const response of viewClient.auctions({})) {
      if (!response.auction) continue;
      const auction = DutchAuction.fromBinary(response.auction.value);
      const auctions = [...get().dutchAuction.auctions, auction];

      void get().dutchAuction.loadMetadata(auction.description?.input?.assetId);
      void get().dutchAuction.loadMetadata(auction.description?.outputId);

      set(state => {
        state.dutchAuction.auctions = auctions;
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
});
