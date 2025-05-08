import { useState, useEffect } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import {
  LpLeaderboardRequest,
  LpLeaderboardApiResponse,
  LpLeaderboardSortKey,
  LpLeaderboardSortDirection,
  LqtLp,
  LpLeaderboard,
  LpLeaderboardResponse,
} from './utils';
import { penumbra } from '@/shared/const/penumbra';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { DexService } from '@penumbra-zone/protobuf';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

// get the position state for each lp reward
async function enrichLpLeaderboards(data: LqtLp[]): Promise<LpLeaderboard[]> {
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
    positionIdString: bech32mPositionId(lp.positionId),
    position: positions[index] as unknown as Position,
  }));
}

export const useMyLpLeaderboard = ({
  subaccount,
  epoch,
  page,
  limit,
  sortKey,
  sortDirection,
}: {
  subaccount: number;
  epoch: number | undefined;
  page: number;
  limit: number;
  sortKey?: LpLeaderboardSortKey | '';
  sortDirection?: LpLeaderboardSortDirection;
}): UseQueryResult<LpLeaderboardResponse> => {
  const [positionIds, setPositionIds] = useState<string[]>([]);

  useEffect(() => {
    try {
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
    } catch (err) {
      console.error('Error fetching position ids', err);
    }
  }, [subaccount]);

  const query = useQuery({
    queryKey: ['my-lp-leaderboard', ...positionIds, epoch, page, limit, sortKey, sortDirection],
    staleTime: Infinity,
    queryFn: async () => {
      return apiPostFetch<LpLeaderboardApiResponse>('/api/tournament/lp-leaderboard', {
        positionIds,
        epoch,
        page,
        limit,
        sortKey,
        sortDirection,
      } as LpLeaderboardRequest).then(async resp => ({
        ...resp,
        data: resp.data.length ? await enrichLpLeaderboards(resp.data) : [],
      }));
    },
    enabled: typeof epoch === 'number' && positionIds.length > 0,
  });

  return query;
};
