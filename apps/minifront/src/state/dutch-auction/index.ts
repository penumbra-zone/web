import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SliceCreator } from '..';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { planBuildBroadcast } from '../helpers';
import { assembleRequest } from './assemble-request';
import { DurationOption } from './constants';

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
});
