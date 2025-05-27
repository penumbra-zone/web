import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import type {
  DelegatorHistorySortDirection,
  DelegatorHistorySortKey,
  TournamentDelegatorHistoryResponse,
  LqtDelegatorHistoryData,
} from '../server/delegator-history';
import { getIndexByAddress } from './use-index-by-address';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface PersonalRewardsData {
  data: LqtDelegatorHistoryData[];
  totalItems: number;
  totalRewards: number;
}

const fetchRewards = async (
  epochOrHeight: { type: 'epoch'; value: bigint } | { type: 'blockHeight'; value: bigint },
  sortKey: DelegatorHistorySortKey = 'epoch',
  sortDirection: DelegatorHistorySortDirection = 'desc',
  subaccount?: number,
): Promise<PersonalRewardsData[]> => {
  if (typeof subaccount === 'undefined') {
    return [];
  }

  const accountFilter = new AddressIndex({ account: subaccount });

  // `tournamentVotes` accepts either `blockHeight` or `epochIndex`:
  //  * `blockHeight` – calls `iterateLQTVotes` to gather every vote up to the
  //   epoch containing that height, grouping results by epoch.
  //  * `epochIndex` – returns the votes for that single epoch, already grouped.
  const service = penumbra.service(ViewService);
  const votes =
    epochOrHeight.type === 'epoch'
      ? await Array.fromAsync(
          service.tournamentVotes({ accountFilter, epochIndex: epochOrHeight.value }),
        )
      : await Array.fromAsync(
          service.tournamentVotes({ accountFilter, blockHeight: epochOrHeight.value }),
        );

  if (votes.length > 0) {
    const epochs = new Set<string>();
    for (const response of votes) {
      for (const vote of response.votes) {
        epochs.add(vote.epochIndex.toString());
      }
    }

    // Send a list of epochs to the server, – it sends back a list of delegators with their history
    // of matched epochs. Then we filter the results by subaccount. This doesn't leak privacy as
    // the address filtering happens on the client side.
    const delegatorHistory = await apiPostFetch<TournamentDelegatorHistoryResponse[]>(
      '/api/tournament/delegator-history',
      {
        epochs: Array.from(epochs),
        sortKey,
        sortDirection,
      },
    );

    const pairs = await Promise.all(
      delegatorHistory.map(item =>
        getIndexByAddress(item.address).then(index => ({ item, index })),
      ),
    );

    const historyByAddress: TournamentDelegatorHistoryResponse[] = pairs
      .filter(({ index }) => index?.account === subaccount)
      .map(({ item }) => item);

    // Converts each TournamentDelegatorHistoryResponse to PersonalRewardsData
    return historyByAddress.map(item => ({
      data: item.data,
      totalItems: item.total_items,
      totalRewards: item.total_rewards,
    }));
  }

  return [];
};

/**
 * Retrieves every vote from the view service for each epoch in which the user participated.
 */
export const usePersonalRewards = (
  subaccount?: number,
  epoch?: number,
  disabled?: boolean,
  page: number = BASE_PAGE,
  limit: number = BASE_LIMIT,
  sortKey: DelegatorHistorySortKey = 'epoch',
  sortDirection: DelegatorHistorySortDirection = 'desc',
) => {
  const blockHeight = statusStore.latestKnownBlockHeight;

  const query = useQuery({
    queryKey: ['total-voting-rewards', subaccount, page, limit, sortKey, sortDirection, epoch],
    staleTime: Infinity,
    enabled:
      connectionStore.connected &&
      !!epoch &&
      !!blockHeight &&
      subaccount !== undefined &&
      !disabled,
    queryFn: async () =>
      fetchRewards(
        {
          type: 'blockHeight',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- block height parameter is always defined
          value: blockHeight!,
        },
        sortKey,
        sortDirection,
        subaccount,
      ),
  });

  const totalRewards = useMemo(() => {
    return query.data?.reduce((sum, item) => sum + item.totalRewards, 0) ?? 0;
  }, [query.data]);

  const { rewards, totalItems } = useMemo(() => {
    const allDelegatorRewards = query.data?.flatMap(item => item.data) ?? [];

    const sortFunctions: Record<
      DelegatorHistorySortKey,
      (a: LqtDelegatorHistoryData, b: LqtDelegatorHistoryData) => number
    > = {
      epoch: (a, b) => Number(a.epoch) - Number(b.epoch),
      reward: (a, b) => Number(a.reward) - Number(b.reward),
    };

    const sortedDelegatorRewards = allDelegatorRewards.sort((a, b) => {
      const comparison = sortFunctions[sortKey](a, b);
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    // Apply client-side pagination and create map from paginated sorted entries
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = sortedDelegatorRewards.slice(startIndex, endIndex);

    const sortedMap = new Map<number, LqtDelegatorHistoryData>();
    paginatedData.forEach(item => {
      sortedMap.set(item.epoch, item);
    });

    return {
      rewards: sortedMap,
      totalItems: sortedDelegatorRewards.length,
    };
  }, [limit, page, query.data, sortDirection, sortKey]);

  return {
    query,
    data: rewards,
    total: totalItems,
    totalRewards: totalRewards,
  };
};
