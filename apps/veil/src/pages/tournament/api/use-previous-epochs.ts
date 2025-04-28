import { useQuery } from '@tanstack/react-query';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { apiFetch } from '@/shared/utils/api-fetch';
import type { PreviousEpochsApiResponse, PreviousEpochsRequest } from '../server/previous-epochs';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface LQTVote {
  percent: number;
  asset: Metadata;
}

export interface EpochVote {
  epoch: number;
  votes: LQTVote[];
  lpReward?: ValueView;
  votingReward?: ValueView;
  sort: {
    epoch: number;
    lpReward: number;
    votingReward: number;
  };
}

export const usePreviousEpochs = (
  connected: boolean,
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: keyof Required<EpochVote>['sort'] | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery({
    queryKey: ['previous-epochs', connected, page, limit, sortKey, sortDirection],
    queryFn: async () => {
      return apiFetch<PreviousEpochsApiResponse>('/api/tournament/previous-epochs', {
        limit,
        page,
        sortKey,
        sortDirection,
      } satisfies Partial<PreviousEpochsRequest>);
    },
  });

  return {
    query,
    data: query.data?.data,
    total: query.data?.total ?? 0,
  };
};
