// File: src/pages/tournament/api/use-personal-rewards.ts
import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import {
  DelegatorHistorySortDirection,
  DelegatorHistorySortKey,
  TournamentDelegatorHistoryResponse,
} from '../server/delegator-history';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import {
  AddressByIndexResponse,
  TournamentVotesResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

const fetchRewards = async (
  epochOrHeight: { type: 'epoch'; value: bigint } | { type: 'blockHeight'; value: bigint },
  page: number = BASE_PAGE,
  limit: number = BASE_LIMIT,
  sortKey: DelegatorHistorySortKey = 'epoch',
  sortDirection: DelegatorHistorySortDirection = 'desc',
  subaccount?: number,
): Promise<TournamentDelegatorHistoryResponse> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

  // `tournamentVotes` accepts either `blockHeight` or `epochIndex`:
  //  * `blockHeight` – calls `iterateLQTVotes` to gather every vote up to the
  //   epoch containing that height, grouping results by epoch.
  //  * `epochIndex` – returns the votes for that single epoch, already grouped.
  const service = penumbra.service(ViewService);
  const votesPromise: Promise<TournamentVotesResponse[]> =
    epochOrHeight.type === 'epoch'
      ? Array.fromAsync(service.tournamentVotes({ accountFilter, epochIndex: epochOrHeight.value }))
      : Array.fromAsync(
          service.tournamentVotes({ accountFilter, blockHeight: epochOrHeight.value }),
        );

  const addressPromise: Promise<AddressByIndexResponse> = service.addressByIndex({
    addressIndex: { account: accountFilter?.account },
  });

  const [votes, { address }] = await Promise.all([votesPromise, addressPromise]);

  if (votes.length > 0) {
    const epochs = new Set<string>();
    for (const response of votes) {
      for (const vote of response.votes) {
        epochs.add(vote.epochIndex.toString());
      }
    }

    // We send the address plus a list of epochs to the server and ask for the
    // matching delegator history. That’s not ideal. A better strategy would be to
    // fetch validator exchange rates keyed by epoch and convert prices locally.
    // As the liquidity tournament scales, this server-side query would force us to
    // sift through many delegators per epoch, whereas the block processor already
    // tracks rewards locally and could handle the conversion far more efficiently.
    // Consequently, we can always fall back to local-first reward processing
    // if that becomes a performance bottleneck.

    const delegatorHistory = await apiPostFetch<TournamentDelegatorHistoryResponse>(
      '/api/tournament/delegator-history',
      {
        epochs: Array.from(epochs),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- address is defined
        address: { inner: Array.from(address!.inner) },
        page,
        limit,
        sortKey,
        sortDirection,
      },
    );

    return delegatorHistory;
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
    enabled: connectionStore.connected && !!epoch && !!blockHeight && !disabled,
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

  return {
    query,
    data: query.data?.data ?? [],
    total: query.data?.totalItems ?? 0,
    totalRewards: query.data?.totalRewards ?? 0,
  };
};

export const usePersonalRewardsForEpoch = (
  subaccount?: number,
  epoch?: number,
  page: number = BASE_PAGE,
  limit: number = BASE_LIMIT,
  sortKey: DelegatorHistorySortKey = 'epoch',
  sortDirection: DelegatorHistorySortDirection = 'desc',
) => {
  const query = useQuery({
    queryKey: [
      'single-epoch-voting-rewards',
      subaccount,
      epoch,
      page,
      limit,
      sortKey,
      sortDirection,
    ],
    enabled: connectionStore.connected && !!epoch,
    queryFn: async () =>
      fetchRewards(
        {
          type: 'epoch',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- epoch parameter is always defined
          value: BigInt(epoch!),
        },
        page,
        limit,
        sortKey,
        sortDirection,
        subaccount,
      ),
  });

  return {
    query,
    data: query.data?.data ?? [],
    total: query.data?.totalItems ?? 0,
    totalRewards: query.data?.totalRewards ?? 0,
  };
};
