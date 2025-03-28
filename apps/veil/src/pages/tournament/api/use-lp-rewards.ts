import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { connectionStore } from '@/shared/model/connection';
import { DUMMY_VALUE_VIEW, DUMMY_POSITION_ID } from './dummy';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface Reward {
  epoch: number;
  positionId: PositionId;
  reward: ValueView;
  isWithdrawn: boolean;
  // Easily-sortable fields for the rewards table
  sort?: {
    positionId: string;
    epoch: number;
    reward: number;
  };
}

const DUMMY_LP_REWARDS: Reward[] = Array.from({ length: 55 }, (_, i) => {
  return {
    epoch: i + 1,
    positionId: new PositionId({
      inner: new Uint8Array([...DUMMY_POSITION_ID.inner.slice(0, -1), i + 1]),
    }),
    isWithdrawn: i % 2 === 0,
    reward: DUMMY_VALUE_VIEW,
  };
});

const addSortToRewards = (reward: Reward): Required<Reward> => {
  const amount = getAmount.optional(reward.reward);
  return {
    ...reward,
    sort: {
      epoch: reward.epoch,
      positionId: bech32mPositionId(reward.positionId),
      reward: amount ? Number(joinLoHiAmount(amount)) : 0,
    },
  };
};

export const useLpRewards = (
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: keyof Required<Reward>['sort'] | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery<Required<Reward>[]>({
    queryKey: ['my-lp-rewards', page, limit, sortKey, sortDirection],
    enabled: connectionStore.connected,
    queryFn: async () => {
      // TODO: use backend API to fetch, filter, and sort rewards
      return new Promise(resolve => {
        setTimeout(() => {
          const data = DUMMY_LP_REWARDS;
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
    total: DUMMY_LP_REWARDS.length,
  };
};
