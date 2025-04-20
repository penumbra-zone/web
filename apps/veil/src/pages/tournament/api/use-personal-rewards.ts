import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import { TournamentVotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const fetchRewards = async (subaccount?: number): Promise<{ votes: TournamentVotesResponse[] }> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });
  const { latestKnownBlockHeight } = statusStore;

  const responses = await Array.fromAsync(
    penumbra
      .service(ViewService)
      .tournamentVotes({ accountFilter, blockHeight: latestKnownBlockHeight }),
  );

  return { votes: responses };
};

/**
 * Retrieves voting rewards from the ViewService.
 */
export const usePersonalRewards = (subaccount?: number) => {
  const query = useQuery({
    queryKey: ['my-voting-rewards', subaccount], // add epoch index here
    staleTime: Infinity,
    enabled: connectionStore.connected,
    queryFn: async () => {
      return await fetchRewards(subaccount);
    },
  });

  const { data, isLoading } = query;

  return {
    data,
    isLoading,
  };
};
