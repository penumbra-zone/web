import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import {
  LpLeaderboardRequest,
  LpLeaderboardApiResponse,
  LpLeaderboardSortKey,
  LpLeaderboardSortDirection,
  LqtLp,
  LpLeaderboard,
  LpLeaderboardResponse,
} from '@/entities/leaderboard/api/utils';
import { penumbra } from '@/shared/const/penumbra';
import { DexService } from '@penumbra-zone/protobuf';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { statusStore } from '@/shared/model/status';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';

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

export const useLpLeaderboard = ({
  epoch,
  page,
  limit,
  sortKey,
  sortDirection,
  isActive,
}: {
  epoch: number | undefined;
  page: number;
  limit: number;
  sortKey?: LpLeaderboardSortKey | '';
  sortDirection?: LpLeaderboardSortDirection;
  isActive: boolean;
}): UseQueryResult<LpLeaderboardResponse> => {
  const { latestKnownBlockHeight } = statusStore;
  const { epoch: currentEpoch } = useCurrentEpoch();

  const query = useQuery({
    queryKey: [
      'lp-leaderboard',
      epoch,
      page,
      limit,
      sortKey,
      sortDirection,
      ...(epoch === currentEpoch ? [Number(latestKnownBlockHeight)] : []),
    ],
    staleTime: Infinity,
    queryFn: async () => {
      return apiPostFetch<LpLeaderboardApiResponse>('/api/tournament/lp-leaderboard', {
        epoch,
        page,
        limit,
        sortKey,
        sortDirection,
      } as LpLeaderboardRequest).then(async resp => ({
        ...resp,
        data: await enrichLpLeaderboards(resp.data),
      }));
    },
    enabled:
      typeof epoch === 'number' &&
      isActive &&
      (epoch === currentEpoch ? !!latestKnownBlockHeight : true),
  });

  return query;
};
