import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import { TournamentDelegatorHistoryResponse } from '../server/delegator-history';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import { AddressByIndexResponse, TournamentVotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const fetchRewards = async (
  epochOrHeight: { type: 'epoch'; value: bigint } | { type: 'blockHeight'; value: bigint },
  subaccount?: number,
): Promise<TournamentDelegatorHistoryResponse | undefined> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

  // `tournamentVotes` accepts either `blockHeight` or `epochIndex`:
  //  * `blockHeight` – calls `iterateLQTVotes` to gather every vote up to the
  //   epoch containing that height, grouping results by epoch.
  //  * `epochIndex` – returns the votes for that single epoch, already grouped.
  const votesPromise: Promise<TournamentVotesResponse[]> = (() => {
    switch (epochOrHeight.type) {
      case 'epoch':
        return Array.fromAsync(
          penumbra
            .service(ViewService)
            .tournamentVotes({ accountFilter, epochIndex: epochOrHeight.value }),
        );
      case 'blockHeight':
        return Array.fromAsync(
          penumbra.service(ViewService).tournamentVotes({
            accountFilter,
            blockHeight: epochOrHeight.value,
          }),
        );
    }
  })();
  
  const addressPromise: Promise<AddressByIndexResponse> = penumbra
    .service(ViewService)
    .addressByIndex({ addressIndex: { account: accountFilter?.account } });
  
  const [votes, { address }] = await Promise.all([votesPromise, addressPromise]);

  if (votes.length > 0) {
    const epochs = new Set<string>();
    votes.forEach(response => {
      response.votes.forEach(vote => {
        epochs.add(vote.epochIndex.toString());
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

    const delegatorHistory = await apiPostFetch<TournamentDelegatorHistoryResponse>(
      '/api/tournament/delegator-history',
      {
        epochs: Array.from(epochs),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- address is defined
        address: { inner: Array.from(address!.inner) },
      },
    );

    return delegatorHistory;
  }

  return undefined;
};

/**
 * Retrieves every vote from the view service for each epoch in which the user participated.
 */
export const usePersonalRewards = (subaccount?: number, epoch?: number) => {
  const blockHeight = statusStore.latestKnownBlockHeight;

  return useQuery({
    queryKey: ['total-voting-rewards', subaccount],
    enabled: connectionStore.connected && !!epoch && !!blockHeight,
    queryFn: async () => {
      return await fetchRewards(
        {
          type: 'blockHeight',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- based on `enabled`, blockHeight is always defined
          value: blockHeight!,
        },
        subaccount,
      );
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
    enabled: connectionStore.connected && !!epoch,
    queryFn: async () => {
      return await fetchRewards(
        {
          type: 'epoch',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- based on `enabled`, epoch is always defined
          value: BigInt(epoch!),
        },
        subaccount,
      );
    },
  });
};
