import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { DUMMY_VALUE_VIEW, DUMMY_POSITION_ID } from './dummy';
import { apiFetch } from '@/shared/utils/api-fetch';

import {
  LpRewardsRequest,
  LpRewardsApiResponse,
  LpRewardsSortKey,
  LpRewardsSortDirection,
} from '@/shared/api/server/tournament/lp-rewards';

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

export const useLpRewards = (
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: LpRewardsSortKey | '',
  sortDirection?: LpRewardsSortDirection,
) => {
  const data = useQuery<Required<Reward>[]>({
    queryKey: ['my-lp-rewards', page, limit, sortKey, sortDirection],
    queryFn: async () => {
      return apiFetch<LpRewardsApiResponse>('/api/tournament/lp-rewards', {
        page,
        limit,
        sortKey,
        sortDirection,
      } satisfies Partial<LpRewardsRequest>);
    },
  });

  return data;
};
