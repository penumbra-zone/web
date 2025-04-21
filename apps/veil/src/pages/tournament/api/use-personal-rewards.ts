import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

/**
 * Retrieves voting rewards from the ViewService.
 *
 * TODO: update rewards calculation based on this comment:
 * https://github.com/penumbra-zone/web/pull/2269#pullrequestreview-2780489876
 */
export const usePersonalRewards = (epoch?: number) => {
  const { connected, subaccount } = connectionStore;

  return useQuery({
    queryKey: ['personal-rewards', subaccount, epoch],
    enabled: connected && !!epoch,
    queryFn: async () => {
      const res = await penumbra.service(ViewService).tournamentVotes({
        epochIndex: epoch ? BigInt(epoch) : undefined,
        accountFilter: new AddressIndex({
          account: subaccount,
        }),
      });

      return res.votes;
    },
  });
};
