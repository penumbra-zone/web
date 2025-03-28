import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { DUMMY_VALUE_VIEW, DUMMY_ADDRESS_VIEW_DECODED, DUMMY_ADDRESS_VIEW_OPAQUE } from './dummy';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface DelegatorLeaderboardInfo {
  place: number;
  address: AddressView;
  rounds: number;
  streak: number;
  reward: ValueView;
  sort?: {
    place: number;
    rounds: number;
    streak: number;
    reward: number;
  };
}

const DUMMY_DELEGATOR_LEADERBOARD_INFOS: DelegatorLeaderboardInfo[] = Array.from(
  { length: 55 },
  (_, i) => {
    return {
      place: i + 1,
      streak: Math.floor(Math.random() * 100 + 1),
      rounds: Math.floor(Math.random() * 50 + 1),
      address: Math.random() > 0.25 ? DUMMY_ADDRESS_VIEW_OPAQUE : DUMMY_ADDRESS_VIEW_DECODED,
      reward: DUMMY_VALUE_VIEW,
    };
  },
);

const addSortToLeaderboardInfo = (
  info: DelegatorLeaderboardInfo,
): Required<DelegatorLeaderboardInfo> => {
  const amount = getAmount.optional(info.reward);
  return {
    ...info,
    sort: {
      place: info.place,
      streak: info.streak,
      rounds: info.rounds,
      reward: amount ? Number(joinLoHiAmount(amount)) : 0,
    },
  };
};

export const useDelegatorLeaderboard = (
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: keyof Required<DelegatorLeaderboardInfo>['sort'] | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery<Required<DelegatorLeaderboardInfo>[]>({
    queryKey: ['delegator-leaderboard', page, limit, sortKey, sortDirection],
    queryFn: async () => {
      // TODO: use backend API to fetch, filter, and sort delegator leaderboard
      return new Promise(resolve => {
        setTimeout(() => {
          const data = DUMMY_DELEGATOR_LEADERBOARD_INFOS;
          const mapped = data.map(addSortToLeaderboardInfo);
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
    total: DUMMY_DELEGATOR_LEADERBOARD_INFOS.length,
  };
};
