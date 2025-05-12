import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  Position,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { apiPostFetch } from '@/shared/utils/api-fetch';

import {
  LpRewardsRequest,
  LpRewardsApiResponse,
  LpRewardsSortKey,
  LpRewardsSortDirection,
  LqtLp,
} from '@/pages/tournament/server/lp-rewards';
import { penumbra } from '@/shared/const/penumbra';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { DexService } from '@penumbra-zone/protobuf';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface LpReward extends LqtLp {
  position: Position;
  isWithdrawn: boolean;
  isWithdrawable: boolean;
}

export interface LpRewardsResponse extends LpRewardsApiResponse {
  data: LpReward[];
  total: number;
}

// get the position state for each lp reward
async function enrichLpRewards(data: LqtLp[]): Promise<LpReward[]> {
  if (data.length === 0) {
    return [];
  }

  const positionIds = data.map(lp => lp.positionId);
  const positionsRes = await Array.fromAsync(
    penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
  );
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  return data.map((lp, index) => ({
    ...lp,
    position: positions[index] as unknown as Position,
    isWithdrawn: positions[index]?.state?.state === PositionState_PositionStateEnum.WITHDRAWN,
    isWithdrawable: positions[index]?.state?.state === PositionState_PositionStateEnum.CLOSED,
  }));
}

export const useLpRewards = (
  subaccount: number,
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: LpRewardsSortKey | '',
  sortDirection?: LpRewardsSortDirection,
): UseQueryResult<LpRewardsResponse> => {
  const { data: positionIds } = useQuery({
    queryKey: ['owned-positions', subaccount],
    queryFn: async () => {
      const ids: string[] = [];

      const result = penumbra.service(ViewService).ownedPositionIds({
        subaccount: new AddressIndex({ account: subaccount }),
      });
      for await (const item of result) {
        const id = item.positionId;
        if (id) {
          ids.push(bech32mPositionId(id));
        }
      }

      return ids;
    },
  });

  const query = useQuery({
    queryKey: ['lp-rewards', ...(positionIds ?? []), page, limit, sortKey, sortDirection],
    // NOTE(@cronokirby): This is not quite correct, because a position may receive rewards at any time,
    // but it's fine to let people reload the page to see that.
    staleTime: Infinity,
    queryFn: async () => {
      return apiPostFetch<LpRewardsApiResponse>('/api/tournament/lp-rewards', {
        positionIds,
        page,
        limit,
        sortKey,
        sortDirection,
      } as LpRewardsRequest).then(async resp => ({
        ...resp,
        data: resp.data.length ? await enrichLpRewards(resp.data) : [],
      }));
    },
    // Also handles the case where we have an empty array
    enabled: !!positionIds,
  });

  return query;
};
