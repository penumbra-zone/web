import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { connectionStore } from '@/shared/model/connection';
import { penumbra } from '@/shared/const/penumbra';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';

export const useTournamentVotes = (epoch?: number, disabled?: boolean) => {
  const { connected, subaccount } = connectionStore;
  const enabled = connected && !!epoch;

  const query = useQuery({
    enabled,
    queryKey: ['tournament-votes', subaccount, epoch],
    staleTime: Infinity,
    queryFn: async () => {
      if (!epoch) {
        throw new Error('Epoch is required');
      }

      const res = await Array.fromAsync(
        penumbra.service(ViewService).tournamentVotes({
          accountFilter: new AddressIndex({ account: subaccount }),
          epochIndex: BigInt(epoch),
        }),
      );

      return res[0]?.votes ?? [];
    },
  });

  useRefetchOnNewBlock('tournament-votes', query, !enabled || disabled);

  return query;
};
