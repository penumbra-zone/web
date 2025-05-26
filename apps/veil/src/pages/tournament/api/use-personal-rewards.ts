// File: src/pages/tournament/api/use-personal-rewards.ts
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
  page: number = BASE_PAGE,
  limit: number = BASE_LIMIT,
  sortKey: DelegatorHistorySortKey = 'epoch',
  sortDirection: DelegatorHistorySortDirection = 'desc',
  subaccount?: number,
): Promise<PersonalRewardsData> => {
  if (typeof subaccount === 'undefined') {
    return {
      data: [],
      totalItems: 0,
      totalRewards: 0,
    };
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
        page,
        limit,
        sortKey,
        sortDirection,
      },
    );

    // filter the history by address – find user's subaccount index
    const historyByAddress = await Promise.any<TournamentDelegatorHistoryResponse | undefined>(
      delegatorHistory.map(async item => {
        const index = await getIndexByAddress(item.address);
        if (!index || index.account !== subaccount) {
          throw new Error('Address index does not match');
        }
        return item;
      }),
    );

    return {
      data: historyByAddress?.data ?? [],
      totalItems: historyByAddress?.total_items ?? 0,
      totalRewards: historyByAddress?.total_rewards ?? 0,
    };
  }

  return {
    data: [],
    totalItems: 0,
    totalRewards: 0,
  };
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
    queryKey: ['total-voting-rewards', subaccount, page, limit, sortKey, sortDirection],
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
        page,
        limit,
        sortKey,
        sortDirection,
        subaccount,
      ),
  });

  const data = query.data?.data ?? [];

  return {
    query,
    data: new Map(data.map(x => [x.epoch, x])),
    total: query.data?.totalItems ?? 0,
    totalRewards: query.data?.totalRewards ?? 0,
  };
};
