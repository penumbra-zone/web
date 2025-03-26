import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { connectionStore } from '@/shared/model/connection';
import { DUMMY_VALUE_VIEW, DUMMY_UM_METADATA, DUMMY_USDC_METADATA } from './dummy';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface VotingReward {
  epoch: number;
  reward: ValueView;
  vote: {
    percent: number;
    asset: Metadata;
  };
  sort?: {
    epoch: number;
    reward: number;
  };
}

const DUMMY_VOTING_REWARDS: VotingReward[] = Array.from({ length: 55 }, (_, i) => ({
  epoch: i + 1,
  reward: DUMMY_VALUE_VIEW,
  vote: {
    percent: Math.floor(Math.random() * 100 + 1),
    asset: Math.random() > 0.5 ? DUMMY_UM_METADATA : DUMMY_USDC_METADATA,
  },
}));

const addSortToRewards = (reward: VotingReward): Required<VotingReward> => {
  const amount = getAmount.optional(reward.reward);
  return {
    ...reward,
    sort: {
      epoch: reward.epoch,
      reward: amount ? Number(joinLoHiAmount(amount)) : 0,
    },
  };
};

export const useVotingRewards = (
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: keyof Required<VotingReward>['sort'] | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery<Required<VotingReward>[]>({
    queryKey: ['my-voting-rewards', page, limit, sortKey, sortDirection],
    enabled: connectionStore.connected,
    queryFn: async () => {
      // TODO: use backend API to fetch, filter, and sort rewards
      return new Promise(resolve => {
        setTimeout(() => {
          const data = DUMMY_VOTING_REWARDS;
          const mapped = data.map(addSortToRewards);
          const sorted =
            sortKey && sortDirection ? orderBy(mapped, `sort.${sortKey}`, sortDirection) : mapped;
          const limited = sorted.slice(limit * (page - 1), limit * page);
          resolve(limited);
        }, 1000);
      });
    },
  });

  return {
    query,
    total: DUMMY_VOTING_REWARDS.length,
  };
};
