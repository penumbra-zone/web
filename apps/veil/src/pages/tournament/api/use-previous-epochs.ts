import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DUMMY_UM_METADATA, DUMMY_USDC_METADATA, DUMMY_VALUE_VIEW } from './dummy';
import { LQTVote } from './use-voting-rewards';
import { apiFetch } from '@/shared/utils/api-fetch';
import type { PreviousEpochsApiResponse, PreviousEpochsRequest } from '../server/previous-epochs';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

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

const DUMMY_PREVIOUS_EPOCHS: Partial<EpochVote>[] = Array.from({ length: 55 }, (_, i) => ({
  epoch: i + 1,
  lpReward: DUMMY_VALUE_VIEW,
  votingReward: DUMMY_VALUE_VIEW,
  votes: [
    {
      percent: Math.floor(Math.random() * 100 + 1),
      asset: Math.random() > 0.5 ? DUMMY_UM_METADATA : DUMMY_USDC_METADATA,
    },
    {
      percent: Math.floor(Math.random() * 100 + 1),
      asset: Math.random() > 0.5 ? DUMMY_UM_METADATA : DUMMY_USDC_METADATA,
    },
    {
      percent: Math.floor(Math.random() * 100 + 1),
      asset: Math.random() > 0.5 ? DUMMY_UM_METADATA : DUMMY_USDC_METADATA,
    },
    {
      percent: Math.floor(Math.random() * 100 + 1),
      asset: Math.random() > 0.5 ? DUMMY_UM_METADATA : DUMMY_USDC_METADATA,
    },
    {
      percent: Math.floor(Math.random() * 100 + 1),
      asset: Math.random() > 0.5 ? DUMMY_UM_METADATA : DUMMY_USDC_METADATA,
    },
  ],
}));

const addSortToEpochVotes = (epochVote: Partial<EpochVote>): EpochVote => {
  const sortedVotes = [...(epochVote.votes ?? [])].sort((a, b) => a.percent - b.percent);
  const lpAmount = getAmount.optional(epochVote.lpReward);
  const votingAmount = getAmount.optional(epochVote.votingReward);

  return {
    ...epochVote,
    epoch: epochVote.epoch ?? 0,
    votes: sortedVotes,
    sort: {
      epoch: epochVote.epoch ?? 0,
      lpReward: lpAmount ? Number(joinLoHiAmount(lpAmount)) : 0,
      votingReward: votingAmount ? Number(joinLoHiAmount(votingAmount)) : 0,
    },
  };
};

export const usePreviousEpochs = (
  connected: boolean,
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  address?: string,
  sortKey?: keyof Required<EpochVote>['sort'] | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery<EpochVote[]>({
    queryKey: ['previous-epochs', connected, page, limit, sortKey, sortDirection, address],
    queryFn: async () => {
      const data = await apiFetch<PreviousEpochsApiResponse>('/api/tournament/previous-epochs', {
        limit,
        page,
        address,
        sortKey,
        sortDirection,
      } satisfies Partial<PreviousEpochsRequest>);
      console.log('DATA', data);

      // TODO: use backend API to fetch, filter, and sort previous epochs
      return new Promise(resolve => {
        setTimeout(() => {
          const data = DUMMY_PREVIOUS_EPOCHS;
          const mapped = data.map(addSortToEpochVotes);
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
    total: DUMMY_PREVIOUS_EPOCHS.length,
  };
};
