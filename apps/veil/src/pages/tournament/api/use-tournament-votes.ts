import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { connectionStore } from '@/shared/model/connection';
import { penumbra } from '@/shared/const/penumbra';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { TournamentVotesResponse_Vote } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const useTournamentVotes = (epoch?: number, disabled?: boolean) => {
  const { connected, subaccount } = connectionStore;
  const enabled = connected && !!epoch;

  const query = useQuery<TournamentVotesResponse_Vote[]>({
    enabled,
    queryKey: ['tournament-votes', subaccount, epoch],
    staleTime: Infinity,
    queryFn: async () => {
      if (!epoch) {
        throw new Error('Epoch is required');
      }

      // creates an iterable from the stream
      const iterable = penumbra.service(ViewService).tournamentVotes({
        accountFilter: new AddressIndex({ account: subaccount }),
        epochIndex: BigInt(epoch),
      });

      // breaks the loop after the first iteration
      const result = await iterable[Symbol.asyncIterator]().next();
      return result.done ? [] : result.value.votes;
    },
  });

  useRefetchOnNewBlock('tournament-votes', query, !enabled || disabled);

  return query;
};
