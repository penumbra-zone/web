import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { DUMMY_UM_METADATA, DUMMY_USDC_METADATA } from './dummy';
import { LQTVote } from './use-voting-rewards';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface EpochVote {
  epoch: number;
  votes: LQTVote[];
  sort?: {
    epoch: number;
  };
}

const DUMMY_PREVIOUS_EPOCHS: EpochVote[] = Array.from({ length: 55 }, (_, i) => ({
  epoch: i + 1,
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

const addSortToEpochVotes = (epochVote: EpochVote): Required<EpochVote> => {
  const sortedVotes = [...epochVote.votes].sort((a, b) => a.percent - b.percent);
  return {
    ...epochVote,
    votes: sortedVotes,
    sort: {
      epoch: epochVote.epoch,
    },
  };
};

export const usePreviousEpochs = (
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: keyof Required<EpochVote>['sort'] | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery<Required<EpochVote>[]>({
    queryKey: ['previous-epochs', page, limit, sortKey, sortDirection],
    enabled: connectionStore.connected,
    queryFn: async () => {
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
