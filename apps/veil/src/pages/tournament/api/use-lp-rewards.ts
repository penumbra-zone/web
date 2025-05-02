import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { apiPostFetch } from '@/shared/utils/api-fetch';

import {
  LpRewardsRequest,
  LpRewardsApiResponse,
  LpRewardsSortKey,
  LpRewardsSortDirection,
} from '@/pages/tournament/server/lp-rewards';
import { penumbra } from '@/shared/const/penumbra';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { useEffect, useState } from 'react';
import { DexService } from '@penumbra-zone/protobuf';

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

export interface LpRewardsResponse extends LpRewardsApiResponse {
  data: (Required<Reward> & { position: Position | undefined; isWithdrawn: boolean })[];
  total: number;
}

// get the position state for each lp reward
async function enrichLpRewards(
  data: Required<Reward>[],
): Promise<(Required<Reward> & { position: Position | undefined })[]> {
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
    position: positions[index],
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
  const [positionIds, setPositionIds] = useState<string[]>([]);

  useEffect(() => {
    void Array.fromAsync(
      penumbra.service(ViewService).ownedPositionIds({
        subaccount: new AddressIndex({ account: subaccount }),
      }),
    ).then(ownedRes => {
      const positionIds = ownedRes
        .map(r => r.positionId && bech32mPositionId(r.positionId))
        .filter(Boolean) as string[];
      setPositionIds(positionIds);
    });
  }, [subaccount]);

  const query = useQuery<Required<Reward>[]>({
    queryKey: ['lp-rewards', ...positionIds, page, limit, sortKey, sortDirection],
    staleTime: Infinity,
    queryFn: async () => {
      return apiPostFetch<LpRewardsApiResponse>('/api/tournament/lp-rewards', {
        positionIds,
        page,
        limit,
        sortKey,
        sortDirection,
      } satisfies LpRewardsRequest).then(async resp => ({
        ...resp,
        data: resp.data ? await enrichLpRewards(resp.data) : [],
      }));
    },
    enabled: positionIds.length > 0,
  });

  return query;
};
