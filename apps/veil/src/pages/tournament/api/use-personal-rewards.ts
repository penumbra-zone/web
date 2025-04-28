import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import { TournamentDelegatorHistoryResponse } from '../../../shared/api/server/tournament/delegator-history';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import { TournamentVotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const fetchRewards = async (
  subaccount?: number,
  epochOrHeight?: { type: 'epoch'; value: bigint } | { type: 'blockHeight'; value: bigint },
): Promise<TournamentDelegatorHistoryResponse> => {
  let votes: TournamentVotesResponse[];
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

  // `tournamentVotes` accepts either `blockHeight` or `epochIndex`:
  //  * `blockHeight` – calls `iterateLQTVotes` to gather every vote up to the
  //   epoch containing that height, grouping results by epoch.
  //  * `epochIndex` – returns the votes for that single epoch, already grouped.

  if (epochOrHeight?.type === 'epoch') {
    votes = await Array.fromAsync(
      penumbra
        .service(ViewService)
        .tournamentVotes({ accountFilter, epochIndex: epochOrHeight.value }),
    );
  } else if (epochOrHeight?.type === 'blockHeight') {
    votes = await Array.fromAsync(
      penumbra.service(ViewService).tournamentVotes({
        accountFilter,
        blockHeight: epochOrHeight.value,
      }),
    );
  }

  const { address } = await penumbra
    .service(ViewService)
    .addressByIndex({ addressIndex: { account: accountFilter?.account } });

  const epochs = new Set<string>();
  votes!.forEach(response => {
    response.votes?.forEach(vote => {
      if (vote.epochIndex !== undefined) {
        epochs.add(vote.epochIndex.toString());
      }
    });
  });

  // We send the address plus a list of epochs to the server and ask for the
  // matching delegator history. That’s not ideal. A better strategy would be to
  // fetch validator exchange rates keyed by epoch and convert prices locally.
  // As the liquidity tournament scales, this server-side query would force us to
  // sift through many delegators per epoch, whereas the block processor already
  // tracks rewards locally and could handle the conversion far more efficiently.
  // Consequently, we can always fall back to local-first reward processing
  // if that becomes a performance bottleneck. 
  let delegatorHistory = await apiPostFetch<TournamentDelegatorHistoryResponse>(
    '/api/tournament/delegator-history',
    {
      epochs: Array.from(epochs),
      address: { inner: Array.from(address!.inner) },
    },
  );

  return delegatorHistory;
};

/**
 * Retrieves every vote from the view service for each epoch in which the user participated.
 */
export const usePersonalRewards = (subaccount?: number, epoch?: number) => {
  return useQuery({
    queryKey: ['total-voting-rewards', subaccount, epoch],
    staleTime: Infinity,
    enabled: connectionStore.connected && !!epoch,
    queryFn: async () => {
      return await fetchRewards(connectionStore.subaccount, {
        type: 'blockHeight',
        value: statusStore.latestKnownBlockHeight!,
      });
    },
  });
};

/**
 * Retrieves the user’s vote for a single epoch.
 *
 * TODO: hook into `RoundCard` to surface incoming rewards.
 */
export const usePersonalRewardsForEpoch = (subaccount?: number, epoch?: number) => {
  return useQuery({
    queryKey: ['single-epoch-voting-rewards', subaccount, epoch],
    staleTime: Infinity,
    enabled: connectionStore.connected && !!epoch,
    queryFn: async () => {
      return await fetchRewards(connectionStore.subaccount, {
        type: 'epoch',
        value: BigInt(epoch!),
      });
    },
  });
};
